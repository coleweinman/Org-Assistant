import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  type DocumentData,
  Firestore,
  type FirestoreDataConverter,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { Attendee, CheckIn, LinkedCheckIn, LinkedEvent, Org, OrgEvent, OrgEventWithId } from "./types";
import { CheckInType } from "./enums";
import { CHECK_IN_TYPE_INFO } from "./dynamicConstants";

const attendeeConverter = (seasonId: string): FirestoreDataConverter<Attendee> => (
  {
    toFirestore: () => {
      throw new Error("Illegal operation");
    },
    fromFirestore: (doc: DocumentData) => {
      const { name, email, seasonAttendance, seasonRsvps } = doc.data();
      return {
        name,
        email,
        totalEventsAttended: seasonAttendance[seasonId] ?? 0,
        totalEventsRsvpd: seasonRsvps[seasonId] ?? 0,
      };
    },
  }
);

const checkInConverter: FirestoreDataConverter<CheckIn> = {
  toFirestore: ({ id, ...checkIn }: CheckIn) => checkIn as DocumentData,
  fromFirestore: (doc: DocumentData) => (
    {
      ...(
        doc.data() as Omit<CheckIn, "id">
      ),
      id: doc.id,
    }
  ),
};

const linkedCheckInConverter = (orgName: string): FirestoreDataConverter<LinkedCheckIn> => (
  {
    toFirestore: () => {
      throw new Error("Illegal operation");
    },
    fromFirestore: (doc: DocumentData) => (
      {
        ...(
          doc.data() as Omit<CheckIn, "id">
        ),
        id: doc.id,
        orgName,
      }
    ),
  }
);

const eventConverter: FirestoreDataConverter<OrgEvent> = {
  toFirestore: (orgEvent: OrgEvent) => orgEvent as DocumentData,
  fromFirestore: (doc: DocumentData) => doc.data() as OrgEvent,
};

const orgConverter: FirestoreDataConverter<Org> = {
  toFirestore: ({ id, ...orgEvent }: Org) => orgEvent as DocumentData,
  fromFirestore: (doc: DocumentData) => (
    {
      ...(
        doc.data() as Omit<Org, "id">
      ),
      id: doc.id,
    }
  ),
};

export function getAttendees(db: Firestore, orgId: string, seasonId: string, callback: (events: Attendee[]) => void) {
  const q = query<Attendee>(
    collection(db, "orgs", orgId, "attendees")
      .withConverter<Attendee>(attendeeConverter(seasonId)), where("lastActiveSeasonId", "==", seasonId),
  );
  return onSnapshot(q, (querySnapshot) => {
    const events: Attendee[] = querySnapshot.docs.map((doc) => doc.data());
    callback(events);
  });
}

export async function submitCheckInOrRsvp(
  db: Firestore,
  orgId: string,
  eventId: string,
  checkIn: CheckIn,
  type: CheckInType,
): Promise<void | never> {
  const checkInsCollection = collection(db, "orgs", orgId, "checkIns");
  const q = query<CheckIn>(
    checkInsCollection.withConverter<CheckIn>(checkInConverter),
    where("email", "==", checkIn.email),
    where("eventId", "==", eventId),
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const existing = snapshot.docs[0].data();
    // Do not allow user to re-rsvp or re-check in
    if ((
      existing.didRsvp && type === CheckInType.RSVP
    ) || existing.didCheckIn) {
      throw new Error(CHECK_IN_TYPE_INFO[type].errorMessage);
    }
    await setDoc(
      snapshot.docs[0].ref,
      // Overwrite didRsvp with true if RSVP exists
      {
        ...checkIn,
        didRsvp: checkIn.didRsvp || existing.didRsvp,
      },
    );
  } else {
    console.log(checkIn);
    await addDoc(checkInsCollection, checkIn);
  }
}

export function getCheckIns(
  db: Firestore,
  orgId: string,
  eventId: string,
  callback: (checkIns: CheckIn[]) => void,
) {
  const q = query<CheckIn>(
    collection(db, "orgs", orgId, "checkIns").withConverter<CheckIn>(checkInConverter),
    where("eventId", "==", eventId),
  );
  return onSnapshot(q, (querySnapshot) => {
    const checkIns: CheckIn[] = [];
    querySnapshot.forEach((doc) => {
      const data: CheckIn = doc.data();
      checkIns.push(data);
    });
    callback(checkIns);
  });
}

