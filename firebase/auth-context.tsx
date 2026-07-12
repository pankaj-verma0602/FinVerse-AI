"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";

interface AuthUser {
  email: string | null;
  uid: string;
  role: "admin" | "user" | null;
  name?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

const isDemoMode = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return !apiKey || apiKey === "dummy-api-key";
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isDemoMode()) {
      const demoUser = localStorage.getItem("finverse_demo_user");
      if (demoUser) {
        setUser(JSON.parse(demoUser));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let role: "admin" | "user" = "user";
        let name = firebaseUser.email ? firebaseUser.email.split("@")[0] : "";
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            role = data.role || "user";
            name = data.name || name;
          }
        } catch (err) {
          console.error("Error fetching user document:", err);
        }
        setUser({
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          role,
          name
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const role = email.includes("admin") ? "admin" : "user";
      const name = email.split("@")[0];
      if (isDemoMode()) {
        const mockUser: AuthUser = { email, uid: `demo-uid-${Date.now()}`, role, name };
        localStorage.setItem("finverse_demo_user", JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        let userRole: "admin" | "user" = role;
        let userName = name;
        if (userDoc.exists()) {
          const data = userDoc.data();
          userRole = data.role || "user";
          userName = data.name || name;
        }
        setUser({
          email: userCredential.user.email,
          uid: userCredential.user.uid,
          role: userRole,
          name: userName
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const role = email.includes("admin") ? "admin" : "user";
      const name = email.split("@")[0];
      if (isDemoMode()) {
        const mockUser: AuthUser = { email, uid: `demo-uid-${Date.now()}`, role, name };
        localStorage.setItem("finverse_demo_user", JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name,
          email,
          role,
          createdAt: new Date().toISOString()
        });
        setUser({
          email: userCredential.user.email,
          uid: userCredential.user.uid,
          role,
          name
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        localStorage.removeItem("finverse_demo_user");
        setUser(null);
      } else {
        await firebaseSignOut(auth);
        setUser(null);
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
