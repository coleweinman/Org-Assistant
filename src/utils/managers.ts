import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  type DocumentData,
  documentId,
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
import type {
  Attendee,
  AttendeeWithData,
  CheckIn,
  LinkedCheckIn,
  LinkedOrg,
  Org,
  OrgEvent,
  OrgEventWithId,
} from "./types";
import { CheckInType } from "./enums";
import { CHECK_IN_REQUIREMENTS } from "./dynamicConstants";
import dayjs from "dayjs";

const attendeeConverter = (seasonId: string): FirestoreDataConverter<Attendee> => (
  {
    toFirestore: () => {
      throw new Error("Illegal operation");
    },
    fromFirestore: (doc: DocumentData) => {
      const { name, email, schoolId, discord, year, seasonAttendance, seasonRsvps } = doc.data();
      return {
        id: doc.id,
        name,
        email,
        schoolId,
        discord,
        year,
        totalEventsAttended: seasonAttendance[seasonId] ?? 0,
        totalEventsRsvpd: seasonRsvps[seasonId] ?? 0,
      };
    },
  }
);

const attendeeWithDataConverter: FirestoreDataConverter<AttendeeWithData> = {
  toFirestore: ({ id, ...attendee }: AttendeeWithData) => attendee as DocumentData,
  fromFirestore: (doc: DocumentData) => (
    {
      ...(
        doc.data() as Omit<AttendeeWithData, "id">
      ),
      id: doc.id,
    }
  ),
};

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

const eventWithIdConverter: FirestoreDataConverter<OrgEventWithId> = {
  toFirestore: ({ id, ...orgEvent }: OrgEventWithId) => orgEvent as DocumentData,
  fromFirestore: (doc: DocumentData) => (
    {
      ...(
        doc.data() as Omit<OrgEventWithId, "id">
      ),
      id: doc.id,
    }
  ),
};

const linkedOrgConverter: FirestoreDataConverter<LinkedOrg> = {
  toFirestore: (org: LinkedOrg) => {
    throw new Error("Illegal operation");
  },
  fromFirestore: (doc: DocumentData) => {
    const { name } = doc.data();
    return { id: doc.id, name };
  },
};

const orgConverter: FirestoreDataConverter<Org> = {
  toFirestore: ({ id, calendarId, ...org }: Org) => (
    org as DocumentData
  ),
  fromFirestore: (doc: DocumentData) => (
    {
      ...(
        doc.data() as Omit<Org, "id">
      ),
      id: doc.id,
    }
  ),
};

export function getAttendees(
  db: Firestore,
  orgId: string,
  seasonId: string,
  callback: (attendees: Attendee[]) => void,
) {
  const q = query<Attendee>(
    collection(db, "orgs", orgId, "attendees")
      .withConverter<Attendee>(attendeeConverter(seasonId)), where("lastActiveSeasonId", "==", seasonId),
  );
  return onSnapshot(q, (querySnapshot) => {
    const events: Attendee[] = querySnapshot.docs.map((doc) => doc.data());
    callback(events);
  });
}

export function getAttendee(
  db: Firestore,
  orgId: string,
  attendeeId: string,
  callback: (attendee: AttendeeWithData | null) => void,
) {
  const q = doc(db, "orgs", orgId, "attendees", attendeeId).withConverter<AttendeeWithData>(attendeeWithDataConverter);
  return onSnapshot(q, (doc) => {
    callback(doc.exists() ? doc.data() : null);
  });
}

