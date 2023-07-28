import React from "react";
import DateTimePicker from "./DateTimePicker";
import { InputType } from "../utils/enums";
import type {
  DateFieldWithValue,
  FormDataType,
  FormFieldWithValue,
  SingleOptionsFieldWithValue,
  TextFieldWithValue,
} from "../utils/types";

type FormFieldProps<T extends FormDataType> = FormFieldWithValue<T>;

const FormField = <T extends FormDataType>({
  inputType,
  ...formField
}: FormFieldProps<T>): React.ReactElement | null => {
  switch (inputType) {
    case InputType.TEXT:
    case InputType.EMAIL:
    case InputType.URL: {
      const { id, required, label, value, setValue } = formField as Omit<TextFieldWithValue<T>, "inputType">;
      return (
        <input
          id={id as string}
          required={required}
          type={inputType}
          placeholder={label.toLowerCase()}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    }
    case InputType.DROPDOWN: {
      const {
        id,
        required,
        label,
        options,
        value,
        setValue,
      } = formField as Omit<SingleOptionsFieldWithValue<T>, "inputType">;
      return (
        <select
          id={id as string}
          required={required}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="" disabled>
            {label.toLowerCase()}
          </option>
          {options.map(({ id, label }) => (
            <option key={id} value={id}>
              {label.toLowerCase()}
            </option>
          ))}
        </select>
      );
    }
    case InputType.DATE: {
      const { id, required, label, value, setValue } = formField as Omit<DateFieldWithValue<T>, "inputType">;
      return (
        <DateTimePicker
          id={id as string}
          required={required}
          placeholder={label.toLowerCase()}
          value={value}
          onChange={setValue}
        />
      );
    }
    default:
      return null;
  }
};

export default FormField;