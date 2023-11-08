import React from "react";
import { ORG_FIELDS } from "../utils/dynamicConstants";
import type { FormState, Org } from "../utils/types";
import EditableDetails from "./EditableDetails";
import IconButton from "./IconButton";
import { regular } from "@fortawesome/fontawesome-svg-core/import.macro";
import { editCalendarAuth } from "../utils/googleCalendar";

type OrgSettingsProps = {
  org: Org,
  onOrgEdit: (data: FormState<Org>) => Promise<void>,
};

const OrgSettings: React.FunctionComponent<OrgSettingsProps> = ({ org, onOrgEdit }) => {
  const getIconButtons = (editButton: React.ReactElement) => [
    editButton,
    org.calendarId ? (
      <IconButton
        key="open-rsvp"
        label="Change linked calendar"
        onClick={() => editCalendarAuth(org.id, org.calendarId!)}
        icon={regular("calendar-plus")}
      />
    ) : null,
  ];
  return (
    <EditableDetails
      title="Org Settings"
      typeText="org"
      fields={ORG_FIELDS}
      data={org}
      onEdit={onOrgEdit}
      getIconButtons={getIconButtons}
    />
  );
};

export default OrgSettings;