export async function getAttendeeId(db: Firestore, orgId: string, email: string): Promise<string | null> {
  const q = query(collection(db, "orgs", orgId, "attendees"), where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  return snapshot.docs[0].id;
}

export async function submitCheckInOrRsvp(
  db: Firestore,
  orgId: string,
  eventId: string,
  { seasonId, checkInRequirements, rsvpCutoff, checkInCutoff }: OrgEvent,
  checkIn: CheckIn,
  type: CheckInType,
): Promise<string | never> {
  const checkInsCollection = collection(db, "orgs", orgId, "checkIns");
  const existingCheckInQuery = query<CheckIn>(
    checkInsCollection.withConverter<CheckIn>(checkInConverter),
    where("email", "==", checkIn.email),
    where("eventId", "==", eventId),
  );
  const existingAttendeeQuery = query<Attendee>(
    collection(db, "orgs", orgId, "attendees").withConverter<Attendee>(attendeeConverter(seasonId)),
    where("email", "==", checkIn.email),
  );
  const [existingCheckInSnapshot, existingAttendeeSnapshot] = await Promise.all([
    getDocs(existingCheckInQuery),
    getDocs(existingAttendeeQuery),
  ]);
  const existingCheckIn = existingCheckInSnapshot.empty ? null : existingCheckInSnapshot.docs[0].data();
  const existingAttendee = existingAttendeeSnapshot.empty ? null : existingAttendeeSnapshot.docs[0].data();
  // Do not allow user to re-rsvp or re-check in
  if (existingCheckIn) {
    const reRsvping = existingCheckIn.didRsvp && type === CheckInType.RSVP;
    const reCheckingIn = existingCheckIn.didCheckIn && type === CheckInType.CHECK_IN;
    if (reRsvping || reCheckingIn) {
      // Don't re-check in, but let them re-navigate to the submitted page
      return existingCheckIn.id;
    }
  }
  if (type === CheckInType.CHECK_IN && checkInCutoff && dayjs().isAfter(checkInCutoff.toDate(), "minute")) {
    throw new Error("Check in cutoff time has passed");
  } else if (type === CheckInType.RSVP && rsvpCutoff && dayjs().isAfter(rsvpCutoff.toDate(), "minute")) {
    throw new Error("RSVP cutoff time has passed");
  } else if (type === CheckInType.CHECK_IN) {
    // Adhere to specified check in requirements
    for (const requirement of checkInRequirements ?? []) {
      if (!CHECK_IN_REQUIREMENTS[requirement].meetsCondition(existingCheckIn, existingAttendee)) {
        throw new Error(CHECK_IN_REQUIREMENTS[requirement].errorMessage);
      }
    }
  }
  if (existingCheckIn) {
    const existingDoc = existingCheckInSnapshot.docs[0];
    // Replace existing check in
    await setDoc(existingDoc.ref, {
      ...checkIn,
      // Overwrite didRsvp with true if RSVP exists
      didRsvp: checkIn.didRsvp || existingCheckIn.didRsvp,
    });
    return existingDoc.id;
  } else {
    // Create new check in
    return (
      await addDoc(checkInsCollection, checkIn)
    ).id;
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

export function getCheckIn(
  db: Firestore,
  orgId: string,
  checkInId: string,
  callback: (checkIn: CheckIn | null) => void,
) {
  const q = doc(db, "orgs", orgId, "checkIns", checkInId).withConverter<CheckIn>(checkInConverter);
  return onSnapshot(q, (querySnapshot) => callback(querySnapshot.data() ?? null));
}

export function getAttendeeEvents(
  db: Firestore,
  orgId: string,
  email: string,
  callback: (checkIns: OrgEventWithId[]) => void,
) {
  const q = query<CheckIn>(
    collection(db, "orgs", orgId, "checkIns").withConverter<CheckIn>(checkInConverter),
    where("email", "==", email),
  );
  return onSnapshot(q, async (querySnapshot) => {
    const checkIns = querySnapshot.docs.map((doc) => doc.data());
    // Split into arrays of 10
    const eventIdBatches: string[][] = [];
    for (let i = 0; i < checkIns.length; i++) {
      if (i % 10 === 0) {
        eventIdBatches.push([]);
      }
      eventIdBatches[eventIdBatches.length - 1].push(checkIns[i].eventId);
    }
    // Make separate queries in batches of 10
    const eventsCollection = collection(db, "orgs", orgId, "events")
      .withConverter<OrgEventWithId>(eventWithIdConverter);
    const responseBatches = await Promise.all(eventIdBatches.map((eventIds) => getDocs(query(
      eventsCollection,
      where(documentId(), "in", eventIds),
    )).then((snapshot) => snapshot.docs.map((doc) => doc.data()))));
    // Join all results into one array and call callback
    const events: OrgEventWithId[] = (
      [] as OrgEventWithId[]
    ).concat(...responseBatches);
    callback(events);
  });
}

export async function getLinkedCheckIns(
  db: Firestore,
  eventId: string,
  linkedEvents: LinkedOrg[],
): Promise<LinkedCheckIn[]> {
  const checkIns: LinkedCheckIn[] = [];
  for (const { id, name } of linkedEvents) {
    const q = query<LinkedCheckIn>(
      collection(db, "orgs", id, "checkIns").withConverter<LinkedCheckIn>(linkedCheckInConverter(name)),
      where("eventId", "==", eventId),
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

export async function getEventOnce(db: Firestore, orgId: string, eventId: string) {
  const eventDoc = await getDoc(doc(db, "orgs", orgId, "events", eventId).withConverter<OrgEvent>(eventConverter));
  return eventDoc.data();
}

export async function addEvent(db: Firestore, orgId: string, event: Omit<OrgEvent, "id">) {
  const result = await addDoc(collection(db, "orgs", orgId, "events").withConverter<OrgEvent>(eventConverter), event);
  return result.id;
}

export async function updateEvent(db: Firestore, orgId: string, eventId: string, event: OrgEvent) {
  await setDoc(doc(db, "orgs", orgId, "events", eventId).withConverter<OrgEvent>(eventConverter), event);
}

export async function updateLinkedEvents(
  db: Firestore,
  orgId: string,
  eventId: string,
  linkedEvents: LinkedOrg[],
  newOrg: LinkedOrg,
) {
  console.log([...linkedEvents, newOrg]);
  await updateDoc(
    doc(db, "orgs", orgId, "events", eventId).withConverter<OrgEvent>(eventConverter),
    { linkedEvents: [...linkedEvents, newOrg] },
  );
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

export function getAllOrgs(db: Firestore, excludeOrgs: string[], callback: (orgs: LinkedOrg[]) => void) {
  // TODO: excludeOrgs is currently limited to 10 orgs
  const q = query<LinkedOrg>(collection(
    db, "orgs",
  ).withConverter<LinkedOrg>(linkedOrgConverter), where("__name__", "not-in", excludeOrgs));
  return onSnapshot(q, (querySnapshot) => {
    const orgs: LinkedOrg[] = querySnapshot.docs.map((doc) => doc.data());
    callback(orgs);
  });
}

export function getOrgs(db: Firestore, uid: string, callback: (orgs: Org[]) => void) {
  const q = query<Org>(collection(db, "orgs").withConverter<Org>(orgConverter), where("admins", "array-contains", uid));
  return onSnapshot(q, (querySnapshot) => {
    const orgs: Org[] = querySnapshot.docs.map((doc) => doc.data());
    callback(orgs);
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

export async function updateOrg(db: Firestore, org: Org) {
  await updateDoc(doc(db, "orgs", org.id).withConverter<Org>(orgConverter), org);
}

export async function updateCalendarId(db: Firestore, orgId: string, calendarId: string | null) {
  await updateDoc(doc(db, "orgs", orgId), { calendarId });
}
