import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/api";

// GET /api/doctors — รายชื่อแพทย์
export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const doctors = await prisma.doctors.findMany({ orderBy: { id: "asc" } });
    return Response.json(doctors);
  } catch (err) {
    return handleError(err);
  }
}
