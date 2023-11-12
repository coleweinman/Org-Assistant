import React from "react";
import { Helmet } from "react-helmet-async";
import { Firestore, Timestamp } from "firebase/firestore";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Form from "../components/Form";
import Page from "../components/Page";
import { getEvent, getEventOnce, getOrg, submitCheckInOrRsvp } from "../utils/managers";
import { CHECK_IN_FIELDS } from "../utils/dynamicConstants";
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
  const title = type === CheckInType.CHECK_IN ? "Check In" : "RSVP";

  const onFormSubmit = async (data: FormState<CheckIn | JointCheckIn>): Promise<void | never> => {
    if (!eventId || !orgId) {
      return;
    }
    const checkInData = {
      ...data,
      email: (
        data.email as string
      ).toLowerCase(),
      didRsvp: type === CheckInType.RSVP,
      didCheckIn: type === CheckInType.CHECK_IN,
      eventId,
      timestamp: Timestamp.now(),
    };
    if (joint) {
      const jointCheckIn = checkInData as JointCheckIn;
      const { org: selectedOrg, ...checkIn } = jointCheckIn;
      let orgEvent = selectedOrg !== orgId ? await getEventOnce(db, selectedOrg, eventId) : event;
      for (const { id } of checkInFields as FormFieldType<JointCheckIn>[]) {
        window.localStorage.setItem(id, jointCheckIn[id]?.toString() ?? "");
      }
      const checkInId = await submitCheckInOrRsvp(db, selectedOrg, eventId, orgEvent!, checkIn, type!);
      navigate(`/orgs/${selectedOrg}/submitted/${checkInId}`);
    } else {
      const checkIn = checkInData as CheckIn;
      for (const { id } of checkInFields as FormFieldType<CheckIn>[]) {
        window.localStorage.setItem(id, checkIn[id]?.toString() ?? "");
      }
      const checkInId = await submitCheckInOrRsvp(db, orgId!, eventId!, event!, checkIn, type!);
      navigate(`/orgs/${orgId}/submitted/${checkInId}`);
    }
  };

  const orgs: FormOption[] | null = joint && org && event?.linkedEvents && event.linkedEvents.length > 0
    ? [
      { id: orgId!, label: org.name }, ...event.linkedEvents.map(({ name, id }) => (
        { id, label: name }
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
