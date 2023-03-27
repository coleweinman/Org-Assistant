import React from "react";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import Table from "../../components/Table";
import { CheckIn } from '../../managers/CheckInManager';
import { timestampToDate } from "../../helpers/Dates";

interface CheckInTableProps {
  checkIns: CheckIn[] | null
}

const columnHelper = createColumnHelper<CheckIn>();

const columns: ColumnDef<CheckIn, any>[] = [
  columnHelper.accessor("name", {
    cell: (info) => info.getValue(),
    header: "Name"
  }),
  columnHelper.accessor("schoolId", {
    cell: (info) => info.getValue(),
    header: "UTEID"
  }),
  columnHelper.accessor("email", {
    cell: (info) => info.getValue(),
    header: "Email"
  }),
  columnHelper.accessor("year", {
    cell: (info) => info.getValue(),
    header: "Year"
  }),
  columnHelper.accessor("discord", {
    cell: (info) => info.getValue(),
    header: "Discord"
  }),
  columnHelper.accessor("timestamp", {
    cell: (info) => timestampToDate(info.getValue()),
    header: "Timestamp"
  })
];

const CheckInTable: React.FC<CheckInTableProps> = ({ checkIns }) => (
  <Table
    data={checkIns}
    initialSorting={[{ id: "timestamp", desc: true }]}
    columns={columns}
    tableName={"check-in-table"}
    tableTitle={"Check Ins"}
  />
);

export default CheckInTable;
