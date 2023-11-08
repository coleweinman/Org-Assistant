import { firestore } from "firebase-admin";
import { Modality } from "./enums";
import { FieldPath, FieldValue, Timestamp } from "firebase-admin/lib/firestore";

export type Attendee = {
  name: string,
  email: string,
  schoolId: string,
  discord?: string,
  year: string,
  totalEventsAttended: number,
  totalEventsRsvpd: number,
  lastActiveSeasonId: string,
  seasonAttendance: {
    [season: string]: number,
  }
  seasonRsvps: {
    [season: string]: number,
  }
};

export type CheckIn = {
  name: string,
  email: string,
  schoolId: string,
  year: string,
  discord: string | null,
  didRsvp: boolean,
  didCheckIn: boolean,
  timestamp: firestore.Timestamp,
  eventId: string,
};

export type LinkedEvent = {
  org: Pick<Org, "id" | "name">,
  event: Pick<OrgEvent, "name"> & {
    id: string,
  },
};

export type OrgEvent = {
  name: string,
  seasonId: string,
  imageUrl?: string,
  description?: string,
  location?: string,
  startTime: Timestamp,
  endTime: Timestamp,
  modality: Modality,
  virtualEventUrl?: string,
  rsvpCount: number,
  newRsvpCount: number,
  newAttendeeCount: number,
  attendeeCount: number,
  linkedEvents: LinkedEvent[],
};

export type PublicOrgEvent = Omit<
  OrgEvent,
  "seasonId" | "newAttendeeCount" | "attendeeCount" | "rsvpCount" | "newRsvpCount" | "linkedEvents"
>;

export type Org = {
  id: string,
  name: string,
  currentSeasonId: string,
  seasons: string[],
  calendarId: string | null,
};

export type UpdateData = (FieldPath | FieldValue | string)[];
