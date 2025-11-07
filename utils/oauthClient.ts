import { buildAtprotoLoopbackClientMetadata } from "@atproto/oauth-client-browser";
import { getLoopBackCanonicalLocation } from "./constants";

export const buildClientMetadata = () => {
  return buildAtprotoLoopbackClientMetadata({
    scope: "atproto transition:generic",
    redirect_uris: [getLoopBackCanonicalLocation()],
  });
};
