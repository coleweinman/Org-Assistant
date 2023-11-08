import React from "react";
import { Helmet } from "react-helmet-async";
import { Firestore } from "firebase/firestore";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import Page from "../components/Page";
import BackButton from "../components/BackButton";
import EventTable from "../components/EventTable";
import { ATTENDEE_SETTINGS_CATEGORIES, ATTENDEE_STATISTICS_CATEGORIES } from "../utils/dynamicConstants";
import { getAttendee, getAttendeeEvents, getAttendeeId } from "../utils/managers";
import type { AttendeePageParams, AttendeeWithData, OrgEventWithId } from "../utils/types";
import "../stylesheets/AttendeePage.scss";

type AttendeePageProps = {
  db: Firestore,
};

const AttendeePage: React.FunctionComponent<AttendeePageProps> = ({ db }) => {
  const [attendee, setAttendee] = React.useState<AttendeeWithData | null>(null);
  const [events, setEvents] = React.useState<OrgEventWithId[] | null>(null);

  const navigate = useNavigate();
  const { orgId, attendeeId } = useParams<AttendeePageParams>();
  const { state } = useLocation();
  const onAttendeeUpdate = (attendee: AttendeeWithData | null) => setAttendee(attendee);
  const onEventsUpdate = (events: OrgEventWithId[]) => setEvents(events);

  React.useEffect(() => {
    if (attendeeId) {
      return getAttendee(db, orgId!, attendeeId, onAttendeeUpdate);
    } else {
      getAttendeeId(db, orgId!, state.email!).then((id) => {
        if (!id) {
          navigate(-1);
        } else {
          navigate(`/orgs/${orgId}/attendees/${id}`);
        }
      });
    }
  }, [db, orgId, attendeeId, navigate, state.email]);

  // Listen and unsubscribe from check ins
  React.useEffect(() => {
    if (attendee) {
      return getAttendeeEvents(db, orgId!, attendee.email, onEventsUpdate);
    }
  }, [db, orgId, attendee]);

  if (!attendee) {
    return (
      <Loading className="attendee-page">
        <BackButton to={`/orgs/${orgId}`} />
      </Loading>
    );
  } else {
    return (
      <Page className="attendee-page">
        <Helmet>
          <title>{attendee.name} &bull; Org Assistant</title>
        </Helmet>
        <BackButton to={`/orgs/${orgId}`} />
        <h1 className="header">{attendee.name}</h1>
        <div className="section">
          <h2 className="section-title">Attendee Settings</h2>
          <table className="attendee-data">
            <tbody>
              {ATTENDEE_SETTINGS_CATEGORIES.map(({ id, label, getDisplayValue }) => (
                <tr key={id}>
                  <th>{label}:</th>
                  <td>{getDisplayValue(attendee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="section">
          <h2 className="section-title">Attendee Statistics</h2>
          <table className="attendee-data">
            <tbody>
              {ATTENDEE_STATISTICS_CATEGORIES.map(({ id, label, getDisplayValue }) => (
                <tr key={id}>
                  <th>{label}:</th>
                  <td>{getDisplayValue(attendee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EventTable orgId={orgId!} events={events} />
      </Page>
    );
  }
};

export default AttendeePage;