import React from "react";
import Page from "../components/Page";
import { useParams } from "react-router-dom";
import type { SubmitPageParams } from "../utils/types";
import { CHECK_IN_TYPE_INFO } from "../utils/dynamicConstants";
import "../stylesheets/SubmitPage.scss";

const SubmitPage: React.FunctionComponent = () => {
  const { type } = useParams<SubmitPageParams>();
  return (
    <Page className="submit-page">
      <h3>{CHECK_IN_TYPE_INFO[type!].submitMessage}</h3>
    </Page>
  );
};

export default SubmitPage;