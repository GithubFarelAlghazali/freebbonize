-- Seed data: supabase/seed.sql
-- Description: Reset and insert sample records for campaigns (Fresh Seed)

-- 1. Hapus seluruh data lama di tabel kampanye & analitik (Cascade ke relasi foreign key)
TRUNCATE TABLE public.campaign_analytics, public.campaigns RESTART IDENTITY CASCADE;

-- 2. Masukkan data seeder baru
INSERT INTO public.campaigns (
    slug, 
    title, 
    description, 
    frame_url, 
    frame_width, 
    frame_height, 
    caption_template, 
    caption_props
) VALUES 
(
    'fancy-event-2026',
    'FancyEvent Grand Launch 2026',
    'Join our biggest annual event and invite those around you to celebrate together!',
    'https://sfslqkqbbvnwrhgirrar.supabase.co/storage/v1/object/public/freebbonize-files/samples/fancy-event-frame-1763402444-23253cd3-129c-4938-978a-a1fd24c6c01e.png',
    1080,
    1080,
    'Halo! Saya [name] dari [school] siap menyukseskan FancyEvent 2026! Ayo gabung bersama saya!',
    '["name", "school"]'::jsonb
),
(
    'webinar-ai-future',
    'National Webinar: AI & Future Tech 2026',
    'Diskusi mendalam tentang perkembangan frontier AI dan dampaknya bagi industri kreatif.',
    'https://sfslqkqbbvnwrhgirrar.supabase.co/storage/v1/object/public/freebbonize-files/samples/webinar-ai-portrait-1763402420-f6af5867-ab4d-468d-a096-f0299f971ea8.png',
    1080,
    1350,
    'Saya [nama], perwakilan dari [institusi], sangat antusias mengikuti Webinar Nasional AI 2026! #FutureTech #AIRevolution',
    '["nama", "institusi"]'::jsonb
),
(
    'dies-natalis-univ',
    'Dies Natalis Ke-45 Universitas Nusantara',
    'Mengabdi untuk Negeri, Mencerdaskan Generasi Emas Bangsa.',
    'https://sfslqkqbbvnwrhgirrar.supabase.co/storage/v1/object/public/freebbonize-files/samples/dies-natalis-banner-1763402400-3f4125b0-745a-4bf8-b516-92b0fa138c21.png',
    1920,
    1080,
    'Selamat Dies Natalis ke-45! Saya [nama] ([jurusan] - angkatan [angkatan]) bangga menjadi bagian dari keluarga besar kampus tercinta!',
    '["nama", "jurusan", "angkatan"]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
