import { firestore } from "firebase-admin";
import { Attendee, OrgEvent } from "./types";
import { attendeeConverter, eventConverter } from "./converters";

export function getEventsCollection(db: firestore.Firestore, orgId: string): firestore.CollectionReference<OrgEvent> {
  return db.collection("orgs")
    .doc(orgId as string)
    .collection("events")
    .withConverter<OrgEvent>(eventConverter);
}

export function getEventDoc(
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

export function getAttendeesCollection(
  db: firestore.Firestore,
  orgId: string,
): firestore.CollectionReference<Attendee> {
  return db
    .collection("orgs")
    .doc(orgId)
    .collection("attendees")
    .withConverter<Attendee>(attendeeConverter);
}

export async function getAttendeeDoc(
  t: firestore.Transaction,
  db: firestore.Firestore,
  orgId: string,
  email: string,
): Promise<firestore.QueryDocumentSnapshot<Attendee> | null> {
  const attendeeSnapshot = await t.get(getAttendeesCollection(db, orgId).where("email", "==", email.toLowerCase()));
  if (attendeeSnapshot.empty) {
    console.error("Could not find attendee associated with check in");
    return null;
  }
  return attendeeSnapshot.docs[0];
}
