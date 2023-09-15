import React from "react";
import Page from "../components/Page";
import Clock from "../components/Clock";
import Loading from "../components/Loading";
import { useParams } from "react-router-dom";
import { Firestore } from "firebase/firestore";
import type { CheckIn, Org, OrgEvent, SubmitPageParams } from "../utils/types";
import "../stylesheets/SubmitPage.scss";
import { getCheckIn, getEvent, getOrg } from "../utils/managers";

type SubmitPageProps = {
  db: Firestore,
};

const SubmitPage: React.FunctionComponent<SubmitPageProps> = ({ db }) => {
  const [checkIn, setCheckIn] = React.useState<CheckIn | null>(null);
  const [org, setOrg] = React.useState<Org | null>(null);
  const [event, setEvent] = React.useState<OrgEvent | null>(null);
  const { orgId, checkInId } = useParams<SubmitPageParams>();

  React.useEffect(() => (
    getCheckIn(db, orgId!, checkInId!, setCheckIn)
  ), [db, orgId, checkInId]);

  React.useEffect(() => (
    getOrg(db, orgId!, setOrg)
  ), [db, orgId]);

  React.useEffect(() => {
    if (!checkIn) {
      return;
    }
    return getEvent(db, orgId!, checkIn.eventId, false, setEvent);
  }, [db, orgId, checkIn]);

  if (!checkIn || !event || !org) {
    return <Loading />;
  } else {
    return (
      <Page className="submit-page">
        <h2>{checkIn.didCheckIn ? "You are now checked in!" : "You have successfully RSVP'd!"}</h2>
        <Clock />
        <table className="submitted-data">
          <tbody style={{fontSize: "24px"}}>
            <tr>
              <th>Name:</th>
              <td>{checkIn.name}</td>
            </tr>
            <tr>
              <th>Event:</th>
              <td>{event.name}</td>
            </tr>
            <tr>
              <th>Org:</th>
              <td>{org.name}</td>
            </tr>
          </tbody>
        </table>
      </Page>
    );
  }
};

export default SubmitPage;