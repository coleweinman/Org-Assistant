import { onCall, onRequest } from "firebase-functions/v2/https";
import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
  onDocumentWritten,
} from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import { eventConverter, orgConverter } from "./converters";
import { getAttendeeDoc, getAttendeesCollection, getEventDoc, getEventsCollection } from "./firestoreHelpers";
import {
  addCalendarEvent,
  addToCalendarList,
  deleteCalendarEvent,
  getAttendeeAddUpdates,
  getAttendeeRemoveUpdates,
  getEventAddUpdates,
  getEventRemoveUpdates,
  getSeasonId,
  getWasNewAttendee,
  removeFromCalendarList,
  removeLinkedEvents,
  setUpdates,
  updateCalendarEvent,
  updateLinkedEvents,
} from "./helpers";
import type { Attendee, CheckIn, Org, OrgEvent, PublicOrgEvent } from "./types";
import { error, log } from "firebase-functions/logger";
import { JWT } from "google-auth-library";
import { SERVICE_ACCOUNT_KEYFILE } from "./constants";

initializeApp();
const db = getFirestore();

export const getEvents = onRequest({ cors: ["texasqpp.com"] }, async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");

  if (request.method === "OPTIONS") {
    // Send response to OPTIONS requests
    response.set("Access-Control-Allow-Methods", "GET");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    response.set("Access-Control-Max-Age", "3600");
    response.status(204).send("");
    return;
  }

  const orgId = request.query.orgId as string | undefined;
  if (!orgId) {
    response
      .status(400)
      .json({ "status": "error", "message": "Org Id not provided." });
    return;
  }
  const orgData = (
    await db.collection("orgs").doc(orgId as string).withConverter<Org>(orgConverter).get()
  ).data();
  if (!orgData) {
    response
      .status(400)
      .json({ "status": "error", "message": "Could not find data associated with org " + orgId });
    return;
  }
  const seasonId = orgData.currentSeasonId;
  const querySnapshot = await getEventsCollection(db, orgId)
    .where("seasonId", "==", seasonId)
    .orderBy("startTime")
    .get();
  // Only include relevant data
  const events: PublicOrgEvent[] = querySnapshot.docs.map((doc) => {
    const { name, imageUrl, description, location, startTime, endTime, modality, virtualEventUrl } = doc.data();
    return { name, imageUrl, description, location, startTime, endTime, modality, virtualEventUrl };
  });
  response.json({ status: "success", data: { events } });
});

export const linkEvents = onCall<{
  orgIds: string[],
  eventRef: DocumentReference<OrgEvent>
}, Promise<void>>(async (request) => {
  const { orgIds, eventRef } = request.data;
  await db.runTransaction(async (t) => {
    const eventDoc = await t.get(eventRef.withConverter<OrgEvent>(eventConverter));
    const event = eventDoc.data();
    if (!event) {
      return;
    }
    const eventDocs = [
      ...orgIds.map((orgId) => db.collection("orgs").doc(orgId).collection("events").doc()),
      eventDoc.ref,
    ];
    for (let i = 0; i < orgIds.length; i++) {
      t.set(
        eventDocs[i],
        {
          ...event,
          rsvpCount: 0,
          newRsvpCount: 0,
          newAttendeeCount: 0,
          attendeeCount: 0,
          linkedEvents: [...eventDocs.slice(0, i), ...eventDocs.slice(i + 1)],
        },
      );
    }
    t.update(eventDoc.ref, { linkedEvents: eventDocs.slice(0, eventDocs.length - 1) });
  });
});

