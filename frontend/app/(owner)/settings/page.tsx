"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

type RestaurantCard = {
  id: string;
  restaurant_name: string;
  brand_name?: string;
  cuisine?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  google_review_url?: string;
  short_code?: string;
  rating_threshold?: number;
  theme_name?: string;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"restaurant" | "account">("restaurant");
  const [form, setForm] = useState<Record<string, string>>({});
  const [restaurants, setRestaurants] = useState<RestaurantCard[]>([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(4.0);
  const [activePalette, setActivePalette] = useState(THEME_PALETTES[0].name);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [ownerId, setOwnerId] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const securityScore = useMemo(() => {
    let score = 40;
    if (ownerEmail) score += 20;
    if (ownerPhone) score += 15;
    if (restaurants.length > 0) score += 15;
    if (activePalette) score += 10;
    return Math.min(score, 100);
  }, [activePalette, ownerEmail, ownerPhone, restaurants.length]);

  useEffect(() => {
    const id = localStorage.getItem("gr_owner_id") || "";
    const currentRestaurantId = localStorage.getItem("gr_restaurant_id");
    const localRestaurantName = localStorage.getItem("gr_restaurant_name") || "Current restaurant";
    const localShortCode = localStorage.getItem("gr_restaurant_short_code") || "";

    setOwnerId(id);
    setOwnerName(localStorage.getItem("gr_owner_name") || "");
    setOwnerEmail(localStorage.getItem("gr_owner_email") || "");
    setOwnerPhone(localStorage.getItem("gr_owner_phone") || "");

    if (id) {
      api.listRestaurants(id)
        .then((res) => {
          const list = (res.restaurants || []) as RestaurantCard[];
          setRestaurants(list);
          if (list.length > 0) {
            // Find current active restaurant in list
            const found = list.find(r => r.id === currentRestaurantId);
            selectRestaurant(found || list[0]);
          }
        })
        .catch(() => {
          if (currentRestaurantId) {
            const fallback = {
              id: currentRestaurantId,
              restaurant_name: localRestaurantName,
              short_code: localShortCode,
            };
            setRestaurants([fallback]);
            selectRestaurant(fallback);
          }
        });
    } else if (currentRestaurantId) {
      const fallback = {
        id: currentRestaurantId,
        restaurant_name: localRestaurantName,
        short_code: localShortCode,
      };
      setRestaurants([fallback]);
      selectRestaurant(fallback);
    }
  }, []);

  function selectRestaurant(restaurant: RestaurantCard) {
    setActiveRestaurantId(restaurant.id);
    setForm({
      restaurant_name: restaurant.restaurant_name || "",
      brand_name: restaurant.brand_name || restaurant.restaurant_name || "",
      category: restaurant.cuisine || "Restaurant",
      phone: restaurant.phone || "",
      email: restaurant.email || "",
      address: restaurant.address || "",
      city: restaurant.city || "",
      state: restaurant.state || "",
      country: restaurant.country || "India",
      google_review_link: restaurant.google_review_url || "",
    });

    const thresholdVal = restaurant.rating_threshold ?? 4.0;
    const themeVal = restaurant.theme_name ?? THEME_PALETTES[0].name;

    setThreshold(thresholdVal);
    setActivePalette(themeVal);

    localStorage.setItem("gr_restaurant_id", restaurant.id);
    localStorage.setItem("gr_restaurant_name", restaurant.restaurant_name || "");
    localStorage.setItem("gr_restaurant_short_code", restaurant.short_code || "");
    localStorage.setItem("gr_active_theme", themeVal);
    localStorage.setItem("gr_active_threshold", String(thresholdVal));
  }

  function update(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleRestaurantSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const body = {
        restaurant_name: form.restaurant_name || "",
        brand_name: form.brand_name || "",
        category: form.category || "",
        phone: form.phone || "",
        email: form.email || "",
        address: form.address || "",
        city: form.city || "",
        state: form.state || "",
        country: form.country || "",
        google_review_link: form.google_review_link || "",
        rating_threshold: threshold,
        theme_name: activePalette,
      };
      let id = activeRestaurantId;
      
      if (id) {
        await api.updateRestaurant(id, body);
        setMessage("Restaurant details updated successfully.");
      } else {
        const res = (await api.createRestaurant({ owner_id: ownerId || "owner-placeholder", ...body })) as {
          id?: string;
          restaurant_id?: string;
          data?: { id?: string }[];
        };
        id = res.id || res.restaurant_id || res.data?.[0]?.id || null;
        setMessage("Restaurant created successfully.");
      }

      if (id) {
        localStorage.setItem("gr_restaurant_id", id);
        localStorage.setItem("gr_restaurant_name", form.restaurant_name || "");
        localStorage.setItem("gr_active_theme", activePalette);
        localStorage.setItem("gr_active_threshold", String(threshold));
        setActiveRestaurantId(id);

        // Refresh restaurant list
        if (ownerId) {
          const listRes = await api.listRestaurants(ownerId);
          const list = (listRes.restaurants || []) as RestaurantCard[];
          setRestaurants(list);
          const updated = list.find(r => r.id === id);
          if (updated) {
            selectRestaurant(updated);
          }
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail() {
    if (!activeRestaurantId) return;
    setSendingTest(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.sendTestEmail(activeRestaurantId);
      if (res.success) {
        setMessage("Test email alert sent successfully to: " + ownerEmail);
      } else {
        setError(res.message || "Failed to send test email.");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setSendingTest(false);
    }
  }

  async function handleDeleteRestaurant() {
    if (!activeRestaurantId) return;
    const confirmed = window.confirm("Are you absolutely sure you want to delete this restaurant? All data, reviews, and private feedback will be permanently deleted.");
    if (!confirmed) return;
    
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.deleteRestaurant(activeRestaurantId);
      if (res.success) {
        setMessage("Restaurant deleted successfully.");
        setActiveRestaurantId(null);
        setForm({});
        setThreshold(4.0);
        setActivePalette(THEME_PALETTES[0].name);
        
        // Reload list
        if (ownerId) {
          const listRes = await api.listRestaurants(ownerId);
          const list = (listRes.restaurants || []) as RestaurantCard[];
          setRestaurants(list);
          if (list.length > 0) {
            selectRestaurant(list[0]);
          } else {
            localStorage.removeItem("gr_restaurant_id");
            localStorage.removeItem("gr_restaurant_name");
            localStorage.removeItem("gr_restaurant_short_code");
          }
        }
      } else {
        setError(res.message || "Failed to delete restaurant.");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleProfileSave() {
    if (!ownerId) return setError("Please log in again before updating profile.");
    setError(null);
    setMessage(null);
    try {
      const res = await api.updateProfile({ user_id: ownerId, full_name: ownerName, phone: ownerPhone });
      localStorage.setItem("gr_owner_name", ownerName);
      localStorage.setItem("gr_owner_phone", ownerPhone);
      setMessage((res as any).message || "Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    }
  }

  async function handleEmailChange() {
    if (!ownerId) return setError("Please log in again before changing email.");
    setError(null);
    setMessage(null);
    try {
      const res = await api.changeEmail({ user_id: ownerId, new_email: newEmail, current_password: profilePassword });
      localStorage.setItem("gr_owner_email", newEmail);
      setOwnerEmail(newEmail);
      setNewEmail("");
      setProfilePassword("");
      setMessage((res as any).message || "Email updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    }
  }

  async function handlePasswordChange() {
    if (!ownerId) return setError("Please log in again before changing password.");
    setError(null);
    setMessage(null);
    try {
      const res = await api.changePassword({ user_id: ownerId, current_password: currentPassword, new_password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setMessage((res as any).message || "Password updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    }
  }

  async function handleForgotPassword() {
    const email = newEmail || ownerEmail;
    if (!email) return setError("Enter your account email first.");
    setError(null);
    setMessage(null);
    try {
      const res = await api.forgotPassword({ email });
      setMessage((res as any).message || "Reset request sent.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        eyebrow="Owner Control Panel"
        title="Settings"
        description="Configure your restaurants, low-rating email notification thresholds, UI themes, and account security details."
      />

      {/* Modern Tab Bar navigation */}
      <div className="flex border-b border-line px-8 mb-6 mt-4">
        <button
          onClick={() => {
            setActiveTab("restaurant");
            setMessage(null);
            setError(null);
          }}
          className={`pb-4 px-6 font-medium text-sm border-b-2 transition-all duration-200 outline-none ${
            activeTab === "restaurant"
              ? "border-paprika text-paprika font-semibold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Restaurant Profiles & Themes
        </button>
        <button
          onClick={() => {
            setActiveTab("account");
            setMessage(null);
            setError(null);
          }}
          className={`pb-4 px-6 font-medium text-sm border-b-2 transition-all duration-200 outline-none ${
            activeTab === "account"
              ? "border-paprika text-paprika font-semibold"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Account Security & Profile
        </button>
      </div>

      <div className="px-8 py-2">
        {message && (
          <div className="mb-6 p-4 bg-sage-light/10 border border-sage text-sage-dark rounded-sm text-sm font-medium">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-plum/5 border border-plum text-plum-dark rounded-sm text-sm font-medium">
            {error}
          </div>
        )}
      </div>

      {activeTab === "restaurant" ? (
        <div className="grid gap-8 px-8 pb-12 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-8">
            <section className="border border-line bg-paper p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Select Restaurant</p>
                  <p className="mt-1 text-sm text-ink-soft">Switch between outlets or add a new branch.</p>
                </div>
                <button
                  onClick={() => {
                    setActiveRestaurantId(null);
                    setForm({});
                    setThreshold(4.0);
                    setActivePalette(THEME_PALETTES[0].name);
                  }}
                  className="border border-ink px-4 py-2 text-xs font-semibold tracking-wider text-ink hover:bg-ink hover:text-paper uppercase transition-all"
                >
                  + Add restaurant
                </button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={`border p-4 transition-all ${
                      activeRestaurantId === restaurant.id
                        ? "border-paprika bg-paprika/5 shadow-sm"
                        : "border-line bg-paper-dim hover:border-ink-soft"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{restaurant.restaurant_name}</p>
                        <p className="mt-1 text-xs text-ink-soft">{restaurant.city || "No city added"}</p>
                        <p className="mt-2 font-mono text-[11px] font-semibold text-paprika">{restaurant.short_code || "No QR yet"}</p>
                      </div>
                      <button
                        onClick={() => selectRestaurant(restaurant)}
                        className="border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-paprika hover:text-paprika bg-paper"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
                {restaurants.length === 0 && (
                  <p className="text-sm text-ink-faint">No restaurants yet. Click "Add restaurant" to register one.</p>
                )}
              </div>
            </section>

            <form onSubmit={handleRestaurantSubmit} className="space-y-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint mb-4">
                  Restaurant Metadata & Settings
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  {RESTAURANT_FIELDS.map((field) => (
                    <label key={field.name} className="block text-sm">
                      <span className="mb-1.5 block font-semibold text-ink-soft">{field.label}</span>
                      <input
                        required
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        value={form[field.name] || ""}
                        onChange={(e) => update(field.name, e.target.value)}
                        className="w-full border border-line bg-paper px-3.5 py-2.5 text-ink outline-none focus:border-paprika text-sm"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="border border-line bg-paper p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink-soft">Rating threshold alert rule</span>
                      <span className="font-mono text-lg font-bold text-paprika">{threshold.toFixed(1)} ★</span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={4.5}
                      step={0.5}
                      value={threshold}
                      onChange={(e) => setThreshold(parseFloat(e.target.value))}
                      className="mt-4 w-full accent-paprika cursor-pointer"
                    />
                    <p className="mt-3 text-xs text-ink-faint leading-relaxed">
                      Ratings STRICTLY below {threshold.toFixed(1)} are treated as unhappy customers. The system automatically routes them to private feedback and triggers a priority email notification to you.
                    </p>
                  </div>
                </div>

                <div className="border border-line bg-paper p-5">
                  <p className="text-sm font-semibold text-ink-soft">Restaurant Theme Preset</p>
                  <p className="text-xs text-ink-faint mt-1 mb-3">Select the appearance style used for customer feedback flow.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {THEME_PALETTES.map((palette) => (
                      <button
                        key={palette.name}
                        type="button"
                        onClick={() => {
                          setActivePalette(palette.name);
                        }}
                        className={`border py-3 text-center text-xs font-semibold tracking-wide transition-all ${
                          activePalette === palette.name
                            ? "border-paprika bg-paprika/5 text-paprika"
                            : "border-line bg-paper-dim text-ink-soft hover:bg-paper-deep"
                        }`}
                      >
                        {palette.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-paprika px-6 py-3 text-sm font-semibold text-paper tracking-wide hover:bg-paprika-dark disabled:opacity-60 transition-all uppercase"
                >
                  {saving ? "Saving..." : activeRestaurantId ? "Save details & theme" : "Create restaurant"}
                </button>
              </div>
            </form>
          </div>

          <aside className="space-y-6">
            <section className="border border-line bg-paper p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Email Alerts Test</p>
              <p className="mt-2 text-xs text-ink-soft leading-relaxed">
                Confirm your Resend SMTP configuration is working properly by sending a simulated low-rating review notification.
              </p>
              <button
                onClick={handleTestEmail}
                disabled={sendingTest || !activeRestaurantId}
                className="mt-4 w-full border border-ink bg-paper px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink hover:bg-ink hover:text-paper transition-all disabled:opacity-50"
              >
                {sendingTest ? "Sending test email..." : "Send Test Email Alert"}
              </button>
              {!activeRestaurantId && (
                <p className="mt-2 text-[10px] text-plum-dark">Select a restaurant first to test notifications.</p>
              )}
            </section>

            {activeRestaurantId && (
              <section className="border border-plum/30 bg-plum/5 p-6 rounded-sm">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-plum-dark font-semibold">Danger Zone</p>
                <p className="mt-2 text-xs text-ink-soft leading-relaxed">
                  Permanently delete this restaurant. This deletes its custom QR codes, RAG knowledge bases, public reviews, and private feedback logs. This action is irreversible.
                </p>
                <button
                  onClick={handleDeleteRestaurant}
                  className="mt-4 w-full bg-plum text-paper px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-plum-dark transition-all"
                >
                  Delete Restaurant
                </button>
              </section>
            )}
          </aside>
        </div>
      ) : (
        <div className="grid gap-8 px-8 pb-12 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-6">
            <section className="border border-line bg-paper p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint mb-4">Owner Profile</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-ink-soft">Owner name</span>
                  <input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-paprika"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-ink-soft">Phone</span>
                  <input
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-paprika"
                  />
                </label>
              </div>
              <button
                onClick={handleProfileSave}
                className="mt-5 bg-ink px-5 py-2.5 text-sm font-semibold tracking-wide text-paper hover:bg-ink-soft uppercase transition-all"
              >
                Save profile
              </button>
            </section>

            <section className="border border-line bg-paper p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint mb-4">Update Contact Credentials</p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-ink-soft">New email address</span>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder={ownerEmail || "owner@example.com"}
                    className="w-full border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-paprika"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-ink-soft">Current password (verification)</span>
                  <input
                    type="password"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-paprika"
                  />
                </label>
              </div>
              
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleEmailChange}
                  className="border border-ink px-5 py-2.5 text-sm font-semibold tracking-wide text-ink hover:bg-ink hover:text-paper uppercase transition-all"
                >
                  Change email
                </button>
                <button
                  onClick={handleForgotPassword}
                  className="border border-transparent px-4 py-2.5 text-sm font-semibold text-ink-faint hover:text-ink underline underline-offset-4"
                >
                  Forgot password?
                </button>
              </div>
            </section>

            <section className="border border-line bg-paper p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint mb-4">Change Password</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-ink-soft">Old password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-paprika"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-ink-soft">New password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-paprika"
                  />
                </label>
              </div>
              <button
                onClick={handlePasswordChange}
                className="mt-5 bg-paprika px-5 py-2.5 text-sm font-semibold tracking-wide text-paper hover:bg-paprika-dark uppercase transition-all"
              >
                Change password
              </button>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="border border-line bg-paper p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Account Security Status</p>
              <div className="mt-4 border border-line bg-paper-dim p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-soft">Strength Score</span>
                  <span className="font-mono text-xl font-bold text-paprika">{securityScore}%</span>
                </div>
                <div className="mt-3 h-2 bg-paper rounded-full overflow-hidden">
                  <div className="h-full bg-paprika transition-all duration-300" style={{ width: `${securityScore}%` }} />
                </div>
              </div>
              <p className="mt-4 text-xs text-ink-faint leading-relaxed">
                We evaluate your profile security based on verification parameters, linked branches, contact records, and active security measures. Keep your phone and password updated.
              </p>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
