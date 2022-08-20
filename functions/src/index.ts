import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
const FieldPath = admin.firestore.FieldPath;

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const onCheckInCreate = functions.firestore
    .document("orgs/{orgId}/events/{eventId}/checkIns/{checkInId}")
    .onCreate(async (checkInDoc, context) => {
      const checkIn = checkInDoc.data();
      const name: string = checkIn.name;
      const email: string = checkIn.email;

      // Get event
      const eventDoc = await checkInDoc.ref.parent.parent!.get();
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

      await attendeeDocRef.update(updateData);

      // Update event
      const updateEventData = {
        "checkInCount": FieldValue.increment(1),
        "newAttendeeCount": FieldValue.increment(newAttendee ? 1 : 0),
      };
      await eventDoc.ref.update(updateEventData);
    });
