"use client";

import { useState } from "react";
import { api, ApiError, BASE_URL } from "@/lib/api";
import PageHeader from "@/components/PageHeader";

export default function QrPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const restaurantId = localStorage.getItem("gr_restaurant_id");
      if (!restaurantId) throw new Error("No restaurant is linked to this account yet.");
      const res = await api.generateQr(restaurantId);
      setResult(res as Record<string, unknown>);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

 const imageUrl =
  result &&
  (["qr_url", "qr_path", "url", "image_url", "path"]
    .map((k) => result[k])
    .find((v) => typeof v === "string") as string | undefined);

  const resolvedSrc =
  imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${BASE_URL}/${imageUrl.replace(/\\/g, "/")}`
    : undefined;

  return (
    <div>
      <PageHeader
        eyebrow="Print-ready asset"
        title="QR code"
        description="Generate the code that opens your rating page. Print it, laminate it, put it on every table."
      />

      <div className="px-8 py-8">
        <div className="max-w-md border border-line bg-paper p-8 text-center">
          {!result && (
            <>
              <div className="mx-auto mb-6 flex h-40 w-40 items-center justify-center border border-dashed border-line bg-paper-dim">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  Not generated yet
                </span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-paprika px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-paprika-dark disabled:opacity-60"
              >
                {loading ? "Generating…" : "Generate QR code"}
              </button>
            </>
          )}

          {result && (
            <>
              {resolvedSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolvedSrc}
                  alt="Restaurant QR code"
                  className="mx-auto mb-6 h-48 w-48 border border-line bg-white p-3"
                />
              ) : (
                <pre className="mb-6 overflow-auto bg-paper-dim p-4 text-left font-mono text-xs text-ink-soft">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
              <a
                href={resolvedSrc || "#"}
                download
                className="block w-full bg-ink px-5 py-3 text-center text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
              >
                Download
              </a>
              <button
                onClick={handleGenerate}
                className="mt-3 w-full border border-line px-5 py-2.5 text-sm text-ink-soft hover:border-ink"
              >
                Regenerate
              </button>
            </>
          )}

          {error && <p className="mt-4 text-sm text-plum-dark">{error}</p>}
        </div>
      </div>
    </div>
  );
}
