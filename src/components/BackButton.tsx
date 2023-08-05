import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useNavigate } from "react-router-dom";

const BackButton: React.FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <button className="back-button" onClick={() => navigate(-1)}>
      <FontAwesomeIcon icon={solid("chevron-left")} />
    </button>
  );
};

export default BackButton;