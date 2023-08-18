/**
 * @description Helpers that rely on app constants
 */

import { Timestamp } from "firebase/firestore";
import { CHECK_IN_COLUMNS, CHECK_IN_FIELDS } from "./dynamicConstants";
import { getLabelFromId } from "./staticHelpers";
import type { CheckIn, SingleOptionsFieldType, YearGroup } from "./types";
import { InputType } from "./enums";

///////////////////
// Table helpers //
///////////////////

export function getCheckInsCsv(checkIns: CheckIn[]) {
  const clipboardRows: string[] = [CHECK_IN_COLUMNS.map(({ label }) => label).join("\t")];
  for (const checkIn of checkIns) {
    clipboardRows.push(CHECK_IN_COLUMNS.map(({ id, getDisplayValue }) => getDisplayValue(checkIn[id])).join("\t"));
  }
  return clipboardRows.join("\n");
}

export async function copyCheckIns(checkIns: CheckIn[]) {
  await navigator.clipboard.writeText(getCheckInsCsv(checkIns));
}

////////////////////////
// Event page helpers //
////////////////////////

export function getYearGroups(checkIns: CheckIn[]): YearGroup[] {
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

export function getSavedUserData(): Partial<CheckIn> {
  const data: Partial<CheckIn> = {};
  for (const { id, inputType } of CHECK_IN_FIELDS) {
    const saved = window.localStorage.getItem(id);
    if (saved) {
      // @ts-ignore: Type 'string | Timestamp' is not assignable to type '(string & Timestamp) | undefined'.
      data[id] = inputType === InputType.DATE ? Timestamp.fromDate(new Date(saved)) : saved;
    }
  }
  return data;
}