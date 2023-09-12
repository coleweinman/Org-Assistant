import React from "react";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { IconDefinition } from "@fortawesome/free-regular-svg-icons";
import IconButton from "./IconButton";

type ConfirmButtonProps = {
  onClick: () => void,
  icon: IconDefinition,
  label: string,
};

const ConfirmButton: React.FunctionComponent<ConfirmButtonProps> = ({ onClick, icon, label }) => {
  const [confirming, setConfirming] = React.useState<boolean>(false);
  const onConfirm = () => {
    setConfirming(false);
    onClick();
  };
  return confirming ? (
    <>
      <IconButton onClick={() => setConfirming(false)} icon={solid("xmark")} label="Cancel" />
      <IconButton onClick={onConfirm} icon={solid("check")} label="Confirm" />
    </>
  ) : (
    <IconButton onClick={() => setConfirming(true)} icon={icon} label={label} />
  );
};

export default ConfirmButton;