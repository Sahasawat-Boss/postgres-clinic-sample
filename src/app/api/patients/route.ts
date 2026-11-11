import { requireAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validation";
import { handleError } from "@/lib/api";

// GET /api/patients?q=คำค้น  — ค้นหาจาก HN / ชื่อ / นามสกุล / เบอร์โทร
export async function GET(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim();
    const patients = await prisma.patients.findMany({
      where: q
        ? {
            OR: [
              { hn: { contains: q, mode: "insensitive" } },
              { first_name: { contains: q, mode: "insensitive" } },
              { last_name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { hn: "asc" },
    });
    return Response.json(patients);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/patients — เพิ่มผู้ป่วยใหม่
export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const data = patientSchema.parse(await req.json());
    const patient = await prisma.patients.create({ data });
    return Response.json(patient, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
