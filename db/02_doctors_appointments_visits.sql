-- แพทย์
CREATE TABLE doctors (
    id          SERIAL PRIMARY KEY,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    specialty   VARCHAR(100),                 -- สาขา
    phone       VARCHAR(20),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- นัดหมาย
CREATE TABLE appointments (
    id            SERIAL PRIMARY KEY,
    patient_id    INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id     INT NOT NULL REFERENCES doctors(id),
    appointment_at TIMESTAMPTZ NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    reason        TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ประวัติการรักษา (การมาพบแพทย์จริง)
CREATE TABLE visits (
    id              SERIAL PRIMARY KEY,
    patient_id      INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id       INT NOT NULL REFERENCES doctors(id),
    appointment_id  INT REFERENCES appointments(id),   -- walk-in ได้ จึง NULL ได้
    visit_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    symptoms        TEXT,                               -- อาการ
    diagnosis       TEXT,                               -- วินิจฉัย
    treatment       TEXT,                               -- การรักษา / ยา
    fee             NUMERIC(10,2) DEFAULT 0
);

CREATE INDEX idx_appointments_patient ON appointments (patient_id);
CREATE INDEX idx_appointments_time    ON appointments (appointment_at);
CREATE INDEX idx_visits_patient       ON visits (patient_id);

INSERT INTO doctors (first_name, last_name, specialty, phone) VALUES
('ประเสริฐ', 'รักษาดี', 'อายุรกรรม', '02-111-0001'),
('อรุณี',   'ใส่ใจ',   'กุมารเวช',  '02-111-0002'),
('ธนา',    'แม่นยำ',  'ทันตกรรม',  '02-111-0003');

INSERT INTO appointments (patient_id, doctor_id, appointment_at, status, reason) VALUES
(1, 1, '2026-11-01 09:00+07', 'completed', 'ไข้ ไอ'),
(2, 1, '2026-11-05 10:30+07', 'completed', 'ปวดหัวเรื้อรัง'),
(5, 2, '2026-11-08 14:00+07', 'completed', 'ตรวจพัฒนาการ'),
(4, 3, '2026-11-10 13:00+07', 'no_show',   'ขูดหินปูน'),
(1, 1, '2026-11-15 09:00+07', 'scheduled', 'ติดตามอาการ'),
(3, 1, '2026-11-16 11:00+07', 'scheduled', 'ตรวจความดัน'),
(4, 3, '2026-11-18 13:00+07', 'scheduled', 'ขูดหินปูน (นัดใหม่)');

INSERT INTO visits (patient_id, doctor_id, appointment_id, visit_at, symptoms, diagnosis, treatment, fee) VALUES
(1, 1, 1,    '2026-11-01 09:10+07', 'ไข้ 38.5 ไอมีเสมหะ', 'หลอดลมอักเสบ', 'ยาลดไข้, ยาละลายเสมหะ', 450),
(2, 1, 2,    '2026-11-05 10:40+07', 'ปวดหัวข้างเดียว 2 สัปดาห์', 'ไมเกรน', 'ยาแก้ปวด (เลี่ยง Penicillin)', 600),
(5, 2, 3,    '2026-11-08 14:05+07', 'ตรวจสุขภาพเด็ก', 'ปกติ', 'วัคซีนตามเกณฑ์', 800),
(3, 1, NULL, '2026-11-09 16:00+07', 'เวียนหัว', 'ความดันสูง', 'ยาลดความดัน', 500);
