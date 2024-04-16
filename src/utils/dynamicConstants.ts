import { CheckInRequirement, FilterType, IconType, InputType, Modality, TableType } from "./enums";
import type {
  Attendee,
  AttendeeWithData,
  CategoryData,
  CheckIn,
  ColumnData,
  Filter,
  FormFieldType,
  LinkedCheckIn,
  NavLink,
  Org,
  OrgEventWithId,
  OrgEventWithoutLinked,
} from "./types";
import {
  getBooleanDisplayValue,
  getColumnsFromFields,
  getHeaderTransform,
  getLabelFromId,
  getReverseDataTransform,
  getReverseHeaderTransform,
  timestampToDate,
} from "./staticHelpers";
import { Dayjs } from "dayjs";
import { IconDefinition } from "@fortawesome/free-regular-svg-icons";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { YEAR_OPTIONS } from "./staticConstants";

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

export const CHECK_IN_REQUIREMENTS: Record<CheckInRequirement, {
  meetsCondition: (checkIn: CheckIn | null, attendee: Attendee | null) => boolean,
  errorMessage: string,
}> = {
  [CheckInRequirement.REQUIRE_RSVP]: {
    meetsCondition: (checkIn: CheckIn | null) => checkIn?.didRsvp ?? false,
    errorMessage: "This event requires an RSVP beforehand",
  },
  [CheckInRequirement.REQUIRE_ACTIVE]: {
    meetsCondition: (_, attendee: Attendee | null) => (
      attendee && attendee.totalEventsAttended >= 3
    ) ?? false,
    errorMessage: "This event requires that you have attended 3 or more events this season",
  },
};

export const NAVIGATION_LINKS: NavLink[] = [
  { name: "Home", link: "/" },
];

export const ORG_FIELDS: FormFieldType<Org>[] = [
  { id: "name", label: "Org Name", required: true, inputType: InputType.TEXT },
  { id: "calendarId", label: "Enable Google Calendar", required: true, inputType: InputType.BOOLEAN },
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
    options: YEAR_OPTIONS,
  },
  {
    id: "discord",
    label: "Discord",
    required: false,
    inputType: InputType.TEXT,
  },
];

export const CREATE_EVENT_FIELDS: FormFieldType<OrgEventWithoutLinked>[] = [
  { id: "name", label: "Event Name", required: true, inputType: InputType.TEXT },
  { id: "modality", label: "Modality", required: true, inputType: InputType.DROPDOWN, options: MODALITY_OPTIONS },
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
  { id: "rsvpCutoff", label: "RSVP Cutoff", required: false, inputType: InputType.DATE },
  { id: "checkInCutoff", label: "Check In Cutoff", required: false, inputType: InputType.DATE },
  { id: "location", label: "Location", required: false, inputType: InputType.TEXT },
  {
    id: "virtualEventUrl",
    label: "Virtual Event URL",
    required: false,
    inputType: InputType.URL,
    showConditional: ({ modality }) => modality !== Modality.IN_PERSON,
  },
  { id: "imageUrl", label: "Image URL", required: false, inputType: InputType.URL },
  { id: "description", label: "Description", required: false, inputType: InputType.TEXT },
  { id: "checkInPageNote", label: "Check In Page Note", required: false, inputType: InputType.TEXT },
  { id: "rsvpPageNote", label: "RSVP Page Note", required: false, inputType: InputType.TEXT },
  {
    id: "checkInRequirements",
    label: "Requirements for Check In",
    required: false,
    inputType: InputType.CHECKBOX,
    options: [
      { id: CheckInRequirement.REQUIRE_RSVP, label: "Require RSVP" },
      { id: CheckInRequirement.REQUIRE_ACTIVE, label: "Member must be active" },
    ],
  },
];

export const EVENT_STATISTICS_CATEGORIES: CategoryData<OrgEventWithoutLinked>[] = [
  {
    id: "newRsvps",
    label: "New RSVPs",
    getDisplayValue: ({ newRsvpCount }: OrgEventWithoutLinked) => newRsvpCount.toString(),
  },
  {
    id: "returningRsvps",
    label: "Returning RSVPs",
    getDisplayValue: ({ rsvpCount, newRsvpCount }: OrgEventWithoutLinked) => (
      rsvpCount - newRsvpCount
    ).toString(),
  },
  {
    id: "newAttendees",
    label: "New Attendees",
    getDisplayValue: ({ newAttendeeCount }: OrgEventWithoutLinked) => newAttendeeCount.toString(),
  },
  {
    id: "returningAttendees",
    label: "Returning Attendees",
    getDisplayValue: ({ attendeeCount, newAttendeeCount }: OrgEventWithoutLinked) => (
      attendeeCount - newAttendeeCount
    ).toString(),
  },
  {
    id: "total",
    label: "Total Attendees",
    getDisplayValue: ({ attendeeCount }: OrgEventWithoutLinked) => attendeeCount.toString(),
  },
  {
    id: "yield",
    label: "RSVP Yield",
    getDisplayValue: ({ attendeeCount, rsvpCount }: OrgEventWithoutLinked) => rsvpCount === 0 ? "N/A" : (
      attendeeCount / rsvpCount * 100
    ).toFixed(1).toString() + "%",
  },
];

