import { Agent } from "@atproto/api";
import * as HypercertClaim from "@/lexicons/types/org/hypercerts/claim";
import * as HypercertContribution from "@/lexicons/types/org/hypercerts/claim/contribution";
import * as HypercertEvidence from "@/lexicons/types/org/hypercerts/claim/evidence";
import { Collections } from "./types";

export const getHypercert = async (rkey: string, atProtoAgent: Agent) => {
  const data = await atProtoAgent.com.atproto.repo.getRecord({
    repo: atProtoAgent.assertDid,
    collection: Collections.claim,
    rkey,
  });
  return data;
};

export const updateHypercert = async (
  rkey: string,
  atProtoAgent: Agent,
  record: HypercertClaim.Record
) => {
  const data = await atProtoAgent.com.atproto.repo.putRecord({
    rkey,
    repo: atProtoAgent.assertDid,
    collection: Collections.claim,
    record,
  });
  return data;
};

export const createContribution = async (
  atProtoAgent: Agent,
  record: HypercertContribution.Record
) => {
  const response = await atProtoAgent?.com.atproto.repo.createRecord({
    record,
    collection: Collections.contribution,
    repo: atProtoAgent.assertDid,
  });
  return response;
};

export const createEvidence = async (
  atProtoAgent: Agent,
  record: HypercertEvidence.Record
) => {
  const response = await atProtoAgent.com.atproto.repo.createRecord({
    record,
    collection: "org.hypercerts.claim.evidence",
    repo: atProtoAgent.assertDid,
  });
  return response;
};
