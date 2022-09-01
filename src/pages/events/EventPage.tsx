import React from "react";
import { ExitToApp } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography
} from "@mui/material";
import { Firestore } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { CheckIn, getCheckIns } from "../../managers/CheckInManager";
import { getEvent, OrgEvent } from "../../managers/EventManager";
import CheckInTable from "./CheckInTable";
import "../../stylesheets/EventPage.scss";

interface EventPageProps {
  db: Firestore
}

const EventPage: React.FC<EventPageProps> = ({ db }) => {
  const [checkIns, setCheckIns] = React.useState<CheckIn[] | null>(null);
  const [event, setEvent] = React.useState<OrgEvent | null>(null);

  const { orgId, eventId } = useParams();
  const onCheckInsUpdate = (checkIns: CheckIn[]) => setCheckIns(checkIns);
  const onEventUpdate = (event: OrgEvent | null) => setEvent(event);

  // Listen and unsubscribe from check ins
  React.useEffect(() => (
    getCheckIns(db, orgId!, eventId!, onCheckInsUpdate)
  ), [db, orgId, eventId]);

  // Listen and unsubscribe from event details
  React.useEffect(() => (
    getEvent(db, orgId!, eventId!, true, onEventUpdate)
  ), [db, orgId, eventId]);

  if (!event) {
    return (
      <Container>
        <CircularProgress/>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h3" sx={{
        textAlign: 'center',
        padding: '8px'
      }}>{event.name}</Typography>
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
              <Button variant="outlined" endIcon={<ExitToApp/>}
                      target={"_blank"}
                      href={`/orgs/${orgId}/checkin/${eventId}`}>
                VIEW CHECK IN PAGE
              </Button>
            </Stack>
          </CardContent>
        </Card>
        <CheckInTable checkIns={checkIns ?? []}/>
        <Typography>New Attendees: {event.newAttendeeCount}</Typography>
        <Typography>Attendees: {event.attendeeCount}</Typography>
      </Stack>
    </Container>
  );
}

export default EventPage;