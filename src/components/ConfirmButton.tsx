import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { IconDefinition } from "@fortawesome/free-regular-svg-icons";

type ConfirmButtonProps = {
  onClick: () => void,
  icon: IconDefinition,
};

const ConfirmButton: React.FunctionComponent<ConfirmButtonProps> = ({ onClick, icon }) => {
  const [confirming, setConfirming] = React.useState<boolean>(false);
  const onConfirm = () => {
    setConfirming(false);
    onClick();
  };
  return confirming ? (
    <div className="confirm-buttons">
      <button className="blue-button" onClick={onConfirm}>
        <FontAwesomeIcon icon={solid("check")} />
      </button>
      <button className="blue-button" onClick={() => setConfirming(false)}>
        <FontAwesomeIcon icon={solid("xmark")} />
      </button>
    </div>
  ) : (
    <button className="blue-button" onClick={() => setConfirming(true)}>
      <FontAwesomeIcon icon={icon} />
    </button>
  );
};

export default ConfirmButton;