import React from "react";
import { getDisplayValue } from "../utils/staticHelpers";
import type { FormDataType, FormFieldType, FormState } from "../utils/types";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import IconButton from "./IconButton";
import Form from "./Form";

type EditableDetailsProps<T extends FormDataType> = {
  title: string,
  typeText: string,
  fields: FormFieldType<T>[],
  data: T,
  onEdit: (data: FormState<T>) => Promise<void>,
  getIconButtons?: (editButton: React.ReactElement) => (React.ReactElement | null)[],
};

const EditableDetails = <T extends FormDataType>({
  title,
  typeText,
  fields,
  data,
  onEdit,
  getIconButtons = (editButton: React.ReactElement) => [editButton],
}: EditableDetailsProps<T>) => {
  const [editing, setEditing] = React.useState<boolean>(false);
  const onFormSubmit = async (newData: FormState<T>) => {
    await onEdit(newData);
    setEditing(false);
  };
  return (
    <div className={`section editable-details ${editing ? "editing" : ""}`}>
      {editing ? (
        <div className="column">
          <h2 className="section-title">{title}</h2>
          <Form
            className="editable-details-form"
            initialData={data}
            fields={fields}
            submitText={`Update ${typeText}`}
            cancelText="Cancel"
            onSubmit={onFormSubmit}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <>
          <div className="column">
            <h2 className="section-title">{title}</h2>
            <table className="editable-details-table">
              <tbody>
                {fields.map((field) => (
                  <tr key={field.id as string}>
                    <th>{field.label}:</th>
                    <td>
                      {getDisplayValue(data[field.id], field)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="action-buttons">
            {getIconButtons(
              <IconButton
                key="edit"
                label={`Edit ${typeText}`}
                onClick={() => setEditing(true)}
                icon={solid("pen")}
              />,
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EditableDetails;