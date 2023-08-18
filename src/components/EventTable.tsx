import React from "react";
import { useNavigate } from "react-router-dom";
import Table from "./Table";
import { getColumnDef } from "../utils/staticHelpers";
import type { OrgEventWithId } from "../utils/types";
import { EVENT_COLUMNS } from "../utils/dynamicConstants";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

type EventTableProps = {
  events: OrgEventWithId[] | null,
};

const columns = getColumnDef(EVENT_COLUMNS);

const EventTable: React.FunctionComponent<EventTableProps> = ({ events }) => {
  const navigate = useNavigate();
  return (
    <Table
      data={events}
      columns={columns}
      tableName="event-table"
      tableTitle="Events"
      onRowClick={({ id }) => navigate(`events/${id}`)}
      actions={[{ icon: solid("pen-to-square"), onClick: () => navigate("createEvent") }]}
      initialSorting={[{ id: "startTime", desc: true }]}
    />
  );
};

export default EventTable;
