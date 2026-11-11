"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Droplet,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import { api, calcAge, fmtDate, fmtDateTime, genderLabel, type Doctor, type PatientDetail } from "@/lib/types";
import { Avatar, EmptyState, ErrorBox, Spinner, StatusBadge } from "@/components/ui";

/** แปลงค่า datetime-local (เวลาเครื่อง) เป็น ISO ก่อนส่ง API */
const toIso = (v: FormDataEntryValue | null) => (v ? new Date(String(v)).toISOString() : undefined);

function DoctorSelect({ doctors, defaultValue }: { doctors: Doctor[]; defaultValue?: number }) {
  return (
    <select name="doctor_id" required className="input" defaultValue={defaultValue ?? ""}>
      <option value="">เลือกแพทย์</option>
      {doctors.map((d) => (
        <option key={d.id} value={d.id}>
          พ.{d.first_name} {d.last_name} ({d.specialty})
        </option>
      ))}
    </select>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [p, setP] = useState<PatientDetail | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAppt, setShowAppt] = useState(false);
  const [visitFor, setVisitFor] = useState<number | "walkin" | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<PatientDetail>(`/api/patients/${id}`).then(setP).catch((e: Error) => setError(e.message));
  }, [id]);

  useEffect(() => {
    load();
    api<Doctor[]>("/api/doctors").then(setDoctors).catch(() => {});
  }, [load]);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      setError(null);
      await fn();
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!p || !confirm(`ลบผู้ป่วย ${p.first_name} ${p.last_name}?\nนัดหมายและประวัติการรักษาจะถูกลบด้วย`)) return;
    try {
      await api(`/api/patients/${p.id}`, { method: "DELETE" });
      router.push("/patients");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function onCreateAppt(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    run(async () => {
      await api("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          patient_id: p!.id,
          doctor_id: f.get("doctor_id"),
          appointment_at: toIso(f.get("appointment_at")),
          reason: f.get("reason"),
        }),
      });
      setShowAppt(false);
    });
  }

  function onCreateVisit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    run(async () => {
      await api("/api/visits", {
        method: "POST",
        body: JSON.stringify({
          patient_id: p!.id,
          doctor_id: f.get("doctor_id"),
          appointment_id: typeof visitFor === "number" ? visitFor : null,
          symptoms: f.get("symptoms"),
          diagnosis: f.get("diagnosis"),
          treatment: f.get("treatment"),
          fee: f.get("fee") || 0,
        }),
      });
      setVisitFor(null);
    });
  }

  if (!p) return error ? <ErrorBox message={error} /> : <Spinner />;

  const apptForVisit = typeof visitFor === "number" ? p.appointments.find((a) => a.id === visitFor) : null;
  const totalFee = p.visits.reduce((s, v) => s + Number(v.fee ?? 0), 0);

  return (
    <div className="space-y-6">
      <Link href="/patients" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" /> รายชื่อผู้ป่วย
      </Link>

      {/* โปรไฟล์ */}
      <div className="card overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-brand-500 to-brand-700" />
        <div className="flex flex-wrap items-end justify-between gap-4 px-6 pb-6">
          <div className="-mt-8 flex items-end gap-4">
            <span className="rounded-full ring-4 ring-white">
              <Avatar name={p.first_name} seed={p.id} size="lg" />
            </span>
            <div className="pb-1">
              <h1 className="text-2xl font-semibold text-slate-900">
                {p.first_name} {p.last_name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="font-mono">{p.hn}</span>·<span>{p.gender ? genderLabel[p.gender] : "ไม่ระบุเพศ"}</span>·
                <span>{calcAge(p.date_of_birth)} ปี</span>
                {p.blood_type && (
                  <span className="badge bg-red-50 text-red-600 ring-1 ring-red-100">
                    <Droplet className="size-3" /> {p.blood_type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/patients/${p.id}/edit`} className="btn-outline">
              <Pencil className="size-4" /> แก้ไข
            </Link>
            <button onClick={onDelete} className="btn-danger">
              <Trash2 className="size-4" /> ลบ
            </button>
          </div>
        </div>
      </div>

      {p.allergies && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <AlertTriangle className="size-5 shrink-0 text-red-500" />
          <span>
            <b>แพ้ยา / อาหาร:</b> {p.allergies}
          </span>
        </div>
      )}

      {error && <ErrorBox message={error} />}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ข้อมูลติดต่อ */}
        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-900">ข้อมูลผู้ป่วย</h2>
            <dl className="space-y-3.5 text-sm">
              {[
                { icon: CalendarDays, label: "วันเกิด", value: fmtDate(p.date_of_birth) },
                { icon: Phone, label: "เบอร์โทร", value: p.phone },
                { icon: Mail, label: "อีเมล", value: p.email },
                { icon: MapPin, label: "ที่อยู่", value: p.address },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="break-words text-slate-800">{value ?? "-"}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <p className="text-xs text-slate-500">มาพบแพทย์</p>
              <p className="text-xl font-semibold text-slate-900">{p.visits.length} ครั้ง</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-500">ค่ารักษารวม</p>
              <p className="text-xl font-semibold text-slate-900">฿{totalFee.toLocaleString("th-TH")}</p>
            </div>
          </section>
        </aside>

        <div className="space-y-6 lg:col-span-2">
          {/* นัดหมาย */}
          <section className="card">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <CalendarDays className="size-4 text-brand-600" /> นัดหมาย
              </h2>
              <button className={showAppt ? "btn-ghost btn-sm" : "btn-outline btn-sm"} onClick={() => setShowAppt((v) => !v)}>
                {showAppt ? <X className="size-4" /> : <CalendarPlus className="size-4" />}
                {showAppt ? "ปิด" : "สร้างนัด"}
              </button>
            </div>

            {showAppt && (
              <form onSubmit={onCreateAppt} className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-2">
                <DoctorSelect doctors={doctors} />
                <input name="appointment_at" type="datetime-local" required className="input" />
                <input name="reason" placeholder="เหตุผลที่นัด" className="input sm:col-span-2" />
                <div className="flex justify-end sm:col-span-2">
                  <button disabled={busy} className="btn-primary">
                    บันทึกนัด
                  </button>
                </div>
              </form>
            )}

            {p.appointments.length === 0 ? (
              <EmptyState icon={CalendarDays} text="ยังไม่มีนัดหมาย" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {p.appointments.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{fmtDateTime(a.appointment_at)}</p>
                      <p className="text-slate-500">
                        {a.reason ?? "-"} · พ.{a.doctors.first_name}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                    {a.status === "scheduled" && (
                      <div className="flex gap-1.5">
                        <button className="btn-primary btn-sm" onClick={() => setVisitFor(a.id)}>
                          <Stethoscope className="size-3.5" /> ตรวจ
                        </button>
                        <button
                          className="btn-outline btn-sm"
                          disabled={busy}
                          onClick={() =>
                            run(() =>
                              api(`/api/appointments/${a.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({ status: "cancelled" }),
                              }),
                            )
                          }
                        >
                          ยกเลิก
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ประวัติการรักษา */}
          <section className="card">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <ClipboardList className="size-4 text-brand-600" /> ประวัติการรักษา
              </h2>
              <button
                className={visitFor ? "btn-ghost btn-sm" : "btn-outline btn-sm"}
                onClick={() => setVisitFor(visitFor ? null : "walkin")}
              >
                {visitFor ? <X className="size-4" /> : <Stethoscope className="size-4" />}
                {visitFor ? "ปิด" : "บันทึก walk-in"}
              </button>
            </div>

            {visitFor && (
              <form onSubmit={onCreateVisit} className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-2">
                <p className="text-sm text-slate-600 sm:col-span-2">
                  {apptForVisit ? (
                    <>
                      ตรวจตามนัด <b>{fmtDateTime(apptForVisit.appointment_at)}</b> — นัดจะเปลี่ยนเป็น &quot;เสร็จสิ้น&quot;
                    </>
                  ) : (
                    "ผู้ป่วย walk-in (ไม่มีนัด)"
                  )}
                </p>
                <DoctorSelect doctors={doctors} defaultValue={apptForVisit?.doctor_id} key={String(visitFor)} />
                <input name="fee" type="number" min={0} step="0.01" placeholder="ค่ารักษา (บาท)" className="input" />
                <textarea name="symptoms" rows={2} placeholder="อาการ" className="input sm:col-span-2" />
                <input name="diagnosis" placeholder="ผลวินิจฉัย" className="input" />
                <input name="treatment" placeholder="การรักษา / ยา" className="input" />
                <div className="flex justify-end sm:col-span-2">
                  <button disabled={busy} className="btn-primary">
                    บันทึกการรักษา
                  </button>
                </div>
              </form>
            )}

            {p.visits.length === 0 ? (
              <EmptyState icon={ClipboardList} text="ยังไม่มีประวัติการรักษา" />
            ) : (
              <ol className="relative space-y-5 p-5 before:absolute before:bottom-8 before:left-[29px] before:top-8 before:w-px before:bg-slate-200">
                {p.visits.map((v) => (
                  <li key={v.id} className="relative flex gap-4">
                    <span className="z-10 mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100 ring-4 ring-white">
                      <span className="size-2 rounded-full bg-brand-600" />
                    </span>
                    <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-sm">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-slate-900">
                          {fmtDateTime(v.visit_at)}
                          {!v.appointment_id && (
                            <span className="badge ml-2 bg-slate-100 text-slate-500">walk-in</span>
                          )}
                        </p>
                        <span className="font-medium text-emerald-600">฿{Number(v.fee ?? 0).toLocaleString("th-TH")}</span>
                      </div>
                      <p className="mb-2 text-xs text-slate-500">
                        พ.{v.doctors.first_name} {v.doctors.last_name} · {v.doctors.specialty}
                      </p>
                      <dl className="grid gap-1.5 sm:grid-cols-[90px_1fr]">
                        <dt className="text-slate-500">อาการ</dt>
                        <dd>{v.symptoms ?? "-"}</dd>
                        <dt className="text-slate-500">วินิจฉัย</dt>
                        <dd className="font-medium">{v.diagnosis ?? "-"}</dd>
                        <dt className="text-slate-500">การรักษา</dt>
                        <dd>{v.treatment ?? "-"}</dd>
                      </dl>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
