import React from "react";
import { Helmet } from "react-helmet-async";
import { Firestore } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { getAttendees, getEvents, getOrg } from "../utils/managers";
import EventTable from "../components/EventTable";
import AttendeeTable from "../components/AttendeeTable";
import type { Attendee, Org, OrgEventWithId, OrgPageParams } from "../utils/types";
import "../stylesheets/OrgPage.scss";
import Page from "../components/Page";
import BackButton from "../components/BackButton";
import Loading from "../components/Loading";

type OrgPageProps = {
  db: Firestore,
  seasonId: string,
};

const OrgPage: React.FunctionComponent<OrgPageProps> = ({ db, seasonId }) => {
  const [org, setOrg] = React.useState<Org | null>(null);
  const [events, setEvents] = React.useState<OrgEventWithId[] | null>(null);
  const [attendees, setAttendees] = React.useState<Attendee[] | null>(null);
  const { orgId } = useParams<OrgPageParams>();
  const onEventsUpdate = (events: OrgEventWithId[]) => setEvents(events);
  const onAttendeesUpdate = (attendees: Attendee[]) => setAttendees(attendees);
  const onOrgUpdate = (org: Org | null) => setOrg(org);

  React.useEffect(() => {
    const unsubEvents = getEvents(db, orgId!, seasonId, onEventsUpdate);
    const unsubAttendees = getAttendees(db, orgId!, seasonId, onAttendeesUpdate);
    const unsubOrg = getOrg(db, orgId!, onOrgUpdate);
    return () => {
      unsubEvents();
      unsubAttendees();
      unsubOrg();
    };
  }, [orgId, seasonId, db]);

  if (!org || !events || !attendees) {
    return (
      <Loading className="org-page" />
    );
  } else {
    return (
      <Page className="org-page">
        <Helmet>
          <title>{org.name} &bull; Org Assistant</title>
        </Helmet>
        <BackButton to="/" />
        <h1 className="header">{org.name}</h1>
        <EventTable events={events} />
        <AttendeeTable attendees={attendees} />
      </Page>
    );
  }
};

export default OrgPage;