-- ==============================================================================
-- D ENSURED CONSULT - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Office: Doyin Plaza, Igboelerin Bus Stop, Beside Prime-Mart, Okomaiko, Lagos
-- Phone & WhatsApp: 08147896930
-- Motto: "Education is power"
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enum Types
DO $$ BEGIN
    CREATE TYPE exam_program_type AS ENUM (
        'UTME',
        'WAEC',
        'NECO',
        'IELTS',
        'COMBINED_OLEVEL_UTME',
        'ATSWA',
        'TOEFL',
        'SAT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE study_mode_type AS ENUM (
        'Physical Weekday',
        'Weekend Intensive',
        'Online Virtual Live',
        'Private 1-on-1'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admission_status_type AS ENUM (
        'Pending Review',
        'Approved',
        'Interview Scheduled',
        'Enrolled',
        'Rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM (
        'Successful',
        'Pending',
        'Failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM (
        'student',
        'tutor',
        'admin',
        'super_admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. Profiles Table (Linked to Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role user_role_type DEFAULT 'student'::user_role_type,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 4. Students Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    registration_number TEXT UNIQUE NOT NULL, -- e.g. "DEC-2026-0142"
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_url TEXT,
    program exam_program_type NOT NULL,
    study_mode study_mode_type NOT NULL DEFAULT 'Physical Weekday',
    target_exam_date DATE,
    target_score TEXT DEFAULT '320+',
    current_average_score NUMERIC(5, 2) DEFAULT 0.00,
    attendance_rate NUMERIC(5, 2) DEFAULT 100.00,
    syllabus_completion NUMERIC(5, 2) DEFAULT 0.00,
    tuition_total NUMERIC(12, 2) NOT NULL DEFAULT 85000.00,
    tuition_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tuition_balance NUMERIC(12, 2) GENERATED ALWAYS AS (tuition_total - tuition_paid) STORED,
    currency TEXT NOT NULL DEFAULT 'NGN',
    assigned_advisor TEXT DEFAULT 'Dr. Anthony Adeleke (Academic Director)',
    next_class TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for speedy lookups
CREATE INDEX IF NOT EXISTS idx_students_reg_no ON public.students(registration_number);
CREATE INDEX IF NOT EXISTS idx_students_program ON public.students(program);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);

-- ==============================================================================
-- 5. Admission Applications Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    program exam_program_type NOT NULL,
    study_mode study_mode_type NOT NULL,
    state_of_origin TEXT NOT NULL,
    target_institution TEXT,
    target_course TEXT,
    subject_combinations TEXT[], -- array of subjects e.g. ['Use of English', 'Mathematics', 'Physics', 'Chemistry']
    status admission_status_type DEFAULT 'Pending Review'::admission_status_type,
    notes TEXT,
    assigned_cohort TEXT,
    submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admissions_status ON public.admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_email ON public.admissions(email);

-- ==============================================================================
-- 6. Mock Tests & Examinations Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mock_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    test_date DATE NOT NULL,
    program exam_program_type NOT NULL,
    total_score NUMERIC(6, 2) NOT NULL,
    max_score NUMERIC(6, 2) NOT NULL DEFAULT 400,
    percentage NUMERIC(5, 2) GENERATED ALWAYS AS (ROUND((total_score / NULLIF(max_score, 0)) * 100, 2)) STORED,
    percentile NUMERIC(5, 2) DEFAULT 90,
    status TEXT DEFAULT 'Completed',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mock_tests_student ON public.mock_tests(student_id);

-- ==============================================================================
-- 7. Mock Subject Scores Breakdown
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subject_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mock_test_id UUID NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 100,
    grade TEXT,
    trend TEXT DEFAULT 'up' CHECK (trend IN ('up', 'down', 'stable')),
    teacher_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subject_scores_test ON public.subject_scores(mock_test_id);

-- ==============================================================================
-- 8. Payment & Billing Transactions Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL, -- e.g. "DEC-TX-92810"
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    program TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    status payment_status_type NOT NULL DEFAULT 'Successful'::payment_status_type,
    payment_method TEXT NOT NULL, -- 'Paystack Card', 'Bank Transfer', 'USSD', 'Cash / POS'
    description TEXT NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(reference);
CREATE INDEX IF NOT EXISTS idx_transactions_student ON public.transactions(student_id);

-- ==============================================================================
-- 9. Lesson Schedules & Timetable Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    program exam_program_type NOT NULL,
    tutor_name TEXT NOT NULL,
    tutor_avatar TEXT,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    time_slot TEXT NOT NULL, -- e.g. "09:00 AM - 11:30 AM"
    room TEXT NOT NULL, -- e.g. "CBT Hall A" or "Doyin Plaza Suite 1"
    is_live_online BOOLEAN NOT NULL DEFAULT FALSE,
    zoom_link TEXT,
    materials_count INTEGER NOT NULL DEFAULT 1,
    topic_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 10. Announcements & Notices Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Urgent', 'Academic', 'Exam Registration', 'Holiday')),
    content TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'D Ensured Directorate',
    published_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 11. Website Inquiries & Contact Messages Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    program_interest TEXT NOT NULL,
    message TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 12. Supabase Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Helper function to check if caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin'::user_role_type, 'super_admin'::user_role_type)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view and edit their own profile; Admins can view all
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admissions: Anyone (public) can insert an admission application; Admins can read & update
CREATE POLICY "Public can submit admission application" ON public.admissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all admissions" ON public.admissions
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update admissions" ON public.admissions
    FOR UPDATE USING (public.is_admin());

-- Inquiries: Anyone can send an inquiry; Admins can read & update
CREATE POLICY "Public can submit inquiry" ON public.inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries" ON public.inquiries
    FOR SELECT USING (public.is_admin());

-- Schedules: Public and authenticated users can view timetables
CREATE POLICY "Anyone can view schedules" ON public.schedules
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage schedules" ON public.schedules
    FOR ALL USING (public.is_admin());

-- Announcements: Anyone can view announcements; Admins manage them
CREATE POLICY "Anyone can read announcements" ON public.announcements
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage announcements" ON public.announcements
    FOR ALL USING (public.is_admin());

-- Students: Students can view their own profile; Admins can manage all
CREATE POLICY "Students can view own profile" ON public.students
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage students" ON public.students
    FOR ALL USING (public.is_admin());

-- Mock Tests & Scores: Students can view their own; Admins manage all
CREATE POLICY "Students can view own mock tests" ON public.mock_tests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE students.id = mock_tests.student_id AND students.user_id = auth.uid()
        ) OR public.is_admin()
    );

