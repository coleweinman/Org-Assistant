import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { FieldPath, FieldValue, getFirestore } from "firebase-admin/firestore";
import { eventConverter, orgConverter } from "./converters";
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
import type { CheckIn, Org, OrgEvent, PublicOrgEvent, UpdateData } from "./types";
import { error, log } from "firebase-functions/logger";

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

// export const updateAttendees = onRequest(async (request, response) => {
//   response.set("Access-Control-Allow-Origin", "*");
//
//   if (request.method === "OPTIONS") {
//     // Send response to OPTIONS requests
//     response.set("Access-Control-Allow-Methods", "GET");
//     response.set("Access-Control-Allow-Headers", "Content-Type");
//     response.set("Access-Control-Max-Age", "3600");
//     response.status(204).send("");
//     return;
//   }
//
//   const orgId = "xHtVQbaPJrwOFKJ6kJbc";
//   const attendees = await db.collection("orgs")
//     .doc(orgId)
//     .collection("attendees")
//     .withConverter<Attendee>(attendeeConverter)
//     .get();
//   debug(`Found ${attendees.docs.length} attendees`);
//   const checkIns = (
//     await db.collection("orgs")
//       .doc(orgId)
//       .collection("checkIns")
//       .withConverter<CheckIn>(checkInConverter)
//       .where("year", "in", ["2024", "2025", "2026", "2027", "grad"])
//       .get()
//   ).docs.map((doc) => doc.data());
//   const batch = db.batch();
//   for (const attendeeDoc of attendees.docs) {
//     const attendee = attendeeDoc.data();
//     if (attendee.seasonRsvps["Fall 2023"] || attendee.seasonAttendance["Fall 2023"]) {
//       const matchingCheckIn = checkIns.find(({ email }) => email === attendee.email);
//       if (matchingCheckIn) {
//         debug(matchingCheckIn.schoolId, matchingCheckIn.discord);
//         batch.set(attendeeDoc.ref, {
//           ...attendee,
//           schoolId: matchingCheckIn.schoolId,
//           discord: matchingCheckIn.discord ?? "",
//         });
//       }
//     }
//   }
//   debug("Committing batch");
//   await batch.commit();
//   response.json({ status: "success" });
// });

export const updateLinkedEvents = onDocumentUpdated("orgs/{orgId}/events/{eventId}", async ({ params, data }) => {
  if (!data) {
    error("No data associated with the event");
    return;
  }
  const oldEvent = data.before.data() as OrgEvent;
  const { eventId } = params;
  const {
    name,
    startTime,
    endTime,
    location,
    modality,
    virtualEventUrl,
    linkedEvents,
  } = data.before.data() as OrgEvent;
  if (!linkedEvents || linkedEvents.length === 0) {
    return;
  }
  await db.runTransaction(async (t) => {
    const updates: UpdateData = [];
    if (!startTime.isEqual(oldEvent.startTime)) {
      updates.push(new FieldPath("startTime"));
      updates.push(startTime);
    }
    if (!endTime.isEqual(oldEvent.endTime)) {
      updates.push(new FieldPath("endTime"));
      updates.push(endTime);
    }
    if (location !== oldEvent.location) {
      updates.push(new FieldPath("location"));
      updates.push(location ?? FieldValue.delete());
    }
    if (modality !== oldEvent.modality) {
      updates.push(new FieldPath("modality"));
      updates.push(modality);
    }
    if (virtualEventUrl !== oldEvent.virtualEventUrl) {
      updates.push(new FieldPath("virtualEventUrl"));
      updates.push(virtualEventUrl ?? FieldValue.delete());
    }
    for (const { org, event } of linkedEvents) {
      const eventDoc = db.collection("orgs")
        .doc(org.id)
        .collection("events")
        .doc(event.id)
        .withConverter<OrgEvent>(eventConverter);
      if (name !== oldEvent.name) {
        const orgEvent = (
          await t.get(eventDoc)
        ).data();
        if (orgEvent) {
          const linkedEvent = orgEvent.linkedEvents.find(({ event }) => event.id === eventId);
          updates.push(new FieldPath("linkedEvents"));
          updates.push(FieldValue.arrayRemove(linkedEvent));
          updates.push(FieldValue.arrayUnion({
            ...linkedEvent, event: {
              id: eventId,
              name,
            },
          }));
        }
      }
      setUpdates(t, eventDoc, updates);
    }
  });
});

export const removeLinkedEvent = onDocumentDeleted("orgs/{orgId}/events/{eventId}", async ({ params, data }) => {
  if (!data) {
    error("No data associated with the event");
    return;
  }

  const { linkedEvents } = data.data() as OrgEvent;
  const { eventId } = params;
  if (!linkedEvents) {
    return;
  }
  await db.runTransaction(async (t) => {
    for (const { org, event } of linkedEvents) {
      const eventDoc = db.collection("orgs")
        .doc(org.id)
        .collection("events")
        .doc(event.id)
        .withConverter<OrgEvent>(eventConverter);
      const orgEvent = (
        await t.get(eventDoc)
      ).data();
      if (orgEvent) {
        const linkedEvent = orgEvent.linkedEvents.find(({ event }) => event.id === eventId);
        t.update(eventDoc, {
          linkedEvents: FieldValue.arrayRemove(linkedEvent),
        });
      }
    }
  });
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
    if (isNewAttendee) {
      await t.set(attendeeRef, {
        name: "",
        email: email.toLowerCase(),
        schoolId: "",
        discord: "",
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

    setUpdates(t, attendeeRef, getAttendeeAddUpdates(didRsvp, didCheckIn, name, schoolId, discord ?? "", seasonId));
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
      ...getAttendeeAddUpdates(addRsvp, addCheckIn, name, schoolId, discord ?? "", seasonId),
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
