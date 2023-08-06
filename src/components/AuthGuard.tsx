import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import Loading from "./Loading";

type AuthGuardProps = {
  children: JSX.Element,
};

// Use to protect routes that require authentication or specific permissions
const AuthGuard: React.FunctionComponent<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  } else if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  } else {
    return children;
  }
};

export default AuthGuard;