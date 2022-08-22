import { ExitToApp } from "@mui/icons-material";
import { Button, Card, CardContent, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { Firestore, Unsubscribe } from "firebase/firestore";
import React from "react";
import { useParams } from "react-router-dom";
import { CheckIn, getCheckIns } from "../../managers/CheckInManager";
import { getEvent, OrgEvent } from "../../managers/EventManager";
import CheckInTable from "./CheckInTable";

interface EventPageProps {
    db: Firestore,
}

function EventPage(props: EventPageProps) {
    const [checkIns, setCheckIns] = React.useState<CheckIn[] | null>(null);
    const [event, setEvent] = React.useState<OrgEvent | null>(null);

    let params = useParams();
    let onCheckInsUpdate = (checkIns: CheckIn[]) => setCheckIns(checkIns);
    let onEventUpdate = (event: OrgEvent | null) => setEvent(event);

    React.useEffect(() => {
        let checkInUnsub: Unsubscribe = getCheckIns(props.db, params.orgId!, params.eventId!, onCheckInsUpdate);
        return function cleanup() {
            checkInUnsub();
        };
    }, [params.orgId, params.eventId]);

    React.useEffect(() => {
        let eventUnsub: Unsubscribe = getEvent(props.db, params.orgId!, params.eventId!, true, onEventUpdate);
        return function cleanup() {
            eventUnsub();
        };
    }, [params.orgId, params.eventId]);

    if (event === null) {
        return (
            <Container>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container>
            <Typography variant="h3" sx={{ textAlign: 'center', padding: '8px' }}>{event.name}</Typography>
            <Stack
                spacing="16px"
                alignItems={'center'}
            >
                <Card
                    sx={{
                        width: "300px"
                    }}
                >
                    <CardContent>
                        <Stack
                            alignItems={'center'}
                        >
                            <Typography variant="h5">Event Settings</Typography>
                            <Button variant="outlined" endIcon={<ExitToApp />} target={"_blank"} href={"/orgs/" + params.orgId + "/checkin/" + params.eventId}>
                                VIEW CHECK IN PAGE
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
                <CheckInTable checkIns={checkIns ?? []} />
                <Typography>New Attendees: {event.newAttendeeCount}</Typography>
                <Typography>Attendees: {event.attendeeCount}</Typography>
            </Stack>
        </Container>
    );
}

export default EventPage;