import { requireAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validation";
import { badId, handleError, parseId } from "@/lib/api";

// GET /api/patients/:id — รายละเอียดผู้ป่วย + นัดหมาย + ประวัติการรักษา
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/patients/[id]">) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const id = parseId((await ctx.params).id);
  if (!id) return badId();
  try {
    const patient = await prisma.patients.findUnique({
      where: { id },
      include: {
        appointments: { include: { doctors: true }, orderBy: { appointment_at: "desc" } },
        visits: { include: { doctors: true }, orderBy: { visit_at: "desc" } },
      },
    });
    if (!patient) return Response.json({ error: "ไม่พบผู้ป่วย" }, { status: 404 });
    return Response.json(patient);
  } catch (err) {
    return handleError(err);
  }
}

// PUT /api/patients/:id — แก้ไขข้อมูลผู้ป่วย
export async function PUT(req: NextRequest, ctx: RouteContext<"/api/patients/[id]">) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const id = parseId((await ctx.params).id);
  if (!id) return badId();
  try {
    const data = patientSchema.parse(await req.json());
    const patient = await prisma.patients.update({
      where: { id },
      data: { ...data, updated_at: new Date() },
    });
    return Response.json(patient);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/patients/:id — ลบผู้ป่วย (นัดหมาย/ประวัติถูกลบตามด้วย CASCADE)
export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/patients/[id]">) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const id = parseId((await ctx.params).id);
  if (!id) return badId();
  try {
    await prisma.patients.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
