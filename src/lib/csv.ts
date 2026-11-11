/** แปลงค่า 1 ช่องเป็น CSV — ครอบ "" ถ้ามี , " หรือขึ้นบรรทัดใหม่ และกันสูตร Excel (CSV injection) */
function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** ตอบกลับเป็นไฟล์ CSV ให้ดาวน์โหลด — ใส่ BOM ให้ Excel อ่านภาษาไทยถูก */
export function csvResponse(filename: string, headers: string[], rows: unknown[][]) {
  const body = [headers, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  return new Response("\uFEFF" + body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** วันที่แบบ YYYY-MM-DD ตามเวลาไทย */
export const ymd = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });
export const ymdHm = (d: Date) =>
  d.toLocaleString("sv-SE", { timeZone: "Asia/Bangkok", hour12: false }).slice(0, 16);
