import React from "react";
import { getAuthErrorMessage } from "../utils/helpers";
import {
  Auth,
  AuthError,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  UserCredential,
} from "firebase/auth";
import type { AuthContextType } from "../utils/types";

const AuthContext = React.createContext<AuthContextType>(null!);

type AuthProviderProps = {
  auth: Auth,
  children: React.ReactNode,
};

const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({ auth, children }) => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [user, setUser] = React.useState<User | null>(null);

  onAuthStateChanged(auth, (user) => {
    setLoading(false);
    setUser(user);
  });

  const signInWithEmail = (
    email: string,
    password: string,
  ): Promise<UserCredential> => {
    try {
      return signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      const errorMessage = getAuthErrorMessage(e as AuthError);
      throw new Error(errorMessage);
    }
  };

  const signOut = () => firebaseSignOut(getAuth());

  const value = {
    user,
    loading,
    signInWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuth() {
  return React.useContext(AuthContext);
}

export { AuthProvider, useAuth };