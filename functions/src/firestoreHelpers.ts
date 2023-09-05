import {
  CollectionReference,
  DocumentReference,
  Firestore,
  QueryDocumentSnapshot,
  Transaction,
} from "firebase-admin/firestore";
import { Attendee, OrgEvent } from "./types";
import { attendeeConverter, eventConverter } from "./converters";

export function getEventsCollection(db: Firestore, orgId: string): CollectionReference<OrgEvent> {
  return db.collection("orgs")
    .doc(orgId as string)
    .collection("events")
    .withConverter<OrgEvent>(eventConverter);
}

export function getEventDoc(
  db: Firestore,
  orgId: string,
  eventId: string,
): DocumentReference<OrgEvent> {
  return db
    .collection("orgs")
    .doc(orgId)
    .collection("events")
    .doc(eventId)
    .withConverter<OrgEvent>(eventConverter);
}

export function getAttendeesCollection(
  db: Firestore,
  orgId: string,
): CollectionReference<Attendee> {
  return db
    .collection("orgs")
    .doc(orgId)
    .collection("attendees")
    .withConverter<Attendee>(attendeeConverter);
}

export async function getAttendeeDoc(
  t: Transaction,
  db: Firestore,
  orgId: string,
  email: string,
): Promise<QueryDocumentSnapshot<Attendee> | null> {
  const attendeeSnapshot = await t.get(getAttendeesCollection(db, orgId).where("email", "==", email.toLowerCase()));
  if (attendeeSnapshot.empty) {
    console.error("Could not find attendee associated with check in");
    return null;
  }
  return attendeeSnapshot.docs[0];
}
