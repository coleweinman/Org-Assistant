import React from "react";
import { CSVLink } from "react-csv";
import Table from "./Table";
import Toast from "./Toast";
import { getColumnDef } from "../utils/staticHelpers";
import { copyLinkedCheckIns, getCsv } from "../utils/dynamicHelpers";
import { CHECK_IN_FILTERS, LINKED_CHECK_IN_COLUMNS } from "../utils/dynamicConstants";
import type { CheckIn, LinkedCheckIn, LinkedEvent } from "../utils/types";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconType } from "../utils/enums";
import { Firestore } from "firebase/firestore";
import { getLinkedCheckIns, getOrgOnce } from "../utils/managers";

type LinkedCheckInsTableProps = {
  db: Firestore,
  orgId: string,
  eventName: string,
  existingCheckIns: CheckIn[] | null,
  linkedEvents: LinkedEvent[],
};

const columns = getColumnDef(LINKED_CHECK_IN_COLUMNS);

const LinkedCheckInsTable: React.FunctionComponent<LinkedCheckInsTableProps> = ({
  db,
  orgId,
  eventName,
  existingCheckIns,
  linkedEvents,
}) => {
  const [orgName, setOrgName] = React.useState<string | null>(null);
  const [checkIns, setCheckIns] = React.useState<LinkedCheckIn[] | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const copy = async () => {
    await copyLinkedCheckIns(checkIns ?? []);
    setSuccessMessage("Copied to clipboard!");
  };

  React.useEffect(() => {
    getOrgOnce(db, orgId).then((org) => {
      if (!org) {
        return;
      }
      setOrgName(org.name);
    });
  }, [db, orgId]);

  React.useEffect(() => {
    if (!orgName || !existingCheckIns) {
      return;
    }
    getLinkedCheckIns(db, linkedEvents).then((linkedCheckIns: LinkedCheckIn[]) => {
      setCheckIns(linkedCheckIns);
    });
  }, [db, linkedEvents, existingCheckIns, orgName]);

  return (
    <>
      <Table
        data={checkIns}
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
                data={getCsv(checkIns ?? [], LINKED_CHECK_IN_COLUMNS)}
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
