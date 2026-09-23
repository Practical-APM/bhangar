-- ==============================================================================
-- BHANGAR.SPACE - INITIAL SEED DATA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor after running schema.sql

-- 1. SEED SOCIETIES (Initial launch societies with 0 active listings)
INSERT INTO public.societies (id, name, city, pincode, towers, resident_count, active_listings_count)
VALUES
  ('dlf-phase-5', 'DLF Phase 5 (The Crest & Park Place)', 'Gurugram', '122002', ARRAY['Tower 1', 'Tower 2', 'Tower 3', 'Tower 4', 'Tower 5', 'Tower 6', 'Tower 7'], 1420, 0),
  ('prestige-shantiniketan', 'Prestige Shantiniketan', 'Bengaluru', '560048', ARRAY['Tower 01', 'Tower 04', 'Tower 07', 'Tower 11', 'Tower 15'], 3100, 0),
  ('amanora-park-town', 'Amanora Park Town', 'Pune', '411028', ARRAY['Sector R1', 'Sector R2', 'Future Towers A', 'Future Towers B'], 2450, 0),
  ('ats-greens', 'ATS Greens Village', 'Noida', '201304', ARRAY['Tower 2', 'Tower 5', 'Tower 8', 'Tower 10'], 1180, 0),
  ('hiranandani-estate', 'Hiranandani Estate', 'Mumbai', '400607', ARRAY['Rodas Enclave A', 'Rodas Enclave B', 'Canis', 'Pegasus'], 2900, 0)
ON CONFLICT (id) DO UPDATE SET
  active_listings_count = EXCLUDED.active_listings_count;
