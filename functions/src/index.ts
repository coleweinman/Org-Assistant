import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { orgConverter } from "./converters";
import { getAttendeeDoc, getAttendeesCollection, getEventDoc, getEventsCollection } from "./firestoreHelpers";
import {
  getAttendeeAddUpdates,
  getAttendeeRemoveUpdates,
  getEventAddUpdates,
  getEventRemoveUpdates,
  getSeasonId,
  getWasNewAttendee,
  setUpdates,
} from "./helpers";
import type { CheckIn, Org, PublicOrgEvent } from "./types";

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

export const onCreateCheckIn = onDocumentCreated("orgs/{orgId}/checkIns/{checkInId}", async ({ params, data }) => {
  if (!data) {
    console.error("No data associated with the event");
    return;
  }
  const { name, email, eventId, didRsvp, didCheckIn } = data.data() as CheckIn;
  const { orgId } = params;

  if (!didRsvp && !didCheckIn) {
    console.error("Attendee neither RSVP'd nor checked in. Deleting check in...");
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
    if (isNewAttendee) {
      await t.set(attendeeRef, {
        name: "",
        email: email.toLowerCase(),
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
      });
    }

    setUpdates(t, attendeeRef, getAttendeeAddUpdates(didRsvp, didCheckIn, name, seasonId));
    setUpdates(t, getEventDoc(db, orgId, eventId), getEventAddUpdates(didRsvp, didCheckIn, isNewAttendee));
  });
});

export const onEditCheckIn = onDocumentUpdated("orgs/{orgId}/checkIns/{checkInId}", async ({ params, data }) => {
  if (!data) {
    console.error("No data associated with the event");
    return;
  }
  const oldCheckIn = data.before.data() as CheckIn;
  const { name, email, eventId, didRsvp, didCheckIn } = data.after.data() as CheckIn;
  const { orgId } = params;

  await db.runTransaction(async (t) => {
    const seasonId = await getSeasonId(t, db, orgId, eventId);
    if (!seasonId) {
      return;
    }

    // Update attendee data
    const attendeeDoc = await getAttendeeDoc(t, db, orgId, email);
    if (!attendeeDoc) {
      console.error("Could not find attendee associated with check in");
      return;
    }
    const attendee = attendeeDoc.data();
    const addRsvp = didRsvp && !oldCheckIn.didRsvp;
    const removeRsvp = !didRsvp && oldCheckIn.didRsvp;
    const addCheckIn = didCheckIn && !oldCheckIn.didCheckIn;
    const removeCheckIn = !didCheckIn && oldCheckIn.didCheckIn;
    const wasNewAttendee = getWasNewAttendee(removeRsvp, removeCheckIn, seasonId, attendee);

    if (!didCheckIn && !didRsvp) {
      console.log("Attendee neither RSVP'd nor checked in. Deleting check in...");
      t.delete(data.after.ref);
      return;
    }

    const attendeeUpdates = [
      ...getAttendeeAddUpdates(addRsvp, addCheckIn, name, seasonId),
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
    console.error("No data associated with the event");
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
