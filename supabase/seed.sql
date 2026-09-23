-- ==============================================================================
-- BHANGAR.SPACE - INITIAL SEED DATA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor after running schema.sql

-- 1. SEED SOCIETIES
INSERT INTO public.societies (id, name, city, pincode, towers, resident_count, active_listings_count)
VALUES
  ('dlf-phase-5', 'DLF Phase 5 (The Crest & Park Place)', 'Gurugram', '122002', ARRAY['Tower 1', 'Tower 2', 'Tower 3', 'Tower 4', 'Tower 5', 'Tower 6', 'Tower 7'], 1420, 28),
  ('prestige-shantiniketan', 'Prestige Shantiniketan', 'Bengaluru', '560048', ARRAY['Tower 01', 'Tower 04', 'Tower 07', 'Tower 11', 'Tower 15'], 3100, 42),
  ('amanora-park-town', 'Amanora Park Town', 'Pune', '411028', ARRAY['Sector R1', 'Sector R2', 'Future Towers A', 'Future Towers B'], 2450, 22),
  ('ats-greens', 'ATS Greens Village', 'Noida', '201304', ARRAY['Tower 2', 'Tower 5', 'Tower 8', 'Tower 10'], 1180, 19),
  ('hiranandani-estate', 'Hiranandani Estate', 'Mumbai', '400607', ARRAY['Rodas Enclave A', 'Rodas Enclave B', 'Canis', 'Pegasus'], 2900, 35)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED LISTINGS (REALISTIC LAUNCH CATALOG)
