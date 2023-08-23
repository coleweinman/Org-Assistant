import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { AuthProvider } from "./components/AuthProvider";
import AuthGuard from "./components/AuthGuard";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import OrgPage from "./pages/OrgPage";
import CheckInPage from "./pages/CheckInPage";
import EventPage from "./pages/EventPage";
import SubmitPage from "./pages/SubmitPage";
import CreateEventPage from "./pages/CreateEventPage";
import { FIREBASE_CONFIG } from "./utils/dynamicConstants";
import "./stylesheets/App.scss";

const App: React.FunctionComponent = () => {
  // Initialize Firebase
  const app = initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);

  return (
    <HelmetProvider>
      <AuthProvider auth={auth}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Org Assistant</title>
          <link rel="canonical" href="https://org-assistant.web.app" />
        </Helmet>
        <Routes>
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <AuthGuard>
                  <HomePage db={db} />
                </AuthGuard>
              }
            />
            <Route path="login" element={<LoginPage />} />
            <Route path="orgs">
              <Route
                path=":orgId"
                element={
                  <AuthGuard>
                    <OrgPage db={db} seasonId="Spring 2023" />
                  </AuthGuard>
                }
              >
              </Route>
            </Route>
            <Route
              path="orgs/:orgId/events/:eventId"
              element={
                <AuthGuard>
                  <EventPage db={db} />
                </AuthGuard>
              }
            />
            <Route
              path="orgs/:orgId/createEvent"
              element={
                <AuthGuard>
                  <CreateEventPage db={db} />
                </AuthGuard>
              }
            />
            <Route path="orgs/:orgId/:type/:eventId" element={<CheckInPage db={db} />} />
            <Route path="orgs/:orgId/:type/:eventId/submitted" element={<SubmitPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
