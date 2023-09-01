import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { FieldPath, FieldValue, getFirestore } from "firebase-admin/firestore";
import { firestore } from "firebase-admin";
import type { Attendee, CheckIn, Org, OrgEvent, PublicOrgEvent } from "./types";

initializeApp();
const db = getFirestore();

const attendeeConverter: firestore.FirestoreDataConverter<Attendee> = {
  toFirestore: (orgEvent: Attendee) => orgEvent as firestore.DocumentData,
  fromFirestore: (doc: firestore.DocumentData) => doc.data() as Attendee,
};

const eventConverter: firestore.FirestoreDataConverter<OrgEvent> = {
  toFirestore: (orgEvent: OrgEvent) => orgEvent as firestore.DocumentData,
  fromFirestore: (doc: firestore.DocumentData) => doc.data() as OrgEvent,
};

const orgConverter: firestore.FirestoreDataConverter<Org> = {
  toFirestore: (orgEvent: Org) => orgEvent as firestore.DocumentData,
  fromFirestore: (doc: firestore.DocumentData) => (
    {
      ...(
        doc.data() as Omit<Org, "id">
      ),
      id: doc.id,
    }
  ),
};

// A season is expected to have the format "[Fall/Spring] [year]", e.g. "Fall 2023"
function decrementSeasonId(seasonId: string, seasonsActive: string[]): string {
  const newSeasons = seasonsActive.filter((season) => season !== seasonId);
  // Find minimum season
  let newLatestSeason = newSeasons[0].split(" ");
  for (let i = 1; i < newSeasons.length; i++) {
    const [season, year] = newSeasons[i];
    // seasonA is after seasonB if:
    // - seasonA year is greater than seasonB year
    // - seasonA is in fall of the same year as seasonB
    if (parseInt(year) > parseInt(newLatestSeason[1]) || (
      season === "Fall" && newLatestSeason[0] === "Spring" && parseInt(year) === parseInt(newLatestSeason[1])
    )) {
      newLatestSeason = [season, year];
    }
  }
  return newLatestSeason.join(" ");
}

function getEventsCollection(db: firestore.Firestore, orgId: string): firestore.CollectionReference<OrgEvent> {
  return db.collection("orgs")
    .doc(orgId as string)
    .collection("events")
    .withConverter<OrgEvent>(eventConverter);
}

function getEventDoc(
  db: firestore.Firestore,
  orgId: string,
  eventId: string,
): firestore.DocumentReference<OrgEvent> {
  return db
    .collection("orgs")
    .doc(orgId)
    .collection("events")
    .doc(eventId)
    .withConverter<OrgEvent>(eventConverter);
}

function getAttendeesCollection(db: firestore.Firestore, orgId: string): firestore.CollectionReference<Attendee> {
  return db
    .collection("orgs")
    .doc(orgId)
    .collection("attendees")
    .withConverter<Attendee>(attendeeConverter);
}

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
  // Add all events to array with relevant data
  const events: PublicOrgEvent[] = [];
  querySnapshot.forEach((doc) => {
    const event = doc.data();
    const newEvent: PublicOrgEvent = {
      name: event.name,
      imageUrl: event.imageUrl,
      description: event.description,
      location: event.location,
      startTime: event.startTime,
      endTime: event.endTime,
      modality: event.modality,
      virtualEventUrl: event.virtualEventUrl,
    };
    events.push(newEvent);
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

  // Get event
  const eventDoc = await getEventDoc(db, orgId, eventId).get();
  const event = eventDoc?.data();
  if (!eventDoc || !event) {
    console.error(`Could not find created doc orgs/${orgId}/events/${eventId}`);
    return;
  }
  const eventSeasonId = event.seasonId;

  // Update attendee data or create new attendee doc if new
  const attendeeQuery = await getAttendeesCollection(db, orgId).where("email", "==", email.toLowerCase()).get();
  const isNewAttendee = attendeeQuery.empty;
  const updateData: (FieldPath | FieldValue | string)[] = [];
  let attendeeDocRef;
  if (isNewAttendee) {
    // Add attendee doc
    attendeeDocRef = await getAttendeesCollection(db, orgId).add({
      name,
      email,
      // Default values, to be updated below
      totalEventsAttended: 0,
      lastActiveSeasonId: "",
      seasonAttendance: {
        [eventSeasonId]: 0,
      },
    });
  } else {
    attendeeDocRef = attendeeQuery.docs[0].ref;
    // Update name if different from existing
    if (attendeeQuery.docs[0].data().name !== name) {
      updateData.push(new FieldPath("name"));
      updateData.push(name);
    }
  }
  // Update attendance statistics
  updateData.push(new FieldPath("totalEventsAttended"));
  updateData.push(FieldValue.increment(1));
  updateData.push(new FieldPath("seasonAttendance", eventSeasonId));
  updateData.push(FieldValue.increment(1));
  updateData.push(new FieldPath("lastActiveSeasonId"));
  updateData.push(eventSeasonId);
  await attendeeDocRef.update(
    updateData[0],
    updateData[1],
    ...updateData.slice(2),
  );

  const isRsvp = didRsvp && !didCheckIn;
  // Update event
  const updateEventData = {
    rsvpCount: FieldValue.increment(isRsvp ? 1 : 0),
    newRsvpCount: FieldValue.increment(isRsvp && isNewAttendee ? 1 : 0),
    attendeeCount: FieldValue.increment(!isRsvp ? 1 : 0),
    newAttendeeCount: FieldValue.increment(!isRsvp && isNewAttendee ? 1 : 0),
  };
  await eventDoc.ref.update(updateEventData);
});

export const onDeleteCheckIn = onDocumentDeleted("orgs/{orgId}/checkIns/{checkInId}", async ({ params, data }) => {
  if (!data) {
    console.error("No data associated with the event");
    return;
  }
  const { email, eventId } = data.data() as CheckIn;
  const { orgId } = params;

  // Get event
  const eventDoc = await getEventDoc(db, orgId, eventId).get();
  const event = eventDoc.data();
  if (!eventDoc || !event) {
    console.error(`Could not find created doc orgs/${orgId}/events/${eventId}`);
    return;
  }
  const eventSeasonId = event.seasonId;

  // Update attendee data
  const attendeeCol = getAttendeesCollection(db, orgId);
  const attendeeQuery = await attendeeCol.where("email", "==", email.toLowerCase()).get();
  if (attendeeQuery.empty) {
    return;
  }
  const updateData: (FieldPath | FieldValue | string)[] = [];
  const attendeeData = attendeeQuery.docs[0].data();
  const attendeeDocRef = attendeeQuery.docs[0].ref;

  // Delete attendee if they have not attended any events
  if (attendeeData.totalEventsAttended <= 1) {
    await attendeeDocRef.delete();
    return;
  }

  // Decrement season attendance and go back a season if necessary
  if (attendeeData.seasonAttendance[eventSeasonId] <= 1) {
    updateData.push(new FieldPath("lastActiveSeasonId"));
    updateData.push(decrementSeasonId(eventSeasonId, Object.keys(attendeeData.seasonAttendance)));
    updateData.push(new FieldPath("seasonAttendance", eventSeasonId));
    updateData.push(FieldValue.delete());
  } else {
    updateData.push(new FieldPath("seasonAttendance", eventSeasonId));
    updateData.push(FieldValue.increment(-1));
  }
  updateData.push(new FieldPath("totalEventsAttended"));
  updateData.push(FieldValue.increment(-1));
  await attendeeDocRef.update(updateData[0], updateData[1], ...updateData.slice(2));
});
