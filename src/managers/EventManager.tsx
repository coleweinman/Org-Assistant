import { collection, doc, DocumentData, Firestore, FirestoreDataConverter, onSnapshot, query, where } from "firebase/firestore";

const eventConverter: FirestoreDataConverter<OrgEvent> = {
	toFirestore: (orgEvent: OrgEvent) => orgEvent as DocumentData,
	fromFirestore: (doc: DocumentData) => doc.data() as OrgEvent
}

function getEvents(db: Firestore, orgId: string, seasonId: string, callback: (events: OrgEvent[]) => void) {
	const q = query<OrgEvent>(collection(db, "orgs", orgId, "events").withConverter<OrgEvent>(eventConverter), where("seasonID", "==", seasonId));
	const unsubscribe = onSnapshot(q, (querySnapshot) => {
		const events: OrgEvent[] = [];
		querySnapshot.forEach((doc) => {
			let data: OrgEvent = doc.data();
			data.id = doc.id;
			events.push(data);
		});
		callback(events);
	});
	return unsubscribe;
}

function getEvent(db: Firestore, orgId: string, eventId: string, secure: boolean, callback: (event: OrgEvent | null) => void) {
	const unsub = onSnapshot(doc(db, "orgs", orgId, "events", eventId).withConverter<OrgEvent>(eventConverter), (doc) => {
		if (doc.exists()) {
			const event = doc.data();
			callback(event);
		} else {
			callback(null);
		}
	}, (e) => console.log(e), () => console.log("complete"));
	return unsub;
}

interface OrgEvent {
	id: string,
	name: string,
	newAttendeeCount: number,
	attendeeCount: number
}

export { getEvents, getEvent };
export type { OrgEvent };
