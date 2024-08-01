import type { ReactElement } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Timestamp, type Unsubscribe } from "firebase/firestore";
import dayjs, { Dayjs } from "dayjs";
import { DATE_FORMAT, EMAIL_REGEX, INPUT_DATE_FORMAT, TIMEZONE, URL_REGEX } from "./staticConstants";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import timezone from "dayjs/plugin/timezone";
import utc from 'dayjs/plugin/utc';
import { AuthError, AuthErrorCodes } from "firebase/auth";
import type {
  ColumnData,
  FormDataType,
  FormFieldType,
  FormFieldWithValue,
  FormOption,
  FormState,
  FormValue,
  HeaderTransform,
  LinkedOrg,
  MultiOptionsFieldType,
  OrgEvent,
  OrgEventWithoutLinked,
  ReverseDataTransform,
  ReverseHeaderTransform,
  SingleOptionsFieldType,
  YearGroup,
} from "./types";
import { type ColumnDef, createColumnHelper, type DeepKeys, Row } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { InputType, Modality, TableType } from "./enums";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FilterMeta } from "@tanstack/table-core/src/types";

//////////////////
// Date helpers //
//////////////////

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault(TIMEZONE);

function timestampToDayjs(timestamp: Timestamp): Dayjs {
  return dayjs(timestamp.toMillis());
}

function dayjsToTimestamp(date: Dayjs): Timestamp {
  return Timestamp.fromMillis(date.valueOf());
}

export function timestampToDate(timestamp?: Timestamp): string {
  return timestamp
    ? timestampToDayjs(timestamp).format(DATE_FORMAT)
    : "";
}

export function dateStringToTimestamp(dateStr: string): Timestamp {
  return Timestamp.fromDate(dayjs(dateStr, DATE_FORMAT).tz(TIMEZONE, true).toDate());
}

export function rawDateToDayjs(rawDate: string): Dayjs {
  return dayjs(rawDate, [DATE_FORMAT, INPUT_DATE_FORMAT]).tz(TIMEZONE, true);
}

/////////////////
// URL helpers //
/////////////////

export function parseHashParams(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  const hashPairs = hash.replace("#", "").split("&");
  for (const pair of hashPairs) {
    const [key, value] = pair.split("=");
    params[key] = value;
  }
  return params;
}

//////////////////////
// Firebase helpers //
//////////////////////

export function getAuthErrorMessage(e: AuthError): string {
  switch (e.code) {
    case AuthErrorCodes.EMAIL_EXISTS:
      return "The provided email is already linked to an account. Try a " +
        "different email or log into your account.";
    case AuthErrorCodes.INVALID_EMAIL:
      return "Please provide a valid email address.";
    case AuthErrorCodes.INVALID_PASSWORD:
      return "Invalid password. Please try again.";
    case AuthErrorCodes.USER_DELETED:
      return "Could not find an account with that email. Try creating an " +
        "account instead.";
    case AuthErrorCodes.NETWORK_REQUEST_FAILED:
      return "Could not connect to the server. Please try again later.";
    default:
      return "Something went wrong. Please try again later.";
  }
}

export function executeAllUnsubs(...args: Unsubscribe[]): () => void {
  return () => {
    args.forEach((unsub) => unsub());
  };
}

//////////////////
// Form helpers //
//////////////////

export function getFormFieldWithValue<T extends FormDataType>(
  field: FormFieldType<T>,
  value: FormValue<T> | undefined,
  setFieldValue: (id: keyof T, value: FormValue<T>) => void,
): FormFieldWithValue<T> {
  switch (field.inputType) {
    case InputType.TEXT:
    case InputType.EMAIL:
    case InputType.URL:
    case InputType.DROPDOWN:
    case InputType.RADIO:
      return {
        ...field,
        value: (
          value ?? ""
        ) as string,
        setValue: (newValue: string) => setFieldValue(field.id, newValue),
      };
    case InputType.DATE:
      return {
        ...field,
        value: value as Dayjs | null,
        setValue: (newValue: Dayjs | null) => setFieldValue(field.id, newValue),
      };
    case InputType.CHECKBOX:
      return {
        ...field,
        value: (
          value ?? []
        ) as string[],
        setValue: (newValue: string[]) => setFieldValue(field.id, newValue),
      };
    case InputType.BOOLEAN:
      return {
        ...field,
        value: !!value,
        setValue: (newValue: boolean) => setFieldValue(field.id, newValue),
      };
  }
}

