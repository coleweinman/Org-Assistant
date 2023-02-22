import React from "react";
import { Firestore, Timestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { CheckIn, submitCheckIn } from "../../managers/CheckInManager";
import { getEvent, OrgEvent } from "../../managers/EventManager";
import { CheckInFields, InputType } from "../../helpers/FormFields";
import CheckInField from "./CheckInField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import "../../stylesheets/CheckInPage.scss";
import { isEmail, isFilled } from "../../helpers/Forms";

type FormState = {
	[key: string]: string
};

interface CheckInPageProps {
	db: Firestore,
};

const CheckInPage: React.FC<CheckInPageProps> = ({ db }) => {
	const [event, setEvent] = React.useState<OrgEvent | null>(null);
	const [formData, setFormData] = React.useState<FormState>({});
	const [error, setError] = React.useState<string>("");

	let { orgId, eventId } = useParams();
	let navigate = useNavigate();

	React.useEffect(() => {
		getEvent(
			db,
			orgId!,
			eventId!,
			false, (event) => setEvent(event)
		);
		for (const { id, inputType, options } of CheckInFields) {
			let defaultValue = "";
			if (inputType === InputType.DROPDOWN) {
				defaultValue = (options ?? [])[0];
			}
			setFieldValue(id, window.localStorage.getItem(id) ?? defaultValue);
		}
	}, [db, orgId, eventId]);

	const setFieldValue = (key: string, value: string) => {
		setFormData((prevData) => ({
			...prevData,
			[key]: value
		}));
	};

	const validate = () => {
		for (const { id, inputType } of CheckInFields) {
			let invalid = true;
			if (!isFilled(formData[id])) {
				setError("Please fill out all fields.");
			} else if (inputType === InputType.EMAIL && !isEmail(formData[id])) {
				setError("Please enter a valid email address.");
			} else {
				invalid = false;
			}
			if (invalid)
				return false;
		}
		setError("");
		return true;
	}

	const submit: React.FormEventHandler = async (e) => {
		e.preventDefault();
		if (!validate())
			return;
		let checkIn: CheckIn = {
			...formData,
			eventId: eventId!,
			timestamp: Timestamp.now()
		} as CheckIn;
		for (const { id } of CheckInFields) {
			window.localStorage.setItem(id, formData[id]);
		}
		const success = await submitCheckIn(db, orgId!, eventId!, checkIn);
		if (success)
			navigate("submitted");
		else
			setError("You already checked in!");
	};

	if (event === null) {
		return (
			<div className={"page check-in-page"} />
		);
	}

	return (
		<div className={"page check-in-page"}>
			<h1 className={"header"}>{event.name}</h1>
			<form className={"check-in-form"} noValidate onSubmit={submit}>
				{CheckInFields.map((field) => (
					<CheckInField
						{...field}
						key={field.id}
						value={formData[field.id] ?? ""}
						setValue={(value) => setFieldValue(field.id, value)}
					/>
				))}
				<button type={"submit"}>
					Check In
					<span className={"icon"}>
						<FontAwesomeIcon icon={solid("paper-plane")} />
					</span>
				</button>
				{error.length > 0 && <p className={"error"}>{error}</p>}
			</form>
		</div>
	);
}

export default CheckInPage;
