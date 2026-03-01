import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Role } from "@/lib/types";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(intendedRole: Role) {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user document already exists
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();

            // Role conflict check: Prevent student from logging in as teacher and vice versa
            if (userData.role !== intendedRole) {
                await firebaseSignOut(auth);
                throw new Error(`Role conflict: You are already registered as a ${userData.role}.`);
            }

            return { user, isNewUser: false };
        }

        // New user registration flow
        if (intendedRole === "teacher") {
            // Teachers must be pre-approved in the 'approvedTeachers' collection
            const approvedRef = doc(db, "approvedTeachers", user.email!);
            const approvedSnap = await getDoc(approvedRef);

            if (!approvedSnap.exists()) {
                await firebaseSignOut(auth);
                throw new Error("Access Denied: Your email is not on the approved faculty list.");
            }
        }

        // Create the base user document
        await setDoc(userDocRef, {
            name: user.displayName || "",
            email: user.email,
            role: intendedRole,
            photoURL: user.photoURL || "",
            onboardingCompleted: false,
            createdAt: serverTimestamp(),
        });

        return { user, isNewUser: true };
    } catch (error) {
        console.error("Auth error:", error);
        throw error;
    }
}

export async function signOut() {
    try {
        await firebaseSignOut(auth);
        // Redirect to home is handled by middleware/components listening to auth state
    } catch (error) {
        console.error("Sign out error:", error);
        throw error;
    }
}
