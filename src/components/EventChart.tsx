import React from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { YearGroup } from "../utils/types";

type EventChartProps = {
  yearGroups: YearGroup[],
};

const EventChart: React.FunctionComponent<EventChartProps> = ({ yearGroups }) => (
  <ResponsiveContainer width={300} height="100%" minHeight={250}>
    <PieChart margin={{ top: 20, left: 20, right: 20, bottom: 20 }}>
      <Pie
        nameKey="year"
        dataKey="quantity"
        isAnimationActive={false}
        data={yearGroups}
        cx="50%"
        cy="50%"
        label
      />
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

export default EventChart;