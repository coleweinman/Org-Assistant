import { Timestamp } from "firebase/firestore";
import dayjs, { Dayjs } from "dayjs";
import { CHECK_IN_COLUMNS, DATE_FORMAT, EMAIL_REGEX, URL_REGEX } from "./constants";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { AuthError, AuthErrorCodes } from "firebase/auth";
import type {
  CheckIn,
  ColumnData,
  FormDataType,
  FormFieldType,
  FormFieldWithValue,
  FormState,
  FormValue,
} from "./types";
import type { ColumnDef, DeepKeys } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { InputType } from "./enums";

//////////////////
// Date helpers //
//////////////////

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);

export function timestampToDate(timestamp?: Timestamp): string {
  return timestamp
    ? dayjs(timestamp.toDate()).format(DATE_FORMAT)
    : "";
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
  }
}

export function getFormError<T extends FormDataType>(fields: FormFieldType<T>[], state: FormState<T>): string | null {
  for (const { id, inputType, required, validate } of fields) {
    const value = state[id];
    if (required && !isFieldFilled(inputType, value)) {
      return "Please fill out all required fields";
    }
    if (!value) {
      return null;
    }
    if (inputType === InputType.EMAIL && !isValidEmail(value as string)) {
      return "Please enter a valid email address";
    } else if (inputType === InputType.URL && !isValidUrl(value as string)) {
      return "Please enter a valid URL";
    } else if (inputType === InputType.DATE && !isValidDate(value as Dayjs)) {
      return "Please enter a date in the future";
    } else if (validate && validate(state)) {
      return validate(state);
    }
  }
  return null;
}

export function isFieldFilled<T extends FormDataType>(inputType: InputType, value: FormValue<T> | undefined): boolean {
  if (!value) {
    return false;
  }
  switch (inputType) {
    case InputType.TEXT:
    case InputType.EMAIL:
    case InputType.URL:
    case InputType.DROPDOWN:
    case InputType.RADIO:
      return (
        value as string
      ).length > 0;
    case InputType.CHECKBOX:
      return (
        value as string[]
      ).length > 0;
    case InputType.DATE:
      return (
        value as Dayjs
      ).isValid();
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

///////////////////
// Table helpers //
///////////////////

export function getColumnDef<T extends FormDataType>(columns: ColumnData<T>[]): ColumnDef<T, any>[] {
  const columnHelper = createColumnHelper<T>();
  return columns.map(({ id, label, getDisplayValue }) => (
    columnHelper.accessor(id as DeepKeys<T>, {
      header: label,
      cell: (info) => getDisplayValue(info.getValue()),
    })
  ));
}

export async function copyCheckIns(checkIns: CheckIn[]) {
  const clipboardRows: string[] = [CHECK_IN_COLUMNS.map(({ label }) => label).join("\t")];
  for (const checkIn of checkIns) {
    clipboardRows.push(CHECK_IN_COLUMNS.map(({ id }) => checkIn[id]).join("\t"));
  }
  await navigator.clipboard.writeText(clipboardRows.join("\n"));
}