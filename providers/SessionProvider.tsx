"use client";

import { OAuthSession } from "@atproto/oauth-client-node";
import React, { createContext, useContext } from "react";

type SessionContextValue = {
  session: OAuthSession | null;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

export function SessionProvider({
  session,
  children,
}: {
  session: OAuthSession | null;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
