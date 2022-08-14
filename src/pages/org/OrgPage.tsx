import { Add } from "@mui/icons-material";
import { Container, Fab, Stack, Typography } from "@mui/material";
import { Firestore, Unsubscribe } from "firebase/firestore";
import React from "react";
import { useParams } from "react-router-dom";
import { getEvents, OrgEvent } from "../../managers/EventManager";
import EventTable from "./EventTable";

interface OrgPageProps {
    db: Firestore,
    seasonId: string
}

function OrgPage(props: OrgPageProps) {
    const [events, setEvents] = React.useState<OrgEvent[] | null>(null);

    let params = useParams();
    let onEventsUpdate = (events: OrgEvent[]) => setEvents(events);

    React.useEffect(() => {
        let eventUnsub: Unsubscribe = getEvents(props.db, params.orgId!, props.seasonId, onEventsUpdate);
        return function cleanup() {
            eventUnsub();
        };
    }, [params.orgId, props.seasonId]);

    return (
        <Container>
            <Typography>Events Page</Typography>
            <Stack>
                <EventTable events={events ?? []} />
            </Stack>
            <Fab 
                color="primary" 
                aria-label="add"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16
                }}
            >
                <Add />
            </Fab>
        </Container>
    );
}

export default OrgPage;