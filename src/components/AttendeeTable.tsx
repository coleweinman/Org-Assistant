import React from "react";
import { useNavigate } from "react-router-dom";
import Table from "./Table";
import { ATTENDEE_COLUMNS } from "../utils/dynamicConstants";
import { getColumnDef } from "../utils/staticHelpers";
import type { Attendee } from "../utils/types";

type AttendeeTableProps = {
  orgId: string,
  attendees: Attendee[] | null,
};

const columns = getColumnDef(ATTENDEE_COLUMNS);

const AttendeeTable: React.FunctionComponent<AttendeeTableProps> = ({ orgId, attendees }) => {
  const navigate = useNavigate();
  return (
    <Table
      data={attendees}
      columns={columns}
      tableName="attendee-table"
      tableTitle="Attendees"
      onRowClick={({ id }) => navigate(`/orgs/${orgId}/attendees/${id}`)}
      initialSorting={[{ id: "name", desc: false }]}
    />
  );
};

export default AttendeeTable;
