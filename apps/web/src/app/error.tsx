"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{ padding: 24 }}>
      <h1>Something went wrong</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{String(error?.message || error)}</pre>
      <button onClick={reset} style={{ marginTop: 12 }}>
        Try again
      </button>
    </main>
  );
}