CREATE POLICY "Admins can manage mock tests" ON public.mock_tests
    FOR ALL USING (public.is_admin());

CREATE POLICY "View subject scores" ON public.subject_scores
    FOR SELECT USING (true);

CREATE POLICY "Admins manage subject scores" ON public.subject_scores
    FOR ALL USING (public.is_admin());

-- Transactions: Students see own payments; Admins manage all
CREATE POLICY "Students can view own transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE students.id = transactions.student_id AND students.user_id = auth.uid()
        ) OR public.is_admin()
    );

CREATE POLICY "Admins can manage transactions" ON public.transactions
    FOR ALL USING (public.is_admin());

-- ==============================================================================
-- 13. Automatic Profile Creation Trigger on Supabase Auth Sign Up
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'D Ensured Scholar'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role_type, 'student'::user_role_type)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 14. Initial Seed Data (D Ensured Consult Center Data)
-- ==============================================================================

-- Sample Announcements
INSERT INTO public.announcements (title, category, content, author, published_date)
VALUES 
(
  '2026 UTME Mock Computer Simulation Series Commences This Saturday',
  'Urgent',
  'All registered UTME candidates must arrive at Doyin Plaza CBT Hall by 07:30 AM in full academic uniform. Bring your student biometric card.',
  'D Ensured Directorate',
  CURRENT_DATE
),
(
  'Intensive WAEC / NECO Practical Lab Sessions',
  'Academic',
  'Physics, Chemistry, and Biology practical apparatus calibration begins next Monday. Attendance is strictly compulsory.',
  'D Ensured Directorate',
  CURRENT_DATE - INTERVAL '3 days'
),
(
  'British Council IELTS Masterclass Registration Open',
  'Exam Registration',
  'Weekend Intensive and Weekday Cohort seats are now available for Academic and General Training modules.',
  'D Ensured Directorate',
  CURRENT_DATE - INTERVAL '7 days'
)
ON CONFLICT DO NOTHING;

-- Sample Class Timetable
INSERT INTO public.schedules (title, subject, program, tutor_name, day_of_week, time_slot, room, is_live_online, topic_summary)
VALUES
(
  'Calculus & Coordinate Geometry Drill',
  'Mathematics',
  'UTME',
  'Dr. Tony Adeleke',
  'Monday',
  '08:30 AM - 10:30 AM',
  'Lecture Theater 1',
  false,
  'Integration by parts, circle theorems, and rapid heuristics for JAMB past questions'
),
(
  'Organic Chemistry Reaction Pathways',
  'Chemistry',
  'UTME',
  'Mrs. Folashade Adeleke',
  'Tuesday',
  '10:45 AM - 12:45 PM',
  'CBT Suite A',
  false,
  'Alkanols, esterification, isomerism, and qualitative laboratory testing'
),
(
  'Electromagnetism & Wave Optics',
  'Physics',
  'UTME',
  'Engr. Chidi Okafor',
  'Wednesday',
  '08:30 AM - 10:30 AM',
  'Science Lab 1',
  false,
  'Induction, transformers, alternating current circuits, and refraction experiments'
),
(
  'IELTS Band 8.0 Speaking & Writing Task 2 Masterclass',
  'English Language',
  'IELTS',
  'Barrister T. Balogun',
  'Saturday',
  '09:00 AM - 12:00 PM',
  'Executive Seminar Hall',
  true,
  'Coherence, lexical resource, complex grammar structures, and mock interview drills'
)
ON CONFLICT DO NOTHING;
