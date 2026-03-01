"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Role, UserDoc } from "@/lib/types";

interface AuthContextType {
    user: FirebaseUser | null;
    userData: UserDoc | null;
    role: Role | null;
    loading: boolean;
    onboardingCompleted: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    role: null,
    loading: true,
    onboardingCompleted: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<UserDoc | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to Firebase Auth state changes
        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (!firebaseUser) {
                setUserData(null);
                setLoading(false);
                return;
            }

            // If user exists, attach a real-time listener to their Firestore document
            const docRef = doc(db, "users", firebaseUser.uid);

            const unsubscribeDoc = onSnapshot(
                docRef,
                (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data() as UserDoc);
                    } else {
                        setUserData(null);
                    }
                    setLoading(false);
                },
                (error) => {
                    console.error("Error fetching user data:", error);
                    setLoading(false);
                }
            );

            // Cleanup doc listener on unmount or auth change
            return () => unsubscribeDoc();
        });

        return () => unsubscribeAuth();
    }, []);

    const value = {
        user,
        userData,
        role: userData?.role || null,
        loading,
        onboardingCompleted: userData?.onboardingCompleted || false,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
