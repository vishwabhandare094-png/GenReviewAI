"use client";

import { useEffect, useState } from "react";
import CustomerFlowClient from "./r/[shortCode]/CustomerFlowClient";

export default function NotFound() {
  const [isReviewRoute, setIsReviewRoute] = useState(false);

  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    setIsReviewRoute(parts[0] === "r" && Boolean(parts[1]));
  }, []);

  if (isReviewRoute) {
    return <CustomerFlowClient />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-semibold">404</h1>
        <div className="h-12 w-px bg-white/30" />
        <p>This page could not be found.</p>
      </div>
    </div>
  );
}
