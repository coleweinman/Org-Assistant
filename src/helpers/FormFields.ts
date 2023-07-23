export enum InputType {
  EMAIL = "email",
  TEXT = "text",
  RADIO = "radio",
  CHECKBOX = "checkbox",
  DROPDOWN = "dropdown"
}

type BaseField = {
  id: string,
  label: string,
  required: boolean
};

type TextField = BaseField & {
  inputType: InputType.TEXT | InputType.EMAIL
};

type OptionsField = BaseField & {
  inputType: InputType.RADIO | InputType.CHECKBOX | InputType.DROPDOWN;
  options: string[];
};

export type FormField = TextField | OptionsField;

export const CheckInFields: FormField[] = [
  { id: "name", label: "Name", required: true, inputType: InputType.TEXT },
  { id: "email", label: "Email", required: true, inputType: InputType.EMAIL },
  {
    id: "schoolId",
    label: "UT EID",
    required: true,
    inputType: InputType.TEXT
  },
  {
    id: "year",
    label: "Year",
    required: true,
    inputType: InputType.DROPDOWN,
    options: [
      "Freshman",
      "Sophomore",
      "Junior",
      "Senior",
      "Super senior",
      "Grad student"
    ]
  },
  {
    id: "discord",
    label: "Discord",
    required: false,
    inputType: InputType.TEXT
  },
];