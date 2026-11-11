"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, ChevronRight, Phone, Search, UserPlus, Users } from "lucide-react";
import { api, calcAge, genderLabel, type Patient } from "@/lib/types";
import { Avatar, EmptyState, ErrorBox, PageHeader, Spinner } from "@/components/ui";

export default function PatientsPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ค้นหาแบบ debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      api<Patient[]>(`/api/patients?q=${encodeURIComponent(q)}`)
        .then((data) => {
          setPatients(data);
          setError(null);
        })
        .catch((e: Error) => setError(e.message));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <>
      <PageHeader
        title="ผู้ป่วย"
        subtitle={patients ? `ทั้งหมด ${patients.length} รายการ` : " "}
        action={
          <Link href="/patients/new" className="btn-primary">
            <UserPlus className="size-4" /> เพิ่มผู้ป่วย
          </Link>
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          placeholder="ค้นหา HN, ชื่อ, นามสกุล, เบอร์โทร..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {error && <div className="mb-4"><ErrorBox message={error} /></div>}

      <div className="card overflow-hidden">
        {patients === null ? (
          <Spinner />
        ) : patients.length === 0 ? (
          <EmptyState icon={Users} text={q ? `ไม่พบผู้ป่วยที่ตรงกับ "${q}"` : "ยังไม่มีผู้ป่วย"} />
        ) : (
          <table className="w-full text-sm">
            <thead className="hidden border-b border-slate-100 bg-slate-50/70 text-left text-xs font-medium uppercase tracking-wide text-slate-500 md:table-header-group">
              <tr>
                <th className="px-5 py-3">ผู้ป่วย</th>
                <th className="px-5 py-3">เพศ / อายุ</th>
                <th className="px-5 py-3">ติดต่อ</th>
                <th className="px-5 py-3">แพ้ยา / อาหาร</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/patients/${p.id}`)}
                  className="group cursor-pointer transition hover:bg-brand-50/40"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={p.first_name} seed={p.id} />
                      <div>
                        <p className="font-medium text-slate-900">
                          {p.first_name} {p.last_name}
                        </p>
                        <p className="font-mono text-xs text-slate-400">{p.hn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-slate-600 md:table-cell">
                    {p.gender ? genderLabel[p.gender] : "-"} · {calcAge(p.date_of_birth)} ปี
                  </td>
                  <td className="hidden px-5 py-3.5 text-slate-600 md:table-cell">
                    {p.phone ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-3.5 text-slate-400" /> {p.phone}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="hidden px-5 py-3.5 md:table-cell">
                    {p.allergies ? (
                      <span className="badge bg-red-50 text-red-700 ring-1 ring-red-200">
                        <AlertTriangle className="size-3" /> {p.allergies}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="pr-4 text-slate-300 group-hover:text-brand-600">
                    <ChevronRight className="size-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
