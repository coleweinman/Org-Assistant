import React from "react";
import { CSVLink } from "react-csv";
import Table from "./Table";
import Toast from "./Toast";
import { copyCheckIns, getCheckInsCsv, getColumnDef } from "../utils/helpers";
import { CHECK_IN_COLUMNS } from "../utils/constants";
import type { CheckIn } from "../utils/types";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconType } from "../utils/enums";

type CheckInTableProps = {
  eventName: string,
  checkIns: CheckIn[] | null,
};

const columns = getColumnDef(CHECK_IN_COLUMNS);

const CheckInTable: React.FunctionComponent<CheckInTableProps> = ({ eventName, checkIns }) => {
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const copy = async () => {
    await copyCheckIns(checkIns ?? []);
    setSuccessMessage("Copied to clipboard!");
  };

  return (
    <>
      <Table
        data={checkIns}
        initialSorting={[{ id: "timestamp", desc: true }]}
        columns={columns}
        tableName="check-in-table"
        tableTitle="Check Ins"
        actions={[
          { icon: solid("clipboard"), onClick: copy },
          {
            element: (
              <CSVLink
                key="csv-link"
                data={getCheckInsCsv(checkIns ?? [])}
                filename={`${eventName.toLowerCase().replace(" ", "_")}_check_ins.csv`}
                className="blue-button action-button"
              >
                <FontAwesomeIcon icon={solid("download")} />
              </CSVLink>
            ),
          },
        ]}
      />
      <Toast message={successMessage} iconType={IconType.SUCCESS} clearMessage={() => setSuccessMessage(null)} />
    </>
  );
};

export default CheckInTable;
