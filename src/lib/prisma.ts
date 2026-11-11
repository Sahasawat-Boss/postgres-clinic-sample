import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// ใช้ instance เดียวทั้งแอป (กัน connection บานตอน hot reload ใน dev)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      // บังคับ session เป็น UTC: ไม่งั้น adapter อ่าน timestamptz ผิด 7 ชม. เมื่อ DB ตั้ง timezone เป็น Asia/Bangkok
      options: "-c TimeZone=UTC",
    }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
