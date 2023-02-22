import { collection, doc, DocumentData, Firestore, FirestoreDataConverter, onSnapshot, query, where } from "firebase/firestore";

const orgConverter: FirestoreDataConverter<Org> = {
    toFirestore: (orgEvent: Org) => orgEvent as DocumentData,
    fromFirestore: (doc: DocumentData) => {
        let data = doc.data() as Org;
        data.id = doc.id;
        return data;
    }
}

function getOrgs(db: Firestore, uid: string, callback: (events: Org[]) => void) {
    const q = query<Org>(collection(db, "orgs").withConverter<Org>(orgConverter), where("admins", "array-contains", uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const events: Org[] = [];
        querySnapshot.forEach((doc) => {
            let data: Org = doc.data();
            events.push(data);
        });
        callback(events);
    });
    return unsubscribe;
}

function getOrg(db: Firestore, orgId: string, callback: (org: Org | null) => void) {
	const unsub = onSnapshot(doc(db, "orgs", orgId).withConverter<Org>(orgConverter), (doc) => {
		if (doc.exists()) {
			const org = doc.data();
			callback(org);
		} else {
			callback(null);
		}
	}, (e) => console.log(e), () => console.log("complete"));
	return unsub;
}

interface Org {
    id: string,
    name: string,
    currentSeasonId: string
}

export { getOrgs, getOrg };
export type { Org };
