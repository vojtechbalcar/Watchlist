"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Start a fresh navigation out of the failed route or root layout. */
import { useEffect, useRef } from "react";
import { RecoveryScreen } from "./recovery-screen";

export type RuntimeErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export function RuntimeErrorScreen({ error, retry, global = false }: RuntimeErrorProps & { global?: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, [error]);

  return (
    <>
      <title>{global ? "App unavailable | Watchlist" : "Page unavailable | Watchlist"}</title>
      <RecoveryScreen
        label={global ? "App unavailable" : "Page unavailable"}
        title={global ? "We couldn’t open Watchlist." : "We couldn’t load this page."}
        description="Please try again. If the problem continues, come back in a little while."
        headingRef={heading}
      >
        <button type="button" onClick={retry}>Try again</button>
        <a href="/">Go to dashboard</a>
      </RecoveryScreen>
    </>
  );
}
