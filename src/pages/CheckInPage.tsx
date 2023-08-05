import React from "react";
import { Firestore, Timestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Form from "../components/Form";
import { getEvent, submitCheckIn } from "../utils/managers";
import { CHECK_IN_FIELDS } from "../utils/constants";
import type { CheckIn, CheckInPageParams, FormState, OrgEvent } from "../utils/types";
import "../stylesheets/CheckInPage.scss";
import { InputType } from "../utils/enums";
import { Helmet } from "react-helmet";
import Page from "../components/Page";

type CheckInPageProps = {
  db: Firestore,
};

const CheckInPage: React.FunctionComponent<CheckInPageProps> = ({ db }) => {
  const [event, setEvent] = React.useState<OrgEvent | null>(null);

  const { orgId, eventId } = useParams<CheckInPageParams>();
  const navigate = useNavigate();

  const getInitialData = (): Partial<CheckIn> => {
    const data: Partial<CheckIn> = {};
    for (const { id, inputType } of CHECK_IN_FIELDS) {
      const saved = window.localStorage.getItem(id);
      if (saved) {
        // @ts-ignore: Type 'string | Timestamp' is not assignable to type '(string & Timestamp) | undefined'.
        data[id] = inputType === InputType.DATE ? Timestamp.fromDate(new Date(saved)) : saved;
      }
    }
    return data;
  };

  const onFormSubmit = async (data: FormState<CheckIn>) => {
    const checkIn: CheckIn = {
      ...data,
      eventId: eventId!,
      timestamp: Timestamp.now(),
    } as CheckIn;
    for (const { id } of CHECK_IN_FIELDS) {
      window.localStorage.setItem(id, data[id]?.toString() ?? "");
    }
    const success = await submitCheckIn(db, orgId!, eventId!, checkIn);
    if (success) {
      navigate("submitted");
    } else {
      throw new Error("You already checked in!");
    }
  };

  React.useEffect(() => {
    getEvent(db, orgId!, eventId!, false, (event) => setEvent(event));
  }, [db, eventId, orgId]);

  return event ? (
    <Page className="check-in-page">
      <Helmet>
        <title>{event.name} Check In &bull; Org Assistant</title>
      </Helmet>
      <h1 className="header">{event.name}</h1>
      <Form
        className="check-in-form"
        fields={CHECK_IN_FIELDS}
        initialData={getInitialData()}
        submitText="Check In"
        submitIcon={solid("paper-plane")}
        onSubmit={onFormSubmit}
      />
    </Page>
  ) : (
    <Page className="check-in-page" />
  );
};

export default CheckInPage;
