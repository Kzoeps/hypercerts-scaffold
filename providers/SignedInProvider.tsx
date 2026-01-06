"use client";
import LoginDialog from "@/components/login-dialog";
import Navbar from "@/components/navbar";
import { useSession } from "./SessionProvider";

export function SignedInProvider({ children }: { children?: React.ReactNode }) {
  const { session } = useSession();

  return (
    <>
      <Navbar />
      {session ? (
        <>{children}</>
      ) : (
        <div className="flex grow flex-col items-center justify-center">
          <LoginDialog />
          {/* {!isLoading ? <LoginDialog /> : <Loader />} */}
        </div>
      )}
    </>
  );
}
