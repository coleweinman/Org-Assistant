import React from "react";
import Table from "./Table";
import { ATTENDEE_COLUMNS } from "../utils/dynamicConstants";
import { getColumnDef } from "../utils/staticHelpers";
import type { Attendee } from "../utils/types";

type AttendeeTableProps = {
  attendees: Attendee[] | null,
};

const columns = getColumnDef(ATTENDEE_COLUMNS);

const AttendeeTable: React.FunctionComponent<AttendeeTableProps> = ({ attendees }) => (
  <Table
    data={attendees}
    columns={columns}
    tableName="attendee-table"
    tableTitle="Attendees"
    initialSorting={[{ id: "name", desc: false }]}
  />
);

export default AttendeeTable;
