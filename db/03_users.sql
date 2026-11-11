-- บัญชีเจ้าหน้าที่สำหรับ login
CREATE TABLE users (
    id             SERIAL PRIMARY KEY,
    email          VARCHAR(255) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,          -- bcrypt hash (ห้ามเก็บรหัสผ่านตรงๆ)
    name           VARCHAR(100) NOT NULL,
    role           VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- บัญชีตัวอย่าง (เปลี่ยนรหัสผ่านก่อนใช้งานจริง)
-- admin@clinic.local / admin1234
-- staff@clinic.local / staff1234
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@clinic.local', '$2b$10$Zbkn57DD6U2z3jNbtDV.9uB7CdxKTk4q7sJgFRS8RJVNYqUqj5DOq', 'ผู้ดูแลระบบ', 'admin'),
('staff@clinic.local', '$2b$10$8433j4TSd1gLJvdKFkuGyuBY2f8Z8VeHAauDa5GvNLKSa/Blsog/q', 'เจ้าหน้าที่ต้อนรับ', 'staff');
