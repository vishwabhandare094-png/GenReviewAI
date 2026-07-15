"use client";

import { useEffect, useState } from "react";
import { api, ApiError, BASE_URL } from "@/lib/api";
import PageHeader from "@/components/PageHeader";

export default function QrPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const rid = localStorage.getItem("gr_restaurant_id");
    const rname = localStorage.getItem("gr_restaurant_name") || "";
    const sc = localStorage.getItem("gr_restaurant_short_code");
    setRestaurantId(rid);
    setRestaurantName(rname);
    setShortCode(sc);
    if (sc) {
      setReviewUrl(`${window.location.origin}/r/${sc}`);
    }
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const rid = restaurantId;
      if (!rid) throw new Error("No restaurant is linked to this account yet. Please configure your restaurant in Settings.");
      const res = await api.generateQr(rid);
      const data = res as Record<string, unknown>;
      setResult(data);
      // Update short code and review URL from response if provided
      if (data.short_code) {
        const sc = data.short_code as string;
        setShortCode(sc);
        localStorage.setItem("gr_restaurant_short_code", sc);
        setReviewUrl(`${window.location.origin}/r/${sc}`);
      }
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

  const resolvedSrc = imageUrl
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

      <div className="px-8 py-8 space-y-6">
        {/* Restaurant Info */}
        {restaurantName && (
          <div className="max-w-md border border-line bg-paper p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mb-1">Restaurant</p>
            <p className="font-semibold text-ink">{restaurantName}</p>
            {shortCode && (
              <p className="text-xs text-ink-soft font-mono mt-1">Short Code: <span className="text-paprika font-bold">{shortCode}</span></p>
            )}
            {reviewUrl && (
              <div className="mt-3 pt-3 border-t border-line">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mb-1">Review URL</p>
                <a
                  href={reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-paprika underline break-all"
                >
                  {reviewUrl}
                </a>
              </div>
            )}
          </div>
        )}

        {/* QR Card */}
        <div className="max-w-md border border-line bg-paper p-8 text-center">
          {!result && (
            <>
              {resolvedSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolvedSrc}
                  alt="Restaurant QR code"
                  className="mx-auto mb-6 h-48 w-48 border border-line bg-white p-3"
                />
              ) : (
                <div className="mx-auto mb-6 flex h-40 w-40 items-center justify-center border border-dashed border-line bg-paper-dim">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                    Not generated yet
                  </span>
                </div>
              )}
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
                Download QR
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
