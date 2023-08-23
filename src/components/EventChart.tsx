import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { YearGroup } from "../utils/types";
import CustomLabel from "./CustomLabel";
import { GAY_FLAG_COLORS, LESBIAN_FLAG_COLORS, TRANS_FLAG_COLORS } from "../utils/staticConstants";
import { addTableId, getCellFill } from "../utils/staticHelpers";

type EventChartProps = {
  checkIns: YearGroup[],
  rsvps: YearGroup[],
  noShows: YearGroup[],
};

const EventChart: React.FunctionComponent<EventChartProps> = ({ checkIns, rsvps, noShows }) => (
  <ResponsiveContainer width={300} height="100%" minHeight={250}>
    <PieChart margin={{ top: 10, left: 20, right: 20, bottom: 10 }}>
      <Pie
        isAnimationActive={false}
        data={addTableId(noShows, "No-Shows")}
        dataKey="quantity"
        nameKey="year"
        cx="50%"
        cy="50%"
        outerRadius="40%"
        label={CustomLabel}
        labelLine={false}
      >
        {noShows.map((_, index) => (
          <Cell
            key={`cell-${index}`}
            fill={getCellFill(LESBIAN_FLAG_COLORS, index, noShows.length)}
          />
        ))}
      </Pie>
      <Pie
        isAnimationActive={false}
        data={addTableId(rsvps, "RSVPs")}
        dataKey="quantity"
        nameKey="year"
        cx="50%"
        cy="50%"
        innerRadius="45%"
        outerRadius="70%"
        label={CustomLabel}
        labelLine={false}
      >
        {rsvps.map((_, index) => (
          <Cell
            key={`cell-${index}`}
            fill={getCellFill(GAY_FLAG_COLORS, index, rsvps.length)}
          />
        ))}
      </Pie>
      <Pie
        isAnimationActive={false}
        data={addTableId(checkIns, "Check Ins")}
        dataKey="quantity"
        nameKey="year"
        cx="50%"
        cy="50%"
        innerRadius="75%"
        outerRadius="100%"
        label={CustomLabel}
        labelLine={false}
      >
        {checkIns.map((_, index) => (
          <Cell
            key={`cell-${index}`}
            fill={getCellFill(TRANS_FLAG_COLORS, index, checkIns.length)}
          />
        ))}
      </Pie>
      <Tooltip
        isAnimationActive={false}
        wrapperStyle={{ outline: "none" }}
        content={({ active, payload }) => (
          active && payload && payload.length && (
            <div className="custom-tooltip">
              <p className="table-id">{payload[0].payload.tableId}</p>
              <p className="label">
                <span className={"label-name"}>{payload[0].name}: </span>
                {payload[0].value}
              </p>
            </div>
          )
        )}
      />
    </PieChart>
  </ResponsiveContainer>
);

export default EventChart;