import React from "react";
import { Helmet } from "react-helmet-async";
import { Firestore } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { getAttendees, getEvents, getOrg, updateOrg } from "../utils/managers";
import EventTable from "../components/EventTable";
import AttendeeTable from "../components/AttendeeTable";
import Page from "../components/Page";
import BackButton from "../components/BackButton";
import Loading from "../components/Loading";
import SeasonSelect from "../components/SeasonSelect";
import type { Attendee, FormState, Org, OrgEventWithId, OrgPageParams } from "../utils/types";
import OrgSettings from "../components/OrgSettings";
import "../stylesheets/OrgPage.scss";
import { revokeCalendarAuth, shareCalendarAuth } from "../utils/googleCalendar";

type OrgPageProps = {
  db: Firestore,
};

const OrgPage: React.FunctionComponent<OrgPageProps> = ({ db }) => {
  const [seasonId, setSeasonId] = React.useState<string | null>(null);
  const [org, setOrg] = React.useState<Org | null>(null);
  const [events, setEvents] = React.useState<OrgEventWithId[] | null>(null);
  const [attendees, setAttendees] = React.useState<Attendee[] | null>(null);
  const { orgId } = useParams<OrgPageParams>();

  const onOrgEdit = async ({ calendarId, ...data }: FormState<Org>) => {
    if (!orgId || !org) {
      return;
    }
    try {
      await updateOrg(db, { ...org, ...data } as Org);
      if (calendarId && !org.calendarId) {
        await shareCalendarAuth(orgId);
      } else if (!calendarId && org.calendarId) {
        await revokeCalendarAuth(orgId, org.calendarId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    const unsubOrg = getOrg(db, orgId!, (org: Org | null) => {
      setOrg(org);
      if (org && !seasonId) {
        setSeasonId(org.currentSeasonId);
      }
    });
    if (!seasonId) {
      return unsubOrg;
    }
    const unsubEvents = getEvents(db, orgId!, seasonId, (events: OrgEventWithId[]) => setEvents(events));
    const unsubAttendees = getAttendees(db, orgId!, seasonId, setAttendees);
    return () => {
      unsubEvents();
      unsubAttendees();
      unsubOrg();
    };
  }, [orgId, seasonId, db]);

  return !(
    orgId && seasonId && org
  ) ? (
    <Loading className="org-page" />
  ) : (
    <Page className="org-page">
      <Helmet>
        <title>{org.name} &bull; Org Assistant</title>
      </Helmet>
      <BackButton to="/" />
      <h1 className="header">{org.name}</h1>
      <SeasonSelect seasonId={seasonId} setSeasonId={setSeasonId} allSeasonIds={org.seasons} />
      <EventTable orgId={orgId} events={events} />
      <AttendeeTable orgName={org.name} orgId={orgId} attendees={attendees} />
      <OrgSettings org={org} onOrgEdit={onOrgEdit} />
    </Page>
  );
};

export default OrgPage;