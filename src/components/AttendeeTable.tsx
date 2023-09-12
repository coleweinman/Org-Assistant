import React from "react";
import { useNavigate } from "react-router-dom";
import Table from "./Table";
import { ATTENDEE_COLUMNS } from "../utils/dynamicConstants";
import { getColumnDef } from "../utils/staticHelpers";
import type { Attendee } from "../utils/types";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { CSVLink } from "react-csv";
import { copyCsv, getCsv } from "../utils/dynamicHelpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Toast from "./Toast";
import { IconType } from "../utils/enums";

type AttendeeTableProps = {
  orgName: string,
  orgId: string,
  attendees: Attendee[] | null,
};

const columns = getColumnDef(ATTENDEE_COLUMNS);

const AttendeeTable: React.FunctionComponent<AttendeeTableProps> = ({ orgName, orgId, attendees }) => {
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const copy = async () => {
    await copyCsv(attendees, ATTENDEE_COLUMNS);
    setSuccessMessage("Copied to clipboard!");
  };
  return (
    <>
      <Table
        data={attendees}
        columns={columns}
        tableName="attendee-table"
        tableTitle="Attendees"
        onRowClick={({ id }) => navigate(`/orgs/${orgId}/attendees/${id}`)}
        initialSorting={[{ id: "name", desc: false }]}
        actions={[
          { icon: solid("clipboard"), onClick: copy },
          {
            element: (
              <CSVLink
                key="csv-link"
                data={getCsv(attendees, ATTENDEE_COLUMNS)}
                filename={`${orgName.toLowerCase()}_attendees.csv`}
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

export default AttendeeTable;
