"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeartPulse, Phone, Save, User } from "lucide-react";
import { api, type Patient } from "@/lib/types";
import { ErrorBox } from "@/components/ui";

type Props = { patient?: Patient };

function Section({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="mb-5 flex items-center gap-2 font-semibold text-slate-900">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="size-4" />
        </span>
        {title}
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function PatientForm({ patient }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!patient;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)));
    try {
      const saved = await api<Patient>(isEdit ? `/api/patients/${patient.id}` : "/api/patients", {
        method: isEdit ? "PUT" : "POST",
        body,
      });
      router.push(`/patients/${saved.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Section icon={User} title="ข้อมูลทั่วไป">
        <div>
          <label className="label">HN</label>
          {isEdit ? (
            <input name="hn" required className="input font-mono" defaultValue={patient.hn} />
          ) : (
            <input disabled className="input font-mono bg-slate-50 text-slate-400" value="ระบบจะออกเลขให้อัตโนมัติ" />
          )}
        </div>
        <div>
          <label className="label">วันเกิด *</label>
          <input name="date_of_birth" type="date" required className="input" defaultValue={patient?.date_of_birth.slice(0, 10)} />
        </div>
        <div>
          <label className="label">ชื่อ *</label>
          <input name="first_name" required className="input" defaultValue={patient?.first_name} />
        </div>
        <div>
          <label className="label">นามสกุล *</label>
          <input name="last_name" required className="input" defaultValue={patient?.last_name} />
        </div>
        <div>
          <label className="label">เพศ</label>
          <select name="gender" className="input" defaultValue={patient?.gender ?? ""}>
            <option value="">- ไม่ระบุ -</option>
            <option value="male">ชาย</option>
            <option value="female">หญิง</option>
            <option value="other">อื่นๆ</option>
          </select>
        </div>
      </Section>

      <Section icon={Phone} title="ข้อมูลติดต่อ">
        <div>
          <label className="label">เบอร์โทร</label>
          <input name="phone" className="input" defaultValue={patient?.phone ?? ""} placeholder="08x-xxx-xxxx" />
        </div>
        <div>
          <label className="label">อีเมล</label>
          <input name="email" type="email" className="input" defaultValue={patient?.email ?? ""} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">ที่อยู่</label>
          <textarea name="address" rows={2} className="input" defaultValue={patient?.address ?? ""} />
        </div>
      </Section>

      <Section icon={HeartPulse} title="ข้อมูลสุขภาพ">
        <div>
          <label className="label">กรุ๊ปเลือด</label>
          <select name="blood_type" className="input" defaultValue={patient?.blood_type ?? ""}>
            <option value="">- ไม่ทราบ -</option>
            {["A", "B", "AB", "O"].map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">ประวัติแพ้ยา / อาหาร</label>
          <input
            name="allergies"
            className="input"
            defaultValue={patient?.allergies ?? ""}
            placeholder="เช่น Penicillin, อาหารทะเล"
          />
        </div>
      </Section>

      {error && <ErrorBox message={error} />}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="btn-outline">
          ยกเลิก
        </button>
        <button type="submit" disabled={saving} className="btn-primary min-w-32">
          <Save className="size-4" />
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </form>
  );
}
