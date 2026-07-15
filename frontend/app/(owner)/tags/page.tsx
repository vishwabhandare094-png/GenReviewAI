"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import PageHeader from "@/components/PageHeader";

const TAG_SUGGESTIONS = {
  Positive: [
    "Great food",
    "Fast service",
    "Friendly staff",
    "Clean space",
    "Good value",
    "Nice ambience",
    "Family friendly",
    "Fresh ingredients",
  ],
  Publicity: [
    "Best biryani in town",
    "Perfect for dinner",
    "Must-visit cafe",
    "Great weekend spot",
    "Quick lunch place",
    "Authentic taste",
  ],
  Recovery: [
    "Slow service",
    "Food was cold",
    "Billing issue",
    "Staff behavior",
    "Cleanliness issue",
    "Long waiting time",
  ],
};

export default function TagsPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Review Tags Manager | GenReviewAI";
    const restaurantId = localStorage.getItem("gr_restaurant_id");
    if (!restaurantId) {
      setError("No restaurant is linked to this account yet.");
      setLoading(false);
      return;
    }
    api
      .getTags(restaurantId)
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : res && typeof res === "object" && "tags" in res
          ? (res as { tags: string[] }).tags || []
          : [];
        setTags(list);
      })
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function addDraftTag(tag: string) {
    setDraftTags((current) => current.includes(tag) ? current : [...current, tag]);
  }

  function removeDraftTag(tag: string) {
    setDraftTags((current) => current.filter((item) => item !== tag));
  }

  function handleCustomTag() {
    const next = customTag.trim();
    if (!next) return;
    addDraftTag(next);
    setCustomTag("");
  }

  return (
    <div>
      <PageHeader
        eyebrow="One-tap words"
        title="Tags"
        description="The descriptive tags customers tap after rating 4 stars or higher — they shape the AI's draft."
      />

      <div className="grid gap-6 px-8 py-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
        {loading && (
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
            Loading tags…
          </p>
        )}

        {error && !loading && (
          <div className="border border-plum/30 bg-plum/5 px-5 py-4 text-sm text-plum-dark">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="border border-line bg-paper p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              Active customer tags
            </p>
            {tags.length === 0 ? (
              <p className="mt-4 text-sm text-ink-faint">
                No tags configured yet for this restaurant.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-paprika/40 bg-paprika/5 px-4 py-1.5 text-sm text-paprika-dark"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

          <div className="border border-line bg-paper p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              Suggested tags
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Owners can choose quick customer words and publicity phrases for each restaurant.
            </p>

            <div className="mt-5 space-y-5">
              {Object.entries(TAG_SUGGESTIONS).map(([group, items]) => (
                <div key={group}>
                  <p className="mb-2 text-sm font-medium text-ink">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addDraftTag(tag)}
                        className="rounded-full border border-line bg-paper-dim px-3 py-1.5 text-sm text-ink-soft hover:border-paprika hover:text-paprika"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="border border-line bg-paper p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
            Preview set
          </p>
          <div className="mt-4 flex gap-2">
            <input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Add your own tag"
              className="min-w-0 flex-1 border border-line bg-paper-dim px-3 py-2 text-sm outline-none focus:border-paprika"
            />
            <button
              onClick={handleCustomTag}
              className="bg-ink px-4 py-2 text-sm text-paper hover:bg-ink-soft"
            >
              Add
            </button>
          </div>

          <div className="mt-5 min-h-36 border border-dashed border-line bg-paper-dim p-4">
            {draftTags.length === 0 ? (
              <p className="text-sm text-ink-faint">
                Pick suggestions to preview the tag set before saving.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {draftTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => removeDraftTag(tag)}
                    className="rounded-full border border-paprika bg-paprika/5 px-3 py-1.5 text-sm text-paprika-dark"
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="mt-5 w-full bg-paprika px-5 py-3 text-sm font-medium text-paper opacity-70"
            title="Backend save will be added after approval"
          >
            Save tag set preview
          </button>
          <p className="mt-3 text-xs text-ink-faint">
            UI preview only. After approval, these tags will be stored per restaurant.
          </p>
        </aside>
      </div>
    </div>
  );
}
