import React from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  flexRender,
  getPaginationRowModel
} from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { CheckIn } from '../../managers/CheckInManager';
import "../../stylesheets/CheckInTable.scss";

interface CheckInTableProps {
  checkIns: CheckIn[]
}

const columnHelper = createColumnHelper<CheckIn>();

const columns = [
  columnHelper.accessor("name", {
    cell: (info) => info.getValue(),
    header: "Name"
  }),
  columnHelper.accessor("email", {
    cell: (info) => info.getValue(),
    header: "Email"
  }),
  columnHelper.accessor("timestamp", {
    cell: (info) => info.getValue().toDate().toLocaleString(),
    header: "Timestamp"
  })
];

const CheckInTable: React.FC<CheckInTableProps> = ({ checkIns }) => {
  const table = useReactTable<CheckIn>({
    data: checkIns,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className={"section check-in-container"}>
      <table className={"check-in-table"}>
        <thead>
          <tr>
            <th colSpan={columns.length}>
              <h2 className={"section-title"}>Check Ins</h2>
            </th>
          </tr>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={columns.length - 1} />
            <td className={"buttons-container"}>
              <div className={"buttons-container"}>
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <FontAwesomeIcon icon={solid("chevron-left")} />
                  <FontAwesomeIcon icon={solid("chevron-left")} />
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <FontAwesomeIcon icon={solid("chevron-left")} />
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <FontAwesomeIcon icon={solid("chevron-right")} />
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <FontAwesomeIcon icon={solid("chevron-right")} />
                  <FontAwesomeIcon icon={solid("chevron-right")} />
                </button>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default CheckInTable;
