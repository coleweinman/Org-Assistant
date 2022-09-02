import React from "react";
import { Firestore } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import CheckInTable from "./CheckInTable";
import { CheckIn, getCheckIns } from "../../managers/CheckInManager";
import { getEvent, OrgEvent } from "../../managers/EventManager";
import loading from "../../images/loader.svg";
import "../../stylesheets/EventPage.scss";

interface EventPageProps {
  db: Firestore
}

const EventPage: React.FC<EventPageProps> = ({ db }) => {
  const [checkIns, setCheckIns] = React.useState<CheckIn[] | null>(null);
  const [event, setEvent] = React.useState<OrgEvent | null>(null);

  const { orgId, eventId } = useParams();
  const navigate = useNavigate();
  const onCheckInsUpdate = (checkIns: CheckIn[]) => setCheckIns(checkIns);
  const onEventUpdate = (event: OrgEvent | null) => setEvent(event);

  // Listen and unsubscribe from check ins
  React.useEffect(() => (
    getCheckIns(db, orgId!, eventId!, onCheckInsUpdate)
  ), [db, orgId, eventId]);

  // Listen and unsubscribe from event details
  React.useEffect(() => (
    getEvent(db, orgId!, eventId!, true, onEventUpdate)
  ), [db, orgId, eventId]);

  if (!event) {
    return (
      <div className={"page event-page loading-event-page"}>
        <img src={loading} alt={"Loading..."} />
      </div>
    );
  }

  return (
    <div className={"page event-page"}>
      <button className={"back-button"} onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={solid("chevron-left")} />
      </button>
      <h1 className={"header"}>{event.name}</h1>
      <div className={"section event-settings"}>
        <h2 className={"section-title"}>Event Settings</h2>
        <button
          className={"view-check-in"}
          onClick={() => window.open(`/orgs/${orgId}/checkin/${eventId}`, "_blank")
        }>
          View check-in page
          <span className={"new-tab-icon"}>
            <FontAwesomeIcon icon={solid("arrow-up-right-from-square")} />
          </span>
        </button>
      </div>
      <div className={"section event-stats"}>
        <h2 className={"section-title"}>Event Statistics</h2>
        <table className={"attendee-table"}>
          <tbody>
            <tr>
              <th>New:</th>
              <td>{event.newAttendeeCount}</td>
            </tr>
            <tr>
              <th>Returning:</th>
              <td>{event.attendeeCount - event.newAttendeeCount}</td>
            </tr>
            <tr>
              <th>Total Attendees:</th>
              <td>{event.attendeeCount}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CheckInTable checkIns={checkIns} />
    </div>
  );
}

export default EventPage;