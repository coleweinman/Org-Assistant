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
  columnHelper.accessor("email", {
    cell: (info) => info.getValue(),
    header: "Email"
  }),
  columnHelper.accessor("timestamp", {
    cell: (info) => timestampToDate(info.getValue()),
    header: "Timestamp"
  })
];

const CheckInTable: React.FC<CheckInTableProps> = ({ checkIns }) => (
  <Table
    data={checkIns}
    columns={columns}
    tableName={"check-in-table"}
    tableTitle={"Check Ins"}
  />
);

export default CheckInTable;
