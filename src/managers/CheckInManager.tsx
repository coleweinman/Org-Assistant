import { addDoc, collection, doc, DocumentData, Firestore, FirestoreDataConverter, getDocs, onSnapshot, query, setDoc, Timestamp, where } from "firebase/firestore";

const eventConverter: FirestoreDataConverter<CheckIn> = {
	toFirestore: (orgEvent: CheckIn) => orgEvent as DocumentData,
	fromFirestore: (doc: DocumentData) => doc.data() as CheckIn
}

async function submitCheckIn(db: Firestore, orgId: string, eventId: string, checkIn: CheckIn) {
	const q = query<CheckIn>(collection(db, "orgs", orgId, "checkIns").withConverter<CheckIn>(eventConverter), where("email", "==", checkIn.email), where("eventId", "==", eventId));
	const docs = await getDocs(q);
	if (!docs.empty) {
		return false;
	}
	await addDoc(collection(db, "orgs", orgId, "checkIns"), checkIn);
	return true;
}

function getCheckIns(db: Firestore, orgId: string, eventId: string, callback: (checkIns: CheckIn[]) => void) {
	const q = query<CheckIn>(collection(db, "orgs", orgId, "checkIns").withConverter<CheckIn>(eventConverter), where("eventId", "==", eventId));
	const unsubscribe = onSnapshot(q, (querySnapshot) => {
			const checkIns: CheckIn[] = [];
			querySnapshot.forEach((doc) => {
					let data: CheckIn = doc.data();
					checkIns.push(data);
			});
			callback(checkIns);
	});
	return unsubscribe;
}

function getAttendeeCheckIns(db: Firestore, orgId: string, email: string, callback: (checkIns: CheckIn[]) => void) {
	const q = query<CheckIn>(collection(db, "orgs", orgId, "checkIns").withConverter<CheckIn>(eventConverter), where("email", "==", email));
	const unsubscribe = onSnapshot(q, (querySnapshot) => {
			const checkIns: CheckIn[] = [];
			querySnapshot.forEach((doc) => {
					let data: CheckIn = doc.data();
					checkIns.push(data);
			});
			callback(checkIns);
	});
	return unsubscribe;
}

interface CheckIn {
	name: string,
	email: string,
	schoolId: string,
	year: string,
	discord: string | null
	timestamp: Timestamp,
	eventId: string
}

export { submitCheckIn, getCheckIns };
export type { CheckIn };
