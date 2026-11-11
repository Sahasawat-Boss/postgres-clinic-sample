-- Patient Management: ตารางผู้ป่วย
CREATE TABLE patients (
    id              SERIAL PRIMARY KEY,
    hn              VARCHAR(20) UNIQUE NOT NULL,          -- Hospital Number
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    gender          VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth   DATE NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(255),
    address         TEXT,
    blood_type      VARCHAR(3) CHECK (blood_type IN ('A','B','AB','O')),
    allergies       TEXT,                                 -- ประวัติแพ้ยา/อาหาร
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- index สำหรับค้นหาด้วยชื่อ/เบอร์โทร
CREATE INDEX idx_patients_name  ON patients (first_name, last_name);
CREATE INDEX idx_patients_phone ON patients (phone);

-- ข้อมูลตัวอย่าง (สมมติ)
INSERT INTO patients (hn, first_name, last_name, gender, date_of_birth, phone, email, address, blood_type, allergies) VALUES
('HN000001', 'สมชาย',  'ใจดี',     'male',   '1985-03-12', '081-111-1111', 'somchai@example.com', 'กรุงเทพฯ',   'O',  NULL),
('HN000002', 'สมหญิง', 'รักสุข',   'female', '1992-07-25', '082-222-2222', 'somying@example.com', 'นนทบุรี',    'A',  'Penicillin'),
('HN000003', 'วิชัย',   'มั่นคง',   'male',   '1970-11-02', '083-333-3333', NULL,                  'เชียงใหม่',  'B',  NULL),
('HN000004', 'มาลี',   'สวยงาม',  'female', '2001-01-18', '084-444-4444', 'malee@example.com',   'ขอนแก่น',    'AB', 'อาหารทะเล'),
('HN000005', 'ด.ช.ภูมิ', 'เก่งกล้า', 'male',   '2018-05-30', '085-555-5555', NULL,                  'กรุงเทพฯ',   'O',  'Aspirin');
