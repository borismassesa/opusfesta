'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';

interface ClientProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  location: string | null;
  avatar_url: string | null;
  portal_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
}

interface AuthState {
  client: ClientProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  client: null,
  loading: true,
  logout: async () => {},
  refresh: async () => {},
});

export function useClientAuth() {
  return useContext(AuthContext);
}

export default function ClientAuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!clerkLoaded) return;

    if (!user) {
      setClient(null);
      setLoading(false);
      return;
    }

    // User is signed in via Clerk — sync/fetch their client profile
    try {
      const res = await fetch('/api/portal/profile');
      if (res.ok) {
        const data = await res.json();
        setClient(data.client || null);
      } else {
        setClient(null);
      }
    } catch {
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, [clerkLoaded, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } finally {
      setClient(null);
    }
  }, [signOut]);

  return (
    <AuthContext.Provider value={{ client, loading: !clerkLoaded || loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
