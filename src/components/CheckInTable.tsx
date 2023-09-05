import React from "react";
import { CSVLink } from "react-csv";
import Table from "./Table";
import Toast from "./Toast";
import { getColumnDef } from "../utils/staticHelpers";
import { copyCheckIns, getCheckInsCsv, getCheckInsFromCsv } from "../utils/dynamicHelpers";
import { CHECK_IN_COLUMNS, CHECK_IN_FILTERS } from "../utils/dynamicConstants";
import type { CheckIn } from "../utils/types";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconType } from "../utils/enums";
import { Firestore } from "firebase/firestore";

type CheckInTableProps = {
  db: Firestore,
  orgId: string,
  eventId: string,
  eventName: string,
  checkIns: CheckIn[] | null,
};

const columns = getColumnDef(CHECK_IN_COLUMNS);

const CheckInTable: React.FunctionComponent<CheckInTableProps> = ({ db, orgId, eventId, eventName, checkIns }) => {
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

  const copy = async () => {
    await copyCheckIns(checkIns ?? []);
    setSuccessMessage("Copied to clipboard!");
  };

  const openFileUpload = () => {
    if (!fileInput.current) {
      return;
    }
    fileInput.current.click();
  };

  const onFileUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    getCheckInsFromCsv(db, orgId, eventId, e.target.files[0], checkIns ?? [], () => {
      setSuccessMessage("Successfully imported check ins");
    }, (e) => {console.error(e);});
  };

  return (
    <>
      <input ref={fileInput} type="file" className="hidden-file-input" accept="text/csv" onChange={onFileUpload} />
      <Table
        data={checkIns}
        initialSorting={[{ id: "timestamp", desc: true }]}
        columns={columns}
        tableName="check-in-table"
        tableTitle="Check Ins"
        filters={CHECK_IN_FILTERS}
        actions={[
          { icon: solid("upload"), onClick: openFileUpload },
          { icon: solid("clipboard"), onClick: copy },
          {
            element: (
              <CSVLink
                key="csv-link"
                data={getCheckInsCsv(checkIns ?? [])}
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

export default CheckInTable;
