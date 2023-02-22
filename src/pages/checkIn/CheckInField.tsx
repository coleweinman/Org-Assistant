import React from "react";
import { FormField, InputType } from "../../helpers/FormFields";

interface CheckInFieldProps extends FormField {
  value: string,
  setValue: (newValue: string) => void
}

const CheckInField: React.FC<CheckInFieldProps> = ({ id, required, inputType, label, options, value, setValue }) => {
  // Load previously stored value on initial render
  React.useEffect(() => {
    setValue(window.localStorage.getItem(id) ?? "");
  }, [setValue, id]);

  switch (inputType) {
    case InputType.TEXT:
    case InputType.EMAIL:
      return (
        <input
          required={required}
          type={inputType}
          id={id}
          placeholder={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    case InputType.DROPDOWN:
      return (
        <select
          required={required}
          id={id}
          placeholder={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          {options?.map((option) => <option key={option} value={option} label={option} />)}
        </select>
      )
    default:
      return null;
  }
}

export default CheckInField;