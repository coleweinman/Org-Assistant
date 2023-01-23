import { addDoc, collection, doc, DocumentData, Firestore, FirestoreDataConverter, onSnapshot, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";

const attendeeConverter: FirestoreDataConverter<Attendee> = {
	toFirestore: (orgEvent: Attendee) => orgEvent as DocumentData,
	fromFirestore: (doc: DocumentData) => doc.data() as Attendee
}

function getAttendees(db: Firestore, orgId: string, seasonId: string, callback: (events: Attendee[]) => void) {
	const q = query<Attendee>(collection(db, "orgs", orgId, "attendees").withConverter<Attendee>(attendeeConverter), where("lastActiveSeasonId", "==", seasonId));
	const unsubscribe = onSnapshot(q, (querySnapshot) => {
		console.log(querySnapshot);
		const events: Attendee[] = [];
		querySnapshot.forEach((doc) => {
			let data: Attendee = doc.data();
			data.id = doc.id;
			events.push(data);
		});
		callback(events);
	});
	return unsubscribe;
}

interface Attendee {
    id: string,
    name: string,
    email: string,
    totalEventsAttended: number
}

export { getAttendees };
export type { Attendee };