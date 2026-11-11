"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, HeartPulse, LayoutDashboard, LogOut, Menu, Users, X } from "lucide-react";
import { api } from "@/lib/types";
import type { SessionUser } from "@/lib/session";
import { Avatar } from "@/components/ui";

const nav = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/patients", label: "ผู้ป่วย", icon: Users },
  { href: "/appointments", label: "นัดหมาย", icon: CalendarDays },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api<SessionUser>("/api/auth/me").then(setUser).catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const content = (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-6" onClick={() => setOpen(false)}>
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30">
          <HeartPulse className="size-5" />
        </span>
        <span>
          <span className="block font-semibold leading-tight text-slate-900">CareClinic</span>
          <span className="block text-xs text-slate-500">ระบบจัดการคลินิก</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`size-[18px] ${active ? "text-brand-600" : "text-slate-400"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        {user ? (
          <div className="flex items-center gap-3">
            <Avatar name={user.name} seed={user.id} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.role === "admin" ? "ผู้ดูแลระบบ" : "เจ้าหน้าที่"}</p>
            </div>
            <button onClick={logout} title="ออกจากระบบ" className="btn-ghost p-2!">
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div className="h-8 animate-pulse rounded bg-slate-200" />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="flex items-center gap-2 font-semibold">
          <HeartPulse className="size-5 text-brand-600" /> CareClinic
        </span>
        <button onClick={() => setOpen(true)} className="btn-ghost p-2!" aria-label="เปิดเมนู">
          <Menu className="size-5" />
        </button>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <button onClick={() => setOpen(false)} className="btn-ghost absolute right-3 top-5 p-2!" aria-label="ปิดเมนู">
              <X className="size-5" />
            </button>
            {content}
          </aside>
        </div>
      )}

      {/* desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">{content}</aside>
    </>
  );
}
