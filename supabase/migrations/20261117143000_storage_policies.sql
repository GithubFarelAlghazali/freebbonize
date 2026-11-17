-- Migration: 20261117143000_storage_policies.sql
-- Description: Allow public read and upload to freebbonize-files storage bucket

DROP POLICY IF EXISTS "Public read freebbonize-files" ON storage.objects;
CREATE POLICY "Public read freebbonize-files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'freebbonize-files');

DROP POLICY IF EXISTS "Public insert freebbonize-files" ON storage.objects;
CREATE POLICY "Public insert freebbonize-files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'freebbonize-files');
