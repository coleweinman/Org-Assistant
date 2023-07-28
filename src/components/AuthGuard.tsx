import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type AuthGuardProps = {
  children: JSX.Element,
};

// Use to protect routes that require authentication or specific permissions
const AuthGuard: React.FunctionComponent<AuthGuardProps> = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();
  return auth.user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export default AuthGuard;