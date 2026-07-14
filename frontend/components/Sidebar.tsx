"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";

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

  function logout() {
    localStorage.removeItem("gr_token");
    localStorage.removeItem("gr_restaurant_id");
    router.push("/login");
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col justify-between border-r border-line bg-ink text-paper">
      <div>
        <div className="px-6 py-6">
          <Logo mono />
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
