import { Agent } from "@atproto/api";
import { Collections } from "./types";

export const getHypercert = async (rkey: string, atProtoAgent: Agent) => {
  const data = await atProtoAgent.com.atproto.repo.getRecord({
    repo: atProtoAgent.assertDid,
    collection: Collections.claim,
    rkey,
  });
  return data;
};
