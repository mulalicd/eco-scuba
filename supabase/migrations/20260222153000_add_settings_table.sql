-- supabase/migrations/20260222153000_add_settings_table.sql
-- Table for application-wide settings

CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default value for persistOpening
INSERT INTO public.settings (key, value, description)
VALUES ('persistOpening', 'false'::jsonb, 'Status of terminal/wizard opening persistence')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can select settings" ON public.settings FOR SELECT USING (true);
