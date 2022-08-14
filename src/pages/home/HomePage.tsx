import { Container } from "@mui/material";
import { Firestore, Unsubscribe } from "firebase/firestore";
import React from "react";
import { useAuth } from "../../AuthProvider";
import { getOrgs, Org } from "../../managers/OrgManager";
import OrgCard from "./OrgCard";

interface HomePageProps {
    db: Firestore,
}

function HomePage(props: HomePageProps) {
    const [orgs, setOrgs] = React.useState<Org[] | null>(null);

    let auth = useAuth();

    let onOrgsUpdate = (events: Org[]) => setOrgs(events);
    React.useEffect(() => {
        let eventUnsub: Unsubscribe = getOrgs(props.db, auth.user!.uid, onOrgsUpdate);
        return function cleanup() {
            eventUnsub();
        };
    }, [auth.user]);

    return (
        <Container>
            {orgs?.map((org) => <OrgCard org={org} />)}
        </Container>
    );
}

export default HomePage;