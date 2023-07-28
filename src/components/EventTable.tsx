import React from "react";
import { useNavigate } from "react-router-dom";
import Table from "./Table";
import { getColumnDef } from "../utils/helpers";
import type { OrgEvent } from "../utils/types";
import { EVENT_COLUMNS } from "../utils/constants";

type EventTableProps = {
  events: OrgEvent[] | null,
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
      onClick={({ id }) => navigate(`events/${id}`)}
      onCreate={() => navigate("createEvent")}
      initialSorting={[{ id: "startTime", desc: true }]}
    />
  );
};

export default EventTable;
