"use client";

import { SmallBlob, Uri } from "@/lexicons/types/org/hypercerts/defs";
import { getBlobURL, getPDSlsURI } from "@/lib/utils";
import { $Typed, BlobRef } from "@atproto/api";
import { ReactNode } from "react";
import { URILink } from "./uri-link";

export function BlobDisplay({
  content,
  did,
}: {
  content: $Typed<Uri> | $Typed<BlobRef> | { $type: string };
  did?: string;
}): ReactNode {
  if (!content) return "—";
  const type = content.$type as string | undefined;

  if (type === "app.certified.defs#uri") {
    const uri = (content as $Typed<Uri>).uri;
    return <URILink uri={getPDSlsURI(uri)} label={uri} />;
  }

  if (["smallBlob", "largeBlob", "blob"].includes(type || "")) {
    const blobRef = (content as $Typed<SmallBlob>).blob;
    return (
      <p className="text-sm">
        Blob-based data
        {blobRef && (
          <>
            {" · "}
            <URILink
              uri={getBlobURL(content, did)}
              label={blobRef.toString()}
            />
          </>
        )}
      </p>
    );
  }

  return "—";
}
