"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import PageHeader from "@/components/PageHeader";

const RESTAURANT_FIELDS: { name: string; label: string; type?: string; placeholder?: string }[] = [
  { name: "restaurant_name", label: "Restaurant name", placeholder: "The Copper Ladle" },
  { name: "brand_name", label: "Brand name", placeholder: "Copper Ladle Hospitality" },
  { name: "category", label: "Category", placeholder: "Restaurant" },
  { name: "phone", label: "Phone", placeholder: "+91 98765 43210" },
  { name: "email", label: "Email", type: "email", placeholder: "hello@copperladle.com" },
  { name: "address", label: "Address", placeholder: "12 MG Road" },
  { name: "city", label: "City", placeholder: "Nagpur" },
  { name: "state", label: "State", placeholder: "Maharashtra" },
  { name: "country", label: "Country", placeholder: "India" },
  { name: "google_review_link", label: "Google review link", placeholder: "https://g.page/r/xxxx/review" },
];

const THEME_PALETTES = [
  { name: "Warm Ticket", colors: ["#C1481D", "#FBF3E7", "#241A14"] },
  { name: "Modern Green", colors: ["#5F7A52", "#F4F8EF", "#1F2A1C"] },
  { name: "Premium Dark", colors: ["#241A14", "#FFFFFF", "#D99A32"] },
  { name: "Soft Plum", colors: ["#8B3A56", "#FFF6F8", "#2B1820"] },
];

export default function SettingsPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [threshold, setThreshold] = useState(4.0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activePalette, setActivePalette] = useState(THEME_PALETTES[0].name);

  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantShortCode, setRestaurantShortCode] = useState<string | null>(null);

  useEffect(() => {
    setOwnerName(localStorage.getItem("gr_owner_name") || "");
    setOwnerEmail(localStorage.getItem("gr_owner_email") || "");
    setOwnerPhone(localStorage.getItem("gr_owner_phone") || "");
    setRestaurantId(localStorage.getItem("gr_restaurant_id"));
    setRestaurantShortCode(localStorage.getItem("gr_restaurant_short_code"));
  }, []);

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
      if (id) {
        localStorage.setItem("gr_restaurant_id", id);
        setRestaurantId(id);
      }
      if (form.restaurant_name) {
        localStorage.setItem("gr_restaurant_name", form.restaurant_name);
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  const restaurantCards = [
    {
      name: form.restaurant_name || localStorage.getItem("gr_restaurant_name") || "Current restaurant",
      city: form.city || "Primary outlet",
      code: restaurantShortCode || "No QR yet",
      active: true,
    },
    { name: "Downtown branch", city: "Preview outlet", code: "DWNTA123", active: false },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Owner setup"
        title="Settings"
        description="Manage restaurant details, multiple outlets, customer theme colors, and rating rules from one simple place."
      />

      <div className="grid gap-8 px-8 py-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-8">
          <section className="border border-line bg-paper p-5">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              Owner profile
            </p>
            <div className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-ink-faint">Name</span>
                <span className="font-medium text-ink">{ownerName || "-"}</span>
              </div>
              <div>
                <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-ink-faint">Email</span>
                <span className="font-medium text-ink">{ownerEmail || "-"}</span>
              </div>
              <div>
                <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-ink-faint">Phone</span>
                <span className="font-medium text-ink">{ownerPhone || "-"}</span>
              </div>
            </div>
          </section>

          <section className="border border-line bg-paper p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                  Restaurants
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  Preview for owners with one or many outlets.
                </p>
              </div>
              <button className="border border-ink px-4 py-2 text-sm text-ink hover:bg-ink hover:text-paper">
                Add restaurant
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {restaurantCards.map((restaurant) => (
                <div
                  key={restaurant.name}
                  className={`border p-4 ${restaurant.active ? "border-paprika bg-paprika/5" : "border-line bg-paper-dim"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{restaurant.name}</p>
                      <p className="mt-1 text-sm text-ink-soft">{restaurant.city}</p>
                    </div>
                    <span className="font-mono text-xs text-paprika">{restaurant.code}</span>
                  </div>
                  {restaurant.active && restaurantId && (
                    <p className="mt-3 break-all font-mono text-[11px] text-ink-faint">
                      ID: {restaurantId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <form onSubmit={handleSubmit}>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              Restaurant details
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {RESTAURANT_FIELDS.map((field) => (
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
                Ratings at or above this go to AI review drafting. Lower ratings go to private feedback first.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 bg-paprika px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-paprika-dark disabled:opacity-60"
            >
              {saving ? "Saving..." : restaurantId ? "Update restaurant" : "Save restaurant"}
            </button>

            {saved && <p className="mt-3 text-sm text-sage-dark">Restaurant saved successfully.</p>}
            {error && <p className="mt-3 text-sm text-plum-dark">{error}</p>}
          </form>
        </div>

        <aside className="border border-line bg-paper p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
            Theme palette
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Owners can choose a simple color theme for QR cards and customer rating pages.
          </p>

          <div className="mt-5 space-y-3">
            {THEME_PALETTES.map((palette) => (
              <button
                key={palette.name}
                onClick={() => setActivePalette(palette.name)}
                className={`w-full border p-4 text-left ${activePalette === palette.name ? "border-paprika bg-paprika/5" : "border-line bg-paper-dim"}`}
              >
                <span className="text-sm font-medium text-ink">{palette.name}</span>
                <span className="mt-3 flex gap-2">
                  {palette.colors.map((color) => (
                    <span key={color} className="h-7 w-7 border border-line" style={{ backgroundColor: color }} />
                  ))}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-5 text-xs text-ink-faint">
            UI preview only. After approval, selected themes will be saved per restaurant.
          </p>
        </aside>
      </div>
    </div>
  );
}
