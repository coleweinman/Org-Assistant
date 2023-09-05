import React from "react";
import { CheckInType, FilterType, InputType, Modality, TableType } from "./enums";
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

export type FormFieldType<T extends FormDataType> =
  TextFieldType<T>
  | DateFieldType<T>
  | SingleOptionsFieldType<T>
  | MultiOptionsFieldType<T>;

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

export type FormFieldWithValue<T extends FormDataType> =
  TextFieldWithValue<T>
  | DateFieldWithValue<T>
  | SingleOptionsFieldWithValue<T>
  | MultiOptionsFieldWithValue<T>;

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
  name: string,
  email: string,
  totalEventsAttended: number,
  totalEventsRsvpd: number,
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

export type LinkedCheckIn = CheckIn & {
  orgName: string,
};

export type LinkedEvent = {
  org: Pick<Org, "id" | "name">,
  event: Pick<OrgEventWithId, "id" | "name">,
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
  checkInPageNote: string,
  rsvpPageNote: string,
  linkedEvents: LinkedEvent[],
};

export type OrgEventWithId = OrgEvent & {
  id: string;
};

export type Org = {
  id: string,
  name: string,
  currentSeasonId: string,
  seasons: string[],
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

export type CategoryData<T extends FormDataType> = {
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
  type: CheckInType,
};

export type CreatEventPageParams = {
  orgId: string,
  eventId: string,
};

export type EventPageParams = {
  orgId: string,
  eventId: string,
};

export type ActionButton = {
  icon: IconDefinition,
  onClick: () => void,
} | {
  element: React.ReactElement
};