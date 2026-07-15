"use client";

import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import PageHeader from "@/components/PageHeader";

const KNOWLEDGE_SUGGESTIONS = [
  "Signature dishes and best sellers",
  "Restaurant story and owner background",
  "Ambience, seating, and family-friendly details",
  "Offers, lunch combos, and happy hours",
  "Cuisine style and special ingredients",
  "Service promises like quick lunch or late-night dining",
];

const EXAMPLE_KNOWLEDGE: Record<string, string> = {
  "Signature dishes and best sellers":
    "Our best sellers are paneer tikka, butter chicken, and garlic naan. Customers often visit us for rich North Indian flavors and generous portions.",
  "Restaurant story and owner background":
    "The restaurant is family-run and started with a small kitchen focused on homestyle recipes and warm service.",
  "Ambience, seating, and family-friendly details":
    "We have comfortable indoor seating, soft lighting, and a calm family-friendly atmosphere suitable for dinner and small celebrations.",
  "Offers, lunch combos, and happy hours":
    "Weekday lunch combos are served quickly and include a main dish, bread, rice, and a drink.",
  "Cuisine style and special ingredients":
    "Our food focuses on fresh spices, slow-cooked gravies, and made-to-order breads from the tandoor.",
  "Service promises like quick lunch or late-night dining":
    "We are known for quick weekday lunch service and attentive staff during peak dinner hours.",
};

export default function KnowledgePage() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<unknown>(null);

  function restaurantId() {
    const id = localStorage.getItem("gr_restaurant_id");
    if (!id) throw new Error("No restaurant is linked to this account yet.");
    return id;
  }

  function useSuggestion(label: string) {
    setContent(EXAMPLE_KNOWLEDGE[label] || label);
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    try {
      await api.addKnowledge({ restaurant_id: restaurantId(), content });
      setSavedMsg("Added to the knowledge base.");
      setContent("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setSearching(true);
    setError(null);
    setResults(null);
    try {
      const res = await api.searchKnowledge({ restaurant_id: restaurantId(), query });
      setResults(res.knowledge ?? res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="RAG"
        title="Knowledge base"
        description="Give the AI real details about your restaurant — menu language, house terms, tone — so drafts sound like you, not a template."
      />

      <div className="grid gap-8 px-8 py-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleAdd} className="border border-line bg-paper p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
            Add knowledge
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Save simple facts the AI can use while writing more accurate review drafts.
          </p>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="e.g. Our signature dish is the smoked paneer tikka. Regulars call our owner 'Chef R'. We're known for fast weekday lunch service."
            className="mt-4 w-full resize-none border border-line bg-paper-dim px-4 py-3 text-sm text-ink outline-none focus:border-paprika"
          />
          <button
            type="submit"
            disabled={saving}
            className="mt-4 bg-paprika px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-paprika-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Add to knowledge base"}
          </button>
          {savedMsg && <p className="mt-3 text-sm text-sage-dark">{savedMsg}</p>}
        </form>

        <form onSubmit={handleSearch} className="border border-line bg-paper p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
            Test retrieval
          </p>
          <input
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. What's the signature dish?"
            className="mt-4 w-full border border-line bg-paper-dim px-4 py-3 text-sm text-ink outline-none focus:border-paprika"
          />
          <button
            type="submit"
            disabled={searching}
            className="mt-4 border border-ink px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-60"
          >
            {searching ? "Searching…" : "Search knowledge"}
          </button>
          {results !== null && (
            <pre className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap break-words bg-paper-dim p-4 font-mono text-xs text-ink-soft">
              {JSON.stringify(results, null, 2)}
            </pre>
          )}
        </form>
        </div>

        <aside className="border border-line bg-paper p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
            Knowledge suggestions
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Click one to fill the editor with a clean starting example.
          </p>

          <div className="mt-5 space-y-2">
            {KNOWLEDGE_SUGGESTIONS.map((item) => (
              <button
                key={item}
                onClick={() => useSuggestion(item)}
                className="w-full border border-line bg-paper-dim px-4 py-3 text-left text-sm text-ink-soft hover:border-paprika hover:text-ink"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
              Stored per restaurant
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              After backend approval, each restaurant will keep its own knowledge base, tags,
              QR style, and Google review link.
            </p>
          </div>
        </aside>
      </div>

      {error && (
        <div className="mx-8 mb-8 border border-plum/30 bg-plum/5 px-5 py-4 text-sm text-plum-dark">
          {error}
        </div>
      )}
    </div>
  );
}
