"use client";

import { ErrorBoundary } from "./ErrorBoundary";

/**
 * Client-only wrapper that makes the class-based ErrorBoundary usable inside
 * Next.js Server Components (e.g. layout.tsx). Wrap {children} in the root
 * layout so that ANY unhandled render error — including throws inside
 * GreenBloxPage hooks — shows the crash screen instead of a white page.
 */
export function ClientErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
