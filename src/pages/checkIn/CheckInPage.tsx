import { Button, Container, TextField, Typography } from "@mui/material";
import { cleanup } from "@testing-library/react";
import { Firestore, Timestamp } from "firebase/firestore";
import React from "react";
import { useParams } from "react-router-dom";
import { CheckIn, submitCheckIn } from "../../managers/CheckInManager";
import { getEvent, OrgEvent } from "../../managers/EventManager";

interface CheckInPageProps {
	db: Firestore,
}

function CheckInPage(props: CheckInPageProps) {
	let params = useParams();
	let [event, setEvent] = React.useState<OrgEvent | null>(null);
	let [name, setName] = React.useState<string>(window.localStorage.getItem("name") ?? "");
	let [email, setEmail] = React.useState<string>(window.localStorage.getItem("email") ?? "");

	React.useEffect(() => {
		let unsub = getEvent(props.db, params.orgId!, params.eventId!, false, (event) => {
			setEvent(event);
		});
		return function cleanup() {
			unsub();
		};
	}, [props.db, params.orgId, params.eventId, event]);

	if (event === null) {
		return (
			<Container></Container>
		);
	}

	const submit = async () => {
		let checkIn: CheckIn = {
			name: name,
			email: email,
			timestamp: Timestamp.now() 
		};
		await submitCheckIn(props.db, params.orgId!, params.eventId!, checkIn);
	};

	// window.localStorage.setItem("name", "Cole Weinman");
	// window.localStorage.setItem("email", "cole@logotology.com");

	return (
		<Container>
			<Typography>{event!.name}</Typography>
			<form>
				<TextField
					required
					id="name-field"
					label="Name"
					defaultValue={name}
					onChange={(e) => setName(e.target.value)}
				/>
				<TextField
					required
					id="email-field"
					label="Email"
					defaultValue={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<Button variant="contained" onClick={() => submit()}>CHECK IN</Button>
			</form>
		</Container>
	);
}

export default CheckInPage;
