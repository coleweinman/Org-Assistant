/**
 * @description Helpers that rely on app constants
 */

import { Firestore, Timestamp } from "firebase/firestore";
import { CHECK_IN_FIELDS, REVERSE_CHECK_IN_HEADER_TRANSFORM, REVERSE_CHECK_IN_TRANSFORM } from "./dynamicConstants";
import { getLabelFromId } from "./staticHelpers";
import type { CheckIn, ColumnData, FormDataType, FormFieldType, SingleOptionsFieldType, YearGroup } from "./types";
import { InputType, TableType } from "./enums";
import { parse } from "papaparse";
import { importCheckIns } from "./managers";

///////////////////
// Table helpers //
///////////////////

export function getCsv<T extends FormDataType>(data: T[] | null, columns: ColumnData<T>[]) {
  const clipboardRows: string[] = [columns.map(({ label }) => label).join("\t")];
  for (const row of data ?? []) {
    clipboardRows.push(columns.map(({ id, getDisplayValue, type }) => type === TableType.DATE
      ? getDisplayValue(row[id])
      : row[id]).join("\t"));
  }
  return clipboardRows.join("\n");
}

export async function copyCsv<T extends FormDataType>(data: T[] | null, columns: ColumnData<T>[]) {
  await navigator.clipboard.writeText(getCsv(data, columns));
}

export function getCheckInsFromCsv(
  db: Firestore,
  orgId: string,
  eventId: string,
  file: File,
  prevCheckIns: CheckIn[],
  onCompleted: () => void = () => {},
  onError: (e: any) => void = () => {},
) {
  parse(file, {
    header: true,
    skipEmptyLines: true,
    transformHeader: REVERSE_CHECK_IN_HEADER_TRANSFORM,
    transform: REVERSE_CHECK_IN_TRANSFORM,
    complete: (results) => {
      // TODO: Validate imported results
      importCheckIns(
        db,
        orgId,
        eventId,
        (
          results.data as Omit<CheckIn, "id" | "eventId">[]
        ).map(({ email, ...checkIn }) => (
          {
            ...checkIn,
            email: email.toLowerCase(),
            eventId,
          }
        )),
        prevCheckIns,
      ).then(onCompleted).catch(onError);
    },
  });
}

////////////////////////
// Event page helpers //
////////////////////////

export function getYearGroups(checkIns: CheckIn[] = []): YearGroup[] {
  const yearQuantities: Record<string, number> = {};
  const yearOptions = (
    CHECK_IN_FIELDS.find(({ id }) => id === "year")! as SingleOptionsFieldType<CheckIn>
  ).options;
  for (const { year } of checkIns) {
    const label = getLabelFromId(year, yearOptions);
    yearQuantities[label] = (
      yearQuantities[label] ?? 0
    ) + 1;
  }
  return Object.entries(yearQuantities)
    .map(([year, quantity]) => (
      { year, quantity }
    ));
}

export function getSavedUserData<T extends FormDataType>(fields: FormFieldType<T>[]): Partial<T> {
  const data: Partial<T> = {};
  for (const { id, inputType } of fields) {
    const saved = window.localStorage.getItem(id as string);
    if (saved) {
      // @ts-ignore: Type 'string | Timestamp' is not assignable to type '(string & Timestamp) | undefined'.
      data[id] = inputType === InputType.DATE ? Timestamp.fromDate(new Date(saved)) : saved;
    }
  }
  return data;
}