import React from "react";
import { Firestore, Unsubscribe } from "firebase/firestore";
import { useAuth } from "../components/AuthProvider";
import { getOrgs } from "../utils/managers";
import OrgCard from "./OrgCard";
import type { Org } from "../utils/types";
import "../stylesheets/HomePage.scss";

type HomePageProps = {
  db: Firestore,
};

const HomePage: React.FunctionComponent<HomePageProps> = ({ db }) => {
  const [orgs, setOrgs] = React.useState<Org[] | null>(null);

  const auth = useAuth();
  const onOrgsUpdate = (events: Org[]) => setOrgs(events);

  React.useEffect(() => {
    const eventUnsub: Unsubscribe = getOrgs(db, auth.user!.uid, onOrgsUpdate);
    return function cleanup() {
      eventUnsub();
    };
  }, [db, auth.user]);

  return (
    <div className="page home">
      <h1 className="header">Your Organizations</h1>
      {orgs ? (
        <div className="org-card-container">
          {orgs.map((org) => <OrgCard key={org.id} org={org} />)}
        </div>
      ) : <p className="no-orgs-msg">No organizations to display</p>}
    </div>
  );
};

export default HomePage;