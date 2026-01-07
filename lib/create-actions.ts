"use server";

import { CreateHypercertParams } from "@hypercerts-org/sdk-core";
import { getAuthenticatedRepo, getSession } from "./atproto-session";
import sdk from "./hypercerts-sdk";

export const createHypercertUsingSDK = async (
  params: CreateHypercertParams
) => {
  const personalRepository = await getAuthenticatedRepo("pds");
  if (personalRepository) {
    const data = await personalRepository.hypercerts.create(params);
    return data;
  }
};

export const logout = async () => {
  const session = await getSession();
  console.log(session);
  if (!session) {
    return;
  }
  sdk.revokeSession(session.sub);
};
