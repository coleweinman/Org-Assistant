import React from "react";
import { RADIAN } from "../utils/staticConstants";

type CustomLabelProps = {
  cx: number,
  cy: number,
  midAngle: number,
  innerRadius: number,
  outerRadius: number,
  percent: number,
  index: number,
};

const CustomLabel: React.FunctionComponent<CustomLabelProps> = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (
    outerRadius - innerRadius
  ) * 0.3;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="black"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontFamily="Nunito, sans-serif"
      fontWeight="bold"
    >
      {`${(
        percent * 100
      ).toFixed(0)}%`}
    </text>
  );
};

export default CustomLabel;