-- COMPLETE PBX DATABASE SCHEMA MIGRATION

-- 1. PBX SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.pbx_settings (
    id INTEGER PRIMARY KEY,
    country_code TEXT,
    mock_enabled BOOLEAN DEFAULT true,
    min_call_delay INTEGER,
    max_call_delay INTEGER,
    min_call_duration INTEGER,
    max_call_duration INTEGER,
    calls_per_interval INTEGER,
    dids JSONB,
    queue_assignments JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pbx_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for all users on settings" ON public.pbx_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.pbx_settings (
    id, country_code, mock_enabled, min_call_delay, max_call_delay, 
    min_call_duration, max_call_duration, calls_per_interval, dids, queue_assignments
) VALUES (
    1, '+1', true, 8, 45, 120, 7200, 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;


-- 2. PBX AGENTS TABLE
CREATE TABLE IF NOT EXISTS public.pbx_agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    extension TEXT NOT NULL,
    status TEXT NOT NULL,
    queue TEXT NOT NULL DEFAULT 'Support',
    active_call_id TEXT,
    active_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pbx_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for all users on agents" ON public.pbx_agents FOR ALL USING (true) WITH CHECK (true);


-- 3. PBX CALLS TABLE (CALL HISTORY & ACTIVE CALLS)
CREATE TABLE IF NOT EXISTS public.pbx_calls (
    id TEXT PRIMARY KEY,
    direction TEXT,
    caller TEXT,
    caller_name TEXT,
    callee TEXT,
    did TEXT,
    extension TEXT,
    agent TEXT,
    queue TEXT,
    status TEXT,
    started_at TEXT,
    answered_at TEXT,
    ended_at TEXT,
    ring_seconds INTEGER,
    talk_seconds INTEGER,
    total_seconds INTEGER,
    codec TEXT,
    recording_available BOOLEAN,
    timeline JSONB
);

ALTER TABLE public.pbx_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for all users on calls" ON public.pbx_calls FOR ALL USING (true) WITH CHECK (true);

