import React from "react";
import DateTimePicker from "./DateTimePicker";
import { InputType } from "../utils/enums";
import type {
  BooleanFieldWithValue,
  DateFieldWithValue,
  FormDataType,
  FormFieldWithValue,
  MultiOptionsFieldWithValue,
  SingleOptionsFieldWithValue,
  TextFieldWithValue,
} from "../utils/types";
import CheckboxField from "./CheckboxField";

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
    case InputType.CHECKBOX: {
      const {
        label,
        options,
        value,
        setValue,
      } = formField as Omit<MultiOptionsFieldWithValue<T>, "inputType">;
      return (
        <CheckboxField label={label} options={options} value={value} setValue={setValue} />
      );
    }
    case InputType.BOOLEAN: {
      const { id, label, value, setValue } = formField as Omit<BooleanFieldWithValue<T>, "inputType">;
      return (
        <div className="boolean-container">
          <label>
            {label}:
            <input type="checkbox" checked={value} value={id as string} onChange={() => setValue(!value)} />
          </label>
        </div>
      );
    }
    default:
      return null;
  }
};

export default FormField;