import React from "react";
import dayjs, { Dayjs } from "dayjs";

const Clock = () => {
  const [time, setTime] = React.useState<Dayjs>(dayjs());

  React.useEffect(() => {
    const intervalId = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="clock">
      <h2>{time.format("h:mm:ssa")}</h2>
    </div>
  );
};

export default Clock;