import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dayjs } from "dayjs";
import { Firestore, Timestamp } from "firebase/firestore";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InputType } from "../../helpers/FormFields";
import { addEvent, OrgEvent } from "../../managers/EventManager";
import { getOrg, Org } from "../../managers/OrgManager";
import DateTimePicker from "../../components/DateTimePicker";

const MODALITY_OPTIONS = ["In-Person", "Virtual", "Hybrid"];

interface CreateEventPageProps {
  db: Firestore
}

function CreateEventPage(props: CreateEventPageProps) {
	const [eventName, setEventName] = React.useState<string>("");
	const [imageUrl, setImageUrl] = React.useState<string>("");
	const [description, setDescription] = React.useState<string>("");
	const [location, setLocation] = React.useState<string>("");
	const [modality, setModality] = React.useState<string>(MODALITY_OPTIONS[0]);
	const [startTime, setStartTime] = React.useState<Dayjs | null>(null);
	const [endTime, setEndTime] = React.useState<Dayjs | null>(null);
	const [virtualEventUrl, setVirtualEventUrl] = React.useState<string>("");
	const [org, setOrg] = React.useState<Org | null>(null);

  const onOrgUpdate = (event: Org | null) => setOrg(event);

  const navigate = useNavigate();
  const { orgId, eventId } = useParams();

  // Listen and unsubscribe from event details
  React.useEffect(() => (
    getOrg(props.db, orgId!, onOrgUpdate)
  ), [props.db, orgId, eventId]);

  // Ensure that end time is always after start time
  React.useEffect(() => {
    if (startTime && (!endTime || startTime.isSameOrAfter(endTime, "minutes"))) {
      setEndTime(startTime.add(1, "hour"));
    }
  }, [startTime, endTime]);

  const validate = () => {
    return org && startTime && endTime;
	};

  const submit: React.FormEventHandler = async (e) => {
		e.preventDefault();
		if (!validate())
			return;
		let event: OrgEvent = {
			name: eventName,
      seasonId: org!.currentSeasonId,
      imageUrl: imageUrl,
      description: description,
      location: location,
      startTime: Timestamp.fromMillis(startTime!.valueOf()),
      endTime: Timestamp.fromMillis(endTime!.valueOf()),
      modality: modality,
      virtualEventUrl: virtualEventUrl,
      newAttendeeCount: 0,
      attendeeCount: 0
		} as OrgEvent;
		const success = await addEvent(props.db, orgId!, event);
		if (success)
			navigate(`/orgs/${orgId}`);
    else
      console.error("Error occurred while adding event");
	};

  return (
    <div className={"page event-page"}>
      <button className={"back-button"} onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={solid("chevron-left")} />
      </button>
      <h1 className={"header"}>Create New Event</h1>
      <div className={"section"}>
        <h2 className={"section-title"}>Event Settings</h2>
        <form className={"new-event-form"} noValidate onSubmit={submit}>
          <input
            required
            type={InputType.TEXT}
            id={"name"}
            placeholder={"Event Name"}
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
          <input
            required={false}
            type={InputType.TEXT}
            id={"imageUrl"}
            placeholder={"Image URL"}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <input
            required
            type={InputType.TEXT}
            id={"description"}
            placeholder={"Description"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            required={false}
            type={InputType.TEXT}
            id={"location"}
            placeholder={"Location"}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <select
            required
            id={"modality"}
            placeholder={"Modality"}
            value={modality}
            onChange={(e) => setModality(e.target.value)}
          >
            {MODALITY_OPTIONS.map((option) => (
              <option value={option} label={option} />
            ))}
          </select>
          {modality !== "In-Person" &&
            <input
              required={false}
              type={InputType.TEXT}
              id={"virtualEventUrl"}
              placeholder={"Virtual Event URL"}
              value={virtualEventUrl}
              onChange={(e) => setVirtualEventUrl(e.target.value)}
            />
          }
          <DateTimePicker
            value={startTime}
            onChange={setStartTime}
            placeholder={"Start Time"}
            required
            id={"startTime"}
          />
          <DateTimePicker
            value={endTime}
            onChange={setEndTime}
            placeholder={"End Time"}
            required
            id={"startTime"}
          />
          <button
            className={"view-check-in"}
            onClick={submit}
          >
            Create Event
            <span className={"new-tab-icon"}>
              <FontAwesomeIcon icon={solid("arrow-right")} />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEventPage;