import React, {
  FocusEventHandler,
  HTMLProps
} from "react";
import { InputType } from "../helpers/FormFields";
import dayjs, { Dayjs } from "dayjs";

const INPUT_DATE_FORMAT = "M/DD h:mma";
const DATE_FORMAT = "M/DD/YYYY h:mma";

type DateTimePickerProps = {
  value: Dayjs | null,
  onChange: (value: Dayjs | null) => void
} & Omit<HTMLProps<HTMLInputElement>, "value" | "onChange">;

const DateTimePicker: React.FunctionComponent<DateTimePickerProps> = ({ value, onChange, placeholder = "", ...props }) => {
  const [rawValue, setRawValue] = React.useState<string>("");

  const isValidDate = (date: Dayjs) => (
    date.isValid() && date.isSameOrAfter(dayjs(), "days")
  );

  const validate: FocusEventHandler<HTMLInputElement> = () => {
    let date = dayjs(rawValue, [DATE_FORMAT, INPUT_DATE_FORMAT]);
    const today = dayjs();
    if (date.isBefore(today, "years")) {
      date = date.year(today.year());
    }
    if (!isValidDate(date)) {
      onChange(null);
    } else {
      onChange(date);
    }
  }

  React.useEffect(() => {
    setRawValue(value ? value.format(DATE_FORMAT) : "");
  }, [value]);

  return (
    <input
      {...props}
      placeholder={`${placeholder} (ex: "2/22 6:00pm")`}
      type={InputType.TEXT}
      onBlur={validate}
      onChange={(e) => setRawValue(e.target.value)}
      value={rawValue}
    />
  )
};

export default DateTimePicker;