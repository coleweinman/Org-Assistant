import { Auth, User } from "firebase/auth";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

// Use to protect routes that require authentication or specific permissions
function AuthGuard({ children }: { children: JSX.Element }) {
    let auth = useAuth();
    let location = useLocation();
    if (auth.user !== null) {
        return children;
    } else {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
}

export default AuthGuard;