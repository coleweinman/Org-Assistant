import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useNavigate } from "react-router-dom";

type BackButtonProps = {
  to: string,
};

const BackButton: React.FunctionComponent<BackButtonProps> = ({ to }) => {
  const navigate = useNavigate();
  return (
    <button className="back-button" onClick={() => navigate(to)}>
      <FontAwesomeIcon icon={solid("chevron-left")} />
    </button>
  );
};

export default BackButton;