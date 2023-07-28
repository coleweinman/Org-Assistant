import { InputType, Modality } from "./enums";
import { User, UserCredential } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { Dayjs } from "dayjs";

export type FormDataType = FormDataType;
export type FormValue<T extends FormDataType> = FormFieldWithValue<T>["value"];
export type FormState<T extends FormDataType> = Partial<Record<keyof T, FormValue<T>>>

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
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>,
  signOut: () => void,
};

export type NavLink = {
  name: string,
  link: string,
};

export type Attendee = {
  id: string,
  name: string,
  email: string,
  totalEventsAttended: number
};

export type CheckIn = {
  name: string,
  email: string,
  schoolId: string,
  year: string,
  discord: string | null
  timestamp: Timestamp,
  eventId: string
};

export type OrgEvent = {
  id: string,
  name: string,
  seasonId: string,
  imageUrl?: string,
  description?: string,
  location?: string,
  startTime: Timestamp,
  endTime: Timestamp,
  modality: Modality,
  virtualEventUrl?: string,
  newAttendeeCount: number,
  attendeeCount: number,
};

export type NewOrgEvent = Omit<OrgEvent, "id">;

export type Org = {
  id: string,
  name: string,
  currentSeasonId: string,
};

export type ColumnData<T extends FormDataType> = {
  id: keyof T,
  label: string,
  getDisplayValue: (value: typeof T[keyof T]) => string,
};

export type OrgPageParams = {
  orgId: string,
};

export type CheckInPageParams = {
  orgId: string,
  eventId: string,
};

export type CreatEventPageParams = {
  orgId: string,
  eventId: string,
};

export type EventPageParams = {
  orgId: string,
  eventId: string,
};