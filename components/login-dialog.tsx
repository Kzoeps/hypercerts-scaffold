"use client";
import { AtSignIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "./ui/button";
import { useOAuthContext } from "@/providers/OAuthProviderSSR";
import { FormEventHandler, useState } from "react";
import { PDS_URL } from "@/utils/constants";
// import { useRouter } from "next/navigation";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginDialog() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useOAuthContext();

  const pdsUrl = process.env.NEXT_PUBLIC_PDS_URL;
  let hostname = "";
  if (pdsUrl) {
    try {
      hostname = new URL(pdsUrl).hostname;
    } catch (e) {
      console.error("Invalid PDS URL:", pdsUrl, e);
    }
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);
    let finalHandle = handle;
    if (hostname && !handle.includes(hostname)) {
      // Remove trailing dot if user typed it? Or just assume simple handle.
      // If user typed "user." and we append ".hostname", we get "user..hostname"
      // Let's strip trailing dot from handle just in case.
      const cleanHandle = handle.endsWith(".") ? handle.slice(0, -1) : handle;
      finalHandle = `${cleanHandle}.${hostname}`;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ handle: finalHandle }),
      });
      const data = await response.json();
      router.push(data.authUrl);
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while logging in.");
    } finally {
      setLoading(false);
    }
  };

  const redirectToAccountCreation = () => {
    signIn(PDS_URL);
  };
  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-6 py-10">
      <InputGroup>
        <InputGroupAddon>
          <AtSignIcon />
        </InputGroupAddon>
        <InputGroupInput
          onChange={(e) => setHandle(e.target.value)}
          placeholder="Enter your handle"
        />
      </InputGroup>
      {hostname && (
        <p className="text-sm text-muted-foreground">
          Handle: {handle}.{hostname}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading && <Spinner />}
        Login
      </Button>
      <Button
        disabled={loading}
        onClick={redirectToAccountCreation}
        variant={"link"}
        type="button"
      >
        Create an account
      </Button>
    </form>
  );
}