export const updateSharedCalendar = onDocumentWritten("orgs/{orgId}", async ({ params, data }) => {
  if (!data) {
    error("No data associated with org");
    return;
  }
  const prevOrg = data.before.data() as Org | undefined;
  const afterOrg = data.after.data() as Org | undefined;
  if (prevOrg && afterOrg && prevOrg.calendarId == afterOrg.calendarId) {
    return;
  }
  const auth = new JWT({ keyFile: SERVICE_ACCOUNT_KEYFILE, scopes: "https://www.googleapis.com/auth/calendar" });
  // Remove previous calendar if doc/calendarId has been removed or if calendarId has been edited
  const removePrevCalendar = prevOrg?.calendarId && (
    !afterOrg?.calendarId || prevOrg.calendarId !== afterOrg.calendarId
  );
  const addNewCalendar = afterOrg?.calendarId && (
    !prevOrg?.calendarId || prevOrg.calendarId !== afterOrg.calendarId
  );
  if (removePrevCalendar) {
    try {
      await removeFromCalendarList(prevOrg.calendarId!, auth);
    } catch (e) {
      error(`Could not remove calendar ${prevOrg.calendarId} from list for org ${prevOrg.name} with error: `, e);
    }
  }
  if (addNewCalendar) {
    try {
      await addToCalendarList(afterOrg.calendarId!, auth);
    } catch (e) {
      error(`Could not add calendar ${afterOrg.calendarId} to list for org ${afterOrg.name} with error: `, e);
    }
  }
});

export const onCreateEvent = onDocumentCreated("orgs/{orgId}/events/{eventId}", async ({ params, data }) => {
  if (!data) {
    error("No data associated with the event");
    return;
  }
  try {
    await addCalendarEvent(db, params.orgId, data);
  } catch (e) {
    error(`Failed to create event ${data.id} with error: `, e);
  }
});

export const onUpdateEvent = onDocumentUpdated("orgs/{orgId}/events/{eventId}", async ({ params, data }) => {
  if (!data) {
    error("No data associated with the event");
    return;
  }
  await Promise.all([
    updateLinkedEvents(
      db,
      params.eventId,
      data.before.data() as OrgEvent,
      data.after.data() as OrgEvent,
    ).catch((e) => error(`Failed to updated linked events for ${data.after.id} with error: `, e)),
    updateCalendarEvent(db, params.orgId, data.after)
      .catch((e) => error(`Failed to update event ${data.after.id} with error: `, e)),
  ]);
});

export const onDeleteEvent = onDocumentDeleted("orgs/{orgId}/events/{eventId}", async ({ params, data }) => {
  if (!data) {
    error("No data associated with the event");
    return;
  }
  await Promise.all([
    removeLinkedEvents(
      db,
      params.eventId,
      data.data() as OrgEvent,
    ).catch((e) => error(`Failed to delete linked events for ${params.eventId} with error: `, e)),
    deleteCalendarEvent(db, params.orgId, params.eventId)
      .catch((e) => error(`Failed to delete event ${params.eventId} with error: `, e)),
  ]);
});

export const onCreateCheckIn = onDocumentCreated("orgs/{orgId}/checkIns/{checkInId}", async ({ params, data }) => {
  if (!data) {
    error("No data associated with the event");
    return;
  }
  const { name, email, schoolId, discord, eventId, didRsvp, didCheckIn } = data.data() as CheckIn;
  const { orgId } = params;

  if (!didRsvp && !didCheckIn) {
    error("Attendee neither RSVP'd nor checked in. Deleting check in...");
    await data.ref.delete();
    return;
  }

  await db.runTransaction(async (t) => {
    // Get event season ID
    const seasonId = await getSeasonId(t, db, orgId, eventId);
    if (!seasonId) {
      return;
    }

    // Update attendee data or create new attendee doc if new
    const attendeeDoc = await getAttendeeDoc(t, db, orgId, email);
    const isNewAttendee = !attendeeDoc;
    const attendeeRef = isNewAttendee ? getAttendeesCollection(db, orgId).doc() : attendeeDoc.ref;
    let attendee: Attendee;
    if (isNewAttendee) {
      attendee = {
        name: "",
        email: email.toLowerCase(),
        schoolId: "",
        discord: "",
        year: "",
        // Default values, to be updated below
        totalEventsAttended: 0,
        totalEventsRsvpd: 0,
        lastActiveSeasonId: "",
        seasonAttendance: {
          [seasonId]: 0,
        },
        seasonRsvps: {
          [seasonId]: 0,
        },
      };
      await t.set(attendeeRef, attendee);
    } else {
      attendee = attendeeDoc.data();
    }

    setUpdates(t, attendeeRef,
      getAttendeeAddUpdates(didRsvp, didCheckIn, name, schoolId, discord ?? "", seasonId, attendee),
    );
    setUpdates(t, getEventDoc(db, orgId, eventId), getEventAddUpdates(didRsvp, didCheckIn, isNewAttendee));
  });
});

