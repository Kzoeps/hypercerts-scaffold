import type * as HypercertRecord from "@/lexicons/types/org/hypercerts/claim";
import type * as HypercertContribution from "@/lexicons/types/org/hypercerts/claim/contribution";
import { ComAtprotoRepoGetRecord } from "@atproto/api";

export type HypercertRecordData = Omit<
  ComAtprotoRepoGetRecord.OutputSchema,
  "value"
> & {
  value: HypercertRecord.Record;
};

export type HypercertContributionData = Omit<
  ComAtprotoRepoGetRecord.OutputSchema,
  "value"
> & {
  value: HypercertContribution.Record;
};

export enum Collections {
  claim = "org.hypercerts.claim"
}