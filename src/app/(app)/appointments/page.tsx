"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { api, fmtDateTime, statusLabel, type AppointmentStatus } from "@/lib/types";
import { Avatar, EmptyState, ErrorBox, PageHeader, Spinner, StatusBadge } from "@/components/ui";

type Row = {
  id: number;
  appointment_at: string;
  status: AppointmentStatus;
  reason: string | null;
  patients: { id: number; hn: string; first_name: string; last_name: string; phone: string | null };
  doctors: { first_name: string; last_name: string; specialty: string | null };
};

const filters: ("" | AppointmentStatus)[] = ["", "scheduled", "completed", "no_show", "cancelled"];

export default function AppointmentsPage() {
  const [status, setStatus] = useState<"" | AppointmentStatus>("scheduled");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Row[]>(`/api/appointments${status ? `?status=${status}` : ""}`)
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }, [status]);

  async function setApptStatus(id: number, s: AppointmentStatus) {
    try {
      await api(`/api/appointments/${id}`, { method: "PATCH", body: JSON.stringify({ status: s }) });
      setRows((r) => r?.map((x) => (x.id === id ? { ...x, status: s } : x)).filter((x) => !status || x.status === status) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader title="นัดหมาย" subtitle="นัดหมายทั้งหมดของคลินิก (สร้างนัดได้จากหน้าผู้ป่วย)" />

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f || "all"}
            onClick={() => {
              setRows(null);
              setStatus(f);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              status === f ? "bg-brand-600 text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f ? statusLabel[f] : "ทั้งหมด"}
          </button>
        ))}
      </div>

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      <div className="card overflow-hidden">
        {rows === null ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState icon={CalendarDays} text="ไม่มีนัดหมาย" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="w-40 shrink-0 text-sm">
                  <p className="font-medium text-slate-900">{fmtDateTime(a.appointment_at)}</p>
                </div>
                <Link href={`/patients/${a.patients.id}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
                  <Avatar name={a.patients.first_name} seed={a.patients.id} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {a.patients.first_name} {a.patients.last_name}{" "}
                      <span className="font-mono text-xs text-slate-400">{a.patients.hn}</span>
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {a.reason ?? "-"} · พ.{a.doctors.first_name} ({a.doctors.specialty})
                    </p>
                  </div>
                </Link>
                <StatusBadge status={a.status} />
                {a.status === "scheduled" && (
                  <div className="flex gap-1.5">
                    <button onClick={() => setApptStatus(a.id, "no_show")} className="btn-outline btn-sm">
                      ไม่มา
                    </button>
                    <button onClick={() => setApptStatus(a.id, "cancelled")} className="btn-danger btn-sm">
                      ยกเลิก
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
