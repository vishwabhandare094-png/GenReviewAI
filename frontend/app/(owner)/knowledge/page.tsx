"use client";

import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import PageHeader from "@/components/PageHeader";

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

      <div className="grid gap-8 px-8 py-8 lg:grid-cols-2">
        <form onSubmit={handleAdd} className="border border-line bg-paper p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
            Add knowledge
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

      {error && (
        <div className="mx-8 mb-8 border border-plum/30 bg-plum/5 px-5 py-4 text-sm text-plum-dark">
          {error}
        </div>
      )}
    </div>
  );
}
