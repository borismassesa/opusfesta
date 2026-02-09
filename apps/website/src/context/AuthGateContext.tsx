"use client";

import { createContext, useCallback, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { AuthGateModal } from "@/components/auth/AuthGateModal";

export type AuthGateIntent =
  | "booking"
  | "details"
  | "save"
  | "review"
  | "inquiry"
  | "apply"
  | "general";

type AuthMode = "signin" | "signup";

export interface AuthGateContextValue {
  /** If signed in, fires callback immediately. Otherwise opens modal; callback fires on auth success. */
  requireAuth: (intent: AuthGateIntent, callback: () => void) => void;
  /** Open the auth modal without a pending callback (e.g. scroll-based trigger). */
  openAuthModal: (intent?: AuthGateIntent, mode?: AuthMode) => void;
}

export const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [intent, setIntent] = useState<AuthGateIntent>("general");
  const [initialMode, setInitialMode] = useState<AuthMode>("signin");
  const pendingCallback = useRef<(() => void) | null>(null);

  const requireAuth = useCallback(
    (intent: AuthGateIntent, callback: () => void) => {
      if (isSignedIn) {
        callback();
        return;
      }
      pendingCallback.current = callback;
      setIntent(intent);
      setInitialMode("signin");
      setIsModalOpen(true);
    },
    [isSignedIn]
  );

  const openAuthModal = useCallback(
    (intent: AuthGateIntent = "general", mode: AuthMode = "signin") => {
      pendingCallback.current = null;
      setIntent(intent);
      setInitialMode(mode);
      setIsModalOpen(true);
    },
    []
  );

  const handleAuthSuccess = useCallback(() => {
    const cb = pendingCallback.current;
    pendingCallback.current = null;
    setIsModalOpen(false);
    // Delay callback slightly so Clerk state propagates
    if (cb) {
      setTimeout(cb, 100);
    }
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      pendingCallback.current = null;
    }
    setIsModalOpen(open);
  }, []);

  return (
    <AuthGateContext.Provider value={{ requireAuth, openAuthModal }}>
      {children}
      <AuthGateModal
        open={isModalOpen}
        onOpenChange={handleOpenChange}
        intent={intent}
        initialMode={initialMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </AuthGateContext.Provider>
  );
}
