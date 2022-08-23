import React from "react";
import { Firestore, Unsubscribe } from "firebase/firestore";
import { useAuth } from "../../AuthProvider";
import { getOrgs, Org } from "../../managers/OrgManager";
import OrgCard from "./OrgCard";
import "../../stylesheets/HomePage.scss";

interface HomePageProps {
  db: Firestore,
}

function HomePage({ db }: HomePageProps) {
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
    <div className={"home"}>
      <h1 className={"header"}>Your Organizations</h1>
      {orgs ? (
        <div className={"org-card-container"}>
          {orgs.map((org) => <OrgCard org={org} />)}
        </div>
      ) : <p className={"no-orgs-msg"}>No organizations to display</p>}
    </div>
  );
}

export default HomePage;