export function convertInitialToFormData<T extends FormDataType>(
  initial: Partial<T>,
  fields: FormFieldType<T>[],
): FormState<T> {
  const formData: FormState<T> = {};
  for (const { inputType, id } of fields) {
    if (inputType === InputType.DATE && initial[id]) {
      formData[id] = timestampToDayjs(initial[id] as Timestamp);
    } else {
      // @ts-ignore
      formData[id] = initial[id];
    }
  }
  return formData;
}

export function getFormError<T extends FormDataType>(fields: FormFieldType<T>[], state: FormState<T>): string | null {
  for (const field of fields) {
    const value = state[field.id];
    if (field.required && !isFieldFilled(field.inputType, value, field)) {
      return "Please fill out all required fields";
    } else if (value) {
      if (field.inputType === InputType.EMAIL && !isValidEmail(value as string)) {
        return "Please enter a valid email address";
      } else if (field.inputType === InputType.URL && !isValidUrl(value as string)) {
        return "Please enter a valid URL";
      } else if (field.inputType === InputType.DATE && !isValidDate(value as Dayjs)) {
        return "Please enter a date in the future";
      } else if (field.validate && field.validate(state)) {
        return field.validate(state);
      }
    }
  }
  return null;
}

export function isFieldFilled<T extends FormDataType>(
  inputType: InputType,
  value: FormValue<T> | undefined,
  field?: FormFieldType<T>,
): boolean {
  if (!value && inputType !== InputType.BOOLEAN) {
    return false;
  }
  switch (inputType) {
    case InputType.TEXT:
    case InputType.EMAIL:
    case InputType.URL:
      return (
        value as string
      ).length > 0;
    case InputType.DROPDOWN:
    case InputType.RADIO:
      return !!(
        field! as SingleOptionsFieldType<T>
      ).options.find(({ id }) => id === value as string);
    case InputType.CHECKBOX:
      return (
        value as string[]
      ).length > 0;
    case InputType.DATE:
      return (
        value as Dayjs
      ).isValid();
    case InputType.BOOLEAN:
      return true;
  }
}

export function isValidEmail(text: string) {
  return text.length === 0 || !!text.match(EMAIL_REGEX);
}

export function isValidUrl(text: string) {
  return text.length === 0 || !!text.match(URL_REGEX);
}

export function isValidDate(date: Dayjs) {
  return date.isSameOrAfter(dayjs(), "day");
}

export function getOrgEventFromFormState(
  seasonId: string,
  state: FormState<OrgEventWithoutLinked>,
  linkedEvents: LinkedOrg[] = [],
  newRsvpCount: number = 0,
  rsvpCount: number = 0,
  newAttendeeCount: number = 0,
  attendeeCount: number = 0,
): OrgEvent {
  return {
    name: state.name,
    seasonId,
    imageUrl: state.imageUrl ?? "",
    description: state.description ?? "",
    checkInPageNote: state.checkInPageNote ?? "",
    rsvpPageNote: state.rsvpPageNote ?? "",
    location: state.location ?? "",
    startTime: dayjsToTimestamp(state.startTime as Dayjs),
    endTime: dayjsToTimestamp(state.endTime as Dayjs),
    rsvpCutoff: state.rsvpCutoff ? dayjsToTimestamp(state.rsvpCutoff as Dayjs) : null,
    checkInCutoff: state.checkInCutoff ? dayjsToTimestamp(state.checkInCutoff as Dayjs) : null,
    modality: state.modality ?? Modality.IN_PERSON,
    virtualEventUrl: state.virtualEventUrl ?? "",
    checkInRequirements: state.checkInRequirements ?? [],
    newRsvpCount,
    rsvpCount,
    newAttendeeCount,
    attendeeCount,
    linkedEvents,
  } as OrgEvent;
}

///////////////////
// Table helpers //
///////////////////

function inputTypeToTableType(inputType: InputType): TableType {
  switch (inputType) {
    case InputType.TEXT:
    case InputType.EMAIL:
    case InputType.URL:
    case InputType.RADIO:
    case InputType.DROPDOWN:
      return TableType.TEXT;
    case InputType.CHECKBOX:
      return TableType.MULTI;
    case InputType.DATE:
      return TableType.DATE;
    case InputType.BOOLEAN:
      return TableType.BOOLEAN;
  }
}

export function getColumnsFromFields<T extends FormDataType>(fields: FormFieldType<T>[]): ColumnData<T>[] {
  return fields.map((field) => (
    {
      id: field.id,
      label: field.label,
      getDisplayValue: (value: T[keyof T]) => getDisplayValue(value, field),
      type: inputTypeToTableType(field.inputType),
    }
  ));
}