export const onEditCheckIn = onDocumentUpdated("orgs/{orgId}/checkIns/{checkInId}", async ({ params, data }) => {
  if (!data) {
    error("No data associated with the event");
    return;
  }
  const oldCheckIn = data.before.data() as CheckIn;
  const { name, email, schoolId, discord, eventId, didRsvp, didCheckIn } = data.after.data() as CheckIn;
  const { orgId } = params;

  await db.runTransaction(async (t) => {
    const seasonId = await getSeasonId(t, db, orgId, eventId);
    if (!seasonId) {
      return;
    }

    // Update attendee data
    const attendeeDoc = await getAttendeeDoc(t, db, orgId, email);
    if (!attendeeDoc) {
      error("Could not find attendee associated with check in");
      return;
    }
    const attendee = attendeeDoc.data();
    const addRsvp = didRsvp && !oldCheckIn.didRsvp;
    const removeRsvp = !didRsvp && oldCheckIn.didRsvp;
    const addCheckIn = didCheckIn && !oldCheckIn.didCheckIn;
    const removeCheckIn = !didCheckIn && oldCheckIn.didCheckIn;
    const wasNewAttendee = getWasNewAttendee(removeRsvp, removeCheckIn, seasonId, attendee);

    if (!didCheckIn && !didRsvp) {
      log("Attendee neither RSVP'd nor checked in. Deleting check in...");
      t.delete(data.after.ref);
      return;
    }

    const attendeeUpdates = [
      ...getAttendeeAddUpdates(addRsvp, addCheckIn, name, schoolId, discord ?? "", seasonId, attendee),
      ...getAttendeeRemoveUpdates(removeRsvp, removeCheckIn, seasonId, attendee),
    ];
    const eventUpdates = [
      ...getEventAddUpdates(addRsvp, addCheckIn, wasNewAttendee),
      ...getEventRemoveUpdates(removeRsvp, removeCheckIn, wasNewAttendee),
    ];
    setUpdates(t, attendeeDoc.ref, attendeeUpdates);
    setUpdates(t, getEventDoc(db, orgId, eventId), eventUpdates);
  });
});

export const onDeleteCheckIn = onDocumentDeleted("orgs/{orgId}/checkIns/{checkInId}", async ({ params, data }) => {
  if (!data) {
    error("No data associated with the event");
    return;
  }
  const { email, eventId, didCheckIn, didRsvp } = data.data() as CheckIn;
  const { orgId } = params;

  await db.runTransaction(async (t) => {
    const seasonId = await getSeasonId(t, db, orgId, eventId);
    if (!seasonId) {
      return;
    }

    // Update attendee data
    const attendeeDoc = await getAttendeeDoc(t, db, orgId, email);
    if (!attendeeDoc) {
      return;
    }
    const attendee = attendeeDoc.data();
    const wasNewAttendee = getWasNewAttendee(didRsvp, didCheckIn, seasonId, attendee);

    // Delete attendee if they were new, otherwise update attendance stats accordingly
    if (wasNewAttendee) {
      t.delete(attendeeDoc.ref);
    } else {
      setUpdates(t, attendeeDoc.ref, getAttendeeRemoveUpdates(didRsvp, didCheckIn, seasonId, attendee));
    }
    setUpdates(t, getEventDoc(db, orgId, eventId), getEventRemoveUpdates(didRsvp, didCheckIn, wasNewAttendee));
  });
});
