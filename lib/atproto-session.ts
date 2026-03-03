import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { Agent } from "@atproto/api";
import type { OAuthSession } from "@atproto/oauth-client-node";
import oauthClient from "@/lib/hypercerts-sdk";

export type { OAuthSession };

export const getSession = cache(
  async function getSession(): Promise<OAuthSession | null> {
    const cookieStore = await cookies();
    const userDid = cookieStore.get("user-did")?.value;
    if (!userDid) return null;

    try {
      return await oauthClient.restore(userDid);
    } catch (error) {
      console.error(`Failed to restore session for DID ${userDid}:`, error);
      return null;
    }
  },
);

export const getAgent = cache(async function getAgent(): Promise<Agent | null> {
  const session = await getSession();
  if (!session) return null;
  return new Agent(session);
});
