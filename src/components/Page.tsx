import React from "react";
import { useLayout } from "./Layout";

type PageProps = React.HTMLAttributes<HTMLDivElement>;

const Page: React.FunctionComponent<PageProps> = ({ className, style = {}, ...props }) => {
  const { navHeight, windowHeight } = useLayout();
  return (
    <div className={`page ${className ?? ""}`} style={{ ...style, minHeight: windowHeight - navHeight }} {...props} />
  );
};

export default Page;