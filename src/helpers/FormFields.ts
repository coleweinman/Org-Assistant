export enum InputType {
  EMAIL = "email",
  TEXT = "text",
  RADIO = "radio",
  CHECKBOX = "checkbox"
}

export type FormField = {
  id: string,
  required: boolean,
  label: string,
  inputType: InputType
}

export const CheckInFields: FormField[] = [
  { id: "name", label: "Name", required: true, inputType: InputType.TEXT },
  { id: "email", label: "Email", required: true, inputType: InputType.EMAIL },
  { id: "schoolId", label: "UT EID", required: true, inputType: InputType.TEXT },
];