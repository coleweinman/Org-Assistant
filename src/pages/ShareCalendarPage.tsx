import React from "react";
import { GoogleCalendar } from "../utils/types";
import { useLocation, useNavigate } from "react-router-dom";
import { parseHashParams } from "../utils/staticHelpers";
import { getCalendars, revokeCalendarAccess, shareCalendar } from "../utils/googleCalendar";
import Page from "../components/Page";
import Loading from "../components/Loading";
import { updateCalendarId } from "../utils/managers";
import { Firestore } from "firebase/firestore";

type ShareCalendarPageProps = {
  db: Firestore,
  editing: boolean,
};

const ShareCalendarPage: React.FunctionComponent<ShareCalendarPageProps> = ({ db, editing }) => {
  const [calendars, setCalendars] = React.useState<GoogleCalendar[] | null>(null);
  const [hasShared, setHasShared] = React.useState<boolean>(false);
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { access_token, state } = parseHashParams(hash);

  const onCalendarClick = async (id: string) => {
    setHasShared(true);
    const orgId = editing ? state.split("%20")[0] : state;
    await Promise.all([
      shareCalendar(id, access_token).catch((e) => console.error(e)),
      editing ? revokeCalendarAccess(state.split("%20")[1], access_token) : Promise.resolve(),
    ]);
    await updateCalendarId(db, orgId, id);
    navigate(`/orgs/${orgId}`);
  };

  React.useEffect(() => {
    getCalendars(access_token).then((newCalendars) => setCalendars(newCalendars));
  }, [access_token]);

  return hasShared || !calendars ? (
    <Loading />
  ) : (
    <Page className="calendar-page revoke-calendar-page">
      <ul className="calendar-list">
        <h1>Select a calendar</h1>
        {calendars.length > 0 ? (
          calendars.map(({ id, summary, backgroundColor }) => (
            <li key={id}>
              <button onClick={() => onCalendarClick(id)}>
                <span className="calendar-color" style={{ backgroundColor }} />
                {summary}
              </button>
            </li>
          ))
        ) : (
          <p>No calendars to display. Please create a calendar, then try again.</p>
        )}
      </ul>
    </Page>
  );
};

export default ShareCalendarPage;