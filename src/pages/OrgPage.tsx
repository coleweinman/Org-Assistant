import React from "react";
import { Firestore } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { getAttendees, getEvents } from "../utils/managers";
import EventTable from "../components/EventTable";
import AttendeeTable from "../components/AttendeeTable";
import type { Attendee, OrgEventWithId, OrgPageParams } from "../utils/types";
import "../stylesheets/OrgPage.scss";

type OrgPageProps = {
  db: Firestore,
  seasonId: string,
};

const OrgPage: React.FunctionComponent<OrgPageProps> = ({ db, seasonId }) => {
  const [events, setEvents] = React.useState<OrgEventWithId[] | null>(null);
  const [attendees, setAttendees] = React.useState<Attendee[] | null>(null);
  const { orgId } = useParams<OrgPageParams>();
  const onEventsUpdate = (events: OrgEventWithId[]) => setEvents(events);
  const onAttendeesUpdate = (attendees: Attendee[]) => setAttendees(attendees);

  React.useEffect(() => {
    getEvents(db, orgId!, seasonId, onEventsUpdate);
    getAttendees(db, orgId!, seasonId, onAttendeesUpdate);
  }, [orgId, seasonId, db]);

  return (
    <div className="page org-page">
      <EventTable events={events} />
      <AttendeeTable attendees={attendees} />
    </div>
  );
};

export default OrgPage;