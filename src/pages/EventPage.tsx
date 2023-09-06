import React from "react";
import { Helmet } from "react-helmet-async";
import { Firestore, Timestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { regular, solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Loading from "../components/Loading";
import Page from "../components/Page";
import EventChart from "../components/EventChart";
import Form from "../components/Form";
import CheckInTable from "../components/CheckInTable";
import { deleteEvent, getCheckIns, getEvent, getLinkedCheckIns, getOrgOnce, updateEvent } from "../utils/managers";
import { CREATE_EVENT_FIELDS, EVENT_STATISTICS_CATEGORIES } from "../utils/dynamicConstants";
import { getDisplayValue, getOrgEventFromFormState } from "../utils/staticHelpers";
import { getYearGroups } from "../utils/dynamicHelpers";
import type { CheckIn, EventPageParams, FormState, OrgEvent, YearGroup } from "../utils/types";
import { LinkedCheckIn } from "../utils/types";
import "../stylesheets/EventPage.scss";
import ConfirmButton from "../components/ConfirmButton";
import BackButton from "../components/BackButton";
import { CheckInType } from "../utils/enums";
import LinkedCheckInsTable from "../components/LinkedCheckInsTable";

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
  const [editing, setEditing] = React.useState<boolean>(false);

  const { orgId, eventId } = useParams<EventPageParams>();
  const navigate = useNavigate();
  const isJointEvent = event?.linkedEvents && event.linkedEvents.length > 0;
  const onCheckInsUpdate = (checkIns: CheckIn[]) => setCheckIns(checkIns);
  const onEventUpdate = (event: OrgEvent | null) => setEvent(event);

  const onEventEdit = async (data: FormState<Omit<OrgEvent, "linkedEvents">>) => {
    const editedEvent = getOrgEventFromFormState(
      event!.seasonId,
      data,
      event!.linkedEvents,
      event!.newAttendeeCount,
      event!.attendeeCount,
    );
    try {
      await updateEvent(db, orgId!, eventId!, editedEvent);
    } catch (e) {
      console.error(e);
    }
    setEditing(false);
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
  }, [db, orgId, checkIns, event?.linkedEvents]);

  if (!event) {
    return (
      <Loading className="event-page">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={solid("chevron-left")} />
        </button>
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
        <div className={`section event-settings ${editing ? "editing" : ""}`}>
          {editing ? (
            <>
              <h2 className="section-title">Event Settings</h2>
              <Form
                className="new-event-form"
                initialData={event}
                fields={CREATE_EVENT_FIELDS}
                submitText="Update Event"
                cancelText="Cancel"
                onSubmit={onEventEdit}
                onCancel={() => setEditing(false)}
              />
            </>
          ) : (
            <>
              <div className="column">
                <h2 className="section-title">Event Settings</h2>
                <table className="event-data event-details-table">
                  <tbody>
                    {CREATE_EVENT_FIELDS.map((field) => (
                      <tr key={field.id}>
                        <th>{field.label}:</th>
                        <td>
                          {event[field.id]
                            ? getDisplayValue(event[field.id] as string | string[] | Timestamp, field)
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="event-action-buttons">
                <button
                  className="icon-button"
                  onClick={() => window.open(`/orgs/${orgId}/${CheckInType.CHECK_IN}/${eventId}`, "_blank")}
                >
                  <FontAwesomeIcon icon={solid("arrow-up-right-from-square")} />
                </button>
                <button
                  className="icon-button"
                  onClick={() => window.open(`/orgs/${orgId}/${CheckInType.RSVP}/${eventId}`, "_blank")}
                >
                  <FontAwesomeIcon icon={regular("calendar")} />
                </button>
                <button className="icon-button" onClick={() => setEditing(true)}>
                  <FontAwesomeIcon icon={solid("pen")} />
                </button>
                <ConfirmButton
                  icon={solid("trash")}
                  onClick={onEventDelete}
                />
              </div>
            </>
          )}
        </div>
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