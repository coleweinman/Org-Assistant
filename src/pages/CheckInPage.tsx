import React from "react";
import { Helmet } from "react-helmet-async";
import { Firestore, Timestamp } from "firebase/firestore";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Form from "../components/Form";
import Page from "../components/Page";
import { getEvent, getOrg, submitCheckInOrRsvp } from "../utils/managers";
import { CHECK_IN_FIELDS, CHECK_IN_TYPE_INFO } from "../utils/dynamicConstants";
import { getSavedUserData } from "../utils/dynamicHelpers";
import { CheckInType, InputType } from "../utils/enums";
import type {
  CheckIn,
  CheckInPageParams,
  FormFieldType,
  FormOption,
  FormState,
  JointCheckIn,
  Org,
  OrgEvent,
} from "../utils/types";
import "../stylesheets/CheckInPage.scss";
import Loading from "../components/Loading";

type CheckInPageProps = {
  db: Firestore,
  joint: boolean,
};

const CheckInPage: React.FunctionComponent<CheckInPageProps> = ({ db, joint }) => {
  const [event, setEvent] = React.useState<OrgEvent | null>(null);
  const [org, setOrg] = React.useState<Org | null>(null);

  const { orgId, eventId, type } = useParams<CheckInPageParams>();
  const navigate = useNavigate();
  const title = CHECK_IN_TYPE_INFO[type!].display;

  const onFormSubmit = async (data: FormState<CheckIn | JointCheckIn>): Promise<void | never> => {
    const checkInData = {
      ...data,
      email: (
        data.email as string
      ).toLowerCase(),
      didRsvp: type === CheckInType.RSVP,
      didCheckIn: type === CheckInType.CHECK_IN,
      eventId: eventId!,
      timestamp: Timestamp.now(),
    };
    if (joint) {
      const jointCheckIn = checkInData as JointCheckIn;
      const { org, ...checkIn } = jointCheckIn;
      for (const { id } of checkInFields as FormFieldType<JointCheckIn>[]) {
        window.localStorage.setItem(id, jointCheckIn[id]?.toString() ?? "");
      }
      const orgEventId = event?.linkedEvents.find((le) => le.org.id === org)?.event.id;
      await submitCheckInOrRsvp(db, org, orgEventId!, event!, checkIn, type!);
    } else {
      const checkIn = checkInData as CheckIn;
      for (const { id } of checkInFields as FormFieldType<CheckIn>[]) {
        window.localStorage.setItem(id, checkIn[id]?.toString() ?? "");
      }
      await submitCheckInOrRsvp(db, orgId!, eventId!, event!, checkIn, type!);
    }
    navigate("submitted");
  };

  const orgs: FormOption[] | null = joint && org && event?.linkedEvents && event.linkedEvents.length > 0
    ? [
      { id: orgId!, label: org.name }, ...event.linkedEvents.map(({ org }) => (
        { id: org.id, label: org.name }
      )),
    ]
    : null;

  const checkInFields: (FormFieldType<CheckIn> | FormFieldType<JointCheckIn>)[] = orgs
    ? [
      { id: "org", label: "Org", required: true, inputType: InputType.DROPDOWN, options: orgs },
      ...CHECK_IN_FIELDS,
    ] : CHECK_IN_FIELDS;

  React.useEffect(() => (
    getEvent(db, orgId!, eventId!, false, (event) => setEvent(event))
  ), [db, eventId, orgId]);

  React.useEffect(() => (
    getOrg(db, orgId!, (org) => setOrg(org))
  ), [db, orgId]);

  if (!event || !org) {
    return (
      <Page className="check-in-page">
        <Loading />
      </Page>
    );
  } else if (joint && !(
    event?.linkedEvents && event.linkedEvents.length > 0
  )) {
    // Redirect if event is not joint
    return (
      <Navigate to={`/orgs/${orgId}/${type}/${eventId}`} replace />
    );
  } else {
    return (
      <Page className="check-in-page">
        <Helmet>
          <title>{event.name} {title} &bull; Org Assistant</title>
        </Helmet>
        <h1 className="header">{title} for {event.name}</h1>
        {type === CheckInType.RSVP && <body>{event.rsvpPageNote}</body>}
        {type === CheckInType.CHECK_IN && <body>{event.checkInPageNote}</body>}
        <Form
          className="check-in-form"
          fields={checkInFields}
          initialData={getSavedUserData(checkInFields)}
          submitText={title}
          submitIcon={solid("paper-plane")}
          onSubmit={onFormSubmit}
        />
      </Page>
    );
  }
};

export default CheckInPage;
