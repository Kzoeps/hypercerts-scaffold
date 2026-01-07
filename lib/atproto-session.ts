import "server-only";
import { cookies } from "next/headers";
import sdk from "@/lib/hypercerts-sdk";
import { Repository } from "@hypercerts-org/sdk-core";

export async function getAuthenticatedRepo(
  server: "pds" | "sds" = "pds"
): Promise<Repository | null> {
  const cookieStore = await cookies();
  const did = cookieStore.get("user-did")?.value;

  if (!did) {
    return null;
  }

  try {
    const session = await sdk.restoreSession(did);
    if (!session) return null;
    return sdk.repository(session, { server });
  } catch (error) {
    console.error(`Failed to restore session for DID ${did}:`, error);
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const did = cookieStore.get("user-did")?.value;

  if (!did) {
    return null;
  }

  try {
    const session = await sdk.restoreSession(did);
    return session;
  } catch (error) {
    console.error(`Failed to restore session for DID ${did}:`, error);
    return null;
  }
}
