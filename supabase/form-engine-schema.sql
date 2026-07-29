-- ==============================================================================
-- VELODESK FORM ENGINE SCHEMA
-- Advanced Form Builder with Partial Submissions, Analytics, and Data Retention
-- ==============================================================================

-- 1. FORM WORKSPACES
-- Organize forms and manage team access
CREATE TABLE public.form_workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FORMS
-- The core form configuration, storing JSON schema, custom CSS, and settings
CREATE TABLE public.forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.form_workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    -- Design & Customization
    custom_css TEXT,
    og_image_url TEXT,
    favicon_url TEXT,
    -- Engine Settings
    is_published BOOLEAN DEFAULT FALSE,
    capture_partial_submissions BOOLEAN DEFAULT TRUE,
    retention_days INTEGER DEFAULT 90, -- Auto-delete after X days
    -- The actual form schema (questions, logic, steps)
    schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FORM VERSIONS
-- 30/90 Day Rollback Feature
CREATE TABLE public.form_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    schema JSONB NOT NULL,
    custom_css TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FORM SUBMISSIONS (Complete)
CREATE TABLE public.form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    respondent_email TEXT, -- If email verification is used
    answers JSONB NOT NULL,
    -- Form Visit Analytics
    duration_seconds INTEGER,
    traffic_source TEXT,
    utm_campaign TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PARTIAL SUBMISSIONS (Unfinished Responses)
CREATE TABLE public.form_partial_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL, -- Anonymous tracking cookie ID
    current_step TEXT,
    partial_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(form_id, session_id)
);

-- 6. DROP-OFF ANALYTICS
-- Tracks exact field focus/blur to see where users abandon the form
CREATE TABLE public.form_dropoff_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    field_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'focus', 'blur', 'abandoned'
    time_spent_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- RLS (Row Level Security) POLICIES
-- ==============================================================================

ALTER TABLE public.form_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_partial_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_dropoff_events ENABLE ROW LEVEL SECURITY;

-- Allow public insertion into submissions and drop-offs
CREATE POLICY "Allow public form submissions" ON public.form_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public partial submissions" ON public.form_partial_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public drop-off events" ON public.form_dropoff_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to update their own partial submissions" ON public.form_partial_submissions FOR UPDATE USING (true);

-- Allow reading of published forms by anyone
CREATE POLICY "Allow public to read published forms" ON public.forms FOR SELECT USING (is_published = TRUE);
