import React from "react";
import { getAuthErrorMessage } from "./helpers/Firebase";
import {
	Auth,
	onAuthStateChanged,
	User,
	UserCredential,
	signOut,
	signInWithEmailAndPassword,
	AuthError
} from "firebase/auth";

interface AuthContextType {
	user: User | null;
	signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
	signOut: () => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

function AuthProvider({ auth, children }: { auth: Auth, children: React.ReactNode }) {
	const [user, setUser] = React.useState<User | null>(null);

	onAuthStateChanged(auth, (user) => {
		setUser(user);
		console.log(user);
	});

	const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
		try {
			return await signInWithEmailAndPassword(auth, email, password);
		} catch (e: any) {
			const errorMessage = getAuthErrorMessage(e as AuthError);
			throw new Error(errorMessage);
		}
	}

	const signOut = () => {
		signOut();
	};

	const value = {
		user,
		signInWithEmail,
		signOut
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
}

function useAuth() {
	return React.useContext(AuthContext);
}

export { AuthProvider, useAuth };