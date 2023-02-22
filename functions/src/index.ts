import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
const FieldPath = admin.firestore.FieldPath;

exports.getEvents = functions.https.onRequest(async (request, response) => {
  const orgId = request.query.orgId;
  const seasonId = request.query.seasonId;
  if (orgId === undefined) {
    response
        .status(400)
        .json({"status": "error", "message": "Org Id not provided."});
    return;
  }
  let q: any = db.collection("orgs").doc(orgId as string).collection("events");
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
  response.json({"status": "success", "data": {"events": events}});
});

export const onCreateCheckIn = functions.firestore
    .document("orgs/{orgId}/checkIns/{checkInId}")
    .onCreate(async (checkInDoc, context) => {
      const checkIn = checkInDoc.data();
      const name: string = checkIn.name;
      const email: string = checkIn.email;

      // Get event
      const eventDoc = await db
          .collection("orgs")
          .doc(context.params.orgId)
          .collection("events")
          .doc(checkIn.eventId)
          .get();
      const event = eventDoc.data()!;
      const eventSeasonId = event.seasonId;

      // Update attendee data or create new attendee doc if new
      const attendeeCol = db
          .collection("orgs")
          .doc(context.params.orgId)
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
        // Update name if different than existing
        if (attendeeName !== checkIn.name) {
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
          ...updateData.slice(2)
      );

      // Update event
      const updateEventData = {
        "attendeeCount": FieldValue.increment(1),
        "newAttendeeCount": FieldValue.increment(newAttendee ? 1 : 0),
      };
      await eventDoc.ref.update(updateEventData);
    });
