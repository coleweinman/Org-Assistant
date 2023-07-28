import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NAVIGATION_LINKS } from "../utils/constants";
import "../stylesheets/NavigationBar.scss";

const NavigationBar: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-content">
        <h2 className="nav-title">Org Assistant</h2>
        <ul className="nav-links">
          {NAVIGATION_LINKS.map(({ link, name }) => (
            <li onClick={() => navigate(link)} key={name}>
              {name}
            </li>
          ))}
        </ul>
      </div>
      {auth.user && (
        <button className="blue-button log-out-button" onClick={auth.signOut}>
          <FontAwesomeIcon icon={solid("sign-out")} />
        </button>
      )}
    </nav>
  );
};

export default NavigationBar;
