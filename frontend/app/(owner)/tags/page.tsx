"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import PageHeader from "@/components/PageHeader";

export default function TagsPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restaurantId = localStorage.getItem("gr_restaurant_id");
    if (!restaurantId) {
      setError("No restaurant is linked to this account yet.");
      setLoading(false);
      return;
    }
    api
      .getTags(restaurantId)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as { tags: string[] }).tags || [];
        setTags(list);
      })
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="One-tap words"
        title="Tags"
        description="The descriptive tags customers tap after rating 4 stars or higher — they shape the AI's draft."
      />

      <div className="px-8 py-8">
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
            {tags.length === 0 ? (
              <p className="text-sm text-ink-faint">
                No tags configured yet for this restaurant.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
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
      </div>
    </div>
  );
}
