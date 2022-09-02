import { Timestamp } from "firebase/firestore";
import moment from "moment";

// Example: 1/1/2022 at 12:00pm
const DATE_FORMAT = "M/D/YYYY [at] h:mma";

export const timestampToDate = (timestamp?: Timestamp) => (
  timestamp
    ? moment(timestamp.toDate()).format(DATE_FORMAT)
    : ""
);