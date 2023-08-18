import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NAVIGATION_LINKS } from "../utils/dynamicConstants";
import "../stylesheets/NavigationBar.scss";

type NavigationBarProps = {
  setNavHeight: (height: number) => void,
};

const NavigationBar: React.FunctionComponent<NavigationBarProps> = ({ setNavHeight }) => {
  const navbar = React.useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const auth = useAuth();

  React.useEffect(() => {
    setNavHeight(navbar?.current?.clientHeight ?? 0);
  }, [navbar?.current?.clientHeight, setNavHeight]);

  return (
    <nav className="navbar" ref={navbar}>
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
        <button className="icon-button log-out-button" onClick={auth.signOut}>
          <FontAwesomeIcon icon={solid("sign-out")} />
        </button>
      )}
    </nav>
  );
};

export default NavigationBar;
