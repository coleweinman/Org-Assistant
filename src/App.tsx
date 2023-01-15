import React from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Outlet, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login/LoginPage';
import HomePage from './pages/home/HomePage';
import { AuthProvider } from './AuthProvider';
import AuthGuard from './AuthGuard';
import OrgPage from './pages/org/OrgPage';
import NavigationBar from './NavigationBar';
import CheckInPage from './pages/checkIn/CheckInPage';
import EventPage from './pages/events/EventPage';
import "./stylesheets/App.scss";
import SubmitPage from './pages/checkIn/SubmitPage';
import CreateEventPage from './pages/events/CreateEventPage';

const firebaseConfig = {
  apiKey: "AIzaSyBlMx0f35Ia49khVmeYFH6dmmpJEx2uMC0",
  authDomain: "org-assistant.firebaseapp.com",
  projectId: "org-assistant",
  storageBucket: "org-assistant.appspot.com",
  messagingSenderId: "45876267496",
  appId: "1:45876267496:web:26dfbcf9656ffc93117c5d",
  measurementId: "G-73BSH3ZW4G"
};

function App() {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const db = getFirestore(app);

  return (
    <AuthProvider auth={auth}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={
            <AuthGuard>
              <HomePage db={db} />
            </AuthGuard>
          } />
          <Route path="login" element={<LoginPage />} />
          <Route path="orgs">
            <Route
              path=":orgId"
              element={
                <AuthGuard>
                  <OrgPage db={db} seasonId={"Fall 2022"} />
                </AuthGuard>
              }
            >
            </Route>
          </Route>
          <Route path="orgs/:orgId/checkin/:eventId"
            element={
              <CheckInPage db={db} />
            }
          />
          <Route path="orgs/:orgId/checkin/:eventId/submitted"
            element={
              <SubmitPage/>
            }
          />
          <Route path="orgs/:orgId/events/:eventId"
            element={
              <EventPage db={db} />
            }
          />
          <Route path="orgs/:orgId/createEvent"
            element={
              <CreateEventPage db={db} />
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

function Layout() {
  return (
    <div>
      <NavigationBar />
      <Outlet />
    </div>
  );
}

export default App;
