"use client";

import { useEffect, useState } from "react";
import { api, ApiError, BASE_URL } from "@/lib/api";
import PageHeader from "@/components/PageHeader";

const DEMO_RESTAURANTS = [
  { id: "current", name: "Current restaurant", code: "" },
  { id: "branch-1", name: "Downtown branch", code: "DWNTA123" },
  { id: "branch-2", name: "Airport branch", code: "AIRPT456" },
];

const QR_THEMES = [
  { name: "Warm Table Card", accent: "#C1481D", bg: "#FBF3E7" },
  { name: "Clean Counter Card", accent: "#241A14", bg: "#FFFFFF" },
  { name: "Fresh Cafe Card", accent: "#5F7A52", bg: "#F4F8EF" },
];

const QR_PATTERN = [
  "11111110010101111111",
  "10000010111101000001",
  "10111010001001011101",
  "10111010110101011101",
  "10111010100101011101",
  "10000010101001000001",
  "11111110101011111111",
  "00000000111100000000",
  "11101011100011101011",
  "00110100110100110100",
  "11001111001111001111",
  "01010001010001010010",
  "11111110010111101010",
  "10000010111100110111",
  "10111010001011100010",
  "10111010110100111101",
  "10111010100111001011",
  "10000010101001110001",
  "11111110111010101111",
  "00000000100101010000",
];

function NormalQrPreview() {
  return (
    <div
      className="grid h-full w-full gap-[2px] bg-white p-2"
      style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))" }}
    >
      {QR_PATTERN.flatMap((row, y) =>
        row.split("").map((cell, x) => (
          <span
            key={`${x}-${y}`}
            className={cell === "1" ? "bg-ink" : "bg-white"}
          />
        ))
      )}
    </div>
  );
}

export default function QrPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState("current");
  const [selectedTheme, setSelectedTheme] = useState(QR_THEMES[0]);

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
        eyebrow="Customer review link"
        title="Review QR"
        description="Create one friendly QR card for each restaurant. Print it once and customers can scan it again and again."
      />

      <div className="grid gap-6 px-8 py-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <div className="border border-line bg-paper p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-ink-soft">
                  Restaurant
                </span>
                <select
                  value={selectedRestaurant}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  className="w-full border border-line bg-paper-dim px-3.5 py-2.5 text-ink outline-none focus:border-paprika"
                >
                  <option value="current">{restaurantName || "Current restaurant"}</option>
                  {DEMO_RESTAURANTS.slice(1).map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-ink-soft">
                  Card style
                </span>
                <select
                  value={selectedTheme.name}
                  onChange={(e) => {
                    const theme = QR_THEMES.find((item) => item.name === e.target.value);
                    if (theme) setSelectedTheme(theme);
                  }}
                  className="w-full border border-line bg-paper-dim px-3.5 py-2.5 text-ink outline-none focus:border-paprika"
                >
                  {QR_THEMES.map((theme) => (
                    <option key={theme.name}>{theme.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-4 border-t border-line pt-5 text-sm md:grid-cols-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  Review code
                </p>
                <p className="mt-1 font-mono text-paprika">{shortCode || "Create one below"}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  Works for
                </p>
                <p className="mt-1 text-ink-soft">Unlimited customer scans</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  Selected style
                </p>
                <div className="mt-2 flex gap-1.5">
                  <span className="h-5 w-5 border border-line" style={{ backgroundColor: selectedTheme.accent }} />
                  <span className="h-5 w-5 border border-line" style={{ backgroundColor: selectedTheme.bg }} />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-line bg-paper p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              Show on printed card
            </p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <label className="flex items-center gap-2 text-ink-soft">
                <input type="checkbox" defaultChecked className="accent-paprika" />
                Restaurant name
              </label>
              <label className="flex items-center gap-2 text-ink-soft">
                <input type="checkbox" defaultChecked className="accent-paprika" />
                Short review URL
              </label>
              <label className="flex items-center gap-2 text-ink-soft">
                <input type="checkbox" defaultChecked className="accent-paprika" />
                Review reminder
              </label>
              <label className="flex items-center gap-2 text-ink-soft">
                <input type="checkbox" className="accent-paprika" />
                Address line
              </label>
            </div>
          </div>

          <div className="border border-line bg-paper p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              Simple rule
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Keep the same QR on your tables. Use reset only when you want to retire the old card
              and print a new one.
            </p>
          </div>
        </div>

        <div className="border border-line bg-paper p-6 text-center">
          <div className="mx-auto max-w-xs border p-5 shadow-sm" style={{ backgroundColor: selectedTheme.bg, borderColor: selectedTheme.accent }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: selectedTheme.accent }}>
              Tell us how we did
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink">
              {restaurantName || "Your Restaurant"}
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Scan, rate, and share your experience.
            </p>
            <div className="mx-auto my-5 flex h-52 w-52 items-center justify-center border bg-white p-3" style={{ borderColor: selectedTheme.accent }}>
              {resolvedSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolvedSrc} alt="Restaurant QR code" className="h-full w-full object-contain" />
              ) : (
                <NormalQrPreview />
              )}
            </div>
            <div className="mx-auto flex max-w-[220px] items-center justify-center gap-1 text-amber-dark">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} viewBox="0 0 24 24" className="h-5 w-5 fill-amber stroke-amber-dark" strokeWidth={1.2}>
                  <path d="M12 2.5l2.9 6.32 6.85.72-5.12 4.7 1.42 6.86L12 17.9l-6.05 3.2 1.42-6.86-5.12-4.7 6.85-.72L12 2.5z" />
                </svg>
              ))}
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              It takes less than 10 seconds.
            </p>
            <p className="mt-3 break-all font-mono text-[10px] text-ink-faint">
              {reviewUrl || "QR link appears after generation"}
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-paprika px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-paprika-dark disabled:opacity-60"
            >
              {loading ? "Preparing..." : shortCode ? "Keep this QR active" : "Create review QR"}
            </button>
            {resolvedSrc && (
              <a
                href={resolvedSrc}
                download
                className="block w-full bg-ink px-5 py-3 text-center text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
              >
                Download QR image
              </a>
            )}
            {shortCode && (
              <button
                className="w-full border border-line px-5 py-2.5 text-sm text-ink-soft hover:border-ink"
              >
                Reset and create a new QR
              </button>
            )}
          {error && <p className="mt-4 text-sm text-plum-dark">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
