import { Timestamp } from "firebase/firestore";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

// Example: 1/1/2022 at 12:00pm
const DATE_FORMAT = "M/D/YYYY [at] h:mma";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);

export const timestampToDate = (timestamp?: Timestamp) => (
  timestamp
    ? dayjs(timestamp.toDate()).format(DATE_FORMAT)
    : ""
);