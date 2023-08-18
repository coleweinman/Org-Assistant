import React from "react";
import type { Filter, FormDataType } from "../utils/types";
import { FilterType } from "../utils/enums";
import BooleanFilter from "./BooleanFilter";
import { Table } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

type FiltersProps<T extends FormDataType> = {
  filters: Filter<T>[],
  table: Table<T>,
  globalFilter: string,
  setGlobalFilter: (value: string) => void,
};

const Filters = <T extends FormDataType>({
  filters,
  table,
  globalFilter,
  setGlobalFilter,
}: FiltersProps<T>): React.ReactElement => {
  const [searchBarActive, setSearchBarActive] = React.useState<boolean>(false);

  return (
    <div className="filters-container">
      <div className="strict-filters-container">
        {filters.length > 0 && (
          <>
            Filters:
            {filters.map(({ type, columnId }) => {
              // TODO: Implement more types
              switch (type) {
                case FilterType.BOOLEAN:
                  return <BooleanFilter
                    key={columnId as string}
                    table={table}
                    column={table.getColumn(columnId as string)!}
                  />;
                default:
                  return null;
              }
            })}
          </>
        )}
      </div>
      <div className="fuzzy-filters-container">
        <div className={`search-bar-wrapper ${searchBarActive ? "focus" : ""}`}>
          <FontAwesomeIcon icon={solid("search")} />
          <input
            onFocus={() => setSearchBarActive(true)}
            onBlur={() => setSearchBarActive(false)}
            className="search-bar"
            type="text"
            placeholder="Search data..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Filters;