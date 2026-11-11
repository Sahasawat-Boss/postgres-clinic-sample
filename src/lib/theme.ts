export type Theme = "light" | "dark" | "system";
export const THEME_COOKIE = "theme";

/**
 * สคริปต์ inline ที่รันใน <head> ก่อนเบราว์เซอร์วาดจอ — อ่าน cookie แล้วใส่ class "dark" ให้ <html>
 * เลยไม่มีจอขาวกระพริบ (ดู node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md)
 * และฟังการเปลี่ยนธีมของระบบเมื่อเลือก "system"
 */
export const themeScript = `(function(){try{
var d=document.documentElement,q=matchMedia("(prefers-color-scheme: dark)");
function t(){var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark|system)/);return m?m[1]:"system"}
function a(){var v=t();d.classList.toggle("dark",v==="dark"||(v==="system"&&q.matches))}
a();q.addEventListener("change",a);
}catch(e){}})()`;

export function getTheme(): Theme {
  const m = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=(light|dark|system)`));
  return (m?.[1] as Theme) ?? "system";
}

const listeners = new Set<() => void>();
/** ใช้กับ useSyncExternalStore */
export function subscribeTheme(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setTheme(theme: Theme) {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  listeners.forEach((cb) => cb());
}