export const ATTENDEE_COLUMNS: ColumnData<Attendee>[] = [
  { id: "name", label: "Name", getDisplayValue: (value: string) => value, type: TableType.TEXT },
  { id: "email", label: "Email", getDisplayValue: (value: string) => value, type: TableType.TEXT },
  {
    id: "schoolId",
    label: "UT EID",
    getDisplayValue: (value: string) => value && value.length > 0 ? value : "N/A",
    type: TableType.TEXT,
  },
  {
    id: "discord",
    label: "Discord Tag",
    getDisplayValue: (value: string) => value && value.length > 0 ? value : "N/A",
    type: TableType.TEXT,
  },
  {
    id: "year",
    label: "Year",
    getDisplayValue: (value: string) => getLabelFromId(value, YEAR_OPTIONS),
    type: TableType.TEXT,
  },
  {
    id: "totalEventsRsvpd",
    label: "Events RSVP'd",
    getDisplayValue: (value: number) => value.toString(),
    type: TableType.NUMBER,
  },
  {
    id: "totalEventsAttended",
    label: "Events Attended",
    getDisplayValue: (value: number) => value.toString(),
    type: TableType.NUMBER,
  },
];

export const ATTENDEE_SETTINGS_CATEGORIES: CategoryData<AttendeeWithData>[] = [
  { id: "name", label: "Name", getDisplayValue: ({ name }) => name },
  { id: "email", label: "Email", getDisplayValue: ({ email }) => email },
  { id: "schoolId", label: "UT EID", getDisplayValue: ({ schoolId }) => schoolId ?? "N/A" },
  { id: "discord", label: "Discord", getDisplayValue: ({ discord }) => discord ?? "N/A" },
];

export const ATTENDEE_STATISTICS_CATEGORIES: CategoryData<AttendeeWithData>[] = [
  {
    id: "totalEventsRsvpd",
    label: "Total Events RSVP'd",
    getDisplayValue: ({ totalEventsRsvpd }) => totalEventsRsvpd.toString(),
  },
  {
    id: "totalEventsAttended",
    label: "Total Events Attended",
    getDisplayValue: ({ totalEventsAttended }) => totalEventsAttended.toString(),
  },
  {
    id: "lastActiveSeason",
    label: "Last Active Season",
    getDisplayValue: ({ lastActiveSeasonId }) => lastActiveSeasonId,
  },
];

export const CHECK_IN_COLUMNS: ColumnData<CheckIn>[] = [
  ...getColumnsFromFields(CHECK_IN_FIELDS),
  { id: "didRsvp", label: "RSVP'd", getDisplayValue: getBooleanDisplayValue, type: TableType.BOOLEAN },
  { id: "didCheckIn", label: "Checked In", getDisplayValue: getBooleanDisplayValue, type: TableType.BOOLEAN },
  { id: "timestamp", label: "Timestamp", getDisplayValue: timestampToDate, type: TableType.DATE },
];

export const LINKED_CHECK_IN_COLUMNS: ColumnData<LinkedCheckIn>[] = [
  ...CHECK_IN_COLUMNS,
  { id: "orgName", label: "Org", getDisplayValue: (value: string) => value, type: TableType.TEXT },
];

export const CHECK_IN_HEADER_TRANSFORM = getHeaderTransform(CHECK_IN_COLUMNS);
export const REVERSE_CHECK_IN_HEADER_TRANSFORM = getReverseHeaderTransform(CHECK_IN_COLUMNS);

export const REVERSE_CHECK_IN_TRANSFORM = getReverseDataTransform(CHECK_IN_COLUMNS);

export const CHECK_IN_FILTERS: Filter<CheckIn>[] = [
  { columnId: "didRsvp", type: FilterType.BOOLEAN },
  { columnId: "didCheckIn", type: FilterType.BOOLEAN },
];

export const EVENT_COLUMNS: ColumnData<Omit<OrgEventWithId, "linkedEvents">>[] = [
  ...getColumnsFromFields(CREATE_EVENT_FIELDS)
    .filter(({ id }) => ["name", "location", "startTime", "endTime"].includes(id)),
  { id: "attendeeCount", label: "Attendees", getDisplayValue: (value) => value, type: TableType.NUMBER },
];