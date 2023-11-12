import React from "react";
import { CheckInRequirement, CheckInType, FilterType, InputType, Modality, TableType } from "./enums";
import { Timestamp } from "firebase/firestore";
import { Dayjs } from "dayjs";
import type { User, UserCredential } from "firebase/auth";
import type { IconDefinition } from "@fortawesome/free-regular-svg-icons";
import type { RankingInfo } from "@tanstack/match-sorter-utils";

declare module "@tanstack/table-core" {
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export type FormDataType = Record<string, string | string[] | Timestamp | number | null | boolean>;
export type FormValue<T extends FormDataType> = FormFieldWithValue<T>["value"];
export type FormState<T extends FormDataType> = Partial<Record<keyof T, FormValue<T>>>;

export type FormOption = {
  id: string,
  label: string
};

type BaseField<T extends FormDataType> = {
  id: keyof T,
  label: string,
  required: boolean,
  showConditional?: (state: FormState<T>) => boolean,
  validate?: (state: FormState<T>) => string | null,
};

type TextFieldType<T extends FormDataType> = BaseField<T> & {
  inputType: InputType.TEXT | InputType.EMAIL | InputType.URL
};

type DateFieldType<T extends FormDataType> = BaseField<T> & {
  inputType: InputType.DATE
};

type SingleOptionsFieldType<T extends FormDataType> = BaseField<T> & {
  inputType: InputType.RADIO | InputType.CHECKBOX | InputType.DROPDOWN,
  options: FormOption[],
};

type MultiOptionsFieldType<T extends FormDataType> = BaseField<T> & {
  inputType: InputType.RADIO | InputType.CHECKBOX | InputType.DROPDOWN,
  options: FormOption[],
};

export type BooleanFieldType<T extends FormDataType> = BaseField<T> & {
  inputType: InputType.BOOLEAN
};

export type FormFieldType<T extends FormDataType> =
  TextFieldType<T>
  | DateFieldType<T>
  | SingleOptionsFieldType<T>
  | MultiOptionsFieldType<T>
  | BooleanFieldType<T>;

export type TextFieldWithValue<T extends FormDataType> = TextFieldType<T> & {
  value: string,
  setValue: (value: string) => void,
};

export type DateFieldWithValue<T extends FormDataType> = DateFieldType<T> & {
  value: Dayjs | null,
  setValue: (value: Dayjs | null) => void,
};

export type SingleOptionsFieldWithValue<T extends FormDataType> = SingleOptionsFieldType<T> & {
  value: string,
  setValue: (value: string) => void,
};

export type MultiOptionsFieldWithValue<T extends FormDataType> = MultiOptionsFieldType<T> & {
  value: string[],
  setValue: (value: string[]) => void,
};

export type BooleanFieldWithValue<T extends FormDataType> = BooleanFieldType<T> & {
  value: boolean,
  setValue: (value: boolean) => void,
};

export type FormFieldWithValue<T extends FormDataType> =
  TextFieldWithValue<T>
  | DateFieldWithValue<T>
  | SingleOptionsFieldWithValue<T>
  | MultiOptionsFieldWithValue<T>
  | BooleanFieldWithValue<T>;

export type YearGroup = {
  year: string,
  quantity: number,
}

export type AuthContextType = {
  user: User | null,
  loading: boolean,
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>,
  signOut: () => void,
};

export type NavContextType = {
  navHeight: number,
  windowHeight: number,
};

export type NavLink = {
  name: string,
  link: string,
};

export type Attendee = {
  id: string,
  name: string,
  email: string,
  schoolId: string,
  discord?: string,
  year: string,
  totalEventsAttended: number,
  totalEventsRsvpd: number,
};

export type AttendeeWithData = Attendee & {
  lastActiveSeasonId: string,
  seasonAttendance: {
    [season: string]: number,
  },
  seasonRsvps: {
    [season: string]: number,
  }
};

export type CheckIn = {
  id: string,
  name: string,
  email: string,
  schoolId: string,
  year: string,
  discord: string | null,
  didRsvp: boolean,
  didCheckIn: boolean,
  timestamp: Timestamp,
  eventId: string,
};

export type JointCheckIn = CheckIn & { org: string };

export type LinkedCheckIn = CheckIn & {
  orgName: string,
};

export type LinkedOrg = Pick<Org, "id" | "name">;

export type OrgEvent = {
  name: string,
  seasonId: string,
  imageUrl?: string,
  description?: string,
  location?: string,
  startTime: Timestamp,
  endTime: Timestamp,
  rsvpCutoff?: Timestamp,
  checkInCutoff?: Timestamp,
  modality: Modality,
  virtualEventUrl?: string,
  rsvpCount: number,
  newRsvpCount: number,
  newAttendeeCount: number,
  attendeeCount: number,
  checkInPageNote: string,
  rsvpPageNote: string,
  linkedEvents: LinkedOrg[],
  checkInRequirements?: CheckInRequirement[],
};

export type OrgEventWithoutLinked = Omit<OrgEvent, "linkedEvents">;

export type OrgEventWithId = OrgEvent & {
  id: string;
};

export type Org = {
  id: string,
  name: string,
  currentSeasonId: string,
  seasons: string[],
  calendarId: string | null,
};

export type ColumnData<T extends FormDataType> = {
  id: keyof T,
  label: string,
  getDisplayValue: (value: typeof T[keyof T]) => string | React.ReactElement,
  type: TableType,
};

export type HeaderTransform<T extends FormDataType> = (key: keyof T) => string;
export type ReverseHeaderTransform<T extends FormDataType> = (label: string) => keyof T | never;
export type ReverseDataTransform<T extends FormDataType> = (value: string, key: keyof T) => typeof T[keyof T];

export type Filter<T extends FormDataType> = {
  columnId: keyof T,
  type: FilterType,
};

export type CategoryData<T extends Record<string, any>> = {
  id: string,
  label: string,
  getDisplayValue: (state: T) => string,
};

export type OrgPageParams = {
  orgId: string,
};

export type CheckInPageParams = {
  orgId: string,
  eventId: string,
  type: CheckInType,
};

export type SubmitPageParams = {
  orgId: string,
  type: CheckInType,
  checkInId: string,
};

export type CreatEventPageParams = {
  orgId: string,
  eventId: string,
};

export type EventPageParams = {
  orgId: string,
  eventId: string,
};

export type AttendeePageParams = {
  orgId: string,
  attendeeId: string,
};

export type ActionButton = {
  icon: IconDefinition,
  onClick: () => void,
} | {
  element: React.ReactElement
};

export type GoogleCalendarListItem = {
  kind: "calendar#calendarListEntry",
  etag: string,
  id: string,
  summary: string,
  description: string,
  location: string,
  timeZone: string,
  summaryOverride: string,
  colorId: string,
  backgroundColor: string,
  foregroundColor: string,
  hidden: boolean,
  selected: boolean,
  accessRole: string,
  defaultReminders: {
    method: string,
    minutes: integer
  }[],
  notificationSettings: {
    notifications: {
      type: string,
      method: string
    }[]
  },
  primary: boolean,
  deleted: boolean,
  conferenceProperties: {
    allowedConferenceSolutionTypes: string[]
  }
}

export type GoogleCalendar = Pick<GoogleCalendarListItem, "id" | "summary" | "backgroundColor">;
