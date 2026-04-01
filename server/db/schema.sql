-- ============================================================
-- Unifiedtransform School Management System
-- PostgreSQL Database Schema
-- Run this in pgAdmin4 Query Tool
-- ============================================================

-- Drop existing tables if recreating
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS final_marks CASCADE;
DROP TABLE IF EXISTS marks CASCADE;
DROP TABLE IF EXISTS attendances CASCADE;
DROP TABLE IF EXISTS routines CASCADE;
DROP TABLE IF EXISTS syllabi CASCADE;
DROP TABLE IF EXISTS grade_rules CASCADE;
DROP TABLE IF EXISTS grading_systems CASCADE;
DROP TABLE IF EXISTS exam_rules CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS academic_settings CASCADE;
DROP TABLE IF EXISTS assigned_teachers CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS school_classes CASCADE;
DROP TABLE IF EXISTS semesters CASCADE;
DROP TABLE IF EXISTS school_sessions CASCADE;
DROP TABLE IF EXISTS student_academic_infos CASCADE;
DROP TABLE IF EXISTS student_parent_infos CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;

-- ===== USERS =====
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    nationality VARCHAR(100) NOT NULL DEFAULT '',
    phone VARCHAR(30) NOT NULL DEFAULT '',
    address VARCHAR(255) NOT NULL DEFAULT '',
    address2 VARCHAR(255) NOT NULL DEFAULT '',
    city VARCHAR(100) NOT NULL DEFAULT '',
    zip VARCHAR(20) NOT NULL DEFAULT '',
    photo VARCHAR(255),
    birthday VARCHAR(30),
    blood_type VARCHAR(10),
    religion VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    email_verified_at TIMESTAMP,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== PASSWORD RESETS =====
CREATE TABLE password_resets (
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===== ROLES =====
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    guard_name VARCHAR(100) NOT NULL DEFAULT 'web',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== PERMISSIONS =====
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    guard_name VARCHAR(100) NOT NULL DEFAULT 'web',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== USER ROLES =====
CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ===== ROLE PERMISSIONS =====
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ===== USER PERMISSIONS (direct) =====
CREATE TABLE user_permissions (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, permission_id)
);

