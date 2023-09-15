import React, { FocusEventHandler, HTMLProps } from "react";
import { InputType } from "../utils/enums";
import dayjs, { Dayjs } from "dayjs";
import { DATE_FORMAT, INPUT_DATE_FORMAT } from "../utils/staticConstants";

type DateTimePickerProps = Omit<HTMLProps<HTMLInputElement>, "value" | "onChange"> & {
  value: Dayjs | null,
  onChange: (value: Dayjs | null) => void,
};

const DateTimePicker: React.FunctionComponent<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = "",
  ...props
}) => {
  const [rawValue, setRawValue] = React.useState<string>("");

  const validate: FocusEventHandler<HTMLInputElement> = () => {
    let date = dayjs(rawValue, [DATE_FORMAT, INPUT_DATE_FORMAT]);
    const today = dayjs();
    if (date.isBefore(today, "years")) {
      date = date.year(today.year());
    }
    if (date.isBefore(today, "years")) {
      date = date.add(1, "year");
    }
    onChange(date.isValid() ? date : null);
  };

  React.useEffect(() => {
    setRawValue(value?.format(DATE_FORMAT) ?? "");
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
  );
};

export default DateTimePicker;