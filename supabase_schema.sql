-- Run this script in your Supabase SQL Editor to create the pbx_settings table

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

-- Setup Row Level Security (RLS)
ALTER TABLE public.pbx_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read/write access (Adjust security as needed for production)
CREATE POLICY "Enable all operations for all users"
    ON public.pbx_settings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insert the default settings row
INSERT INTO public.pbx_settings (
    id, 
    country_code, 
    mock_enabled, 
    min_call_delay, 
    max_call_delay, 
    min_call_duration, 
    max_call_duration, 
    calls_per_interval, 
    dids, 
    queue_assignments
) VALUES (
    1, 
    '+1', 
    true, 
    8, 
    45, 
    120, 
    7200, 
    1, 
    '[]'::jsonb, 
    '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;
