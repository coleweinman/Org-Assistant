import React from "react";
import { revokeCalendarAccess } from "../utils/googleCalendar";
import { useLocation, useNavigate } from "react-router-dom";
import { parseHashParams } from "../utils/staticHelpers";
import Page from "../components/Page";
import "../stylesheets/CalendarPage.scss";
import { Firestore } from "firebase/firestore";
import { updateCalendarId } from "../utils/managers";

type RevokeCalendarPageProps = {
  db: Firestore
}

const RevokeCalendarPage: React.FunctionComponent<RevokeCalendarPageProps> = ({ db }) => {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { access_token, state } = parseHashParams(hash);
  const [orgId, calendarId] = state.split("%20");

  React.useEffect(() => {
    Promise.all([
      revokeCalendarAccess(calendarId, access_token),
      updateCalendarId(db, orgId, null),
    ]).then(() => navigate(`/orgs/${orgId}`));
  }, [access_token, orgId, calendarId, db, navigate]);

  return (
    <Page className="calendar-page revoke-calendar-page">
      <p>
        Revoking access to shared calendar...
      </p>
    </Page>
  );
};

export default RevokeCalendarPage;