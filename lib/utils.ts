import { PDS_URL } from "@/utils/constants";
import { BlobRef } from "@atproto/lexicon";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageURL(
  blobRef: BlobRef | string | { $type: string } | undefined,
  did?: string
): string | undefined {
  if (typeof blobRef === "string") {
    return blobRef;
  }

  if (blobRef && "$type" in blobRef && blobRef.$type === "string") {
    return blobRef.$type;
  }

  // case 3: object with ref (BlobRef)
  if (blobRef && "ref" in blobRef && "ref" in blobRef.original) {
    const cid = blobRef.original?.ref?.$link ?? undefined;
    if (!did || !cid) return undefined;

    const url = `${PDS_URL}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(
      did
    )}&cid=${encodeURIComponent(cid)}`;
    console.log(url);
    return url;
  }

  return undefined;
}
