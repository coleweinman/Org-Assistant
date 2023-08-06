import React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Header,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import loading from "../images/loader.svg";
import "../stylesheets/Table.scss";
import type { ActionButton } from "../utils/types";

type TableProps<T> = {
  data: T[] | null,
  columns: ColumnDef<T, any>[],
  tableName: string,
  tableTitle: string,
  onRowClick?: (row: T) => void,
  actions?: ActionButton[],
  initialSorting?: SortingState,
}

const Table = <T extends unknown>({
  data,
  columns,
  tableName,
  tableTitle,
  onRowClick,
  actions = [],
  initialSorting = [],
}: TableProps<T>): React.ReactElement => {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);

  const table = useReactTable<T>({
    data: data || [],
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const getIconClass = (header: Header<T, unknown>): string => {
    switch (header.column.getIsSorted()) {
      case "asc":
        return "up";
      case "desc":
        return "down";
      default:
        return "invisible";
    }
  };

  return (
    <div className={`section table-container ${tableName}-container`}>
      <table className={tableName}>
        <thead>
          <tr>
            <th className="section-title-container" colSpan={columns.length}>
              <h2 className="section-title">{tableTitle}</h2>
              <span className="action-buttons">
                {actions.map((action, i) => (
                  "element" in action ? (
                    action as { element: React.ReactElement }
                  ).element : (
                    <button
                      key={i.toString()}
                      className="icon-button action-button"
                      onClick={action.onClick}
                    >
                      <FontAwesomeIcon icon={action.icon} />
                    </button>
                  )
                ))}
              </span>
            </th>
          </tr>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`column-header ${header.column.getCanSort() ? "can-sort" : ""}`}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div>
                    <FontAwesomeIcon
                      icon={solid("square")}
                      className="sorting-arrow invisible"
                    />
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    <FontAwesomeIcon
                      icon={solid("arrow-up")}
                      className={`sorting-arrow ${getIconClass(header)}`}
                    />
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr className="loading-row">
              <td colSpan={columns.length}>
                {data
                  ? "No data to display"
                  : <img className="loader" src={loading} alt="Loading..." />
                }
              </td>
            </tr>
          ) : table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? "clickable" : ""}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
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
              <td className="total-count">
                Total: {data.length}
              </td>
              <td colSpan={columns.length - 2} />
              <td className="buttons-container">
                <div className="buttons-container">
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
                  <div className="page-input">
                    <input
                      type="number"
                      value={table.getState().pagination.pageIndex + 1}
                      className="no-arrows"
                      onChange={({ target }) => {
                        let page = Number(target.value) - 1;
                        if (!isNaN(page)) {
                          if (page < 0) {
                            page = 0;
                          } else if (page >= table.getPageCount()) {
                            page = table.getPageCount() - 1;
                          }
                          table.setPageIndex(page);
                        }
                      }}
                    />
                    <p>of {table.getPageCount()}</p>
                  </div>
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
};

export default Table;