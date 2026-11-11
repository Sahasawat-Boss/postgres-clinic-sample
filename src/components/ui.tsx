import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { statusLabel, type AppointmentStatus } from "@/lib/types";

const avatarColors = [
  "bg-teal-100 text-teal-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
];

export function Avatar({ name, seed = 0, size = "md" }: { name: string; seed?: number; size?: "sm" | "md" | "lg" }) {
  const sz = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-16 text-2xl" }[size];
  // ตัดคำนำหน้าแบบ "ด.ช." ออกก่อนเอาตัวอักษรแรก
  const initial = name.replace(/^(ด\.ช\.|ด\.ญ\.|นาย|นาง|น\.ส\.)\s*/, "").charAt(0);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${sz} ${avatarColors[seed % avatarColors.length]}`}
    >
      {initial}
    </span>
  );
}

const statusStyle: Record<AppointmentStatus, string> = {
  scheduled: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cancelled: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  no_show: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`badge ${statusStyle[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabel[status]}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
      <Icon className="size-10 stroke-[1.5]" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function Spinner({ text = "กำลังโหลด..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-400">
      <span className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
      {text}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>;
}
