"use client";

import { useState, useSyncExternalStore } from "react";
import { Download, FileSpreadsheet, Monitor, Moon, Sun } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { getTheme, setTheme, subscribeTheme, type Theme } from "@/lib/theme";

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "สว่าง", icon: Sun },
  { value: "dark", label: "มืด", icon: Moon },
  { value: "system", label: "ตามระบบ", icon: Monitor },
];

const today = () => new Date().toLocaleDateString("sv-SE");
const firstOfMonth = () => today().slice(0, 8) + "01";

export default function SettingsPage() {
  // server ไม่รู้ cookie ธีม → render "system" ไปก่อน แล้ว client อ่านค่าจริงหลัง hydrate
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "system" as Theme);
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);

  return (
    <>
      <PageHeader title="ตั้งค่า" subtitle="การแสดงผลและการส่งออกข้อมูล" />

      <div className="space-y-6">
        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold text-slate-900">ธีม</h2>
          <p className="mt-1 text-sm text-slate-500">เลือกโหมดสว่าง/มืด (จำไว้ในเบราว์เซอร์นี้)</p>
          <div className="mt-4 grid max-w-md grid-cols-3 gap-3">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                  theme === value
                    ? "border-brand-500 bg-brand-50 text-brand-700 ring-4 ring-brand-100"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="size-5" />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold text-slate-900">ส่งออกข้อมูล (CSV)</h2>
          <p className="mt-1 text-sm text-slate-500">ไฟล์เปิดใน Excel ได้ ภาษาไทยไม่เพี้ยน</p>

          <div className="mt-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="size-5 text-brand-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">รายชื่อผู้ป่วยทั้งหมด</p>
                  <p className="text-xs text-slate-500">HN, ชื่อ, ข้อมูลติดต่อ, แพ้ยา</p>
                </div>
              </div>
              <a href="/api/patients/export" className="btn-outline" download>
                <Download className="size-4" /> ดาวน์โหลด
              </a>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="size-5 text-brand-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">บันทึกการรักษาและรายได้</p>
                  <p className="text-xs text-slate-500">ตามช่วงวันที่ พร้อมยอดรวมค่ารักษา</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="min-w-40 flex-1">
                  <span className="label">ตั้งแต่</span>
                  <input type="date" className="input" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
                </label>
                <label className="min-w-40 flex-1">
                  <span className="label">ถึง</span>
                  <input type="date" className="input" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
                </label>
                <a
                  href={`/api/visits/export?from=${from}&to=${to}`}
                  className={`btn-primary ${!from || !to || from > to ? "pointer-events-none opacity-50" : ""}`}
                  download
                >
                  <Download className="size-4" /> ดาวน์โหลด
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
