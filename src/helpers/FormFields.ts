export enum InputType {
  EMAIL = "email",
  TEXT = "text",
  RADIO = "radio",
  CHECKBOX = "checkbox",
  DROPDOWN = "dropdown"
}

export type FormField = {
  id: string,
  required: boolean,
  label: string,
  inputType: InputType,
  options?: string[]
}

export const CheckInFields: FormField[] = [
  { id: "name", label: "Name", required: true, inputType: InputType.TEXT },
  { id: "email", label: "Email", required: true, inputType: InputType.EMAIL },
  { id: "schoolId", label: "UT EID", required: true, inputType: InputType.TEXT },
  { id: "year", label: "Year", required: true, inputType: InputType.DROPDOWN, options: ["Select", "Freshman", "Sophmore", "Junior", "Senior", "Super Senior", "Grad Student"]},
  { id: "discord", label: "Discord", required: false, inputType: InputType.TEXT },
];