// รูปแบบข้อมูลที่ได้จาก API (JSON: วันที่เป็น string, Decimal เป็น string)
export type Patient = {
  id: number;
  hn: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female" | "other" | null;
  date_of_birth: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  blood_type: "A" | "B" | "AB" | "O" | null;
  allergies: string | null;
  created_at: string;
  updated_at: string;
};

export type Doctor = {
  id: number;
  first_name: string;
  last_name: string;
  specialty: string | null;
};

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export type Appointment = {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_at: string;
  status: AppointmentStatus;
  reason: string | null;
  doctors: Doctor;
};

export type Visit = {
  id: number;
  appointment_id: number | null;
  visit_at: string;
  symptoms: string | null;
  diagnosis: string | null;
  treatment: string | null;
  fee: string | null;
  doctors: Doctor;
};

export type PatientDetail = Patient & { appointments: Appointment[]; visits: Visit[] };

export const genderLabel = { male: "ชาย", female: "หญิง", other: "อื่นๆ" } as const;

export const statusLabel: Record<AppointmentStatus, string> = {
  scheduled: "รอพบแพทย์",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
  no_show: "ไม่มาตามนัด",
};

export function calcAge(dob: string) {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--;
  return age;
}

export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("th-TH", { dateStyle: "medium" });

export const fmtDateTime = (s: string) =>
  new Date(s).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });

/** เรียก API แล้วโยน error เป็นข้อความภาษาไทยจาก server */
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (res.status === 401 && typeof window !== "undefined" && !url.startsWith("/api/auth/login")) {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json();
  if (!res.ok) {
    const details = body.details
      ? " — " + Object.entries(body.details).map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`).join("; ")
      : "";
    throw new Error((body.error ?? "เกิดข้อผิดพลาด") + details);
  }
  return body as T;
}
