import React from "react";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dayjs } from "dayjs";
import { Firestore, Timestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import Form from "../components/Form";
import { addEvent, getOrg } from "../utils/managers";
import { CREATE_EVENT_FIELDS } from "../utils/constants";
import type { CreatEventPageParams, FormState, NewOrgEvent, Org } from "../utils/types";

type CreateEventPageProps = {
  db: Firestore,
};

const CreateEventPage: React.FunctionComponent<CreateEventPageProps> = ({ db }) => {
  const [org, setOrg] = React.useState<Org | null>(null);

  const onOrgUpdate = (event: Org | null) => setOrg(event);

  const { orgId, eventId } = useParams<CreatEventPageParams>();
  const navigate = useNavigate();

  // Listen and unsubscribe from event details
  React.useEffect(() => (
    getOrg(db, orgId!, onOrgUpdate)
  ), [db, orgId, eventId]);

  const onFormSubmit = async (data: FormState<NewOrgEvent>) => {
    const event = {
      ...data,
      seasonId: org!.currentSeasonId,
      startTime: Timestamp.fromMillis((
        data.startTime! as Dayjs
      ).valueOf()),
      endTime: Timestamp.fromMillis((
        data.endTime! as Dayjs
      ).valueOf()),
      newAttendeeCount: 0,
      attendeeCount: 0,
    } as NewOrgEvent;
    const success = await addEvent(db, orgId!, event);
    if (success) {
      navigate(`/orgs/${orgId}`);
    } else {
      console.error("Error occurred while adding event");
    }
  };

  return (
    <div className="page event-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={solid("chevron-left")} />
      </button>
      <h1 className="header">Create New Event</h1>
      <div className="section">
        <h2 className="section-title">Event Settings</h2>
        <Form
          className="new-event-form"
          fields={CREATE_EVENT_FIELDS}
          submitText="Create Event"
          submitIcon={solid("arrow-right")}
          onSubmit={onFormSubmit}
        />
      </div>
    </div>
  );
};

export default CreateEventPage;