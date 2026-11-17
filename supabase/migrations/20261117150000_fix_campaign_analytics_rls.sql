-- Migration: 20261117150000_fix_campaign_analytics_rls.sql
-- Description: Fix RLS issue on campaign_analytics by adding SECURITY DEFINER to trigger and INSERT policy

-- 1. Update function with SECURITY DEFINER and explicit search_path
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

-- 2. Add explicit INSERT policy on campaign_analytics
DROP POLICY IF EXISTS "Public can insert campaign_analytics" ON public.campaign_analytics;
CREATE POLICY "Public can insert campaign_analytics"
ON public.campaign_analytics
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
