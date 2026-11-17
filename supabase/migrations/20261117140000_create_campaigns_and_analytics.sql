-- Migration: 20261117140000_create_campaigns_and_analytics.sql
-- Description: Create campaigns and campaign_analytics tables, indexes, triggers, and RLS policies

-- 1. Enable extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Table: campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    frame_url TEXT NOT NULL,
    frame_width INTEGER NOT NULL CHECK (frame_width > 0),
    frame_height INTEGER NOT NULL CHECK (frame_height > 0),
    frame_aspect_ratio NUMERIC(6, 4) GENERATED ALWAYS AS (
        ROUND((frame_width::numeric / frame_height::numeric), 4)
    ) STORED,
    caption_template TEXT NOT NULL DEFAULT 'I am ready to participate in [event]! Join me at [link]',
    caption_props JSONB NOT NULL DEFAULT '["name"]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Constraints
    CONSTRAINT campaigns_slug_unique UNIQUE (slug),
    CONSTRAINT campaigns_slug_format_check CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- 3. Create Table: campaign_analytics
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    download_count INTEGER NOT NULL DEFAULT 0,
    last_download_at TIMESTAMPTZ,
    CONSTRAINT campaign_analytics_campaign_id_unique UNIQUE (campaign_id)
);

-- 4. Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON public.campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at DESC);

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER trg_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 6. Trigger to automatically initialize campaign_analytics record
CREATE OR REPLACE FUNCTION public.init_campaign_analytics()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.campaign_analytics (campaign_id, download_count)
    VALUES (NEW.id, 0)
    ON CONFLICT (campaign_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_init_campaign_analytics ON public.campaigns;
CREATE TRIGGER trg_init_campaign_analytics
AFTER INSERT ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.init_campaign_analytics();

-- 7. Row Level Security (RLS) Policies
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public SELECT campaigns
DROP POLICY IF EXISTS "Public campaigns are viewable by everyone" ON public.campaigns;
CREATE POLICY "Public campaigns are viewable by everyone" 
ON public.campaigns 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Policy 2: Public INSERT campaigns
DROP POLICY IF EXISTS "Public can insert new campaign" ON public.campaigns;
CREATE POLICY "Public can insert new campaign" 
ON public.campaigns 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Policy 3: Public SELECT analytics
DROP POLICY IF EXISTS "Public analytics are viewable by everyone" ON public.campaign_analytics;
CREATE POLICY "Public analytics are viewable by everyone" 
ON public.campaign_analytics 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Policy 4: Public INSERT analytics
DROP POLICY IF EXISTS "Public can insert campaign_analytics" ON public.campaign_analytics;
CREATE POLICY "Public can insert campaign_analytics" 
ON public.campaign_analytics 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Policy 5: Public UPDATE analytics (e.g. increment download counter)
DROP POLICY IF EXISTS "Public can increment download count" ON public.campaign_analytics;
CREATE POLICY "Public can increment download count" 
ON public.campaign_analytics 
FOR UPDATE 
TO anon, authenticated 
USING (true);
