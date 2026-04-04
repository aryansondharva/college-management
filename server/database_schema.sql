-- Unifiedtransform Admin Portal Schema (PostgreSQL)

-- Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(50),
    phone VARCHAR(50),
    address TEXT,
    address2 TEXT,
    city VARCHAR(100),
    zip VARCHAR(20),
    birthday DATE,
    blood_type VARCHAR(10),
    religion VARCHAR(50),
    nationality VARCHAR(100),
    role VARCHAR(50) DEFAULT 'student',
    enrollment_no VARCHAR(100) UNIQUE,
    photo TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions & Semesters
CREATE TABLE IF NOT EXISTS school_sessions (
    id SERIAL PRIMARY KEY,
    session VARCHAR(255) NOT NULL,
    current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS semesters (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    semester VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Academic Structure
CREATE TABLE IF NOT EXISTS school_classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    numeric_name INTEGER NOT NULL,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Student Metadata
CREATE TABLE IF NOT EXISTS student_academic_infos (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id),
    class_id INTEGER REFERENCES school_classes(id),
    section_id INTEGER REFERENCES sections(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_parent_infos (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    father_phone VARCHAR(50),
    mother_phone VARCHAR(50),
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(50),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Exams & Grading
CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    semester_id INTEGER REFERENCES semesters(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_rules (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    total_marks INTEGER DEFAULT 100,
    pass_marks INTEGER DEFAULT 40,
    exam_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grading_systems (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES school_sessions(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES school_classes(id) ON DELETE CASCADE,
    semester_id INTEGER REFERENCES semesters(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grade_rules (
    id SERIAL PRIMARY KEY,
    grading_system_id INTEGER REFERENCES grading_systems(id) ON DELETE CASCADE,
    point DECIMAL(4,2) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    min_mark INTEGER NOT NULL,
    max_mark INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Records
CREATE TABLE IF NOT EXISTS marks (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id),
    class_id INTEGER REFERENCES school_classes(id),
    course_id INTEGER REFERENCES courses(id),
    exam_type VARCHAR(50), -- Mid Term, Final, etc.
    mark INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendances (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id),
    class_id INTEGER REFERENCES school_classes(id),
    section_id INTEGER REFERENCES sections(id),
    attendance_date DATE NOT NULL,
    present BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crucial for the ON CONFLICT query in the backend
CREATE UNIQUE INDEX IF NOT EXISTS unique_attendance_idx ON attendances (student_id, attendance_date, COALESCE(course_id, 0));

CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES school_sessions(id),
    class_id INTEGER REFERENCES school_classes(id),
    section_id INTEGER REFERENCES sections(id),
    promoted_at TIMESTAMP DEFAULT NOW()
);

-- Communication & Resources
CREATE TABLE IF NOT EXISTS notices (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    session_id INTEGER REFERENCES school_sessions(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE,
    class_id INTEGER REFERENCES school_classes(id),
    course_id INTEGER REFERENCES courses(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS syllabi (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    class_id INTEGER REFERENCES school_classes(id),
    section_id INTEGER REFERENCES sections(id),
    session_id INTEGER REFERENCES school_sessions(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routines (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES school_classes(id),
    section_id INTEGER REFERENCES sections(id),
    course_id INTEGER REFERENCES courses(id),
    day VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    session_id INTEGER REFERENCES school_sessions(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_settings (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES school_sessions(id) UNIQUE,
    attendance_type VARCHAR(50) DEFAULT 'Daily', -- Daily, Subject
    final_marks_submission_status VARCHAR(20) DEFAULT 'closed', -- open, closed
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissions System
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_permissions (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, permission_id)
);

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Push Notifications Support
CREATE TABLE IF NOT EXISTS push_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, token)
);

