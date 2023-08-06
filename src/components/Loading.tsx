import React from "react";
import Page from "./Page";
import loading from "../images/loader.svg";

type LoadingProps = React.PropsWithChildren & React.HTMLAttributes<HTMLDivElement>;

const Loading: React.FunctionComponent<LoadingProps> = ({ children, className, ...props }) => (
  <Page className={`loading-page ${className ?? ""}`} {...props}>
    {children}
    <img className="loader" src={loading} alt="Loading..." />
  </Page>
);

export default Loading;