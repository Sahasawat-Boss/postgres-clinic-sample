"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock, CalendarDays, ClipboardList, Users, Wallet } from "lucide-react";
import { api, fmtDateTime, type AppointmentStatus } from "@/lib/types";
import { Avatar, EmptyState, ErrorBox, PageHeader, Spinner, StatusBadge } from "@/components/ui";

type Person = { id: number; first_name: string; last_name: string };
type Dashboard = {
  stats: { patients: number; appointmentsToday: number; upcoming: number; revenueThisMonth: number };
  upcoming: {
    id: number;
    appointment_at: string;
    status: AppointmentStatus;
    reason: string | null;
    patients: Person & { hn: string };
    doctors: Person & { specialty: string | null };
  }[];
  recentVisits: {
    id: number;
    visit_at: string;
    diagnosis: string | null;
    fee: string | null;
    patients: Person;
    doctors: Person;
  }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Dashboard>("/api/dashboard").then(setData).catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Spinner />;

  const cards = [
    { label: "ผู้ป่วยทั้งหมด", value: data.stats.patients.toLocaleString("th-TH"), icon: Users, tone: "bg-teal-50 text-teal-600" },
    { label: "นัดวันนี้", value: data.stats.appointmentsToday, icon: CalendarDays, tone: "bg-sky-50 text-sky-600" },
    { label: "นัดที่รออยู่", value: data.stats.upcoming, icon: CalendarClock, tone: "bg-violet-50 text-violet-600" },
    {
      label: "รายได้เดือนนี้",
      value: `฿${data.stats.revenueThisMonth.toLocaleString("th-TH")}`,
      icon: Wallet,
      tone: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <>
      <PageHeader
        title="แดชบอร์ด"
        subtitle={new Date().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <span className={`flex size-12 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="size-6" />
            </span>
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-semibold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">นัดหมายที่กำลังจะถึง</h2>
            <Link href="/appointments" className="flex items-center gap-1 text-sm text-brand-600 hover:underline">
              ดูทั้งหมด <ArrowRight className="size-4" />
            </Link>
          </div>
          {data.upcoming.length === 0 ? (
            <EmptyState icon={CalendarDays} text="ไม่มีนัดหมายที่กำลังจะถึง" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.upcoming.map((a) => (
                <li key={a.id}>
                  <Link href={`/patients/${a.patients.id}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50">
                    <Avatar name={a.patients.first_name} seed={a.patients.id} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">
                        {a.patients.first_name} {a.patients.last_name}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {a.reason ?? "-"} · พ.{a.doctors.first_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">{fmtDateTime(a.appointment_at)}</p>
                      <StatusBadge status={a.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">การรักษาล่าสุด</h2>
          </div>
          {data.recentVisits.length === 0 ? (
            <EmptyState icon={ClipboardList} text="ยังไม่มีการรักษา" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentVisits.map((v) => (
                <li key={v.id}>
                  <Link href={`/patients/${v.patients.id}`} className="block px-5 py-3.5 transition hover:bg-slate-50">
                    <div className="flex justify-between gap-2">
                      <p className="font-medium text-slate-900">
                        {v.patients.first_name} {v.patients.last_name}
                      </p>
                      <p className="text-sm font-medium text-emerald-600">
                        ฿{Number(v.fee ?? 0).toLocaleString("th-TH")}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">{v.diagnosis ?? "-"}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{fmtDateTime(v.visit_at)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
