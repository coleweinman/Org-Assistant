import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-regular-svg-icons";

type IconButtonProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>,
  icon: IconDefinition,
  label: string,
};

const IconButton: React.FunctionComponent<IconButtonProps> = ({ label, onClick, icon }) => {
  const [hovering, setHovering] = React.useState<boolean>(false);
  return (
    <div className={`icon-button-container ${hovering ? "hovering" : ""}`}>
      <label htmlFor={label}>{label}</label>
      <button
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        name={label}
        className="icon-button"
        onClick={onClick}
      >
        <FontAwesomeIcon icon={icon} />
      </button>
    </div>
  );
};

export default IconButton;