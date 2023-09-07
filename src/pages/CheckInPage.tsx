import React from "react";
import { Helmet } from "react-helmet-async";
import { Firestore, Timestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Form from "../components/Form";
import Page from "../components/Page";
import { getEvent, submitCheckInOrRsvp } from "../utils/managers";
import { CHECK_IN_FIELDS, CHECK_IN_TYPE_INFO } from "../utils/dynamicConstants";
import { getSavedUserData } from "../utils/dynamicHelpers";
import { CheckInType } from "../utils/enums";
import type { CheckIn, CheckInPageParams, FormState, OrgEvent } from "../utils/types";
import "../stylesheets/CheckInPage.scss";

type CheckInPageProps = {
  db: Firestore,
};

const CheckInPage: React.FunctionComponent<CheckInPageProps> = ({ db }) => {
  const [event, setEvent] = React.useState<OrgEvent | null>(null);

  const { orgId, eventId, type } = useParams<CheckInPageParams>();
  const navigate = useNavigate();
  const title = CHECK_IN_TYPE_INFO[type!].display;

  const onFormSubmit = async (data: FormState<CheckIn>): Promise<void | never> => {
    const checkIn: CheckIn = {
      ...data,
      email: (
        data.email as string
      ).toLowerCase(),
      didRsvp: type === CheckInType.RSVP,
      didCheckIn: type === CheckInType.CHECK_IN,
      eventId: eventId!,
      timestamp: Timestamp.now(),
    } as CheckIn;
    for (const { id } of CHECK_IN_FIELDS) {
      window.localStorage.setItem(id, data[id]?.toString() ?? "");
    }
    await submitCheckInOrRsvp(db, orgId!, eventId!, event!, checkIn, type!);
    navigate("submitted");
  };

  React.useEffect(() => {
    getEvent(db, orgId!, eventId!, false, (event) => setEvent(event));
  }, [db, eventId, orgId]);

  return event ? (
    <Page className="check-in-page">
      <Helmet>
        <title>{event.name} {title} &bull; Org Assistant</title>
      </Helmet>
      <h1 className="header">{title} for {event.name}</h1>
      {
        type === CheckInType.RSVP &&
        <body>{event.rsvpPageNote}</body>
      }
      {
        type === CheckInType.CHECK_IN &&
        <body>{event.checkInPageNote}</body>
      }
      <Form
        className="check-in-form"
        fields={CHECK_IN_FIELDS}
        initialData={getSavedUserData()}
        submitText={title}
        submitIcon={solid("paper-plane")}
        onSubmit={onFormSubmit}
      />
    </Page>
  ) : (
    <Page className="check-in-page" />
  );
};

export default CheckInPage;
