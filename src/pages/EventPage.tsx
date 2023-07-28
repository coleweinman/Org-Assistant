import React from "react";
import { Firestore } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { getCheckIns, getEvent } from "../utils/managers";
import CheckInTable from "../components/CheckInTable";
import { Pie, PieChart, Tooltip } from "recharts";
import type { CheckIn, EventPageParams, OrgEvent, YearGroup } from "../utils/types";
import { copyCheckIns } from "../utils/helpers";
import loading from "../images/loader.svg";
import "../stylesheets/EventPage.scss";

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

  React.useEffect(() => {
    const yearMap: Map<string, number> = new Map();
    for (const checkIn of checkIns ?? []) {
      if (!yearMap.has(checkIn.year)) {
        yearMap.set(checkIn.year, 0);
      }
      yearMap.set(checkIn.year, yearMap.get(checkIn.year)! + 1);
    }
    const newYearGroups: YearGroup[] = [];
    Array.from(yearMap.entries())
      .map((e) => newYearGroups.push({ year: e[0], quantity: e[1] }));
    setYearGroups(newYearGroups);
  }, [checkIns]);

  // Listen and unsubscribe from event details
  React.useEffect(() => (
    getEvent(db, orgId!, eventId!, true, onEventUpdate)
  ), [db, orgId, eventId]);

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
          <h2 className="section-title">Event Settings</h2>
          <button
            className="view-check-in"
            onClick={() => window.open(`/orgs/${orgId}/checkin/${eventId}`, "_blank")}
          >
            View check-in page
            <span className="new-tab-icon">
            <FontAwesomeIcon icon={solid("arrow-up-right-from-square")} />
          </span>
          </button>
        </div>
        <div className="section event-stats">
          <h2 className="section-title">Event Statistics</h2>
          <table className="attendee-table">
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
        <button onClick={() => copyCheckIns(checkIns ?? [])}>COPY</button>
        <CheckInTable checkIns={checkIns} />
        <PieChart width={400} height={400}>
          <Pie
            nameKey="year"
            dataKey="quantity"
            isAnimationActive={false}
            data={yearGroups ?? []}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          />
          <Tooltip />
        </PieChart>
      </div>
    );
  }
};

export default EventPage;