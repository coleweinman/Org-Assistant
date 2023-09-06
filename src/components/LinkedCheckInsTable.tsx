import React from "react";
import { CSVLink } from "react-csv";
import Table from "./Table";
import Toast from "./Toast";
import { getColumnDef } from "../utils/staticHelpers";
import { copyLinkedCheckIns, getCsv } from "../utils/dynamicHelpers";
import { CHECK_IN_FILTERS, LINKED_CHECK_IN_COLUMNS } from "../utils/dynamicConstants";
import type { LinkedCheckIn } from "../utils/types";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconType } from "../utils/enums";

type LinkedCheckInsTableProps = {
  eventName: string,
  linkedCheckIns: LinkedCheckIn[] | null,
};

const columns = getColumnDef(LINKED_CHECK_IN_COLUMNS);

const LinkedCheckInsTable: React.FunctionComponent<LinkedCheckInsTableProps> = ({
  eventName,
  linkedCheckIns,
}) => {
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const copy = async () => {
    await copyLinkedCheckIns(linkedCheckIns ?? []);
    setSuccessMessage("Copied to clipboard!");
  };

  return (
    <>
      <Table
        data={linkedCheckIns}
        initialSorting={[{ id: "timestamp", desc: true }]}
        columns={columns}
        tableName="check-in-table"
        tableTitle="All Check Ins"
        filters={CHECK_IN_FILTERS}
        actions={[
          { icon: solid("clipboard"), onClick: copy },
          {
            element: (
              <CSVLink
                key="csv-link"
                data={getCsv(linkedCheckIns ?? [], LINKED_CHECK_IN_COLUMNS)}
                filename={`${eventName.toLowerCase().replace(" ", "_")}_check_ins.csv`}
                className="icon-button action-button"
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

export default LinkedCheckInsTable;
