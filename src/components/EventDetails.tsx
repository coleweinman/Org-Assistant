import React from "react";
import { CREATE_EVENT_FIELDS } from "../utils/dynamicConstants";
import { getDisplayValue } from "../utils/staticHelpers";
import { FormState, OrgEvent, OrgEventWithoutLinked } from "../utils/types";
import { CheckInType } from "../utils/enums";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { regular, solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import ConfirmButton from "./ConfirmButton";
import Form from "./Form";

type EventDetails = {
  orgId: string,
  eventId: string,
  event: OrgEvent,
  onEventEdit: (data: FormState<OrgEventWithoutLinked>) => Promise<void>,
  onEventDelete: () => Promise<void>,
};

const EventDetails: React.FunctionComponent<EventDetails> = ({ orgId, eventId, event, onEventEdit, onEventDelete }) => {
  const [editing, setEditing] = React.useState<boolean>(false);
  const onFormSubmit = async (data: FormState<OrgEventWithoutLinked>) => {
    await onEventEdit(data);
    setEditing(false);
  };
  return (
    <div className={`section event-settings ${editing ? "editing" : ""}`}>
      {editing ? (
        <div className="column">
          <h2 className="section-title">Event Settings</h2>
          <Form
            className="new-event-form"
            initialData={event}
            fields={CREATE_EVENT_FIELDS}
            submitText="Update Event"
            cancelText="Cancel"
            onSubmit={onFormSubmit}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <>
          <div className="column">
            <h2 className="section-title">Event Settings</h2>
            <table className="event-data event-details-table">
              <tbody>
                {CREATE_EVENT_FIELDS.map((field) => (
                  <tr key={field.id}>
                    <th>{field.label}:</th>
                    <td>
                      {getDisplayValue(
                        event[field.id] as OrgEventWithoutLinked[keyof OrgEventWithoutLinked],
                        field,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="event-action-buttons">
            <button
              className="icon-button"
              onClick={() => window.open(`/orgs/${orgId}/${CheckInType.CHECK_IN}/${eventId}`, "_blank")}
            >
              <FontAwesomeIcon icon={solid("arrow-up-right-from-square")} />
            </button>
            <button
              className="icon-button"
              onClick={() => window.open(`/orgs/${orgId}/${CheckInType.RSVP}/${eventId}`, "_blank")}
            >
              <FontAwesomeIcon icon={regular("calendar")} />
            </button>
            <button className="icon-button" onClick={() => setEditing(true)}>
              <FontAwesomeIcon icon={solid("pen")} />
            </button>
            <ConfirmButton
              icon={solid("trash")}
              onClick={onEventDelete}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default EventDetails;