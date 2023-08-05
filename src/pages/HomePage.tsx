import React from "react";
import { Helmet } from "react-helmet";
import { Firestore } from "firebase/firestore";
import { useAuth } from "../components/AuthProvider";
import { getOrgs } from "../utils/managers";
import OrgCard from "../components/OrgCard";
import Page from "../components/Page";
import type { Org } from "../utils/types";
import Loading from "../components/Loading";
import "../stylesheets/HomePage.scss";

type HomePageProps = {
  db: Firestore,
};

const HomePage: React.FunctionComponent<HomePageProps> = ({ db }) => {
  const [orgs, setOrgs] = React.useState<Org[] | null>(null);

  const auth = useAuth();
  const onOrgsUpdate = (orgs: Org[]) => setOrgs(orgs);

  React.useEffect(() => {
    return getOrgs(db, auth.user!.uid, onOrgsUpdate);
  }, [db, auth.user]);

  if (!orgs) {
    return (
      <Loading className="home">
        <Helmet>
          <title>Your Organizations &bull; Org Assistant</title>
        </Helmet>
        <h1 className="header">Your Organizations</h1>
      </Loading>
    );
  }
  return (
    <Page className="home">
      <Helmet>
        <title>Your Organizations &bull; Org Assistant</title>
      </Helmet>
      <h1 className="header">Your Organizations</h1>
      {orgs.length === 0 ? (
        <p className="no-orgs-msg">No organizations to display</p>
      ) : (
        <div className="org-card-container">
          {orgs.map((org) => <OrgCard key={org.id} org={org} />)}
        </div>
      )}
    </Page>
  );
};

export default HomePage;