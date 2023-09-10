import { firestore } from "firebase-admin";
import { Timestamp } from "firebase/firestore";
import { Modality } from "./enums";
import { FieldPath, FieldValue } from "firebase-admin/lib/firestore";

export type Attendee = {
  name: string,
  email: string,
  schoolId: string,
  discord?: string,
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
};

export type UpdateData = (FieldPath | FieldValue | string)[];
