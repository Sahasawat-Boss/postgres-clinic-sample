import { jwtVerify, SignJWT } from "jose";

// ใช้ได้ทั้งใน proxy.ts และ server (ไม่พึ่ง Node API)
export const SESSION_COOKIE = "clinic_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 ชั่วโมง (1 กะ)
export const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30; // "จดจำฉันไว้" 30 วัน

export type SessionUser = { id: number; name: string; email: string; role: "admin" | "staff" };

const key = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
};

export async function createSessionToken(user: SessionUser, maxAge = SESSION_MAX_AGE) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(key());
}

export async function verifySessionToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return { id: payload.id, name: payload.name, email: payload.email, role: payload.role } as SessionUser;
  } catch {
    return null;
  }
}
