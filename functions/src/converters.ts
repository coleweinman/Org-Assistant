import type { DocumentData, FirestoreDataConverter } from "firebase-admin/firestore";
import type { Attendee, Org, OrgEvent } from "./types";

export const attendeeConverter: FirestoreDataConverter<Attendee> = {
  toFirestore: (orgEvent: Attendee) => orgEvent as DocumentData,
  fromFirestore: (doc: DocumentData) => doc.data() as Attendee,
};

export const eventConverter: FirestoreDataConverter<OrgEvent> = {
  toFirestore: (orgEvent: OrgEvent) => orgEvent as DocumentData,
  fromFirestore: (doc: DocumentData) => doc.data() as OrgEvent,
};

export const orgConverter: FirestoreDataConverter<Org> = {
  toFirestore: (orgEvent: Org) => orgEvent as DocumentData,
  fromFirestore: (doc: DocumentData) => (
    {
      ...(
        doc.data() as Omit<Org, "id">
      ),
      id: doc.id,
    }
  ),
};
