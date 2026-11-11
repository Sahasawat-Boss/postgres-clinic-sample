import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullish();

export const patientSchema = z.object({
  // เว้นว่างได้: ตอนสร้าง DB จะรัน HN ให้เอง (hn_seq), ตอนแก้ไขจะคงค่าเดิม
  hn: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((v) => v || undefined),
  first_name: z.string().trim().min(1, "กรุณาระบุชื่อ").max(100),
  last_name: z.string().trim().min(1, "กรุณาระบุนามสกุล").max(100),
  gender: z.enum(["male", "female", "other"]).nullish().or(z.literal("").transform(() => null)),
  date_of_birth: z.coerce.date({ message: "วันเกิดไม่ถูกต้อง" }),
  phone: optionalText,
  email: z.email("อีเมลไม่ถูกต้อง").nullish().or(z.literal("").transform(() => null)),
  address: optionalText,
  blood_type: z.enum(["A", "B", "AB", "O"]).nullish().or(z.literal("").transform(() => null)),
  allergies: optionalText,
});

export const appointmentSchema = z.object({
  patient_id: z.coerce.number().int().positive(),
  doctor_id: z.coerce.number().int().positive(),
  appointment_at: z.coerce.date({ message: "วันเวลานัดไม่ถูกต้อง" }),
  reason: optionalText,
});

// PATCH นัด: เปลี่ยนสถานะ และ/หรือ เลื่อนนัด (ต้องส่งอย่างน้อย 1 อย่าง)
export const appointmentUpdateSchema = z
  .object({
    status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).optional(),
    appointment_at: z.coerce.date({ message: "วันเวลานัดไม่ถูกต้อง" }).optional(),
    doctor_id: z.coerce.number().int().positive().optional(),
    reason: optionalText,
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), { message: "ไม่มีข้อมูลที่จะแก้ไข" });

export const visitSchema = z.object({
  patient_id: z.coerce.number().int().positive(),
  doctor_id: z.coerce.number().int().positive(),
  appointment_id: z.coerce.number().int().positive().nullish(),
  visit_at: z.coerce.date().optional(),
  symptoms: optionalText,
  diagnosis: optionalText,
  treatment: optionalText,
  fee: z.coerce.number().min(0).default(0),
});
