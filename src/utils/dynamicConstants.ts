import { CheckInType, FilterType, IconType, InputType, Modality } from "./enums";
import type {
  Attendee,
  CategoryData,
  CheckIn,
  ColumnData,
  Filter,
  FormFieldType,
  NavLink,
  OrgEvent,
  OrgEventWithId,
} from "./types";
import { getBooleanDisplayValue, getColumnsFromFields, timestampToDate } from "./staticHelpers";
import { Dayjs } from "dayjs";
import { IconDefinition } from "@fortawesome/free-regular-svg-icons";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

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

export const ICON_TYPE_TO_ICON: Record<IconType, IconDefinition> = {
  [IconType.SUCCESS]: solid("check-circle"),
  [IconType.ERROR]: solid("xmark-circle"),
};

export const CHECK_IN_TYPE_INFO: Record<CheckInType, {
  display: string,
  submitMessage: string,
  errorMessage: string,
}> = {
  [CheckInType.RSVP]: {
    display: "RSVP",
    submitMessage: "You have successfully RSVP'd!",
    errorMessage: "You have already RSVP'd for this event",
  },
  [CheckInType.CHECK_IN]: {
    display: "Check In",
    submitMessage: "You are now checked in!",
    errorMessage: "You have already checked in",
  },
};

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

export const EVENT_STATISTICS_CATEGORIES: CategoryData<OrgEvent>[] = [
  { id: "new", label: "New", getDisplayValue: ({ newAttendeeCount }: OrgEvent) => newAttendeeCount.toString() },
  {
    id: "returning",
    label: "Returning",
    getDisplayValue: ({ attendeeCount, newAttendeeCount }: OrgEvent) => (
      attendeeCount - newAttendeeCount
    ).toString(),
  },
  { id: "total", label: "Total Attendees", getDisplayValue: ({ attendeeCount }: OrgEvent) => attendeeCount.toString() },
];

export const ATTENDEE_COLUMNS: ColumnData<Attendee>[] = [
  { id: "name", label: "Name", getDisplayValue: (value: string) => value },
  { id: "email", label: "Email", getDisplayValue: (value: string) => value },
  { id: "totalEventsAttended", label: "Events Attended", getDisplayValue: (value: string) => value },
];

export const CHECK_IN_COLUMNS: ColumnData<CheckIn>[] = [
  ...getColumnsFromFields(CHECK_IN_FIELDS),
  { id: "didRsvp", label: "RSVP'd", getDisplayValue: getBooleanDisplayValue },
  { id: "didCheckIn", label: "Checked In", getDisplayValue: getBooleanDisplayValue },
  { id: "timestamp", label: "Timestamp", getDisplayValue: timestampToDate },
];

export const CHECK_IN_FILTERS: Filter<CheckIn>[] = [
  { columnId: "didRsvp", type: FilterType.BOOLEAN },
  { columnId: "didCheckIn", type: FilterType.BOOLEAN },
];

export const EVENT_COLUMNS: ColumnData<OrgEventWithId>[] = [
  ...getColumnsFromFields(CREATE_EVENT_FIELDS)
    .filter(({ id }) => ["name", "location", "startTime", "endTime"].includes(id)),
  { id: "attendeeCount", label: "Attendees", getDisplayValue: (value) => value },
];