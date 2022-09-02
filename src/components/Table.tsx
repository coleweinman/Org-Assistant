import React from "react";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  getPaginationRowModel,
  ColumnDef
} from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import loading from "../images/loader.svg";
import "../stylesheets/Table.scss";

interface TableProps<T> {
  data: T[] | null,
  columns: ColumnDef<T, any>[],
  tableName: string,
  tableTitle: string,
  onClick?: (row: T) => void
}

const Table = <T extends unknown>({ data, columns, tableName, tableTitle, onClick }: TableProps<T>) => {
  const table = useReactTable<T>({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className={`section table-container ${tableName}-container`}>
      <table className={tableName}>
        <thead>
          <tr>
            <th colSpan={columns.length}>
              <h2 className={"section-title"}>{tableTitle}</h2>
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
          {!data ? (
            <tr className={"loading-row"}>
              <td colSpan={columns.length}>
                <img src={loading} alt={"Loading..."} />
              </td>
            </tr>
          ) : table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={onClick ? "clickable" : ""}
              onClick={onClick ? () => onClick(row.original) : () => {}}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {data && (
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
        )}
      </table>
    </div>
  );
}

export default Table;