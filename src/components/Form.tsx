import React from "react";
import FormField from "./FormField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { convertInitialToFormData, getFormError, getFormFieldWithValue } from "../utils/staticHelpers";
import type { FormDataType, FormFieldType, FormState, FormValue } from "../utils/types";
import type { IconDefinition } from "@fortawesome/free-regular-svg-icons";

type FormProps<T extends FormDataType> = Omit<React.HTMLProps<HTMLFormElement>, "onSubmit"> & {
  fields: FormFieldType<T>[],
  initialData?: Partial<T>,
  submitText: string,
  submitIcon?: IconDefinition,
  onSubmit: ((data: FormState<T>) => void) | ((data: FormState<T>) => Promise<void>),
  cancelText?: string,
  onCancel?: () => void,
};

const Form = <T extends FormDataType>({
  fields,
  initialData = {},
  submitText,
  submitIcon,
  onSubmit,
  cancelText,
  onCancel,
  ...props
}: FormProps<T>): React.ReactElement => {
  const [formData, setFormData] = React.useState<FormState<T>>(convertInitialToFormData(initialData, fields));
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
    if (errorMsg) {
      return;
    }
    try {
      const submitData = { ...formData };
      for (const field of fields) {
        if (submitData[field.id] === undefined) {
          // Firestore can't handle "undefined," so we use "null" instead
          submitData[field.id] = null;
        }
      }
      await onSubmit(submitData);
    } catch (e) {
      setError((
        e as Error
      ).message);
    }
  };

  return (
    <form {...props} noValidate onSubmit={submit}>
      {fields.map((field) => (
        <FormField key={field.id as string} {...getFormFieldWithValue(field, formData[field.id], setFieldValue)} />
      ))}
      <div className="form-buttons">
        {cancelText && onCancel && (
          <button type="button" className="cancel" onClick={onCancel}>
            {cancelText}
          </button>
        )}
        <button type="submit">
          {submitText}
          {submitIcon && (
            <span className="icon">
              <FontAwesomeIcon icon={submitIcon} />
            </span>
          )}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default Form;