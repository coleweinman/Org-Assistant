import React from "react";
import { Firestore, Timestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { getCheckIns, getEvent } from "../utils/managers";
import CheckInTable from "../components/CheckInTable";
import type { CheckIn, EventPageParams, OrgEvent, YearGroup } from "../utils/types";
import { CREATE_EVENT_FIELDS, EVENT_STATISTICS_CATEGORIES } from "../utils/constants";
import { getDisplayValue, getYearGroups } from "../utils/helpers";
import loading from "../images/loader.svg";
import "../stylesheets/EventPage.scss";
import EventChart from "../components/EventChart";

type EventPageProps = {
  db: Firestore,
};

const EventPage: React.FunctionComponent<EventPageProps> = ({ db }) => {
  const [checkIns, setCheckIns] = React.useState<CheckIn[] | null>(null);
  const [yearGroups, setYearGroups] = React.useState<YearGroup[]>([]);
  const [event, setEvent] = React.useState<OrgEvent | null>(null);

  const { orgId, eventId } = useParams<EventPageParams>();
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

  // Get data for chart
  React.useEffect(() => {
    setYearGroups(getYearGroups(checkIns ?? []));
  }, [checkIns]);

  if (!event) {
    return (
      <div className="page event-page loading-event-page">
        <img className="loader" src={loading} alt="Loading..." />
      </div>
    );
  } else {
    return (
      <div className="page event-page">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={solid("chevron-left")} />
        </button>
        <h1 className="header">{event.name}</h1>
        <div className="section event-settings">
          <div className="column">
            <h2 className="section-title">Event Settings</h2>
            <table className="event-data event-details-table">
              <tbody>
                {CREATE_EVENT_FIELDS.map((field) => (
                  <tr>
                    <th>{field.label}:</th>
                    <td>
                      {event[field.id]
                        ? getDisplayValue(event[field.id] as string | string[] | Timestamp, field)
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="event-action-buttons">
            <button className="blue-button" onClick={() => window.open(`/orgs/${orgId}/checkin/${eventId}`, "_blank")}>
              <FontAwesomeIcon icon={solid("arrow-up-right-from-square")} />
            </button>
            <button className="blue-button" onClick={() => window.open(`/orgs/${orgId}/checkin/${eventId}`, "_blank")}>
              <FontAwesomeIcon icon={solid("pen-to-square")} />
            </button>
            <button className="blue-button" onClick={() => window.open(`/orgs/${orgId}/checkin/${eventId}`, "_blank")}>
              <FontAwesomeIcon icon={solid("trash")} />
            </button>
          </div>
        </div>
        <div className="section event-stats">
          <div className={"content"}>
            <h2 className="section-title">Event Statistics</h2>
            <table className="event-data attendee-table">
              <tbody>
                {EVENT_STATISTICS_CATEGORIES.map(({ id, label, getDisplayValue }) => (
                  <tr key={id}>
                    <th>{label}:</th>
                    <td>{getDisplayValue(event)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <EventChart yearGroups={yearGroups} />
        </div>
        <CheckInTable eventName={event.name} checkIns={checkIns} />
      </div>
    );
  }
};

export default EventPage;