-- ===== SCHOOL SESSIONS =====
CREATE TABLE school_sessions (
    id SERIAL PRIMARY KEY,
    session VARCHAR(100) NOT NULL,
    current BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== SEMESTERS =====
CREATE TABLE semesters (
    id SERIAL PRIMARY KEY,
    semester VARCHAR(100) NOT NULL,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== SCHOOL CLASSES =====
CREATE TABLE school_classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    numeric_name INTEGER,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== SECTIONS =====
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== COURSES =====
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== ACADEMIC SETTINGS =====
CREATE TABLE academic_settings (
    id SERIAL PRIMARY KEY,
    session_id INTEGER UNIQUE REFERENCES school_sessions(id) ON DELETE CASCADE,
    final_marks_submission_status BOOLEAN DEFAULT false,
    attendance_type VARCHAR(20) DEFAULT 'section',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== STUDENT PARENT INFO =====
CREATE TABLE student_parent_infos (
    id SERIAL PRIMARY KEY,
    student_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    father_phone VARCHAR(30),
    mother_phone VARCHAR(30),
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== STUDENT ACADEMIC INFO =====
CREATE TABLE student_academic_infos (
    id SERIAL PRIMARY KEY,
    student_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== PROMOTIONS =====
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== EXAM RULES =====
CREATE TABLE exam_rules (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    exam_type VARCHAR(100),
    total_marks INTEGER,
    pass_marks INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== GRADING SYSTEMS =====
CREATE TABLE grading_systems (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    lowest_mark INTEGER,
    highest_mark INTEGER,
    grade_name VARCHAR(10),
    grade_point DECIMAL(4,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== GRADE RULES =====
CREATE TABLE grade_rules (
    id SERIAL PRIMARY KEY,
    grading_system_id INTEGER REFERENCES grading_systems(id) ON DELETE CASCADE,
    lowest_mark INTEGER,
    highest_mark INTEGER,
    grade_name VARCHAR(10),
    grade_point DECIMAL(4,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== MARKS =====
CREATE TABLE marks (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    exam_type VARCHAR(100),
    mark INTEGER,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== EXAMS =====
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== FINAL MARKS =====
CREATE TABLE final_marks (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    total_marks INTEGER,
    grade_name VARCHAR(10),
    grade_point DECIMAL(4,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== ATTENDANCES =====
CREATE TABLE attendances (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    present BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== NOTICES =====
CREATE TABLE notices (
    id SERIAL PRIMARY KEY,
    notice TEXT NOT NULL,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== EVENTS =====
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    color VARCHAR(30),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== SYLLABI =====
CREATE TABLE syllabi (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    syllabus TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== ROUTINES =====
CREATE TABLE routines (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20),
    start_time TIME,
    end_time TIME,
    room_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== ASSIGNED TEACHERS =====
CREATE TABLE assigned_teachers (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== ASSIGNMENTS =====
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    due_date DATE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== INDEXES =====
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_marks_course ON marks(course_id);
CREATE INDEX idx_attendances_student ON attendances(student_id);
CREATE INDEX idx_attendances_date ON attendances(attendance_date);
CREATE INDEX idx_promotions_session ON promotions(session_id);
CREATE INDEX idx_assigned_teachers_teacher ON assigned_teachers(teacher_id);

-- ============================================================
-- SEED DATA: Permissions
-- ============================================================
INSERT INTO permissions (name) VALUES
('create users'), ('view users'), ('edit users'), ('delete users'),
('promote students'),
('create notices'), ('view notices'), ('edit notices'), ('delete notices'),
('create events'), ('view events'), ('edit events'), ('delete events'),
('create syllabi'), ('view syllabi'), ('edit syllabi'), ('delete syllabi'),
('create routines'), ('view routines'), ('edit routines'), ('delete routines'),
('create exams'), ('view exams'), ('delete exams'),
('create exams rule'), ('view exams rule'), ('edit exams rule'), ('delete exams rule'),
('view exams history'),
('create grading systems'), ('view grading systems'), ('edit grading systems'), ('delete grading systems'),
('create grading systems rule'), ('view grading systems rule'), ('edit grading systems rule'), ('delete grading systems rule'),
('take attendances'), ('view attendances'), ('update attendances type'),
('submit assignments'), ('create assignments'), ('view assignments'),
('save marks'), ('view marks'),
('create school sessions'),
('create semesters'), ('view semesters'), ('edit semesters'),
('assign teachers'),
('create courses'), ('view courses'), ('edit courses'),
('view academic settings'), ('update marks submission window'), ('update browse by session'),
('create classes'), ('view classes'), ('edit classes'),
('create sections'), ('view sections'), ('edit sections');

-- ============================================================
-- SEED DATA: Default Admin User
-- Password: admin123 (bcrypt hashed - will be replaced by setup script)
-- ============================================================
INSERT INTO users (first_name, last_name, email, gender, nationality, phone, address, address2, city, zip, role, password)
VALUES ('Admin', 'User', 'admin@ut.com', 'Male', 'N/A', '0000000000', 'Admin Address', '', 'Admin City', '000000', 'admin',
'$2b$10$rQnGKQ0JslXOFE6AKFVsxuzLGSwJKenWk/A/dO7Ynj9M5gJN7gGIm');

-- Grant all permissions to admin user
INSERT INTO user_permissions (user_id, permission_id)
SELECT 1, id FROM permissions;

-- ============================================================
-- SEED DATA: Default School Session
-- ============================================================
INSERT INTO school_sessions (session, current) VALUES ('2024-2025', true);
INSERT INTO academic_settings (session_id, final_marks_submission_status, attendance_type) VALUES (1, false, 'section');

COMMIT;
