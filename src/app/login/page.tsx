"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, HeartPulse, Lock, Mail, ShieldCheck, Stethoscope } from "lucide-react";
import { api } from "@/lib/types";

const REMEMBER_KEY = "clinic_remember_email";

function LoginForm() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [remember, setRemember] = useState(false);

  // เติมอีเมลที่จำไว้ (เก็บเฉพาะอีเมล ไม่เก็บรหัสผ่าน)
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved && emailRef.current) {
      emailRef.current.value = saved;
      setRemember(true);
      passwordRef.current?.focus();
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ ...form, remember }),
      });
      if (remember) localStorage.setItem(REMEMBER_KEY, String(form.email));
      else localStorage.removeItem(REMEMBER_KEY);
      // กันการ redirect ไปเว็บอื่น: รับเฉพาะ path ภายใน
      const next = params.get("next");
      window.location.href = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="label" htmlFor="email">
          อีเมล
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            autoFocus
            className="input pl-10"
            placeholder="you@clinic.local"
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="password">
          รหัสผ่าน
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="input pl-10"
            placeholder="••••••••"
          />
        </div>
      </div>

      <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="size-4 cursor-pointer rounded border-slate-300 accent-brand-600"
        />
        จดจำฉันไว้ <span className="text-slate-400">(ไม่ต้อง login ใหม่ 30 วัน)</span>
      </label>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full py-3!">
        {loading ? (
          <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : null}
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  const features = [
    { icon: Stethoscope, text: "บันทึกประวัติผู้ป่วยและการรักษาครบในที่เดียว" },
    { icon: CalendarCheck, text: "จัดการนัดหมาย ติดตามสถานะได้ทันที" },
    { icon: ShieldCheck, text: "ข้อมูลปลอดภัย เข้าถึงได้เฉพาะเจ้าหน้าที่" },
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ฝั่งแบรนด์ */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <HeartPulse className="size-6" />
          </span>
          <span className="text-xl font-semibold">CareClinic</span>
        </div>

        <div className="relative space-y-8">
          <h2 className="text-4xl font-semibold leading-tight">
            ดูแลผู้ป่วยได้ง่ายขึ้น
            <br />
            <span className="text-teal-200">ด้วยระบบที่ใช้งานง่าย</span>
          </h2>
          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-teal-50">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-teal-100/70">© CareClinic · ตัวอย่างระบบเพื่อการเรียนรู้</p>
      </div>

      {/* ฝั่งฟอร์ม */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <HeartPulse className="size-7 text-brand-600" />
            <span className="text-xl font-semibold">CareClinic</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">ยินดีต้อนรับกลับ 👋</h1>
          <p className="mb-8 mt-1.5 text-sm text-slate-500">เข้าสู่ระบบเพื่อจัดการข้อมูลคลินิก</p>

          <Suspense>
            <LoginForm />
          </Suspense>

          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-500">
            <p className="mb-1 font-medium text-slate-700">บัญชีทดลอง</p>
            <p>admin@clinic.local / admin1234</p>
            <p>staff@clinic.local / staff1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
