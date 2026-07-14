"use client";

import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import PageHeader from "@/components/PageHeader";

const FIELDS: { name: string; label: string; type?: string; placeholder?: string }[] = [
  { name: "restaurant_name", label: "Restaurant name", placeholder: "The Copper Ladle" },
  { name: "brand_name", label: "Brand name", placeholder: "Copper Ladle Hospitality" },
  { name: "category", label: "Category", placeholder: "Restaurant" },
  { name: "phone", label: "Phone", placeholder: "+91 98765 43210" },
  { name: "email", label: "Email", type: "email", placeholder: "hello@copperladle.com" },
  { name: "address", label: "Address", placeholder: "12 MG Road" },
  { name: "city", label: "City", placeholder: "Nagpur" },
  { name: "state", label: "State", placeholder: "Maharashtra" },
  { name: "country", label: "Country", placeholder: "India" },
  {
    name: "google_review_link",
    label: "Google review link",
    placeholder: "https://g.page/r/xxxx/review",
  },
];

export default function SettingsPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [threshold, setThreshold] = useState(4.0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const ownerId = localStorage.getItem("gr_owner_id") || "owner-placeholder";
      const res = (await api.createRestaurant({
        owner_id: ownerId,
        rating_threshold: threshold,
        ...form,
     })) as {
     id?: string;
     restaurant_id?: string;
     data?: { id?: string }[];
   };
   const id = res.id || res.restaurant_id || res.data?.[0]?.id;
   if (id) localStorage.setItem("gr_restaurant_id", id);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Restaurant profile"
        title="Settings"
        description="This is what your customers and your dashboard are built around — keep it current."
      />

      <form onSubmit={handleSubmit} className="max-w-2xl px-8 py-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <label key={field.name} className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">{field.label}</span>
              <input
                required
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={form[field.name] || ""}
                onChange={(e) => update(field.name, e.target.value)}
                className="w-full border border-line bg-paper px-3.5 py-2.5 text-ink outline-none focus:border-paprika"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 border border-line bg-paper p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink-soft">
              Rating threshold
            </span>
            <span className="font-mono text-lg tabular text-paprika">
              {threshold.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={4.5}
            step={0.5}
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="mt-3 w-full accent-paprika"
          />
          <p className="mt-2 text-xs text-ink-faint">
            Ratings at or above this go straight to the AI draft + Google flow. Below it, customers
            see the private feedback form first — the Google link always stays reachable either way.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 bg-paprika px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-paprika-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save restaurant"}
        </button>

        {saved && <p className="mt-3 text-sm text-sage-dark">Saved.</p>}
        {error && <p className="mt-3 text-sm text-plum-dark">{error}</p>}
      </form>
    </div>
  );
}
