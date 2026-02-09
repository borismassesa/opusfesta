"use client";

import { useContext } from "react";
import { AuthGateContext, type AuthGateContextValue } from "@/context/AuthGateContext";

export function useAuthGate(): AuthGateContextValue {
  const context = useContext(AuthGateContext);
  if (!context) {
    throw new Error("useAuthGate must be used within an AuthGateProvider");
  }
  return context;
}
