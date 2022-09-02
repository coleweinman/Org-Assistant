import React from 'react';
import { OrgEvent } from '../../managers/EventManager';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper } from "@tanstack/react-table";
import Table from "../../components/Table";
import { timestampToDate } from "../../helpers/Dates";

interface EventTableProps {
	events: OrgEvent[] | null
}

const columnHelper = createColumnHelper<OrgEvent>();

const columns = [
	columnHelper.accessor("name", {
		cell: (info) => info.getValue(),
		header: "Name"
	}),
	columnHelper.accessor("location", {
		cell: (info) => info.getValue(),
		header: "Location"
	}),
	columnHelper.accessor("startTime", {
		cell: (info) => timestampToDate(info.getValue()),
		header: "Start"
	}),
	columnHelper.accessor("endTime", {
		cell: (info) => timestampToDate(info.getValue()),
		header: "End"
	})
];

const EventTable: React.FC<EventTableProps> = ({ events }) => {
	const navigate = useNavigate();
	return (
		<Table
			data={events}
			columns={columns}
			tableName={"event-table"}
			tableTitle={"Events"}
			onClick={({ id }) => navigate(`events/${id}`)}
		/>
	);
};

export default EventTable;
