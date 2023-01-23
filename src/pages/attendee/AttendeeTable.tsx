import React from "react";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import Table from "../../components/Table";
import { Attendee } from '../../managers/AttendeeManager';
import { timestampToDate } from "../../helpers/Dates";

interface AttendeeTableProps {
    attendees: Attendee[] | null
}

const columnHelper = createColumnHelper<Attendee>();

const columns: ColumnDef<Attendee, any>[] = [
  columnHelper.accessor("name", {
    cell: (info) => info.getValue(),
    header: "Name"
  }),
  columnHelper.accessor("email", {
    cell: (info) => info.getValue(),
    header: "Email"
  }),
  columnHelper.accessor("totalEventsAttended", {
    cell: (info) => info.getValue(),
    header: "Events Attended"
  })
];

const AttendeeTable: React.FC<AttendeeTableProps> = ({ attendees }) => (
  <Table
    data={attendees}
    columns={columns}
    tableName={"attendee-table"}
    tableTitle={"Attendees"}
  />
);

export default AttendeeTable;
