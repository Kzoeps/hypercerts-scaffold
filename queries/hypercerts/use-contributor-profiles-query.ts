"use client";

import { useQueries } from "@tanstack/react-query";
import { getProfile } from "@/lib/api/external/bluesky";
import { queryKeys } from "@/lib/api/query-keys";
import type { DisplayContributor } from "@/lib/contributor-utils";
import type { BlueskyProfile } from "@/lib/api/types";

/**
 * For each DisplayContributor with isDid=true, fetch their Bluesky profile.
 * Returns a Map<string, BlueskyProfile> keyed by DID.
 * Non-DID contributors are skipped (no query created).
 * Failed lookups are silently ignored (retry: false, no throw).
 */
export function useContributorProfilesQuery(contributors: DisplayContributor[]) {
  const didContributors = contributors.filter((c) => c.isDid);
  // Deduplicate DIDs
  const uniqueDids = [...new Set(didContributors.map((c) => c.identity))];

  const queries = useQueries({
    queries: uniqueDids.map((did) => ({
      queryKey: queryKeys.hypercerts.contributorProfile(did),
      queryFn: () => getProfile(did),
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 min cache
    })),
  });

  // Build a Map<did, BlueskyProfile> from successful queries
  const profileMap = new Map<string, BlueskyProfile>();
  queries.forEach((q, i) => {
    if (q.isSuccess && q.data) {
      profileMap.set(uniqueDids[i], q.data);
    }
  });

  const isLoading = queries.some((q) => q.isLoading);

  return { profileMap, isLoading };
}
