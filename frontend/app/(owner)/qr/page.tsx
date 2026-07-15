"use client";

import { useEffect, useState } from "react";
import { api, ApiError, BASE_URL } from "@/lib/api";
import PageHeader from "@/components/PageHeader";

const QR_THEMES = [
  { name: "Warm Ticket", accent: "#C1481D", bg: "#FBF3E7" },
  { name: "Modern Green", accent: "#5F7A52", bg: "#F4F8EF" },
  { name: "Premium Dark", accent: "#D99A32", bg: "#241A14" },
  { name: "Soft Plum", accent: "#8B3A56", bg: "#FFF6F8" },
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

type RestaurantRecord = {
  id: string;
  restaurant_name: string;
  short_code?: string;
  theme_name?: string;
  qr_code_url?: string;
  google_review_url?: string;
};

export default function QrPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantRecord[]>([]);
  
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);
  const [qrCodePath, setQrCodePath] = useState<string | null>(null);
  
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState(QR_THEMES[0]);

  // Labels checkboxes
  const [showName, setShowName] = useState(true);
  const [showUrl, setShowUrl] = useState(true);
  const [showReminder, setShowReminder] = useState(true);
  const [showAddress, setShowAddress] = useState(false);

  useEffect(() => {
    document.title = "Review QR Card Generator | GenReviewAI";
    const ownerId = localStorage.getItem("gr_owner_id") || "";
    const activeId = localStorage.getItem("gr_restaurant_id") || "";

    if (ownerId) {
      api.listRestaurants(ownerId)
        .then((res) => {
          const list = (res && res.restaurants || []) as RestaurantRecord[];
          setRestaurants(list);
          if (list.length > 0) {
            const target = list.find(r => r.id === activeId) || list[0];
            selectRestaurant(target);
            // If restaurant has no short_code yet, generate one for the selected restaurant
            if (!target.short_code) {
              setTimeout(() => {
                void handleGenerate(false, target.id);
              }, 100);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to load restaurants for QR:", err);
          setError("Failed to fetch restaurants list.");
        });
    }
  }, []);

  function selectRestaurant(restaurant: RestaurantRecord) {
    setRestaurantId(restaurant.id);
    setSelectedRestaurantId(restaurant.id);
    setRestaurantName(restaurant.restaurant_name);
    
    const sc = restaurant.short_code || null;
    setShortCode(sc);

    if (sc) {
      // Always derive QR path live from short_code — no button click needed
      const livePath = `qr/image/${sc}.png`;
      setQrCodePath(restaurant.qr_code_url || livePath);
      setReviewUrl(`${window.location.origin}/r/${sc}`);
    } else {
      setQrCodePath(null);
      setReviewUrl(null);
    }

    const savedTheme = localStorage.getItem(`gr_theme_${restaurant.id}`) || localStorage.getItem("gr_active_theme");
    const matchedTheme = QR_THEMES.find(t => t.name === (restaurant.theme_name || savedTheme)) || QR_THEMES[0];
    setSelectedTheme(matchedTheme);
  }

  function handleRestaurantChange(id: string) {
    const found = restaurants.find(r => r.id === id);
    if (found) {
      selectRestaurant(found);
      localStorage.setItem("gr_restaurant_id", found.id);
      localStorage.setItem("gr_restaurant_name", found.restaurant_name);
      localStorage.setItem("gr_restaurant_short_code", found.short_code || "");
      localStorage.setItem("gr_active_theme", found.theme_name || QR_THEMES[0].name);
    }
  }

  async function handleGenerate(force: boolean = false, restaurantIdToUse: string | null = restaurantId) {
    const targetRestaurantId = restaurantIdToUse || restaurantId;
    if (!targetRestaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateQr(targetRestaurantId, force);
      const data = res as Record<string, unknown>;

      if (data.success === false) {
        const message = (data.message as string) || "Unable to generate QR code.";
        setError(message);
        return;
      }

      const sc = (data.short_code as string) || null;
      const path = (data.qr_path as string) || null;

      setShortCode(sc);
      setQrCodePath(path || (sc ? `qr/image/${sc}.png` : null));

      if (sc) {
        setReviewUrl(`${window.location.origin}/r/${sc}`);
        localStorage.setItem("gr_restaurant_short_code", sc);
      }

      // Update restaurant list in state
      setRestaurants(prev => prev.map(r => r.id === targetRestaurantId ? { ...r, short_code: sc || undefined, qr_code_url: path || undefined } : r));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const resolvedSrc = shortCode
    ? `${BASE_URL}/qr/image/${shortCode}.png`
    : qrCodePath
      ? qrCodePath.startsWith("http")
        ? qrCodePath
        : `${BASE_URL}/${qrCodePath.replace(/\\/g, "/")}`
      : undefined;

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        eyebrow="Customer review link"
        title="Review QR Card"
        description="Select a restaurant to view or generate its customer-facing review QR code. Print the card and display on tables."
      />

      <div className="grid gap-6 px-8 py-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <div className="border border-line bg-paper p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-semibold text-ink-soft">
                  Outlet / Restaurant
                </span>
                <select
                  value={selectedRestaurantId}
                  onChange={(e) => handleRestaurantChange(e.target.value)}
                  className="w-full border border-line bg-paper-dim px-3.5 py-2.5 text-ink outline-none focus:border-paprika text-sm font-medium"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.restaurant_name}
                    </option>
                  ))}
                  {restaurants.length === 0 && (
                    <option value="">No restaurants configured</option>
                  )}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block font-semibold text-ink-soft">
                  Card theme style
                </span>
                <select
                  value={selectedTheme.name}
                  onChange={(e) => {
                    const theme = QR_THEMES.find((item) => item.name === e.target.value);
                    if (theme) {
                      setSelectedTheme(theme);
                      if (restaurantId) {
                        localStorage.setItem(`gr_theme_${restaurantId}`, theme.name);
                      }
                      localStorage.setItem("gr_active_theme", theme.name);
                    }
                  }}
                  className="w-full border border-line bg-paper-dim px-3.5 py-2.5 text-ink outline-none focus:border-paprika text-sm font-medium"
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
                  Review short code
                </p>
                <p className="mt-1 font-mono text-paprika font-semibold">{shortCode || "Create one below"}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  Active state
                </p>
                <p className="mt-1 text-ink-soft font-medium">Ready for scans</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  Palette Colors
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
              Configure QR Card Labels
            </p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <label className="flex items-center gap-2 text-ink-soft font-medium cursor-pointer">
                <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} className="accent-paprika cursor-pointer" />
                Show Restaurant Name
              </label>
              <label className="flex items-center gap-2 text-ink-soft font-medium cursor-pointer">
                <input type="checkbox" checked={showUrl} onChange={(e) => setShowUrl(e.target.checked)} className="accent-paprika cursor-pointer" />
                Show Short Review URL
              </label>
              <label className="flex items-center gap-2 text-ink-soft font-medium cursor-pointer">
                <input type="checkbox" checked={showReminder} onChange={(e) => setShowReminder(e.target.checked)} className="accent-paprika cursor-pointer" />
                Show Review Reminder Text
              </label>
              <label className="flex items-center gap-2 text-ink-soft font-medium cursor-pointer">
                <input type="checkbox" checked={showAddress} onChange={(e) => setShowAddress(e.target.checked)} className="accent-paprika cursor-pointer" />
                Show Address Details
              </label>
            </div>
          </div>

          <div className="border border-line bg-paper p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              QR Guidelines
            </p>
            <p className="mt-2 text-xs text-ink-soft leading-relaxed">
              Place the QR cards on tables, billing counters, or menus. Unhappy customers (ratings below threshold) will be seamlessly guided to write private feedback, while happy ones write public reviews.
            </p>
          </div>
        </div>

        <div className="border border-line bg-paper p-6 text-center flex flex-col justify-between">
          <div className="mx-auto w-full max-w-xs border p-6 shadow-md transition-all duration-300" style={{ backgroundColor: selectedTheme.bg, borderColor: selectedTheme.accent }}>
            {showReminder && (
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] font-semibold" style={{ color: selectedTheme.accent }}>
                Tell us how we did
              </p>
            )}
            {showName && (
              <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-ink">
                {restaurantName || "Your Restaurant"}
              </h2>
            )}
            <p className="mt-1 text-xs text-ink-soft">
              Scan, rate, and share your experience.
            </p>
            <div className="mx-auto my-5 flex h-52 w-52 items-center justify-center border bg-white p-3 shadow-inner" style={{ borderColor: selectedTheme.accent }}>
              {resolvedSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolvedSrc} alt="Restaurant QR code" className="h-full w-full object-contain" />
              ) : (
                <NormalQrPreview />
              )}
            </div>
            <div className="mx-auto flex max-w-[200px] items-center justify-center gap-1 text-amber-dark">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} viewBox="0 0 24 24" className="h-5 w-5 fill-amber stroke-amber-dark" strokeWidth={1.2}>
                  <path d="M12 2.5l2.9 6.32 6.85.72-5.12 4.7 1.42 6.86L12 17.9l-6.05 3.2 1.42-6.86-5.12-4.7 6.85-.72L12 2.5z" />
                </svg>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-soft italic">
              Takes less than 10 seconds.
            </p>
            {showUrl && (
              <p className="mt-3 break-all font-mono text-[9px] text-ink-faint font-semibold tracking-tight">
                {reviewUrl || "Link will generate below"}
              </p>
            )}
          </div>

          <div className="mt-6 space-y-2">
            {/* Always show Download if QR is live */}
            {resolvedSrc ? (
              <a
                href={resolvedSrc}
                download={`${restaurantName.replace(/\s+/g, "_")}_QR.png`}
                target="_blank"
                rel="noreferrer"
                className="block w-full bg-paprika px-5 py-3 text-center text-sm font-semibold tracking-wider text-paper hover:bg-paprika-dark uppercase transition-all"
              >
                ⬇ Download QR for Print
              </a>
            ) : (
              <button
                type="button"
                onClick={() => handleGenerate(false)}
                disabled={loading || !restaurantId}
                className="w-full bg-paprika px-5 py-3 text-sm font-semibold text-paper tracking-wider uppercase hover:bg-paprika-dark disabled:opacity-60 transition-all"
              >
                {loading ? "Generating QR..." : "Create review QR"}
              </button>
            )}
            {shortCode && (
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                disabled={loading}
                className="w-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft hover:border-ink hover:text-ink hover:bg-paper-dim uppercase transition-all"
              >
                {loading ? "Resetting..." : "Reset and create new QR"}
              </button>
            )}
            {error && <p className="mt-4 text-xs text-plum-dark font-medium">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
