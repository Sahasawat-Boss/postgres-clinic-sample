"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { api, type Doctor } from "@/lib/types";

/** ISO -> ค่าสำหรับ <input type="datetime-local"> ตามเวลาเครื่อง */
function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  appointment: { id: number; appointment_at: string; doctor_id: number };
  doctors: Doctor[];
  onDone: () => void;
  onCancel: () => void;
};

/** ฟอร์มเลื่อนนัดแบบ inline — เลือกวันเวลาใหม่ และเปลี่ยนแพทย์ได้ */
export default function RescheduleForm({ appointment, doctors, onDone, onCancel }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    setError(null);
    try {
      await api(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          appointment_at: new Date(String(f.get("appointment_at"))).toISOString(),
          doctor_id: Number(f.get("doctor_id")),
        }),
      });
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 w-full space-y-3 rounded-xl border border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-sky-800">
        <CalendarClock className="size-4" /> เลื่อนนัด
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="appointment_at"
          type="datetime-local"
          required
          className="input"
          defaultValue={toLocalInput(appointment.appointment_at)}
        />
        <select name="doctor_id" required className="input" defaultValue={appointment.doctor_id}>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              พ.{d.first_name} {d.last_name} ({d.specialty})
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-ghost btn-sm">
          ยกเลิก
        </button>
        <button disabled={saving} className="btn-primary btn-sm">
          {saving ? "กำลังบันทึก..." : "ยืนยันเลื่อนนัด"}
        </button>
      </div>
    </form>
  );
}
