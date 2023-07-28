import React from "react";
import FormField from "./FormField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getFormError, getFormFieldWithValue } from "../utils/helpers";
import type { FormDataType, FormFieldType, FormState, FormValue } from "../utils/types";
import type { IconDefinition } from "@fortawesome/free-regular-svg-icons";

type FormProps<T extends FormDataType> = Omit<React.HTMLProps<HTMLFormElement>, "onSubmit"> & {
  fields: FormFieldType<T>[],
  initialData?: FormState<T>,
  submitText: string,
  submitIcon?: IconDefinition,
  onSubmit: ((data: FormState<T>) => void) | ((data: FormState<T>) => Promise<void>),
};

const Form = <T extends FormDataType>({
  fields,
  initialData = {},
  submitText,
  submitIcon,
  onSubmit,
  ...props
}: FormProps<T>): React.ReactElement => {
  const [formData, setFormData] = React.useState<FormState<T>>(initialData);
  const [error, setError] = React.useState<string | null>(null);

  const setFieldValue = (key: keyof T, value: FormValue<T>) => {
    setFormData((prevData) => (
      { ...prevData, [key]: value }
    ));
  };

  const submit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const errorMsg = getFormError(fields, formData);
    setError(errorMsg);
    if (!errorMsg) {
      try {
        await onSubmit(formData);
      } catch (e) {
        setError((
          e as Error
        ).message);
      }
    }
  };

  return (
    <form {...props} noValidate onSubmit={submit}>
      {fields.map((field) => (
        <FormField {...getFormFieldWithValue(field, formData[field.id], setFieldValue)} />
      ))}
      <button type="submit">
        {submitText}
        {submitIcon && (
          <span className="icon">
          <FontAwesomeIcon icon={submitIcon} />
        </span>
        )}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default Form;