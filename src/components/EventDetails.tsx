import React from "react";
import { CREATE_EVENT_FIELDS } from "../utils/dynamicConstants";
import { FormState, OrgEvent, OrgEventWithoutLinked } from "../utils/types";
import { CheckInType } from "../utils/enums";
import { regular, solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import ConfirmButton from "./ConfirmButton";
import IconButton from "./IconButton";
import EditableDetails from "./EditableDetails";

type EventDetailsProps = {
  orgId: string,
  eventId: string,
  event: OrgEvent,
  onEventEdit: (data: FormState<OrgEventWithoutLinked>) => Promise<void>,
  onEventDelete: () => Promise<void>,
};

const EventDetails: React.FunctionComponent<EventDetailsProps> = ({
  orgId,
  eventId,
  event,
  onEventEdit,
  onEventDelete,
}) => {
  const getIconButtons = (editButton: React.ReactElement) => [
    <IconButton
      key="open-check-in"
      label="Open check-in page"
      onClick={() => window.open(`/orgs/${orgId}/${CheckInType.CHECK_IN}/${eventId}`, "_blank")}
      icon={solid("arrow-up-right-from-square")}
    />,
    <IconButton
      key="open-rsvp"
      label="Open RSVP page"
      onClick={() => window.open(`/orgs/${orgId}/${CheckInType.RSVP}/${eventId}`, "_blank")}
      icon={regular("calendar")}
    />,
    editButton,
    <ConfirmButton
      key="delete"
      label="Delete event"
      icon={solid("trash")}
      onClick={onEventDelete}
    />,
  ];
  return (
    <EditableDetails
      title="Event Settings"
      typeText="event"
      fields={CREATE_EVENT_FIELDS}
      data={event as OrgEventWithoutLinked}
      onEdit={onEventEdit}
      getIconButtons={getIconButtons}
    />
  );
};

export default EventDetails;