export function getHeaderTransform<T extends FormDataType>(columns: ColumnData<T>[]): HeaderTransform<T> {
  const transformMap: Record<keyof T, string> = {} as Record<keyof T, string>;
  for (const { id, label } of columns) {
    transformMap[id] = label;
  }
  return (key: keyof T) => transformMap[key];
}

export function getReverseHeaderTransform<T extends FormDataType>(columns: ColumnData<T>[]): ReverseHeaderTransform<T> {
  const transformMap: Record<string, keyof T> = {} as Record<keyof T, string>;
  for (const { id, label } of columns) {
    transformMap[label] = id;
  }
  return (label: string) => {
    if (transformMap[label]) {
      return transformMap[label];
    }
    throw new Error("Invalid column " + label);
  };
}

export function getReverseDataTransform<T extends FormDataType>(columns: ColumnData<T>[]): ReverseDataTransform<T> {
  const transformMap: Record<keyof T, TableType> = {} as Record<keyof T, TableType>;
  for (const { id, type } of columns) {
    transformMap[id] = type;
  }
  return (value: string, key: keyof T) => {
    switch (transformMap[key]) {
      case TableType.TEXT:
        return value;
      case TableType.NUMBER:
        return parseInt(value);
      case TableType.MULTI:
        return value.split(",").map((s) => s.trim());
      case TableType.BOOLEAN:
        return value === "true";
      case TableType.DATE:
        return dateStringToTimestamp(value);
    }
  };
}

export function getLabelFromId(value: string, options: FormOption[]): string {
  return options.find(({ id }) => id === value)?.label ?? value;
}

export function getColumnDef<T extends FormDataType>(columns: ColumnData<T>[]): ColumnDef<T, any>[] {
  const columnHelper = createColumnHelper<T>();
  return columns.map(({ id, label, getDisplayValue }) => (
    columnHelper.accessor(id as DeepKeys<T>, {
      header: label,
      cell: (info) => getDisplayValue(info.getValue()),
    })
  ));
}

function isBlank<T extends FormDataType>(value: T[keyof T], inputType: InputType): boolean {
  switch (inputType) {
    // Strings or arrays
    case InputType.TEXT:
    case InputType.EMAIL:
    case InputType.URL:
    case InputType.RADIO:
    case InputType.DROPDOWN:
    case InputType.CHECKBOX:
      return !value || (
        value as string | string[]
      ).length === 0;
    case InputType.BOOLEAN:
    case InputType.DATE:
      return false;
  }
}

export function getDisplayValue<T extends FormDataType>(
  value: T[keyof T],
  field: FormFieldType<T>,
): string | ReactElement {
  // Check if value is left blank (return "N/A")
  if (isBlank(value, field.inputType)) {
    return "N/A";
  }
  switch (field.inputType) {
    case InputType.DROPDOWN:
    case InputType.RADIO:
      return getLabelFromId(
        value as string,
        (
          field as SingleOptionsFieldType<T>
        ).options,
      );
    case InputType.CHECKBOX:
      return (
        (
          value as string[]
        ).map((selected) => getLabelFromId(
          selected,
          (
            field as MultiOptionsFieldType<T>
          ).options,
        )).join(", ")
      );
    case InputType.DATE:
      return timestampToDate(value as Timestamp);
    case InputType.EMAIL:
      return (
        value as string
      ).toLowerCase();
    case InputType.BOOLEAN:
      return getBooleanDisplayValue(value as boolean);
    default:
      return value as string;
  }
}

export function getBooleanDisplayValue(value: boolean): ReactElement {
  return <FontAwesomeIcon icon={value ? solid("check") : solid("xmark")} />;
}

export function fuzzyFilter<T extends FormDataType>(
  row: Row<T>,
  columnId: keyof T,
  value: string,
  addMeta: (meta: FilterMeta) => void,
): boolean {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId as string), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
}

////////////////////
// Charts helpers //
////////////////////

export function getCellFill(colors: string[], index: number, total: number): string {
  if (total >= colors.length) {
    return colors[index % colors.length];
  }
  if (total === 1) {
    return colors[0];
  }
  return colors[Math.floor((
    index / (
      total - 1
    )
  ) * (
    colors.length - 1
  ))];
}

export function addTableId(data: YearGroup[], id: string) {
  return data.map((entry) => (
    { ...entry, tableId: id }
  ));
}