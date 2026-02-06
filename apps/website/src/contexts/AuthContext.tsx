"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";
import type { UserRole, UserType } from "@/lib/auth";
import { getUserRole, getUserTypeFromSession, ensureUserRecord } from "@/lib/auth";
import { getSession, ensureValidSession, checkSessionExpiry } from "@/lib/session";

interface UserData {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  role: UserRole | null;
  userType: UserType | null;
}

interface AuthContextType {
  user: UserData | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserData = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setSession(null);
      return;
    }

    try {
      // Verify user still exists in Auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser || authUser.id !== session.user.id) {
        // User was deleted or session is invalid
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        return;
      }

      // Ensure user record exists
      const ensureResult = await ensureUserRecord(session);
      
      if (!ensureResult.success) {
        console.error("Failed to ensure user record:", ensureResult.error);
        setUser(null);
        setSession(null);
        return;
      }

      // Get user role
      const role = await getUserRole(session.user.id);
      const userType = await getUserTypeFromSession(session);

      // Extract user metadata
      const metadata = session.user.user_metadata;
      const fullName =
        metadata?.full_name ||
        metadata?.name ||
        metadata?.display_name ||
        (metadata?.first_name && metadata?.last_name
          ? `${metadata.first_name} ${metadata.last_name}`
          : null);
      
      const avatar =
        metadata?.avatar_url ||
        metadata?.picture ||
        metadata?.photo_url ||
        null;

      setUser({
        id: session.user.id,
        email: session.user.email,
        name: fullName,
        avatar: avatar,
        role: role,
        userType: userType,
      });

      setSession(session);
    } catch (error) {
      console.error("Error updating user data:", error);
      setUser(null);
      setSession(null);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const currentSession = await ensureValidSession();
      
      if (currentSession) {
        await updateUserData(currentSession);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [updateUserData]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      
      // Clear sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth_redirect");
        sessionStorage.removeItem("auth_login_pending");
        sessionStorage.removeItem("auth_redirect_guard");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Initial auth check
    checkAuth();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (newSession) {
          await updateUserData(newSession);
        }
      }

      if (event === "USER_UPDATED" && newSession) {
        await updateUserData(newSession);
      }
    });

    // Setup session refresh check
    const refreshInterval = setInterval(async () => {
      if (session) {
        const isExpired = await checkSessionExpiry(session);
        if (isExpired) {
          await checkAuth();
        }
      }
    }, 60 * 1000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [checkAuth, updateUserData, session]);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    signOut,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
