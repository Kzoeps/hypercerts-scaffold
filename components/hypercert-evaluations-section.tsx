"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import HypercertEvaluationView, {
  Evaluation,
} from "./hypercert-evaluation-view";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { getEvaluationRecord } from "@/lib/create-actions";

interface BacklinksResponse {
  records: {
    did: string;
    collection: string;
    rkey: string;
  }[];
}

const fetchEvaluationLinks = async (
  hypercertUri: string
): Promise<BacklinksResponse["records"]> => {
  const url = new URL(
    "https://constellation.microcosm.blue/xrpc/blue.microcosm.links.getBacklinks"
  );
  url.searchParams.set("subject", hypercertUri);
  url.searchParams.set("source", "org.hypercerts.claim.evaluation:subject.uri");
  url.searchParams.set("limit", "50");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data: BacklinksResponse = await response.json();
  return data.records;
};

const EvaluationSkeleton = () => (
  <div className="p-4 border rounded-lg space-y-3">
    <Skeleton className="h-5 w-1/4" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export default function HypercertEvaluationsSection({
  hypercertUri,
}: {
  hypercertUri: string;
}) {
  const {
    data: evaluationLinks,
    isLoading: isLoadingLinks,
    isError: isErrorLinks,
  } = useQuery({
    queryKey: ["evaluation-links", hypercertUri],
    queryFn: () => fetchEvaluationLinks(hypercertUri),
  });

  const evaluationQueries = useQueries({
    queries: (evaluationLinks || []).map((link) => ({
      queryKey: ["evaluation-record", link.did, link.rkey],
      queryFn: () =>
        getEvaluationRecord({
          did: link.did,
          collection: link.collection,
          rkey: link.rkey,
        }),
    })),
  });

  const isLoadingDetails = evaluationQueries.some((q) => q.isLoading);
  const isErrorDetails = evaluationQueries.some((q) => q.isError);
  const isLoading = isLoadingLinks || isLoadingDetails;
  const isError = isErrorLinks || isErrorDetails;

  const evaluations = evaluationQueries
    .filter((q) => q.isSuccess && q.data)
    .map((q) => q.data?.value as Evaluation);

  return (
    <div>
      <Separator className="my-6" />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Evaluations</h3>
        {isLoading && (
          <div className="space-y-4">
            <EvaluationSkeleton />
          </div>
        )}
        {isError && (
          <p className="text-sm text-red-500">Failed to load evaluations.</p>
        )}
        {!isLoading && !isError && (
          <>
            {evaluations && evaluations.length > 0 ? (
              <div className="space-y-4">
                {evaluations.map((evaluation, index) => (
                  <HypercertEvaluationView
                    key={index}
                    evaluation={evaluation}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No evaluations found for this hypercert.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
