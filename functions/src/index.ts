import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { FieldPath, FieldValue, getFirestore } from "firebase-admin/firestore";

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

  const orgId = request.query.orgId;
  if (orgId === undefined) {
    response
      .status(400)
      .json({ "status": "error", "message": "Org Id not provided." });
    return;
  }
  const orgData = (
    await db.collection("orgs").doc(orgId as string).get()
  ).data();
  if (!orgData) {
    response
      .status(400)
      .json({ "status": "error", "message": "Could not find data associated with org " + orgId });
    return;
  }
  const seasonId = orgData.currentSeasonId;
  let q: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection("orgs")
    .doc(orgId as string)
    .collection("events");
  if (seasonId !== undefined) {
    q = q.where("seasonId", "==", seasonId);
  }
  const querySnapshot = await q.orderBy("startTime").get();
  const events = [];
  for (const doc of querySnapshot.docs) {
    const event = doc.data();
    const newEvent = {
      "name": event.name,
      "imageUrl": event.imageUrl,
      "description": event.description,
      "location": event.location,
      "startTime": event.startTime,
      "endTime": event.endTime,
      "modality": event.modality,
      "virtualEventUrl": event.virtualEventUrl,
    };
    events.push(newEvent);
  }
  // functions.logger.info("Hello logs!", { structuredData: true });
  response.json({ "status": "success", "data": { "events": events } });
});

export const onCreateCheckIn = onDocumentCreated("orgs/{orgId}/checkIns/{checkInId}", async ({ params, data }) => {
  if (!data) {
    console.error("No data associated with the event");
    return;
  }
  const { name, email, eventId } = data.data();
  const { orgId } = params;

  // Get event
  const eventDoc = await db
    .collection("orgs")
    .doc(orgId)
    .collection("events")
    .doc(eventId)
    .get();
  if (!eventDoc) {
    console.error(`Could not find created doc orgs/${orgId}/events/${eventId}`);
    return;
  }
  const event = eventDoc.data()!;
  const eventSeasonId = event.seasonId;

  // Update attendee data or create new attendee doc if new
  const attendeeCol = db
    .collection("orgs")
    .doc(orgId)
    .collection("attendees");
  const attendeeQuery = await attendeeCol
    .where("email", "==", email.toLowerCase())
    .get();
  const updateData = [];
  let attendeeName = name;
  const newAttendee = attendeeQuery.empty;
  let attendeeDocRef;
  if (newAttendee) {
    // Add attendee doc
    attendeeDocRef = await attendeeCol.add({
      "name": name,
      "email": email,
    });
  } else {
    attendeeDocRef = attendeeQuery.docs[0].ref;
    attendeeName = attendeeQuery.docs[0].data().name;
    // Update name if different from existing
    if (attendeeName !== name) {
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

  const isRsvp = event.didRsvp && !event.didCheckIn;

  // Update event
  const updateEventData = {
    rsvpCount: FieldValue.increment(isRsvp ? 1 : 0),
    newRsvpCount: FieldValue.increment(isRsvp && newAttendee ? 1 : 0),
    attendeeCount: FieldValue.increment(!isRsvp ? 1 : 0),
    newAttendeeCount: FieldValue.increment(!isRsvp && newAttendee ? 1 : 0),
  };
  await eventDoc.ref.update(updateEventData);
});
