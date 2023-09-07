import React from "react";
import { FormOption } from "../utils/types";

type CheckboxFieldProps = {
  label: string,
  options: FormOption[],
  value: string[],
  setValue: (newValue: string[]) => void,
};

const CheckboxField: React.FunctionComponent<CheckboxFieldProps> = ({ label, options, value, setValue }) => {
  const toggleCheckbox = (id: string) => {
    const index = value.findIndex((option) => option === id);
    if (index >= 0) {
      setValue([...value.slice(0, index), ...value.slice(index + 1)]);
    } else {
      setValue([...value, id]);
    }
  };
  return (
    <div className="checkbox-container">
      <h3>{label}</h3>
      {options.map(({ id, label: name }) => (
        <div className="checkbox-row">
          <label key={id}>
            <input type="checkbox" checked={value.includes(id)} value={id} onChange={() => toggleCheckbox(id)} />
            {name}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CheckboxField;