import { DocumentReference, FieldPath, FieldValue, Firestore, Transaction } from "firebase-admin/firestore";
import { getEventDoc } from "./firestoreHelpers";
import { Attendee, UpdateData } from "./types";

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
): UpdateData {
  const rsvpUpdates: UpdateData = rsvp ? [
    new FieldPath("totalEventsRsvpd"), FieldValue.increment(1),
    new FieldPath("seasonRsvps", seasonId), FieldValue.increment(1),
  ] : [];
  const checkInUpdates: UpdateData = checkIn ? [
    new FieldPath("totalEventsAttended"), FieldValue.increment(1),
    new FieldPath("seasonAttendance", seasonId), FieldValue.increment(1),
  ] : [];
  return [
    new FieldPath("name"), name,
    new FieldPath("schoolId"), schoolId,
    new FieldPath("discord"), discord,
    new FieldPath("lastActiveSeasonId"), seasonId,
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
  return [
    new FieldPath("lastActiveSeasonId"), isNewRsvper && isNewAttendee ?
      decrementSeasonId(seasonId, seasonsActive) : seasonId,
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
