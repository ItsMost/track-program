-- ====================================================================
-- TRACK & FIELD LAB - SUPABASE DATABASE SCHEMA MIGRATION
-- مخطط قاعدة بيانات Supabase الكامل لتطبيق مختبر ألعاب القوى
-- ====================================================================
-- Copy and paste this script directly into the Supabase SQL Editor!
-- انسخ هذا السكربت بالكامل وألصقه في محرر SQL في لوحة تحكم Supabase لتأسيس الجداول فوراً!

-- --------------------------------------------------------------------
-- 1. ATHLETES TABLE (جدول اللاعبين)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.track_athletes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    birth_year INT,
    weight NUMERIC,
    height NUMERIC,
    body_fat NUMERIC,
    vertical_jump NUMERIC,
    standing_long_jump NUMERIC,
    squat_jump NUMERIC,
    clean NUMERIC,
    half_squat NUMERIC,
    quarter_squat NUMERIC,
    full_squat NUMERIC,
    bench NUMERIC,
    deadlift NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (تمكين الحماية)
ALTER TABLE public.track_athletes ENABLE ROW LEVEL SECURITY;

-- Anonymous CRUD Policy for quick testing/local dev (سياسة وصول مجهول للمطورين لسهولة الاختبار)
CREATE POLICY "Allow anonymous full access to track_athletes"
ON public.track_athletes
FOR ALL
USING (true)
WITH CHECK (true);


-- --------------------------------------------------------------------
-- 2. DRILLS LIBRARY TABLE (جدول مكتبة التمارين المعتمدة)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.track_library_drills (
    id TEXT PRIMARY KEY DEFAULT 'drill-' || gen_random_uuid(),
    title TEXT NOT NULL,
    details TEXT,
    type TEXT NOT NULL, -- speed, plyometrics, power, strength, isometric, mobility, core, physical
    percentage NUMERIC,
    sets TEXT,
    reps TEXT,
    distance TEXT,
    rest TEXT,
    unit TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.track_library_drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous full access to track_library_drills"
ON public.track_library_drills
FOR ALL
USING (true)
WITH CHECK (true);


-- --------------------------------------------------------------------
-- 3. WORKOUT WEEK TEMPLATES TABLE (جدول قوالب الأسابيع والأيام)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.track_week_templates (
    id TEXT PRIMARY KEY DEFAULT 'tpl-' || gen_random_uuid(),
    template_name TEXT NOT NULL,
    template_type TEXT DEFAULT 'week', -- week, day
    drills JSONB DEFAULT '[]'::jsonb, -- holds arrays of exercises
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.track_week_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous full access to track_week_templates"
ON public.track_week_templates
FOR ALL
USING (true)
WITH CHECK (true);


-- --------------------------------------------------------------------
-- 4. MACRO BLOCKS / PROGRAMS TABLE (جدول البرامج وكتل التدريب الكبرى)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.track_macro_programs (
    id TEXT PRIMARY KEY DEFAULT 'prog-' || gen_random_uuid(),
    program_name TEXT NOT NULL,
    weeks JSONB DEFAULT '[]'::jsonb, -- holds weeks configuration arrays
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.track_macro_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous full access to track_macro_programs"
ON public.track_macro_programs
FOR ALL
USING (true)
WITH CHECK (true);


-- --------------------------------------------------------------------
-- 5. DAILY ATHLETE CALENDAR WORKOUTS (جدول الوحدات التدريبية اليومية المجدولة)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.track_athlete_workouts (
    id TEXT PRIMARY KEY DEFAULT 'workout-' || gen_random_uuid(),
    athlete_id TEXT NOT NULL REFERENCES public.track_athletes(id) ON DELETE CASCADE,
    workout_date DATE NOT NULL,
    workout_title TEXT DEFAULT '',
    drills JSONB DEFAULT '[]'::jsonb, -- holds array of planned drills for this day
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_track_athlete_date UNIQUE (athlete_id, workout_date)
);

-- Indexing for instantaneous calendar loading speed (فهرسة البيانات لسرعة تحميل خطط المذكرة والتقويم)
CREATE INDEX IF NOT EXISTS idx_track_workouts_athlete_date ON public.track_athlete_workouts(athlete_id, workout_date);

-- Enable RLS
ALTER TABLE public.track_athlete_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous full access to track_athlete_workouts"
ON public.track_athlete_workouts
FOR ALL
USING (true)
WITH CHECK (true);

-- --------------------------------------------------------------------
-- INSTRUCTIONS TO RENAME TABLES (تعليمات تغيير أسماء الجداول):
-- --------------------------------------------------------------------
-- If you want to use customized table names in the future:
-- 1. Modify the tables names in `src/supabaseClient.js` inside the Mock seeding blocks.
-- 2. Modify the `.from('table_name')` queries inside `src/components/TrackPlanner/index.jsx`.
-- 3. Execute this SQL script with your customized names instead of the defaults.
