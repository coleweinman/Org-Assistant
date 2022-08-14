import { Auth, onAuthStateChanged, User, UserCredential, signOut, signInWithEmailAndPassword } from "firebase/auth";
import React from "react";

interface AuthContextType {
	user: User | null;
	signInWithEmail: (email: string, password: string) => void;
	signOut: () => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

function AuthProvider({ auth, children }: { auth: Auth, children: React.ReactNode }) {
	let [user, setUser] = React.useState<User | null>(null);

	onAuthStateChanged(auth, (user) => {
		setUser(user);
		console.log(user);
	});

	let signInWithEmail = async (email: string, password: string): Promise<UserCredential | null> => {
		try {
			let cred: UserCredential | null = await signInWithEmailAndPassword(auth, email, password);
			return cred;
		} catch (error) {
			console.error(error);
			return null;
		}
	};

	let signOut = () => {
		signOut();
	};

	let value = { user, signInWithEmail, signOut };

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
	return React.useContext(AuthContext);
}

export { AuthProvider, useAuth };