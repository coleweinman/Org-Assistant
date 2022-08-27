import { Button, Container, Stack, TextField, Typography } from "@mui/material";
import { cleanup } from "@testing-library/react";
import { Firestore, Timestamp } from "firebase/firestore";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckIn, submitCheckIn } from "../../managers/CheckInManager";
import { getEvent, OrgEvent } from "../../managers/EventManager";

interface CheckInPageProps {
	db: Firestore,
}

function CheckInPage(props: CheckInPageProps) {
	let params = useParams();
	let navigate = useNavigate();
	let [event, setEvent] = React.useState<OrgEvent | null>(null);
	let [name, setName] = React.useState<string>(window.localStorage.getItem("name") ?? "");
	let [email, setEmail] = React.useState<string>(window.localStorage.getItem("email") ?? "");
	let [schoolId, setSchoolId] = React.useState<string>(window.localStorage.getItem("schoolId") ?? "");

	React.useEffect(() => {
		let unsub = getEvent(props.db, params.orgId!, params.eventId!, false, (event) => {
			setEvent(event);
		});
		return function cleanup() {
			unsub();
		};
	}, [props.db, params.orgId, params.eventId]);

	if (event === null) {
		return (
			<Container></Container>
		);
	}

	const submit = async () => {
		let checkIn: CheckIn = {
			name: name,
			email: email,
			schoolId: schoolId,
			timestamp: Timestamp.now() 
		};
		window.localStorage.setItem("name", name);
		window.localStorage.setItem("email", email);
		window.localStorage.setItem("schoolId", schoolId);
		const success = await submitCheckIn(props.db, params.orgId!, params.eventId!, checkIn);
		if (success)
			navigate("submitted");
	};


	return (
		<Container>
			<Typography>{event!.name}</Typography>
			<Stack
				direction={"column"}
				spacing={"8px"}
			>
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
				<TextField
					required
					id="school-id-field"
					label="UT EID"
					defaultValue={schoolId}
					onChange={(e) => setSchoolId(e.target.value)}
				/>
				<Button variant="contained" onClick={() => submit()}>CHECK IN</Button>
			</Stack>
		</Container>
	);
}

export default CheckInPage;
