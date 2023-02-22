import { Firestore } from "firebase/firestore";
import React from "react";
import {useNavigate, useParams} from "react-router-dom";
import { getEvents, OrgEvent } from "../../managers/EventManager";
import EventTable from "./EventTable";
import "../../stylesheets/OrgPage.scss";
import AttendeeTable from "../attendee/AttendeeTable";
import { Attendee, getAttendees } from "../../managers/AttendeeManager";

interface OrgPageProps {
  db: Firestore,
  seasonId: string
}

const OrgPage: React.FC<OrgPageProps> = ({ db, seasonId }) => {
  const [events, setEvents] = React.useState<OrgEvent[] | null>(null);
  const [attendees, setAttendees] = React.useState<Attendee[] | null>(null);
  const params = useParams();
  const onEventsUpdate = (events: OrgEvent[]) => setEvents(events);
  const onAttendeesUpdate = (attendees: Attendee[]) => setAttendees(attendees);

  React.useEffect(() => {
    getEvents(db, params.orgId!, seasonId, onEventsUpdate);
    getAttendees(db, params.orgId!, seasonId, onAttendeesUpdate);
  }, [params.orgId, seasonId, db]);

  return (
    <div className={"page org-page"}>
      <EventTable events={events} />
      <AttendeeTable attendees={attendees} />
    </div>
  );
}

export default OrgPage;