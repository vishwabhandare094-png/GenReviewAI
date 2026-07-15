"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { api } from "@/lib/api";

const NAV = [
  { href: "/dashboard", label: "Dashboard", code: "01" },
  { href: "/analytics", label: "Analytics", code: "02" },
  { href: "/tags", label: "Tags", code: "03" },
  { href: "/knowledge", label: "Knowledge base", code: "04" },
  { href: "/qr", label: "QR code", code: "05" },
  { href: "/settings", label: "Settings", code: "06" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<{ id: string; restaurant_name: string; short_code?: string; theme_name?: string }[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const ownerId = localStorage.getItem("gr_owner_id");
    const activeId = localStorage.getItem("gr_restaurant_id") || "";
    setSelectedId(activeId);

    if (ownerId) {
      api.listRestaurants(ownerId)
        .then((res) => {
          const list = (res && res.restaurants || []) as any[];
          setRestaurants(list);
          // If no active ID is set in localStorage, default to the first restaurant in list
          if (!activeId && list.length > 0) {
            localStorage.setItem("gr_restaurant_id", list[0].id);
            localStorage.setItem("gr_restaurant_name", list[0].restaurant_name);
            localStorage.setItem("gr_restaurant_short_code", list[0].short_code || "");
            localStorage.setItem("gr_active_theme", list[0].theme_name || "Warm Ticket");
            setSelectedId(list[0].id);
            window.location.reload();
          }
        })
        .catch(() => {});
    }
  }, []);

  function handleSelect(id: string) {
    const found = restaurants.find(r => r.id === id);
    if (found) {
      localStorage.setItem("gr_restaurant_id", found.id);
      localStorage.setItem("gr_restaurant_name", found.restaurant_name);
      localStorage.setItem("gr_restaurant_short_code", found.short_code || "");
      localStorage.setItem("gr_active_theme", found.theme_name || "Warm Ticket");
      setSelectedId(found.id);
      window.location.reload();
    }
  }

  function logout() {
    localStorage.removeItem("gr_token");
    localStorage.removeItem("gr_restaurant_id");
    localStorage.removeItem("gr_restaurant_name");
    localStorage.removeItem("gr_restaurant_short_code");
    localStorage.removeItem("gr_active_theme");
    router.push("/login");
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col justify-between border-r border-line bg-ink text-paper">
      <div>
        <div className="px-6 pt-6 pb-4">
          <Logo mono />
        </div>
        
        {/* Global Restaurant Selector */}
        <div className="px-6 pb-4">
          <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-paper/40 mb-1.5">
            Active Restaurant
          </label>
          {restaurants.length > 0 ? (
            <select
              value={selectedId}
              onChange={(e) => handleSelect(e.target.value)}
              className="w-full bg-paper/10 border border-paper/20 rounded px-2.5 py-1.5 text-xs font-semibold text-paper outline-none focus:border-paprika cursor-pointer"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id} className="bg-ink text-paper">
                  {r.restaurant_name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-paper/30 italic">No restaurants linked</p>
          )}
        </div>

        <div className="ticket-divider opacity-20" />
        <nav className="mt-4 flex flex-col px-3">
          {NAV.map((item) => {
            const activeItem = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                  activeItem
                    ? "bg-paper/10 text-paper"
                    : "text-paper/60 hover:bg-paper/5 hover:text-paper"
                }`}
              >
                <span
                  className={`font-mono text-[10px] ${
                    activeItem ? "text-paprika-light" : "text-paper/30"
                  }`}
                >
                  {item.code}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-paper/10 p-4">
        <button
          onClick={logout}
          className="w-full rounded-sm px-3 py-2.5 text-left text-sm text-paper/60 transition-colors hover:bg-paper/5 hover:text-paper"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
