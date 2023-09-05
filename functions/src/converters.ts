import { firestore } from "firebase-admin";
import { Attendee, Org, OrgEvent } from "./types";

export const attendeeConverter: firestore.FirestoreDataConverter<Attendee> = {
  toFirestore: (orgEvent: Attendee) => orgEvent as firestore.DocumentData,
  fromFirestore: (doc: firestore.DocumentData) => doc.data() as Attendee,
};

export const eventConverter: firestore.FirestoreDataConverter<OrgEvent> = {
  toFirestore: (orgEvent: OrgEvent) => orgEvent as firestore.DocumentData,
  fromFirestore: (doc: firestore.DocumentData) => doc.data() as OrgEvent,
};

export const orgConverter: firestore.FirestoreDataConverter<Org> = {
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
