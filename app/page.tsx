"use client";
import { useOAuthContext } from "@/providers/OAuthProviderSSR";
import { useRef } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { signIn } = useOAuthContext();
  const handleSubmit = async () => {
    if (inputRef.current) {
      const handle = inputRef.current.value;
      console.log("Submitted handle:", handle);
      await signIn(handle);
    }
  };
  return <div>Signed in</div>;
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-3 py-32 px-16 bg-white dark:bg-black sm:items-start">
        <label htmlFor="handle">Handle</label>
        <input
          ref={inputRef}
          id="handle"
          placeholder="alice@test.certified.app"
        ></input>
        <button type="submit" onClick={handleSubmit}>
          Submit
        </button>
      </main>
    </div>
  );
}
