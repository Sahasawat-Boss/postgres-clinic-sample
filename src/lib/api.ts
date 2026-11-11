import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";

/** แปลง error เป็น JSON response มาตรฐาน { error, details? } */
export function handleError(err: unknown) {
  if (err instanceof z.ZodError) {
    return Response.json(
      { error: "ข้อมูลไม่ถูกต้อง", details: z.flattenError(err).fieldErrors },
      { status: 400 },
    );
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return Response.json({ error: "ข้อมูลซ้ำ (เช่น HN นี้มีอยู่แล้ว)" }, { status: 409 });
    if (err.code === "P2025") return Response.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
    if (err.code === "P2003") return Response.json({ error: "อ้างอิงข้อมูลที่ไม่มีอยู่ (เช่น patient/doctor id)" }, { status: 400 });
  }
  console.error(err);
  return Response.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
}

export function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const badId = () => Response.json({ error: "id ไม่ถูกต้อง" }, { status: 400 });
