import { firestore } from "firebase-admin";
import { Timestamp } from "firebase/firestore";
import { Modality } from "./enums";

export type Attendee = {
  name: string,
  email: string,
  totalEventsAttended: number,
  lastActiveSeasonId: string,
  seasonAttendance: {
    [season: string]: number
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
};

export type PublicOrgEvent = Omit<
  OrgEvent,
  "seasonId" | "newAttendeeCount" | "attendeeCount" | "rsvpCount" | "newRsvpCount"
>;

export type Org = {
  id: string,
  name: string,
  currentSeasonId: string,
  seasons: string[],
};
