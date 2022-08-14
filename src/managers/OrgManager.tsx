import { collection, DocumentData, Firestore, FirestoreDataConverter, onSnapshot, query, where } from "firebase/firestore";

function getOrgs(db: Firestore, uid: string, callback: (events: Org[]) => void) {
    const eventConverter: FirestoreDataConverter<Org> = {
        toFirestore: (orgEvent: Org) => orgEvent as DocumentData,
        fromFirestore: (doc: DocumentData) => {
            let data = doc.data() as Org;
            data.id = doc.id;
            return data;
        }
    }
    const q = query<Org>(collection(db, "orgs").withConverter<Org>(eventConverter), where("admins", "array-contains", uid));
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

interface Org {
    id: string,
    name: string
}

export { getOrgs };
export type { Org };