export function getAttendeeCheckIns(
  db: Firestore,
  orgId: string,
  email: string,
  callback: (checkIns: CheckIn[]) => void,
) {
  const q = query<CheckIn>(
    collection(db, "orgs", orgId, "checkIns").withConverter<CheckIn>(checkInConverter),
    where("email", "==", email),
  );
  return onSnapshot(q, (querySnapshot) => {
    const checkIns: CheckIn[] = [];
    querySnapshot.forEach((doc) => {
      const data: CheckIn = doc.data();
      checkIns.push(data);
    });
    callback(checkIns);
  });
}

export async function getLinkedCheckIns(db: Firestore, linkedEvents: LinkedEvent[]): Promise<LinkedCheckIn[]> {
  const checkIns: LinkedCheckIn[] = [];
  for (const { org, event } of linkedEvents) {
    const q = query<LinkedCheckIn>(
      collection(db, "orgs", org.id, "checkIns").withConverter<LinkedCheckIn>(linkedCheckInConverter(org.name)),
      where("eventId", "==", event.id),
    );
    const snapshot = await getDocs<LinkedCheckIn>(q);
    snapshot.forEach((checkInDoc) => checkIns.push(checkInDoc.data()));
  }
  return checkIns;
}

export async function importCheckIns(
  db: Firestore,
  orgId: string,
  eventId: string,
  checkIns: Omit<CheckIn, "id">[],
  prevCheckIns: CheckIn[],
) {
  const batch = writeBatch(db);
  const checkInsCollection = collection(db, "orgs", orgId, "checkIns").withConverter<CheckIn>(checkInConverter);
  checkIns.forEach((checkIn) => {
    const existing = prevCheckIns.find(({ email }) => email === checkIn.email);
    batch.set(existing ? doc(checkInsCollection, existing.id) : doc(checkInsCollection), checkIn);
  });
  await batch.commit();
}

export function getEvents(
  db: Firestore,
  orgId: string,
  seasonId: string,
  callback: (events: OrgEventWithId[]) => void,
) {
  const q = query<OrgEvent>(
    collection(db, "orgs", orgId, "events").withConverter<OrgEvent>(eventConverter),
    where("seasonId", "==", seasonId),
  );
  return onSnapshot(q, (querySnapshot) => {
    const events: OrgEventWithId[] = [];
    querySnapshot.forEach((doc) => {
      events.push({ ...doc.data(), id: doc.id });
    });
    callback(events);
  });
}

export function getEvent(
  db: Firestore,
  orgId: string,
  eventId: string,
  secure: boolean,
  callback: (event: OrgEvent | null) => void,
) {
  return onSnapshot(doc(db, "orgs", orgId, "events", eventId).withConverter<OrgEvent>(eventConverter), async (doc) => {
    callback(doc.exists() ? doc.data() : null);
  }, (e) => console.error(e));
}

export async function addEvent(db: Firestore, orgId: string, event: Omit<OrgEvent, "id">) {
  const result = await addDoc(collection(db, "orgs", orgId, "events").withConverter<OrgEvent>(eventConverter), event);
  return result.id;
}

export async function updateEvent(db: Firestore, orgId: string, eventId: string, event: OrgEvent) {
  await updateDoc(doc(db, "orgs", orgId, "events", eventId).withConverter<OrgEvent>(eventConverter), event);
}

export async function deleteEvent(db: Firestore, orgId: string, eventId: string) {
  const checkInsSnapshot = await getDocs(query(
    collection(db, "orgs", orgId, "checkIns"),
    where("eventId", "==", eventId),
  ));
  const batch = writeBatch(db);
  // Delete all associated check ins
  checkInsSnapshot.forEach((checkIn) => {
    batch.delete(doc(db, "orgs", orgId, "checkIns", checkIn.id));
  });
  await batch.commit();
  // Commit this after the batch so that firebase function can succeed
  await deleteDoc(doc(db, "orgs", orgId, "events", eventId));
}

export function getOrgs(db: Firestore, uid: string, callback: (events: Org[]) => void) {
  const q = query<Org>(collection(db, "orgs").withConverter<Org>(orgConverter), where("admins", "array-contains", uid));
  return onSnapshot(q, (querySnapshot) => {
    const events: Org[] = [];
    querySnapshot.forEach((doc) => {
      const data: Org = doc.data();
      events.push(data);
    });
    callback(events);
  });
}

export function getOrg(db: Firestore, orgId: string, callback: (org: Org | null) => void) {
  return onSnapshot(doc(db, "orgs", orgId).withConverter<Org>(orgConverter), (doc) => {
    if (doc.exists()) {
      const org = doc.data();
      callback(org);
    } else {
      callback(null);
    }
  }, (e) => console.error(e));
}

export async function getOrgOnce(db: Firestore, orgId: string) {
  const orgDoc = await getDoc(doc(db, "orgs", orgId).withConverter<Org>(orgConverter));
  return orgDoc.data();
}