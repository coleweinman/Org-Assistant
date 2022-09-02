import { Firestore } from "firebase/firestore";
import React from "react";
import {useParams} from "react-router-dom";
import { getEvents, OrgEvent } from "../../managers/EventManager";
import EventTable from "./EventTable";
import "../../stylesheets/OrgPage.scss";

interface OrgPageProps {
  db: Firestore,
  seasonId: string
}

const OrgPage: React.FC<OrgPageProps> = ({ db, seasonId }) => {
  const [events, setEvents] = React.useState<OrgEvent[] | null>(null);

  const params = useParams();
  const onEventsUpdate = (events: OrgEvent[]) => setEvents(events);

  React.useEffect(() => (
    getEvents(db, params.orgId!, seasonId, onEventsUpdate)
  ), [params.orgId, seasonId, db]);

  return (
    <div className={"page org-page"}>
      <EventTable events={events}/>
    </div>
  );
}

export default OrgPage;