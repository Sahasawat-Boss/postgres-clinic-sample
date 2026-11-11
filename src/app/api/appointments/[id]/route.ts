import { requireAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { appointmentStatusSchema } from "@/lib/validation";
import { badId, handleError, parseId } from "@/lib/api";

// PATCH /api/appointments/:id — เปลี่ยนสถานะนัด { status }
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/appointments/[id]">) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const id = parseId((await ctx.params).id);
  if (!id) return badId();
  try {
    const data = appointmentStatusSchema.parse(await req.json());
    const appointment = await prisma.appointments.update({ where: { id }, data });
    return Response.json(appointment);
  } catch (err) {
    return handleError(err);
  }
}
