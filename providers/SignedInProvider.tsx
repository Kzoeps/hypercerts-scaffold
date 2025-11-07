"use client";
import { Spinner } from "@/components/ui/spinner";
import { useOAuthContext } from "./OAuthProviderSSR";
import LoginDialog from "@/components/login-dialog";

export function SignedInProvider({ children }: { children?: React.ReactNode }) {
  const { isSignedIn, isLoading } = useOAuthContext();

  if (isSignedIn) return <>{children}</>;

  return (
    <div className="flex grow flex-col items-center justify-center">
      {!isLoading ? <LoginDialog /> : <Spinner />}
    </div>
  );
}
