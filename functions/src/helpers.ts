import {
  DocumentReference,
  FieldPath,
  FieldValue,
  Firestore,
  QueryDocumentSnapshot,
  Transaction,
} from "firebase-admin/firestore";
import { getEventDoc } from "./firestoreHelpers";
import type { Attendee, OrgEvent, UpdateData } from "./types";
import { Org } from "./types";
import { error } from "firebase-functions/logger";
import { type calendar_v3 as CalendarV3, google } from "googleapis";
import { JWT } from "google-auth-library";
import { Modality } from "./enums";
import { eventConverter, orgConverter } from "./converters";
import { SERVICE_ACCOUNT_KEYFILE } from "./constants";

const calendar = google.calendar("v3");
const TIME_ZONE = "America/Chicago";

export async function getSeasonId(t: Transaction, db: Firestore, orgId: string, eventId: string) {
  // Get event
  const eventDoc = await t.get(getEventDoc(db, orgId, eventId));
  const event = eventDoc?.data();
  if (!eventDoc || !event) {
    console.error(`Could not find created doc orgs/${orgId}/events/${eventId}`);
    return null;
  }
  return event.seasonId;
}

// A season is expected to have the format "[Fall/Spring] [year]", e.g. "Fall 2023"
export function decrementSeasonId(seasonId: string, seasonsActive: string[]): string {
  const newSeasons = seasonsActive.filter((season) => season !== seasonId);
  if (newSeasons.length === 0) {
    error("Could not decrement season Id");
    return seasonId;
  }
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

export function getWasNewAttendee(
  removeRsvp: boolean,
  removeCheckIn: boolean,
  seasonId: string,
  attendee: Attendee,
): boolean {
  const rsvpBit = removeRsvp ? 1 : 0;
  const checkInBit = removeCheckIn ? 1 : 0;
  const maxPrevEvents = attendee.seasonRsvps[seasonId] - rsvpBit + attendee.seasonAttendance[seasonId] - checkInBit;
  return maxPrevEvents === 0;
}

export function getAttendeeAddUpdates(
  rsvp: boolean,
  checkIn: boolean,
  name: string,
  schoolId: string,
  discord: string,
  seasonId: string,
  { lastActiveSeasonId }: Attendee,
): UpdateData {
  const rsvpUpdates: UpdateData = rsvp ? [
    new FieldPath("totalEventsRsvpd"), FieldValue.increment(1),
    new FieldPath("seasonRsvps", seasonId), FieldValue.increment(1),
  ] : [];
  const checkInUpdates: UpdateData = checkIn ? [
    new FieldPath("totalEventsAttended"), FieldValue.increment(1),
    new FieldPath("seasonAttendance", seasonId), FieldValue.increment(1),
  ] : [];
  const seasonIdUpdates: UpdateData = lastActiveSeasonId !== seasonId ? [
    new FieldPath("lastActiveSeasonId"), seasonId,
  ] : [];
  return [
    new FieldPath("name"), name,
    new FieldPath("schoolId"), schoolId,
    new FieldPath("discord"), discord,
    ...seasonIdUpdates,
    ...rsvpUpdates,
    ...checkInUpdates,
  ];
}

export function getEventAddUpdates(rsvp: boolean, checkIn: boolean, isNewAttendee: boolean): UpdateData {
  const rsvpUpdates = rsvp ? [
    new FieldPath("rsvpCount"), FieldValue.increment(1),
    new FieldPath("newRsvpCount"), FieldValue.increment(isNewAttendee ? 1 : 0),
  ] : [];
  const checkInUpdates = checkIn ? [
    new FieldPath("attendeeCount"), FieldValue.increment(1),
    new FieldPath("newAttendeeCount"), FieldValue.increment(isNewAttendee ? 1 : 0),
  ] : [];
  return [...rsvpUpdates, ...checkInUpdates];
}

export function getAttendeeRemoveUpdates(
  rsvp: boolean,
  checkIn: boolean,
  seasonId: string,
  { seasonAttendance, seasonRsvps }: Attendee,
): UpdateData {
  const isNewRsvper = seasonRsvps[seasonId] <= 1;
  const isNewAttendee = seasonAttendance[seasonId] <= 1;
  const rsvpUpdates: UpdateData = rsvp ? [
    new FieldPath("totalEventsRsvpd"), FieldValue.increment(-1),
    new FieldPath("seasonRsvps", seasonId), isNewRsvper ? FieldValue.delete() : FieldValue.increment(-1),
  ] : [];
  const checkInUpdates: UpdateData = checkIn ? [
    new FieldPath("totalEventsAttended"), FieldValue.increment(-1),
    new FieldPath("seasonAttendance", seasonId), isNewAttendee ? FieldValue.delete() : FieldValue.increment(-1),
  ] : [];
  const seasonsActive = [...Object.keys(seasonAttendance), ...Object.keys(seasonRsvps)];
  const seasonIdUpdate: UpdateData = (
    rsvp || checkIn
  ) && isNewRsvper && isNewAttendee
    ? [new FieldPath("lastActiveSeasonId"), decrementSeasonId(seasonId, seasonsActive)]
    : [];
  return [
    ...seasonIdUpdate,
    ...rsvpUpdates,
    ...checkInUpdates,
  ];
}

export function getEventRemoveUpdates(rsvp: boolean, checkIn: boolean, isNewAttendee: boolean): UpdateData {
  const rsvpUpdates = rsvp ? [
    new FieldPath("rsvpCount"), FieldValue.increment(-1),
    new FieldPath("newRsvpCount"), FieldValue.increment(isNewAttendee ? -1 : 0),
  ] : [];
  const checkInUpdates = checkIn ? [
    new FieldPath("attendeeCount"), FieldValue.increment(-1),
    new FieldPath("newAttendeeCount"), FieldValue.increment(isNewAttendee ? -1 : 0),
  ] : [];
  return [...rsvpUpdates, ...checkInUpdates];
}

export function setUpdates(db: Transaction, ref: DocumentReference, updates: UpdateData) {
  if (updates.length < 2) {
    return;
  }
  db.update(ref, updates[0], updates[1], ...updates.slice(2));
}

export async function updateLinkedEvents(db: Firestore, eventId: string, before: OrgEvent, after: OrgEvent) {
  const {
    name,
    startTime,
    endTime,
    location,
    modality,
    virtualEventUrl,
    linkedEvents,
  } = after;
  if (!linkedEvents || linkedEvents.length === 0) {
    return;
  }
  await db.runTransaction(async (t) => {
    const updates: UpdateData = [];
    if (!startTime.isEqual(before.startTime)) {
      updates.push(new FieldPath("startTime"));
      updates.push(startTime);
    }
    if (!endTime.isEqual(before.endTime)) {
      updates.push(new FieldPath("endTime"));
      updates.push(endTime);
    }
    if (location !== before.location) {
      updates.push(new FieldPath("location"));
      updates.push(location ?? FieldValue.delete());
    }
    if (modality !== before.modality) {
      updates.push(new FieldPath("modality"));
      updates.push(modality);
    }
    if (virtualEventUrl !== before.virtualEventUrl) {
      updates.push(new FieldPath("virtualEventUrl"));
      updates.push(virtualEventUrl ?? FieldValue.delete());
    }
    for (const { org, event } of linkedEvents) {
      const eventDoc = db.collection("orgs")
        .doc(org.id)
        .collection("events")
        .doc(event.id)
        .withConverter<OrgEvent>(eventConverter);
      if (name !== before.name) {
        const orgEvent = (
          await t.get(eventDoc)
        ).data();
        if (orgEvent) {
          const linkedEvent = orgEvent.linkedEvents.find(({ event }) => event.id === eventId);
          updates.push(new FieldPath("linkedEvents"));
          updates.push(FieldValue.arrayRemove(linkedEvent));
          updates.push(FieldValue.arrayUnion({
            ...linkedEvent, event: {
              id: eventId,
              name,
            },
          }));
        }
      }
      setUpdates(t, eventDoc, updates);
    }
  });
}

export async function removeLinkedEvents(db: Firestore, eventId: string, { linkedEvents }: OrgEvent) {
  if (!linkedEvents) {
    return;
  }
  await db.runTransaction(async (t) => {
    for (const { org, event } of linkedEvents) {
      const eventDoc = db.collection("orgs")
        .doc(org.id)
        .collection("events")
        .doc(event.id)
        .withConverter<OrgEvent>(eventConverter);
      const orgEvent = (
        await t.get(eventDoc)
      ).data();
      if (orgEvent) {
        const linkedEvent = orgEvent.linkedEvents.find(({ event }) => event.id === eventId);
        t.update(eventDoc, {
          linkedEvents: FieldValue.arrayRemove(linkedEvent),
        });
      }
    }
  });
}

function getCode(ch: string) {
  return ch.charCodeAt(0);
}

function charModulo(ch: string, zero: string, mod: string) {
  return String.fromCharCode(getCode(zero) + (
    getCode(ch) - getCode(zero)
  ) % (
    getCode(mod) - getCode(zero) + 1
  ));
}

function charIsBetween(ch: string, first: string, last: string) {
  return getCode(ch) >= getCode(first) && getCode(ch) <= getCode(last);
}

function firestoreToCalendarEventId(firestoreId: string): string {
  // GCal IDs are case-insensitive and a-v only, so we encode a firestore doc id as:
  // [lowercase id mod v (22)][0 if lowercase/number, 1 if uppercase, 2 if wrapped around lowercase, 3 if wrapped
  // around uppercase]
  let eventId = "";
  for (const ch of firestoreId) {
    // Wrap around at "v"
    eventId += charIsBetween(ch, "0", "9") ? ch : charModulo(ch.toLowerCase(), "a", "v");
  }
  for (const ch of firestoreId) {
    const isUpperCase = charIsBetween(ch, "A", "Z") ? 1 : 0;
    const isWrapped = charIsBetween(ch.toLowerCase(), "v", "z") ? 2 : 0;
    eventId += (
      isWrapped + isUpperCase
    ).toString();
  }
  return eventId;
}

export async function addToCalendarList(id: string, auth: JWT) {
  await calendar.calendarList.insert({ auth, requestBody: { id } });
}

export async function removeFromCalendarList(id: string, auth: JWT) {
  await calendar.calendarList.delete({ auth, calendarId: id });
}

function getCalendarRequestBody(event: OrgEvent): CalendarV3.Schema$Event {
  return {
    summary: event.name,
    description: event.description,
    location: event.modality === Modality.VIRTUAL ? event.virtualEventUrl : event.location,
    start: {
      dateTime: event.startTime.toDate().toISOString(),
      timeZone: TIME_ZONE,
    },
    end: {
      dateTime: event.endTime.toDate().toISOString(),
      timeZone: TIME_ZONE,
    },
  };
}

export async function addCalendarEvent(
  db: Firestore,
  orgId: string,
  eventDoc: QueryDocumentSnapshot,
) {
  const orgDoc = await db.collection("orgs").doc(orgId).withConverter<Org>(orgConverter).get();
  const calendarId = orgDoc.data()?.calendarId;
  if (!calendarId) {
    return;
  }
  const auth = new JWT({ keyFile: SERVICE_ACCOUNT_KEYFILE, scopes: "https://www.googleapis.com/auth/calendar.events" });
  await calendar.events.insert({
    auth,
    calendarId,
    requestBody: {
      id: firestoreToCalendarEventId(eventDoc.id),
      ...getCalendarRequestBody(eventDoc.data() as OrgEvent),
    },
  });
}

export async function updateCalendarEvent(
  db: Firestore,
  orgId: string,
  eventDoc: QueryDocumentSnapshot,
) {
  const orgDoc = await db.collection("orgs").doc(orgId).withConverter<Org>(orgConverter).get();
  const calendarId = orgDoc.data()?.calendarId;
  if (!calendarId) {
    return;
  }
  const auth = new JWT({ keyFile: SERVICE_ACCOUNT_KEYFILE, scopes: "https://www.googleapis.com/auth/calendar.events" });
  const eventId = firestoreToCalendarEventId(eventDoc.id);
  try {
    await calendar.events.get({ auth, calendarId, eventId });
  } catch (e) {
    if ((
      e as any
    ).errors?.find(({ reason }: { reason: string }) => reason === "notFound")) {
      // Create a new event if the calendar event doesn't already exist
      await calendar.events.insert({
        auth,
        calendarId,
        requestBody: { id: eventId, ...getCalendarRequestBody(eventDoc.data() as OrgEvent) },
      });
      return;
    }
    throw e;
  }
  await calendar.events.update({
    auth,
    calendarId,
    eventId,
    requestBody: getCalendarRequestBody(eventDoc.data() as OrgEvent),
  });
}

export async function deleteCalendarEvent(db: Firestore, orgId: string, eventId: string) {
  const orgDoc = await db.collection("orgs").doc(orgId).withConverter<Org>(orgConverter).get();
  const calendarId = orgDoc.data()?.calendarId;
  if (!calendarId) {
    return;
  }
  const auth = new JWT({ keyFile: SERVICE_ACCOUNT_KEYFILE, scopes: "https://www.googleapis.com/auth/calendar.events" });
  await calendar.events.delete({ auth, calendarId, eventId: firestoreToCalendarEventId(eventId) });
}
