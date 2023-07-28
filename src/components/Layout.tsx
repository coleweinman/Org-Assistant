import React from "react";
import NavigationBar from "./NavigationBar";
import { Outlet } from "react-router-dom";

const Layout: React.FunctionComponent = () => (
  <div>
    <NavigationBar />
    <Outlet />
  </div>
);

export default Layout;