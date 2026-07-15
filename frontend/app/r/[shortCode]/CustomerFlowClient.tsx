"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import StarRating from "@/components/StarRating";
import TicketCard from "@/components/TicketCard";

function hexToRgbStr(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function getThemeStyles(themeName: string) {
  let accent = "#C1481D";
  let bg = "#FBF3E7";
  let text = "#241A14";

  if (themeName === "Modern Green") {
    accent = "#5F7A52";
    bg = "#F4F8EF";
    text = "#1F2A1C";
  } else if (themeName === "Premium Dark") {
    accent = "#D99A32";
    bg = "#241A14";
    text = "#FFFFFF";
  } else if (themeName === "Soft Plum") {
    accent = "#8B3A56";
    bg = "#FFF6F8";
    text = "#2B1820";
  }

  const isDark = themeName === "Premium Dark";
  const paperDim = isDark ? "#17100c" : "#F1E4CE";
  const paperDeep = isDark ? "#100a07" : "#E7D6B6";
  const line = isDark ? "#382920" : "#D8C6A8";
  
  const inkSoft = isDark ? "#e0d8d3" : "#5C4A3D";
  const inkFaint = isDark ? "#b0a096" : "#8A7566";

  const accentDark = isDark ? "#c28827" : "#96380F";
  const accentLight = isDark ? "#e3ad54" : "#E06B3C";

  return {
    "--color-paper": hexToRgbStr(bg),
    "--color-paper-dim": hexToRgbStr(paperDim),
    "--color-paper-deep": hexToRgbStr(paperDeep),
    "--color-ink": hexToRgbStr(text),
    "--color-ink-soft": hexToRgbStr(inkSoft),
    "--color-ink-faint": hexToRgbStr(inkFaint),
    "--color-paprika": hexToRgbStr(accent),
    "--color-paprika-dark": hexToRgbStr(accentDark),
    "--color-paprika-light": hexToRgbStr(accentLight),
    "--color-line": hexToRgbStr(line),
  } as React.CSSProperties;
}

type Step = "rating" | "tags" | "drafts" | "posted" | "feedback" | "feedback-done";

type RestaurantDetails = {
  id: string;
  restaurant_name?: string;
  brand_name?: string;
  short_code: string;
  google_review_url?: string;
  rating_threshold?: number;
  theme_name?: string;
};

const DEFAULT_THRESHOLD = 4.0;

const FALLBACK_TAGS = [
  "Friendly staff",
  "Great food",
  "Fast service",
  "Good value",
  "Nice ambience",
  "Clean space",
];

function ProgressDots({ step }: { step: Step }) {
  const order: Step[] = ["rating", "tags", "drafts", "posted"];
  const idx = Math.max(order.indexOf(step), 0);
  return (
    <div className="flex justify-center gap-1.5">
      {order.map((s, i) => (
        <span
          key={s}
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            i <= idx ? "bg-paprika" : "bg-line"
          }`}
        />
      ))}
    </div>
  );
}

function useShortCode() {
  const [shortCode, setShortCode] = useState("");
  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const rIndex = parts.indexOf("r");
    if (rIndex !== -1 && parts[rIndex + 1]) {
      setShortCode(parts[rIndex + 1].toUpperCase());
    }
  }, []);
  return shortCode;
}

export default function CustomerFlowClient() {
  const shortCode = useShortCode();

  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const [restaurantError, setRestaurantError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("rating");
  const [rating, setRating] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString());
  }, []);

  const [availableTags, setAvailableTags] = useState<string[]>(FALLBACK_TAGS);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [drafts, setDrafts] = useState<string[]>([]);
  const [draftIndex, setDraftIndex] = useState(0);
  const [editedDraft, setEditedDraft] = useState("");

  const [feedbackText, setFeedbackText] = useState("");
  const [contact, setContact] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);

  const restaurantId = restaurant?.id || shortCode;
  const restaurantName =
    restaurant?.restaurant_name || restaurant?.brand_name || "this restaurant";
  const ratingThreshold = restaurant?.rating_threshold || DEFAULT_THRESHOLD;
  const orderRef = useMemo(
    () => (shortCode || "").slice(0, 8).toUpperCase() || "------",
    [shortCode]
  );

  useEffect(() => {
    if (!shortCode) return;
    setRestaurantLoading(true);
    setRestaurantError(null);

    api
      .getRestaurantByShortCode(shortCode)
      .then((res) => {
        if (!res.restaurant) {
          throw new Error(res.message || "Restaurant not found");
        }
        setRestaurant(res.restaurant);
      })
      .catch((err) => {
        setRestaurantError(err instanceof ApiError ? err.message : String(err));
      })
      .finally(() => setRestaurantLoading(false));
  }, [shortCode]);

  useEffect(() => {
    if (!restaurantId) return;
    api
      .getTags(restaurantId)
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : res && typeof res === "object" && "tags" in res
          ? (res as { tags: string[] }).tags
          : [];
        if (list && list.length > 0) setAvailableTags(list);
      })
      .catch(() => {
        /* fall back to defaults silently */
      });
  }, [restaurantId]);

  async function handleRating(value: number) {
    setRating(value);
    setError(null);
    if (value >= ratingThreshold) {
      setStep("tags");
    } else {
      setStep("feedback");
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 2
        ? [...prev, tag]
        : prev
    );
  }

  async function handleGenerateDrafts() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateReview({
        restaurant_id: restaurantId,
        rating,
        selected_tags: selectedTags,
      });
      const list =
        (res as { drafts?: string[] }).drafts ||
        (Array.isArray(res) ? (res as unknown as string[]) : []);
      const finalDrafts =
        list && list.length > 0
          ? list
          : [
              `Really enjoyed my visit to ${restaurantName} - ${selectedTags.join(", ").toLowerCase() || "great experience overall"}. Would come back again.`,
            ];
      setDrafts(finalDrafts);
      setEditedDraft(finalDrafts[0]);
      setStep("drafts");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handlePost() {
    setLoading(true);
    setError(null);
    try {
      await api.submitReview({
        restaurant_id: restaurantId,
        customer_name: customerName || "Guest",
        rating,
        review_text: editedDraft,
      });

      try {
        await navigator.clipboard.writeText(editedDraft);
      } catch {
        /* clipboard may be unavailable */
      }

      try {
        const res = await api.getGoogleReviewUrl(restaurantId);
        const url =
          (res as { google_review_link?: string; url?: string }).google_review_link ||
          (res as { google_review_link?: string; url?: string }).url ||
          restaurant?.google_review_url ||
          null;
        setGoogleUrl(url);
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      } catch {
        /* still show the thank-you screen even if redirect lookup fails */
      }

      setStep("posted");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedbackSubmit() {
    setLoading(true);
    setError(null);
    try {
      await api.submitPrivateFeedback({
        restaurant_id: restaurantId,
        customer_name: contact || "Guest",
        rating,
        feedback_text: feedbackText,
      });
      setStep("feedback-done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handlePostAnyway() {
    try {
      const res = await api.getGoogleReviewUrl(restaurantId);
      const url =
        (res as { google_review_link?: string; url?: string }).google_review_link ||
        (res as { google_review_link?: string; url?: string }).url ||
        restaurant?.google_review_url;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      if (restaurant?.google_review_url) {
        window.open(restaurant.google_review_url, "_blank", "noopener,noreferrer");
      }
    }
  }

  if (restaurantLoading) {
    return (
      <div className="grain flex min-h-screen items-center justify-center bg-paper-dim px-4 py-10">
        <TicketCard className="w-full max-w-sm animate-print-in text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paprika">
            Loading restaurant
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            One moment...
          </h1>
        </TicketCard>
      </div>
    );
  }

  if (restaurantError || !restaurant) {
    return (
      <div className="grain flex min-h-screen items-center justify-center bg-paper-dim px-4 py-10">
        <TicketCard className="w-full max-w-sm animate-print-in text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-plum">
            QR code not found
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            This review link is unavailable
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Please ask the restaurant for a fresh QR code.
          </p>
          {restaurantError && (
            <p className="mt-4 text-xs text-ink-faint">{restaurantError}</p>
          )}
        </TicketCard>
      </div>
    );
  }

  const themeStyles = useMemo(() => {
    return getThemeStyles(restaurant?.theme_name || "Warm Ticket");
  }, [restaurant?.theme_name]);

  return (
    <div 
      className="grain flex min-h-screen flex-col items-center justify-center bg-paper-dim px-4 py-10"
      style={themeStyles}
    >
      <div className="w-full max-w-sm">
        <TicketCard className="animate-print-in">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            <span>Ticket #{orderRef}</span>
            <span>{dateStr}</span>
          </div>

          <div className="my-5">
            <ProgressDots step={step} />
          </div>

          {step === "rating" && (
            <div className="animate-fade-up text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paprika">
                Thanks for visiting
              </p>
              <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
                {restaurantName}
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                How was your visit today?
              </p>
              <div className="mt-8">
                <StarRating value={rating} onChange={handleRating} />
              </div>
            </div>
          )}

          {step === "tags" && (
            <div className="animate-fade-up">
              <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-paprika">
                {"*".repeat(rating)} rating logged
              </p>
              <h2 className="mt-1 text-center font-display text-xl font-semibold text-ink">
                What stood out?
              </h2>
              <p className="mt-1 text-center text-sm text-ink-soft">
                Pick up to two - it helps the draft sound right.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {availableTags.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                        selected
                          ? "border-paprika bg-paprika text-paper"
                          : "border-line bg-paper text-ink-soft hover:border-paprika/50"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleGenerateDrafts}
                disabled={loading}
                className="mt-8 w-full bg-paprika px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-paprika-dark disabled:opacity-60"
              >
                {loading ? "Writing your draft..." : "Get review draft"}
              </button>
            </div>
          )}

          {step === "drafts" && (
            <div className="animate-fade-up">
              <h2 className="text-center font-display text-xl font-semibold text-ink">
                Pick a starting point
              </h2>
              <p className="mt-1 text-center text-sm text-ink-soft">
                Edit it however you like - it should sound like you.
              </p>

              <div className="mt-5 space-y-2">
                {drafts.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDraftIndex(i);
                      setEditedDraft(d);
                    }}
                    className={`w-full rounded-sm border px-4 py-3 text-left text-sm transition-colors ${
                      draftIndex === i
                        ? "border-paprika bg-paprika/5"
                        : "border-line bg-paper hover:border-paprika/40"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <label className="mt-4 block text-sm">
                <span className="mb-1.5 block font-medium text-ink-soft">
                  Your review
                </span>
                <textarea
                  value={editedDraft}
                  onChange={(e) => setEditedDraft(e.target.value)}
                  rows={4}
                  className="w-full resize-none border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-paprika"
                />
              </label>

              <label className="mt-3 block text-sm">
                <span className="mb-1.5 block font-medium text-ink-soft">
                  Your name <span className="text-ink-faint">(optional)</span>
                </span>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-paprika"
                  placeholder="Guest"
                />
              </label>

              <button
                onClick={handlePost}
                disabled={loading || !editedDraft.trim()}
                className="mt-6 w-full bg-paprika px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-paprika-dark disabled:opacity-60"
              >
                {loading ? "Posting..." : "Copy & post on Google"}
              </button>
            </div>
          )}

          {step === "posted" && (
            <div className="animate-fade-up py-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-sage text-sage-dark">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-semibold text-ink">
                Copied to your clipboard
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                {googleUrl
                  ? "Paste it into the Google tab we opened, set your star rating, and submit - that's what makes it count."
                  : "Paste it into your Google review and submit - that's what makes it count."}
              </p>
              {googleUrl && (
                <a
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block w-full bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink-soft"
                >
                  Open Google review page
                </a>
              )}
            </div>
          )}

          {step === "feedback" && (
            <div className="animate-fade-up">
              <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-plum">
                {`${rating}/5`}
              </p>
              <h2 className="mt-1 text-center font-display text-xl font-semibold text-ink">
                We're sorry it wasn't perfect
              </h2>
              <p className="mt-1 text-center text-sm text-ink-soft">
                Tell us what happened - the owner sees this right away.
              </p>

              <label className="mt-6 block text-sm">
                <span className="mb-1.5 block font-medium text-ink-soft">
                  What went wrong?
                </span>
                <textarea
                  required
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  placeholder="Tell us in your own words..."
                  className="w-full resize-none border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-paprika"
                />
              </label>

              <label className="mt-3 block text-sm">
                <span className="mb-1.5 block font-medium text-ink-soft">
                  Contact info <span className="text-ink-faint">(optional)</span>
                </span>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Phone or email, if you'd like a reply"
                  className="w-full border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-paprika"
                />
              </label>

              <button
                onClick={handleFeedbackSubmit}
                disabled={loading || !feedbackText.trim()}
                className="mt-6 w-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send private feedback"}
              </button>

              <button
                onClick={handlePostAnyway}
                className="mt-3 w-full text-center text-xs text-ink-faint underline underline-offset-2 hover:text-ink-soft"
              >
                Post this on Google anyway
              </button>
            </div>
          )}

          {step === "feedback-done" && (
            <div className="animate-fade-up py-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink text-ink">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-semibold text-ink">
                Got it - thank you
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                The owner has been notified and will follow up if you left contact info.
              </p>
              <button
                onClick={handlePostAnyway}
                className="mt-6 w-full border border-line px-5 py-3 text-sm text-ink-soft hover:border-ink"
              >
                Post this on Google anyway
              </button>
            </div>
          )}

          {error && (
            <p className="mt-4 text-center text-sm text-plum-dark">{error}</p>
          )}
        </TicketCard>

        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-ink-faint">
          Powered by GenReviewAI
        </p>
      </div>
    </div>
  );
}
