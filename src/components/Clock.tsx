import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { TIMEZONE } from "../utils/staticConstants";

const Clock = () => {
  const [time, setTime] = React.useState<Dayjs>(dayjs().tz(TIMEZONE));

  React.useEffect(() => {
    const intervalId = setInterval(() => setTime(dayjs().tz(TIMEZONE)), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="clock">
      <h2>{time.format("h:mm:ssa")}</h2>
    </div>
  );
};

export default Clock;