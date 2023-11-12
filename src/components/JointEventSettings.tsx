import React, { FormEventHandler } from "react";
import IconButton from "./IconButton";
import { CheckInType, InputType } from "../utils/enums";
import { regular, solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import type { LinkedOrg } from "../utils/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAllOrgs } from "../utils/managers";
import { Firestore } from "firebase/firestore";
import FormField from "./FormField";

type JointEventSettingsProps = {
  db: Firestore,
  orgId: string,
  eventId: string,
  linkedEvents: LinkedOrg[],
  onAddOrg: (org: LinkedOrg) => void,
};

const JointEventSettings: React.FunctionComponent<JointEventSettingsProps> = ({
  db,
  orgId,
  eventId,
  linkedEvents,
  onAddOrg,
}) => {
  const [selectedOrg, setSelectedOrg] = React.useState<string>("");
  const [orgs, setOrgs] = React.useState<LinkedOrg[]>([]);

  const addOrg: FormEventHandler = (e) => {
    e.preventDefault();
    if (selectedOrg.length === 0) {
      return;
    }
    const org = orgs.find(({ id }) => id === selectedOrg);
    if (!org) {
      return;
    }
    onAddOrg(org);
    setSelectedOrg("");
  };

  React.useEffect(() => {
    getAllOrgs(db, [orgId, ...linkedEvents.map(({ id }) => id)], (orgs) => setOrgs(orgs));
  });

  return (
    <div className="section linked-events-settings">
      <div className="column">
        <h2 className="section-title">Linked Orgs</h2>
        <ul>
          {linkedEvents.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
        <form className="add-linked-org" noValidate onSubmit={addOrg}>
          <FormField
            id="linked-event"
            label="Select an org"
            required={true}
            inputType={InputType.DROPDOWN}
            options={orgs.map(({ id, name }) => (
              { id, label: name }
            ))}
            value={selectedOrg}
            setValue={setSelectedOrg}
          />
          <button type="submit">
            Add org <FontAwesomeIcon icon={solid("plus")} />
          </button>
        </form>
      </div>
      {linkedEvents.length > 0 && (
        <div className="action-buttons">
          <IconButton
            label="Open joint check-in page"
            onClick={() => window.open(`/orgs/${orgId}/${CheckInType.CHECK_IN}/joint/${eventId}`, "_blank")}
            icon={solid("arrow-up-right-from-square")}
          />
          <IconButton
            label="Open joint RSVP page"
            onClick={() => window.open(`/orgs/${orgId}/${CheckInType.RSVP}/joint/${eventId}`, "_blank")}
            icon={regular("calendar")}
          />
        </div>
      )}
    </div>
  );
};

export default JointEventSettings;