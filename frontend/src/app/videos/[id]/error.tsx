"use client";
import { useEffect } from "react";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("PAGE CRASH:", error);
  }, [error]);
  return (
    <div className="p-10 bg-red-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <pre className="mt-4 p-4 bg-black rounded overflow-auto whitespace-pre-wrap">{error.message}</pre>
      <pre className="mt-4 p-4 bg-black rounded overflow-auto whitespace-pre-wrap text-sm text-gray-400">{error.stack}</pre>
      <button onClick={() => reset()} className="mt-4 px-4 py-2 bg-white text-red-900 font-bold rounded">Try again</button>
    </div>
  );
}
