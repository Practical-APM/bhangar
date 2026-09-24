-- ==============================================================================
-- BHANGAR.SPACE - SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. SOCIETIES TABLE
CREATE TABLE IF NOT EXISTS public.societies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT,
  towers TEXT[] DEFAULT '{}',
  resident_count INTEGER DEFAULT 0,
  active_listings_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LISTINGS (ITEMS) TABLE
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  article_number TEXT,
  ikea_style_name TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  room_type TEXT,
  price INTEGER NOT NULL,
  original_price INTEGER NOT NULL,
  bottom_line_price INTEGER,
  condition TEXT NOT NULL DEFAULT 'gently_used',
  condition_label TEXT,
  dimensions TEXT,
  assembly_status TEXT,
  lift_friendly TEXT,
  inspection_note TEXT,
  description TEXT,
  seller_quote TEXT,
  aspect_ratio TEXT DEFAULT '3/4',
  saves_count INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  has_video_proof BOOLEAN DEFAULT FALSE,
  video_proof_note TEXT,
  seller JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_moving_out BOOLEAN DEFAULT FALSE,
  moving_out_date TEXT,
  status TEXT DEFAULT 'available',
  held_by TEXT,
  tags TEXT[] DEFAULT '{}',
  society_id TEXT,
  is_seed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OFFERS TABLE (Buyer Bids & Negotiations)
CREATE TABLE IF NOT EXISTS public.offers (
  id TEXT PRIMARY KEY,
  item_id TEXT REFERENCES public.items(id) ON DELETE CASCADE,
  item_title TEXT,
  item_image TEXT,
  asking_price INTEGER,
  offered_price INTEGER NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_tower TEXT,
  status TEXT DEFAULT 'pending',
  counter_price INTEGER,
  buyer_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMMENTS TABLE (Item Questions & Discussions)
-- 4. COMMENTS TABLE (Item Questions & Discussions)
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  item_id TEXT REFERENCES public.items(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_tower TEXT,
  text TEXT NOT NULL,
  is_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROFILES TABLE (Persistent Cloud Resident Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  username TEXT,
  phone TEXT,
  tower TEXT,
  society_id TEXT,
  society_name TEXT,
  avatar_url TEXT,
  is_onboarded BOOLEAN DEFAULT FALSE,
  rating NUMERIC DEFAULT 5.0,
  deals_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add explicit user identity links to items and offers if not already present
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS seller_id UUID;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS buyer_id UUID;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all users
CREATE POLICY "Public Read Societies" ON public.societies FOR SELECT USING (true);
CREATE POLICY "Public Insert Societies" ON public.societies FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Societies" ON public.societies FOR UPDATE USING (true);

CREATE POLICY "Public Read Items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Public Insert Items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Items" ON public.items FOR UPDATE USING (true);
CREATE POLICY "Public Delete Items" ON public.items FOR DELETE USING (true);

CREATE POLICY "Public Read Offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Public Insert Offers" ON public.offers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Offers" ON public.offers FOR UPDATE USING (true);
CREATE POLICY "Public Delete Offers" ON public.offers FOR DELETE USING (true);

CREATE POLICY "Public Read Comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public Insert Comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Comments" ON public.comments FOR DELETE USING (true);

CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON public.profiles FOR UPDATE USING (true);

-- ==============================================================================
-- STORAGE BUCKET FOR LISTING IMAGES
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket access policies
CREATE POLICY "Public Access Listing Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'listing-images');

CREATE POLICY "Public Upload Listing Images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'listing-images');

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
-- Enable Realtime for live cross-browser updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.societies;
