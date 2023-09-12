import React from "react";
import { Helmet } from "react-helmet-async";
import { Firestore } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import Page from "../components/Page";
import EventChart from "../components/EventChart";
import CheckInTable from "../components/CheckInTable";
import BackButton from "../components/BackButton";
import LinkedCheckInsTable from "../components/LinkedCheckInsTable";
import EventDetails from "../components/EventDetails";
import { EVENT_STATISTICS_CATEGORIES } from "../utils/dynamicConstants";
import { deleteEvent, getCheckIns, getEvent, getLinkedCheckIns, getOrgOnce, updateEvent } from "../utils/managers";
import { getOrgEventFromFormState } from "../utils/staticHelpers";
import { getYearGroups } from "../utils/dynamicHelpers";
import type {
  CheckIn,
  EventPageParams,
  FormState,
  LinkedCheckIn,
  OrgEvent,
  OrgEventWithoutLinked,
  YearGroup,
} from "../utils/types";
import "../stylesheets/EventPage.scss";
import IconButton from "../components/IconButton";
import { CheckInType } from "../utils/enums";
import { regular, solid } from "@fortawesome/fontawesome-svg-core/import.macro";

type EventPageProps = {
  db: Firestore,
};

const EventPage: React.FunctionComponent<EventPageProps> = ({ db }) => {
  const [checkIns, setCheckIns] = React.useState<CheckIn[] | null>(null);
  const [linkedCheckIns, setLinkedCheckIns] = React.useState<LinkedCheckIn[] | null>(null);
  const [checkInYearGroups, setCheckInYearGroups] = React.useState<YearGroup[]>([]);
  const [rsvpYearGroups, setRsvpYearGroups] = React.useState<YearGroup[]>([]);
  const [noShowYearGroups, setNoShowYearGroups] = React.useState<YearGroup[]>([]);
  const [event, setEvent] = React.useState<OrgEvent | null>(null);

  const { orgId, eventId } = useParams<EventPageParams>();
  const navigate = useNavigate();
  const isJointEvent = event?.linkedEvents && event.linkedEvents.length > 0;
  const onCheckInsUpdate = (checkIns: CheckIn[]) => setCheckIns(checkIns);
  const onEventUpdate = (event: OrgEvent | null) => setEvent(event);

  const onEventEdit = async (data: FormState<OrgEventWithoutLinked>) => {
    const editedEvent = getOrgEventFromFormState(
      event!.seasonId,
      data,
      event!.linkedEvents,
      event!.newRsvpCount,
      event!.rsvpCount,
      event!.newAttendeeCount,
      event!.attendeeCount,
    );
    try {
      await updateEvent(db, orgId!, eventId!, editedEvent);
    } catch (e) {
      console.error(e);
    }
  };

  const onEventDelete = async () => {
    await deleteEvent(db, orgId!, eventId!);
    navigate("/orgs/" + orgId);
  };

  // Listen and unsubscribe from check ins
  React.useEffect(() => (
    getCheckIns(db, orgId!, eventId!, onCheckInsUpdate)
  ), [db, orgId, eventId]);

  // Listen and unsubscribe from event details
  React.useEffect(() => (
    getEvent(db, orgId!, eventId!, true, onEventUpdate)
  ), [db, orgId, eventId]);

  // Get data for chart
  React.useEffect(() => {
    setCheckInYearGroups(getYearGroups(checkIns?.filter(({ didCheckIn }) => didCheckIn)));
    setRsvpYearGroups(getYearGroups(checkIns?.filter(({ didRsvp }) => didRsvp)));
    setNoShowYearGroups(getYearGroups(checkIns?.filter(({ didRsvp, didCheckIn }) => didRsvp && !didCheckIn)));
  }, [checkIns]);

  React.useEffect(() => {
    if (!orgId || !checkIns || !isJointEvent) {
      return;
    }
    getOrgOnce(db, orgId).then((org) => {
      if (!org) {
        return;
      }
      getLinkedCheckIns(db, event.linkedEvents).then((linkedCheckIns: LinkedCheckIn[]) => {
        setLinkedCheckIns([
          ...checkIns.map((checkIn) => (
            { ...checkIn, orgName: org.name }
          )),
          ...linkedCheckIns,
        ]);
      });
    });
  }, [db, orgId, checkIns, event?.linkedEvents, isJointEvent]);

  if (!event) {
    return (
      <Loading className="event-page">
        <BackButton to={`/orgs/${orgId}`} />
      </Loading>
    );
  } else {
    return (
      <Page className="event-page">
        <Helmet>
          <title>{event.name} &bull; Org Assistant</title>
        </Helmet>
        <BackButton to={`/orgs/${orgId}`} />
        <h1 className="header">{event.name}</h1>
        <EventDetails
          orgId={orgId!}
          eventId={eventId!}
          event={event!}
          onEventEdit={onEventEdit}
          onEventDelete={onEventDelete}
        />
        {isJointEvent && (
          <div className="section event-settings">
            <div className="column">
              <h2 className="section-title">Linked Events</h2>
              <table className="event-data event-details-table">
                <tbody>
                  {event.linkedEvents.map(({ org, event }) => (
                    <tr key={`${org.id}/${event.id}`}>
                      <th>{org.name}:</th>
                      <td>{event.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="event-action-buttons">
              <IconButton
                label="Open joint check-in page"
                onClick={() => window.open(`/orgs/${orgId}/${CheckInType.CHECK_IN}/joint/${eventId}`, "_blank")}
                icon={solid("arrow-up-right-from-square")}
              />
              <IconButton
                label="Open joint RSVP page"
                onClick={() => window.open(`/orgs/${orgId}/${CheckInType.RSVP}/joint/${eventId}`, "_blank")}
                icon={regular("calendar")}
              />
            </div>
          </div>
        )}
        <div className="section event-stats">
          <div className={"content"}>
            <h2 className="section-title">Event Statistics</h2>
            <table className="event-data attendee-table">
              <tbody>
                {EVENT_STATISTICS_CATEGORIES.map(({ id, label, getDisplayValue }) => (
                  <tr key={id}>
                    <th>{label}:</th>
                    <td>{getDisplayValue(event)}</td>
                  </tr>
                ))}
                {isJointEvent && (
                  <tr key={"linkedAttendees"}>
                    <th>Attendees (w/ Linked):</th>
                    <td>{linkedCheckIns?.length ?? 0}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <EventChart checkIns={checkInYearGroups} rsvps={rsvpYearGroups} noShows={noShowYearGroups} />
        </div>
        <CheckInTable db={db} orgId={orgId!} eventId={eventId!} eventName={event.name} checkIns={checkIns} />
        {isJointEvent && (
          <LinkedCheckInsTable eventName={event.name} linkedCheckIns={linkedCheckIns} />
        )}
      </Page>
    );
  }
};

export default EventPage;