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
import AttendeePage from "./pages/AttendeePage";
import SubmitPage from "./pages/SubmitPage";
import CreateEventPage from "./pages/CreateEventPage";
import { FIREBASE_CONFIG } from "./utils/dynamicConstants";
import "./stylesheets/App.scss";
import ShareCalendarPage from "./pages/ShareCalendarPage";
import RevokeCalendarPage from "./pages/RevokeCalendarPage";

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
                    <OrgPage db={db} />
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
              path="orgs/:orgId/attendees"
              element={
                <AuthGuard>
                  <AttendeePage db={db} />
                </AuthGuard>
              }
            />
            <Route
              path="orgs/:orgId/attendees/:attendeeId"
              element={
                <AuthGuard>
                  <AttendeePage db={db} />
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
            <Route path="orgs/:orgId/:type/:eventId" element={<CheckInPage db={db} joint={false} />} />
            <Route path="orgs/:orgId/:type/joint/:eventId" element={<CheckInPage db={db} joint={true} />} />
            <Route path="orgs/:orgId/submitted/:checkInId" element={<SubmitPage db={db} />} />
            <Route path="calendar/share" element={<ShareCalendarPage db={db} editing={false} />} />
            <Route path="calendar/edit" element={<ShareCalendarPage db={db} editing={true} />} />
            <Route path="calendar/revoke" element={<RevokeCalendarPage db={db} />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
