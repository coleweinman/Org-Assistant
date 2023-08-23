import React from "react";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Firestore } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import Form from "../components/Form";
import { addEvent, getOrg } from "../utils/managers";
import { CREATE_EVENT_FIELDS } from "../utils/dynamicConstants";
import type { CreatEventPageParams, FormState, Org, OrgEvent } from "../utils/types";
import { getOrgEventFromFormState } from "../utils/staticHelpers";
import { Helmet } from "react-helmet-async";
import Page from "../components/Page";

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

  const onFormSubmit = async (data: FormState<OrgEvent>) => {
    const event = getOrgEventFromFormState(org!.currentSeasonId, data);
    const success = await addEvent(db, orgId!, event);
    if (success) {
      navigate(`/orgs/${orgId}`);
    } else {
      console.error("Error occurred while adding event");
    }
  };

  return (
    <Page className="event-page">
      <Helmet>
        <title>Create Event &bull; Org Assistant</title>
      </Helmet>
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
    </Page>
  );
};

export default CreateEventPage;