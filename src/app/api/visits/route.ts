import { requireAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { visitSchema } from "@/lib/validation";
import { handleError } from "@/lib/api";

// POST /api/visits — บันทึกการรักษา (ถ้ามี appointment_id จะปิดนัดเป็น completed ให้ด้วย)
export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const data = visitSchema.parse(await req.json());
    const visit = await prisma.$transaction(async (tx) => {
      const created = await tx.visits.create({ data });
      if (data.appointment_id) {
        await tx.appointments.update({
          where: { id: data.appointment_id },
          data: { status: "completed" },
        });
      }
      return created;
    });
    return Response.json(visit, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
