import { addDoc, collection, doc, DocumentData, Firestore, FirestoreDataConverter, onSnapshot, query, setDoc, Timestamp } from "firebase/firestore";

const eventConverter: FirestoreDataConverter<CheckIn> = {
	toFirestore: (orgEvent: CheckIn) => orgEvent as DocumentData,
	fromFirestore: (doc: DocumentData) => doc.data() as CheckIn
}

async function submitCheckIn(db: Firestore, orgId: string, eventId: string, checkIn: CheckIn) {
	console.log(checkIn);
	await addDoc(collection(db, "orgs", orgId, "events", eventId, "checkIns"), checkIn);
}

function getCheckIns(db: Firestore, orgId: string, eventId: string, callback: (checkIns: CheckIn[]) => void) {
	const q = query<CheckIn>(collection(db, "orgs", orgId, "events", eventId, "checkIns").withConverter<CheckIn>(eventConverter));
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
	timestamp: Timestamp
};

export { submitCheckIn, getCheckIns };
export type { CheckIn };
