import React from "react";
import Table from "./Table";
import { getColumnDef } from "../utils/helpers";
import { CHECK_IN_COLUMNS } from "../utils/constants";
import type { CheckIn } from "../utils/types";

type CheckInTableProps = {
  checkIns: CheckIn[] | null,
};

const columns = getColumnDef(CHECK_IN_COLUMNS);

const CheckInTable: React.FunctionComponent<CheckInTableProps> = ({ checkIns }) => (
  <Table
    data={checkIns}
    initialSorting={[{ id: "timestamp", desc: true }]}
    columns={columns}
    tableName="check-in-table"
    tableTitle="Check Ins"
  />
);

export default CheckInTable;
