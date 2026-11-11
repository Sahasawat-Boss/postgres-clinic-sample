# Clinic Management (Next.js + PostgreSQL)

ระบบจัดการคลินิกตัวอย่าง: ผู้ป่วย, แพทย์, นัดหมาย, ประวัติการรักษา

**Stack:** Next.js 16 (App Router) · Prisma 7 · PostgreSQL 18 · Tailwind CSS 4 · Zod

## เริ่มใช้งาน

```bash
npm install
cp .env.example .env          # แก้ DATABASE_URL ถ้า port/รหัสผ่านต่างจากนี้
npx prisma generate
npm run dev                   # http://localhost:3000
```

### สร้างฐานข้อมูลใหม่ (ถ้ายังไม่มี)

```bash
psql -U postgres -p 5433 -c "CREATE DATABASE clinic;"
psql -U postgres -p 5433 -d clinic -f db/01_patients.sql
psql -U postgres -p 5433 -d clinic -f db/02_doctors_appointments_visits.sql
psql -U postgres -p 5433 -d clinic -f db/03_users.sql
```

### Login

ทุกหน้าและทุก API (ยกเว้น `/login`) ต้อง login ก่อน — session เก็บเป็น JWT ใน cookie `httpOnly` อายุ 8 ชม.

| อีเมล | รหัสผ่าน | role |
|---|---|---|
| admin@clinic.local | admin1234 | admin |
| staff@clinic.local | staff1234 | staff |

ตั้ง `SESSION_SECRET` ใน `.env` เป็นค่าสุ่มยาวๆ และเปลี่ยนรหัสผ่านก่อนใช้งานจริง

ถ้าแก้โครงสร้างตารางใน DB ให้รัน `npx prisma db pull && npx prisma generate` เพื่ออัปเดต schema

## API

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| POST | `/api/auth/login` | เข้าสู่ระบบ `{ email, password }` |
| POST | `/api/auth/logout` | ออกจากระบบ |
| GET | `/api/auth/me` | ผู้ใช้ปัจจุบัน |
| GET | `/api/dashboard` | ตัวเลขสรุป + นัดที่กำลังจะถึง + การรักษาล่าสุด |
| GET | `/api/patients?q=` | รายชื่อ/ค้นหาผู้ป่วย (HN, ชื่อ, นามสกุล, เบอร์) |
| POST | `/api/patients` | เพิ่มผู้ป่วย |
| GET | `/api/patients/:id` | รายละเอียด + นัดหมาย + ประวัติการรักษา |
| PUT | `/api/patients/:id` | แก้ไขผู้ป่วย |
| DELETE | `/api/patients/:id` | ลบผู้ป่วย (ลบนัด/ประวัติตาม) |
| GET | `/api/doctors` | รายชื่อแพทย์ |
| GET | `/api/appointments?status=&patient_id=` | รายการนัด |
| POST | `/api/appointments` | สร้างนัด |
| PATCH | `/api/appointments/:id` | เปลี่ยนสถานะนัด `{ status }` |
| POST | `/api/visits` | บันทึกการรักษา (ถ้าระบุ `appointment_id` นัดจะเป็น completed) |

Error ตอบเป็น `{ error, details? }` พร้อม status 400 / 404 / 409 / 500

## โครงสร้าง

```
db/                      SQL สร้างตาราง + ข้อมูลตัวอย่าง
prisma/schema.prisma     ได้จาก prisma db pull
src/lib/prisma.ts        Prisma client (adapter-pg)
src/lib/validation.ts    Zod schemas
src/lib/api.ts           จัดการ error ของ API
src/lib/types.ts         types + helper ฝั่งหน้าเว็บ
src/app/api/...          Route Handlers (API)
src/app/patients/...     หน้าเว็บ: รายชื่อ, เพิ่ม, รายละเอียด, แก้ไข
src/components/          PatientForm
```
