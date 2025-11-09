"use client";

import { useAtprotoClient } from "@/lib/use-atproto-client";
import { useOAuthContext } from "@/providers/OAuthProviderSSR";
import { redirect, useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditHypercertIdPage() {
  const params = useParams<{ hypercertId: string }>();
  const hypercertId = params.hypercertId;
  if (!hypercertId) {
    redirect(`/`);
  }
  const { atProtoAgent, session } = useOAuthContext();
  if (!atProtoAgent && !session) {
    redirect(`/`);
  }
  useEffect(() => {
    async function fetchHypercert() {
      const record = await atProtoAgent?.com.atproto.repo.getRecord({
        repo: atProtoAgent.assertDid,
        collection: "org.hypercerts.claim.record",
        rkey: hypercertId,
      });
      console.log(record);
    }
    fetchHypercert();
  }, [atProtoAgent, hypercertId]);
  return <div></div>;
}
