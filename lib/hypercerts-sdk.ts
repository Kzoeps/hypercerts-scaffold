import { createATProtoSDK } from "@hypercerts-org/sdk-core";

if (!process.env.ATPROTO_JWK_PRIVATE) {
  throw new Error("ATPROTO_JWK_PRIVATE environment variable is not set");
}

const sdk = createATProtoSDK({
  oauth: {
    clientId: "https://9d216d2bdf13.ngrok-free.app/client-metadata.json",
    redirectUri: "https://9d216d2bdf13.ngrok-free.app/callback",
    scope: "atproto transition:generic",
    jwksUri: "https://9d216d2bdf13.ngrok-free.app/jwks.json",
    jwkPrivate: process.env.ATPROTO_JWK_PRIVATE,
  },
});

export default sdk;