INSERT INTO public.items (
  id, article_number, ikea_style_name, title, category, room_type, price, original_price, bottom_line_price,
  condition, condition_label, dimensions, assembly_status, lift_friendly, inspection_note, description,
  seller_quote, aspect_ratio, saves_count, images, has_video_proof, video_proof_note, seller,
  is_moving_out, moving_out_date, status, tags, society_id, is_seed
)
VALUES
(
  'item-1', '702.611.50', 'MARKUS / Ergonomic high-back chair', 'Green Soul Ergonomic Office Chair',
  'furniture', 'wfh', 3200, 16999, 2800, 'gently_used', 'Gently Used · Hydraulics & 4D armrests verified',
  '62 × 60 × 129 cm', 'Ready Assembled (Zero assembly needed)', 'Fits standard passenger lift',
  'Verified resident test: smooth hydraulic height adjust, firm lumbar support, mesh backing flawless.',
  'Relocating this weekend. Used 1.5 years for remote work. Breathable mesh high-back with lumbar support. Handover in Tower 4 service elevator.',
  '“Spent ₹17k when remote work started. Now company recalled us to Cyber Hub. Please give my spine buddy a good home.”',
  '3/4', 34,
  ARRAY['/images/chair.jpg', 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80'],
  TRUE, 'Hydraulic height adjust and recline mechanism tested',
  '{"name": "Arjun Mehta", "alias": "Arjun M.", "tower": "Tower 4", "society": "DLF Phase 5 (The Crest & Park Place)", "city": "Gurugram", "verifiedResident": true, "rating": 4.9, "dealsCompleted": 6, "responseTime": "< 10 mins"}'::jsonb,
  TRUE, 'Moving this Sunday', 'available', ARRAY['Office', 'Furniture', 'Ergonomic', 'WFH'], 'dlf-phase-5', TRUE
),
(
  'item-2', '403.009.28', 'TILLREDA / Convection microwave 28L', 'LG 28L Convection Microwave Oven',
  'appliances', 'kitchen', 2600, 13490, 2200, 'gently_used', 'Gently Used · Heating, baking & grill verified',
  '51 × 40 × 31 cm', 'Plug & Play', 'Hand-carry 1 person',
  'Includes original glass turntable, high/low grill rack, and baking plate. Zero interior grease.',
  'Moving out liquidation. Works flawlessly for baking and reheating. Sanitized with lemon steam cleaning yesterday.',
  '“Handover right at Tower 2 lobby. Ready to plug and heat.”',
  '4/5', 18,
  ARRAY['https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80'],
  FALSE, NULL,
  '{"name": "Pooja Sharma", "alias": "Pooja S.", "tower": "Tower 2", "society": "DLF Phase 5 (The Crest & Park Place)", "city": "Gurugram", "verifiedResident": true, "rating": 4.8, "dealsCompleted": 3, "responseTime": "< 5 mins"}'::jsonb,
  TRUE, 'Moving next Tuesday', 'available', ARRAY['Appliances', 'Kitchen', 'QuickSale'], 'dlf-phase-5', TRUE
),
(
  'item-3', '904.287.01', 'FÖRNUFTIG / Smart HEPA Room Purifier', 'Mi Smart Air Purifier 4 (HEPA H13 Filter)',
  'appliances', 'living', 3900, 14999, 3500, 'like_new', 'Like New · 74% filter life remaining on app',
  '25 × 25 × 55 cm', 'Plug & Play', 'Hand-carry 1 person',
  'App-connected laser particle sensor reads 12 AQI indoors. Quiet night mode operates below 32dB.',
  'Bought for Gurugram smog season. Moving to Bangalore so won''t need this level of filtration. App shows 74% filter life.',
  '“Essential for tower living during Nov-Jan. Cleaned and reset for the next resident.”',
  '1/1', 45,
  ARRAY['/images/air_purifier.jpg', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80'],
  TRUE, 'Laser particle sensor and OLED display verified',
  '{"name": "Vikram Sethi", "alias": "Vikram S.", "tower": "Tower 1", "society": "DLF Phase 5 (The Crest & Park Place)", "city": "Gurugram", "verifiedResident": true, "rating": 5.0, "dealsCompleted": 8, "responseTime": "< 15 mins"}'::jsonb,
  TRUE, 'Moving this weekend', 'available', ARRAY['AirPurifier', 'Appliances', 'Health', 'SmogReady'], 'dlf-phase-5', TRUE
),
(
  'item-4', '502.821.77', 'KENT / Under-sink RO mineral purifier', 'Kent Grand Plus 8L Water Purifier',
  'appliances', 'kitchen', 3400, 19500, 2900, 'gently_used', 'Gently Used · RO+UV+UF+TDS Controller serviced',
  '40 × 26 × 52 cm', 'Plug & Play', 'Hand-carry 1 person',
  'TDS controller calibrated for DLF Borewell + Tanker blend (reads ~85 TDS output). New sediment candle fitted last month.',
  'Landlord provided RO in the new rented apartment so selling this one. Fully functional with UV lamp test passed.',
  '“Can help unmount and carry to service lift. All inlet pipe adaptors included.”',
  '9/11', 22,
  ARRAY['/images/water_purifier.jpg'],
  FALSE, NULL,
  '{"name": "Neha Gupta", "alias": "Neha G.", "tower": "Tower 7", "society": "DLF Phase 5 (The Crest & Park Place)", "city": "Gurugram", "verifiedResident": true, "rating": 4.9, "dealsCompleted": 5, "responseTime": "< 20 mins"}'::jsonb,
  TRUE, 'Moving in 3 days', 'available', ARRAY['Kitchen', 'RO', 'WaterPurifier', 'Essential'], 'dlf-phase-5', TRUE
),
(
  'item-5', '103.958.33', 'DELL / UltraSharp 27" 4K IPS display', 'Dell 27" 4K UltraSharp IPS Monitor (U2720Q)',
  'electronics', 'wfh', 12500, 48900, 11000, 'like_new', 'Like New · Zero dead pixels, 90W USB-C PD working',
  '61 × 18 × 48 cm', 'Plug & Play', 'Hand-carry 1 person',
  'Color calibrated 99% sRGB. 90W USB-C single-cable dock charges MacBook while driving 4K 60Hz. Original box and cables included.',
  'Moving out of country. Single owner, spotless screen. Includes height-adjustable stand, HDMI cable, and 90W Type-C cable.',
  '“Will test live in Tower 4 lobby with my laptop if buyer wants proof before UPI.”',
  '3/4', 63,
  ARRAY['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'],
  TRUE, 'Tested with MacBook Pro M2 over Type-C 90W',
  '{"name": "Kabir Das", "alias": "Kabir D.", "tower": "Tower 4", "society": "DLF Phase 5 (The Crest & Park Place)", "city": "Gurugram", "verifiedResident": true, "rating": 5.0, "dealsCompleted": 11, "responseTime": "< 5 mins"}'::jsonb,
  TRUE, 'Moving Monday', 'available', ARRAY['Monitor', 'WFH', 'AppleFriendly', '4K', 'DeskSetup'], 'dlf-phase-5', TRUE
)
ON CONFLICT (id) DO NOTHING;
