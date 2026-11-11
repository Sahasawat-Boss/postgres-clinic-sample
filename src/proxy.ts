import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const user = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  // login อยู่แล้วไม่ต้องเห็นหน้า login
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!user && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // ไม่ตรวจไฟล์ static / รูป / favicon
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
