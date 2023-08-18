import React from "react";
import type { Column, Table } from "@tanstack/react-table";
import type { FormDataType } from "../utils/types";
import { getBooleanDisplayValue } from "../utils/staticHelpers";

type BooleanFilterProps<T extends FormDataType> = {
  column: Column<T>,
  table: Table<T>,
};

const BooleanFilter = <T extends FormDataType>({ column, table }: BooleanFilterProps<T>) => {
  const columnFilterValue = column.getFilterValue() as boolean | undefined;

  // Rotate filter between undefined (off), true, and false
  const updateFilterValue = () => column.setFilterValue((prev: boolean) => (
    !prev && prev !== undefined ? undefined : !prev
  ));

  return (
    <button
      className={`filter boolean-filter ${columnFilterValue === undefined && "filter-off"}`}
      onClick={updateFilterValue}
    >
      <span className={"filter-name"}>
        {column.columnDef.header as React.ReactNode}
      </span>
      {columnFilterValue !== undefined && getBooleanDisplayValue(columnFilterValue)}
    </button>
  );
};

export default BooleanFilter;