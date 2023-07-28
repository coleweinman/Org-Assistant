import { InputType, Modality } from "./enums";
import type { Attendee, CheckIn, ColumnData, FormFieldType, NavLink, OrgEvent } from "./types";
import { timestampToDate } from "./helpers";
import { Dayjs } from "dayjs";

export const INPUT_DATE_FORMAT = "M/DD h:mma";
export const DATE_FORMAT = "M/DD/YYYY h:mma";

export const EMAIL_REGEX = /^([a-zA-Z\d_.\-+])+@(([a-zA-Z\d-])+\.)+([a-zA-Z\d]{2,4})+$/;
export const URL_REGEX = /^(http(s):\/\/.)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/;

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBlMx0f35Ia49khVmeYFH6dmmpJEx2uMC0",
  authDomain: "org-assistant.firebaseapp.com",
  projectId: "org-assistant",
  storageBucket: "org-assistant.appspot.com",
  messagingSenderId: "45876267496",
  appId: "1:45876267496:web:26dfbcf9656ffc93117c5d",
  measurementId: "G-73BSH3ZW4G",
};

const MODALITY_OPTIONS: { id: Modality, label: string }[] = [
  { id: Modality.IN_PERSON, label: "In-Person" },
  { id: Modality.VIRTUAL, label: "Virtual" },
  { id: Modality.HYBRID, label: "Hybrid" },
];

export const NAVIGATION_LINKS: NavLink[] = [
  { name: "Home", link: "/" },
];

export const CHECK_IN_FIELDS: FormFieldType<CheckIn>[] = [
  { id: "name", label: "Name", required: true, inputType: InputType.TEXT },
  { id: "email", label: "Email", required: true, inputType: InputType.EMAIL },
  {
    id: "schoolId",
    label: "UT EID",
    required: true,
    inputType: InputType.TEXT,
  },
  {
    id: "year",
    label: "Year",
    required: true,
    inputType: InputType.DROPDOWN,
    options: [
      { id: "2027", label: "Freshman" },
      { id: "2026", label: "Sophomore" },
      { id: "2025", label: "Junior" },
      { id: "2024", label: "Senior" },
      { id: "2023", label: "Super senior" },
      { id: "grad", label: "Grad student" },
    ],
  },
  {
    id: "discord",
    label: "Discord",
    required: false,
    inputType: InputType.TEXT,
  },
];

// name: eventName,
//   seasonId: org!.currentSeasonId,
//   imageUrl: imageUrl,
//   description: description,
//   location: location,
//   startTime: Timestamp.fromMillis(startTime!.valueOf()),
//   endTime: Timestamp.fromMillis(endTime!.valueOf()),
//   modality: modality,
//   virtualEventUrl: virtualEventUrl,
//   newAttendeeCount: 0,
//   attendeeCount: 0,

export const CREATE_EVENT_FIELDS: FormFieldType<OrgEvent>[] = [
  { id: "name", label: "Event Name", required: true, inputType: InputType.TEXT },
  { id: "imageUrl", label: "Image URL", required: false, inputType: InputType.URL },
  { id: "description", label: "Description", required: false, inputType: InputType.TEXT },
  { id: "location", label: "Location", required: false, inputType: InputType.TEXT },
  { id: "startTime", label: "Start Time", required: true, inputType: InputType.DATE },
  {
    id: "endTime",
    label: "End Time",
    required: true,
    inputType: InputType.DATE,
    validate: ({ startTime, endTime }) => {
      if (!startTime || !endTime) {
        return null;
      }
      return (
        endTime as Dayjs
      ).isAfter(startTime as Dayjs, "minute") ? null : "End time must be after start time";
    },
  },
  { id: "modality", label: "Modality", required: true, inputType: InputType.DROPDOWN, options: MODALITY_OPTIONS },
  {
    id: "virtualEventUrl",
    label: "Virtual Event URL",
    required: false,
    inputType: InputType.URL,
    showConditional: ({ modality }) => modality !== Modality.IN_PERSON,
  },
];

export const ATTENDEE_COLUMNS: ColumnData<Attendee>[] = [
  { id: "name", label: "Name", getDisplayValue: (value: string) => value },
  { id: "email", label: "Email", getDisplayValue: (value: string) => value },
  { id: "totalEventsAttended", label: "Events Attended", getDisplayValue: (value: string) => value },
];

export const CHECK_IN_COLUMNS: ColumnData<CheckIn>[] = [
  ...CHECK_IN_FIELDS.map(({ id, label }) => (
    {
      id,
      label,
      getDisplayValue: (value: string) => value,
    }
  )),
  { id: "timestamp", label: "Timestamp", getDisplayValue: timestampToDate },
];

export const EVENT_COLUMNS: ColumnData<OrgEvent>[] = [
  { id: "name", label: "Name", getDisplayValue: (value) => value },
  { id: "location", label: "Location", getDisplayValue: (value) => value },
  { id: "startTime", label: "Start", getDisplayValue: timestampToDate },
  { id: "endTime", label: "End", getDisplayValue: timestampToDate },
  { id: "attendeeCount", label: "Attendees", getDisplayValue: (value) => value },
];

export const MODALITY_DISPLAY: Record<Modality, string> = {
  [Modality.IN_PERSON]: "In-Person",
  [Modality.VIRTUAL]: "Virtual",
  [Modality.HYBRID]: "Hybrid",
};