import React from "react";
import NavigationBar from "./NavigationBar";
import { Outlet } from "react-router-dom";
import type { NavContextType } from "../utils/types";

const LayoutContext = React.createContext<NavContextType>({ navHeight: 0, windowHeight: 0 });

const Layout: React.FunctionComponent = () => {
  const [navHeight, setNavHeight] = React.useState<number>(0);
  const [windowHeight, setWindowHeight] = React.useState<number>(window.innerHeight);

  React.useEffect(() => {
    // setWindowHeight(window.innerHeight - 10);
    return window.addEventListener("resize", () => setWindowHeight(window.innerHeight));
  }, []);

  return (
    <LayoutContext.Provider value={{ navHeight, windowHeight }}>
      <div>
        <NavigationBar setNavHeight={setNavHeight} />
        <Outlet />
      </div>
    </LayoutContext.Provider>
  );
};

export function useLayout() {
  return React.useContext(LayoutContext);
}

export default Layout;