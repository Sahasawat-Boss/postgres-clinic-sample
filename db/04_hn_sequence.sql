-- รัน HN อัตโนมัติ: HN000001, HN000002, ...
CREATE SEQUENCE IF NOT EXISTS hn_seq;

-- เริ่มต่อจากเลข HN สูงสุดที่มีอยู่ (รูปแบบ HN + ตัวเลข)
SELECT setval(
  'hn_seq',
  GREATEST(COALESCE((SELECT MAX(substring(hn FROM '^HN(\d+)$')::int) FROM patients), 0), 1),
  (SELECT COUNT(*) > 0 FROM patients WHERE hn ~ '^HN\d+$')
);

ALTER TABLE patients
  ALTER COLUMN hn SET DEFAULT 'HN' || lpad(nextval('hn_seq')::text, 6, '0');

ALTER SEQUENCE hn_seq OWNED BY patients.hn;
