import React from "react";
import { Helmet } from "react-helmet-async";
import { Firestore } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { getAttendees, getEvents, getOrg } from "../utils/managers";
import EventTable from "../components/EventTable";
import AttendeeTable from "../components/AttendeeTable";
import Page from "../components/Page";
import BackButton from "../components/BackButton";
import Loading from "../components/Loading";
import SeasonSelect from "../components/SeasonSelect";
import type { Attendee, Org, OrgEventWithId, OrgPageParams } from "../utils/types";
import "../stylesheets/OrgPage.scss";

type OrgPageProps = {
  db: Firestore,
};

const OrgPage: React.FunctionComponent<OrgPageProps> = ({ db }) => {
  const [seasonId, setSeasonId] = React.useState<string | null>(null);
  const [org, setOrg] = React.useState<Org | null>(null);
  const [events, setEvents] = React.useState<OrgEventWithId[] | null>(null);
  const [attendees, setAttendees] = React.useState<Attendee[] | null>(null);
  const { orgId } = useParams<OrgPageParams>();
  const onEventsUpdate = (events: OrgEventWithId[]) => setEvents(events);
  const onAttendeesUpdate = (attendees: Attendee[]) => setAttendees(attendees);
  const onOrgUpdate = (org: Org | null) => {
    setOrg(org);
    if (!seasonId && org) {
      setSeasonId(org.currentSeasonId);
    }
  };

  React.useEffect(() => {
    const unsubOrg = getOrg(db, orgId!, onOrgUpdate);
    const unsubEvents = seasonId ? getEvents(db, orgId!, seasonId, onEventsUpdate) : () => {};
    const unsubAttendees = seasonId ? getAttendees(db, orgId!, seasonId, onAttendeesUpdate) : () => {};
    return () => {
      unsubEvents();
      unsubAttendees();
      unsubOrg();
    };
  }, [orgId, seasonId, db]);

  return !org ? (
    <Loading className="org-page" />
  ) : (
    <Page className="org-page">
      <Helmet>
        <title>{org.name} &bull; Org Assistant</title>
      </Helmet>
      <BackButton to="/" />
      <h1 className="header">{org.name}</h1>
      <SeasonSelect seasonId={seasonId!} setSeasonId={setSeasonId} allSeasonIds={org.seasons} />
      <EventTable events={events} />
      <AttendeeTable attendees={attendees} />
    </Page>
  );
};

export default OrgPage;