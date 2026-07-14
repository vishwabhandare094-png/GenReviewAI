"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import StarRating from "@/components/StarRating";
import TicketCard from "@/components/TicketCard";

type Step = "rating" | "tags" | "drafts" | "posted" | "feedback" | "feedback-done";

// The backend doesn't currently expose a public "get restaurant" endpoint,
// so the threshold below mirrors the PRD default (4.0). Swap for a real
// fetched value once a public restaurant-details endpoint exists.
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

export default function CustomerFlowPage() {
  const params = useParams<{ restaurantId: string }>();
  const restaurantId = params.restaurantId;

  const [step, setStep] = useState<Step>("rating");
  const [rating, setRating] = useState(0);
  const [customerName, setCustomerName] = useState("");

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

  const orderRef = useMemo(
    () => (restaurantId || "").slice(0, 8).toUpperCase() || "——————",
    [restaurantId]
  );

  useEffect(() => {
    if (!restaurantId) return;
    api
      .getTags(restaurantId)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as { tags: string[] }).tags;
        if (list && list.length > 0) setAvailableTags(list);
      })
      .catch(() => {
        /* fall back to defaults silently — this is a low-stakes screen */
      });
  }, [restaurantId]);

  async function handleRating(value: number) {
    setRating(value);
    setError(null);
    if (value >= DEFAULT_THRESHOLD) {
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
              `Really enjoyed my visit — ${selectedTags.join(", ").toLowerCase() || "great experience overall"}. Would come back again.`,
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
        /* clipboard may be unavailable — not fatal */
      }

      try {
        const res = await api.getGoogleReviewUrl(restaurantId);
        const url =
          (res as { google_review_link?: string; url?: string }).google_review_link ||
          (res as { google_review_link?: string; url?: string }).url ||
          null;
        setGoogleUrl(url);
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      } catch {
        /* still show the thank-you screen even if the redirect lookup fails */
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
        (res as { google_review_link?: string; url?: string }).url;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      /* no-op */
    }
  }

  return (
    <div className="grain flex min-h-screen flex-col items-center justify-center bg-paper-dim px-4 py-10">
      <div className="w-full max-w-sm">
        <TicketCard className="animate-print-in">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            <span>Ticket #{orderRef}</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>

          <div className="my-5">
            <ProgressDots step={step} />
          </div>

          {/* STEP: rating */}
          {step === "rating" && (
            <div className="animate-fade-up text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paprika">
                Thanks for visiting
              </p>
              <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
                How was it?
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                One tap — no forms, no login.
              </p>
              <div className="mt-8">
                <StarRating value={rating} onChange={handleRating} />
              </div>
            </div>
          )}

          {/* STEP: tags */}
          {step === "tags" && (
            <div className="animate-fade-up">
              <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-paprika">
                {"★".repeat(rating)} rating logged
              </p>
              <h2 className="mt-1 text-center font-display text-xl font-semibold text-ink">
                What stood out?
              </h2>
              <p className="mt-1 text-center text-sm text-ink-soft">
                Pick up to two — it helps the draft sound right.
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
                {loading ? "Writing your draft…" : "Get review draft"}
              </button>
            </div>
          )}

          {/* STEP: drafts */}
          {step === "drafts" && (
            <div className="animate-fade-up">
              <h2 className="text-center font-display text-xl font-semibold text-ink">
                Pick a starting point
              </h2>
              <p className="mt-1 text-center text-sm text-ink-soft">
                Edit it however you like — it should sound like you.
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
                {loading ? "Posting…" : "Copy & post on Google"}
              </button>
            </div>
          )}

          {/* STEP: posted */}
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
                  ? "Paste it into the Google tab we opened, set your star rating, and submit — that's what makes it count."
                  : "Paste it into your Google review and submit — that's what makes it count."}
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

          {/* STEP: feedback (below threshold) */}
          {step === "feedback" && (
            <div className="animate-fade-up">
              <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-plum">
                {"★".repeat(rating)}{"☆".repeat(5 - rating)}
              </p>
              <h2 className="mt-1 text-center font-display text-xl font-semibold text-ink">
                We're sorry it wasn't perfect
              </h2>
              <p className="mt-1 text-center text-sm text-ink-soft">
                Tell us what happened — the owner sees this right away.
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
                  placeholder="Tell us in your own words…"
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
                {loading ? "Sending…" : "Send private feedback"}
              </button>

              <button
                onClick={handlePostAnyway}
                className="mt-3 w-full text-center text-xs text-ink-faint underline underline-offset-2 hover:text-ink-soft"
              >
                Post this on Google anyway
              </button>
            </div>
          )}

          {/* STEP: feedback-done */}
          {step === "feedback-done" && (
            <div className="animate-fade-up py-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink text-ink">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-semibold text-ink">
                Got it — thank you
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
