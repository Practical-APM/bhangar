import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ThriftItem, SellerOffer, ItemComment, UserProfile, SocietyInfo, INITIAL_THRIFT_ITEMS, INITIAL_SELLER_OFFERS, INITIAL_COMMENTS } from '../data/mockData';

// Map database row to ThriftItem
function mapRowToItem(row: any): ThriftItem {
  let sellerObj = row.seller;
  if (typeof sellerObj === 'string') {
    try {
      sellerObj = JSON.parse(sellerObj);
    } catch {
      sellerObj = {};
    }
  }
  sellerObj = (typeof sellerObj === 'object' && sellerObj !== null) ? sellerObj : {};

  const seller = {
    name: sellerObj.name || 'Resident Neighbor',
    alias: sellerObj.alias || sellerObj.name || 'Neighbor',
    tower: sellerObj.tower || row.tower || 'Tower 1',
    phone: sellerObj.phone || '',
    society: sellerObj.society || row.society_name || 'All Societies',
    city: sellerObj.city || row.city || 'All Cities',
    verifiedResident: Boolean(sellerObj.verifiedResident ?? true),
    rating: typeof sellerObj.rating === 'number' ? sellerObj.rating : 5.0,
    dealsCompleted: typeof sellerObj.dealsCompleted === 'number' ? sellerObj.dealsCompleted : 0,
    responseTime: sellerObj.responseTime || '< 15 mins'
  };

  const images = Array.isArray(row.images) && row.images.length > 0
    ? row.images
    : (typeof row.images === 'string' && row.images ? [row.images] : ['/images/chair.jpg']);

  return {
    id: row.id,
    articleNumber: row.article_number || '804.249.12',
    ikeaStyleName: row.ikea_style_name || row.title,
    title: row.title || 'Untitled Listing',
    category: row.category || 'furniture',
    roomType: row.room_type || 'living',
    price: typeof row.price === 'number' ? row.price : 0,
    originalPrice: typeof row.original_price === 'number' ? row.original_price : (row.price ? row.price * 2 : 0),
    bottomLinePrice: row.bottom_line_price || Math.round((row.price || 0) * 0.85),
    condition: row.condition || 'gently_used',
    conditionLabel: row.condition_label || 'Verified Resident Listing',
    dimensions: row.dimensions || 'Standard',
    assemblyStatus: row.assembly_status || 'Ready Assembled (Zero assembly needed)',
    liftFriendly: row.lift_friendly || 'Fits standard passenger lift',
    inspectionNote: row.inspection_note || 'Verified in resident community',
    description: row.description || '',
    sellerQuote: row.seller_quote,
    aspectRatio: (row.aspect_ratio as any) || '3/4',
    savesCount: row.saves_count || 0,
    images,
    hasVideoProof: Boolean(row.has_video_proof),
    videoProofNote: row.video_proof_note,
    seller,
    locationNote: `${seller.tower} · Elevator handover`,
    isMovingOut: Boolean(row.is_moving_out),
    movingOutDate: row.moving_out_date,
    status: row.status || 'available',
    tags: Array.isArray(row.tags) ? row.tags : ['#VerifiedResident'],
    listedAgo: 'Just now',
    sellerId: row.seller_id || undefined
  };
}

// Convert base64 data URL to Blob for upload
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Upload a single image (DataURL or Blob) to Supabase Storage and return its public URL
export async function uploadImageToStorage(imageData: string | Blob): Promise<string> {
  if (!isSupabaseConfigured() || !supabase) {
    // Fallback: return dataURL directly
    return typeof imageData === 'string' ? imageData : URL.createObjectURL(imageData);
  }

  try {
    const blob = typeof imageData === 'string' ? dataURLtoBlob(imageData) : imageData;
    const fileExt = blob.type.split('/')[1] || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(filePath, blob, {
        contentType: blob.type || 'image/jpeg',
        cacheControl: '31536000',
        upsert: false
      });

    if (uploadError) {
      console.warn('[Storage] Upload failed, falling back to local image data:', uploadError.message);
      return typeof imageData === 'string' ? imageData : URL.createObjectURL(imageData);
    }

    const { data } = supabase.storage.from('listing-images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.warn('[Storage] Exception uploading image:', err);
    return typeof imageData === 'string' ? imageData : URL.createObjectURL(imageData);
  }
}

// ==============================================================================
// ITEMS API
// ==============================================================================

const LEGACY_DUMMY_IDS = new Set(['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7', 'item-8', 'item-9', 'item-10']);

export async function fetchItemsFromDB(societyId?: string): Promise<ThriftItem[]> {
  // Always load known locally deleted IDs so taken-down items are never resurrected
  let localDeletedIds = new Set<string>();
  try {
    const rawDeleted = localStorage.getItem('bhangar_deleted_ids');
    if (rawDeleted) {
      localDeletedIds = new Set(JSON.parse(rawDeleted));
    }
  } catch {}

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('items')
        .select('*')
        .neq('status', 'deleted');
      if (societyId) {
        query = query.eq('society_id', societyId);
      }

      // Try ordered by created_at, fallback to unordered if ordering column fails
      let { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.warn('[Supabase] Fetch with order failed, retrying without order:', error.message);
        const fallbackRes = await query;
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (!error && data) {
        return data
          .filter((r: any) => 
            !LEGACY_DUMMY_IDS.has(r.id) && 
            !localDeletedIds.has(r.id) &&
            !r.is_seed && 
            r.status !== 'deleted'
          )
          .map(mapRowToItem);
      }
      if (error) {
        console.warn('[Supabase] Failed to fetch items:', error.message);
      }
    } catch (e) {
      console.warn('[Supabase] Failed to fetch items, using local fallback:', e);
    }
  }

  // LocalStorage fallback (ignoring mock items and deleted items)
  try {
    const local = localStorage.getItem('bhangar_items');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        return parsed.filter((it: any) => 
          !LEGACY_DUMMY_IDS.has(it.id) && 
          !localDeletedIds.has(it.id) &&
          !it.is_seed && 
          it.status !== 'deleted'
        );
      }
    }
  } catch {}
  return INITIAL_THRIFT_ITEMS;
}

export async function createItemInDB(item: ThriftItem): Promise<ThriftItem> {
  let dbItem = { ...item };

  // Remove from bhangar_deleted_ids in case it was previously taken down
  try {
    const rawDeleted = localStorage.getItem('bhangar_deleted_ids');
    if (rawDeleted) {
      const deletedSet = new Set<string>(JSON.parse(rawDeleted));
      deletedSet.delete(item.id);
      localStorage.setItem('bhangar_deleted_ids', JSON.stringify(Array.from(deletedSet)));
    }
  } catch {}

  // Always ensure immediate localStorage persistence so the item survives page reloads
  try {
    const raw = localStorage.getItem('bhangar_items');
    const existing: ThriftItem[] = raw ? JSON.parse(raw) : [];
    const updated = [item, ...existing.filter(i => i.id !== item.id)];
    localStorage.setItem('bhangar_items', JSON.stringify(updated));
  } catch (e) {
    console.warn('[LocalStorage] Error saving item locally:', e);
  }

  // If Supabase is connected, upload any DataURLs to storage bucket first
  if (isSupabaseConfigured() && supabase) {
    try {
      const uploadedImages = await Promise.all(
        item.images.map(async (img) => {
          if (img.startsWith('data:image')) {
            return await uploadImageToStorage(img);
          }
          return img;
        })
      );

      dbItem = { ...item, images: uploadedImages };

      const { error } = await supabase.from('items').upsert({
        id: dbItem.id,
        article_number: dbItem.articleNumber,
        ikea_style_name: dbItem.ikeaStyleName,
        title: dbItem.title,
        category: dbItem.category,
        room_type: dbItem.roomType,
        price: dbItem.price,
        original_price: dbItem.originalPrice,
        bottom_line_price: dbItem.bottomLinePrice,
        condition: dbItem.condition,
        condition_label: dbItem.conditionLabel,
        dimensions: dbItem.dimensions,
        assembly_status: dbItem.assemblyStatus,
        lift_friendly: dbItem.liftFriendly,
        inspection_note: dbItem.inspectionNote,
        description: dbItem.description,
        seller_quote: dbItem.sellerQuote,
        aspect_ratio: dbItem.aspectRatio,
        saves_count: dbItem.savesCount,
        images: dbItem.images,
        has_video_proof: dbItem.hasVideoProof,
        video_proof_note: dbItem.videoProofNote,
        seller: dbItem.seller,
        is_moving_out: dbItem.isMovingOut,
        moving_out_date: dbItem.movingOutDate,
        status: dbItem.status,
        tags: dbItem.tags,
        society_id: dbItem.seller?.society ? dbItem.seller.society.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'general',
        is_seed: false,
        seller_id: dbItem.sellerId || null
      });

      if (!error) {
        // Update local storage with any converted CDN image URLs
        try {
          const raw = localStorage.getItem('bhangar_items');
          const existing: ThriftItem[] = raw ? JSON.parse(raw) : [];
          const updated = existing.map(i => i.id === dbItem.id ? dbItem : i);
          localStorage.setItem('bhangar_items', JSON.stringify(updated));
        } catch {}
        return dbItem;
      }
      console.warn('[Supabase] Insert failed:', error.message);
    } catch (e) {
      console.warn('[Supabase] Exception inserting item:', e);
    }
  }

  return dbItem;
}

export async function deleteItemFromDB(itemId: string): Promise<boolean> {
  // 1. Remove from LocalStorage immediately and mark as tombstone
  try {
    const raw = localStorage.getItem('bhangar_items');
    if (raw) {
      const existing: ThriftItem[] = JSON.parse(raw);
      const updated = existing.filter(i => i.id !== itemId);
      localStorage.setItem('bhangar_items', JSON.stringify(updated));
    }
    const rawOffers = localStorage.getItem('bhangar_seller_offers');
    if (rawOffers) {
      const existingOffers: SellerOffer[] = JSON.parse(rawOffers);
      const updatedOffers = existingOffers.filter(o => o.itemId !== itemId);
      localStorage.setItem('bhangar_seller_offers', JSON.stringify(updatedOffers));
    }
    // Track in bhangar_deleted_ids so client reloads never restore it
    const rawDeleted = localStorage.getItem('bhangar_deleted_ids');
    const deletedSet = new Set<string>(rawDeleted ? JSON.parse(rawDeleted) : []);
    deletedSet.add(itemId);
    localStorage.setItem('bhangar_deleted_ids', JSON.stringify(Array.from(deletedSet)));
  } catch (e) {
    console.warn('[LocalStorage] Error removing item from storage:', e);
  }

  // 2. If Supabase is connected:
  if (isSupabaseConfigured() && supabase) {
    try {
      // Step A: Mark item status as 'deleted' (Public Update Items policy is active and guarantees success)
      await supabase.from('items').update({ status: 'deleted' }).eq('id', itemId);

      // Step B: Attempt hard deletes on offers, comments, and items
      try {
        await supabase.from('offers').delete().eq('item_id', itemId);
        await supabase.from('comments').delete().eq('item_id', itemId);
        const { error: hardDeleteError } = await supabase.from('items').delete().eq('id', itemId);
        if (hardDeleteError) {
          console.info('[Supabase] Item marked as deleted in DB. Note: Row-level hard delete requires DELETE RLS policy:', hardDeleteError.message);
        }
      } catch (hardErr) {
        console.info('[Supabase] Hard delete skipped, soft delete active:', hardErr);
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] Exception marking item as deleted:', e);
      return false;
    }
  }

  return true;
}

export async function updateItemStatusInDB(itemId: string, status: 'available' | 'held' | 'sold'): Promise<boolean> {
  // 1. Update in local storage
  try {
    const raw = localStorage.getItem('bhangar_items');
    if (raw) {
      const items: ThriftItem[] = JSON.parse(raw);
      const updated = items.map(it => it.id === itemId ? { ...it, status } : it);
      localStorage.setItem('bhangar_items', JSON.stringify(updated));
    }
  } catch {}

  // 2. Update in Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('items').update({ status }).eq('id', itemId);
      if (error) {
        console.warn('[Supabase] Failed to update item status:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] Exception updating item status:', e);
      return false;
    }
  }

  return true;
}

export async function updateItemPriceInDB(itemId: string, newPrice: number): Promise<boolean> {
  // 1. Update in local storage
  try {
    const raw = localStorage.getItem('bhangar_items');
    if (raw) {
      const items: ThriftItem[] = JSON.parse(raw);
      const updated = items.map(it => it.id === itemId ? { ...it, price: newPrice } : it);
      localStorage.setItem('bhangar_items', JSON.stringify(updated));
    }
  } catch {}

  // 2. Update in Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('items').update({ price: newPrice }).eq('id', itemId);
      if (error) {
        console.warn('[Supabase] Failed to update item price:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] Exception updating item price:', e);
      return false;
    }
  }

  return true;
}

// ==============================================================================
// OFFERS API
// ==============================================================================

export async function fetchOffersFromDB(): Promise<SellerOffer[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((row) => ({
          id: row.id,
          itemId: row.item_id,
          itemTitle: row.item_title,
          itemImage: row.item_image,
          askingPrice: row.asking_price,
          offeredPrice: row.offered_price,
          buyerName: row.buyer_name,
          buyerTower: row.buyer_tower,
          status: row.status,
          counterPrice: row.counter_price,
          timestamp: 'Just now',
          buyerNote: row.buyer_note || ''
        }));
      }
    } catch (e) {
      console.warn('[Supabase] Failed to fetch offers:', e);
    }
  }

  try {
    const local = localStorage.getItem('bhangar_seller_offers');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return INITIAL_SELLER_OFFERS;
}

export async function createOfferInDB(offer: SellerOffer): Promise<SellerOffer> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('offers').insert({
        id: offer.id,
        item_id: offer.itemId,
        item_title: offer.itemTitle,
        item_image: offer.itemImage,
        asking_price: offer.askingPrice,
        offered_price: offer.offeredPrice,
        buyer_name: offer.buyerName,
        buyer_tower: offer.buyerTower,
        status: offer.status,
        counter_price: offer.counterPrice,
        buyer_note: offer.buyerNote
      });
    } catch (e) {
      console.warn('[Supabase] Exception creating offer:', e);
    }
  }
  return offer;
}

export async function updateOfferStatusInDB(offerId: string, status: string, counterPrice?: number): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('offers').update({ status, counter_price: counterPrice }).eq('id', offerId);
    } catch (e) {
      console.warn('[Supabase] Exception updating offer:', e);
    }
  }
}

// ==============================================================================
// COMMENTS API
// ==============================================================================

export async function fetchCommentsFromDB(itemId?: string): Promise<ItemComment[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('comments').select('*').order('created_at', { ascending: true });
      if (itemId) query = query.eq('item_id', itemId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          itemId: row.item_id,
          authorName: row.author_name,
          authorTower: row.author_tower,
          text: row.text,
          timestamp: 'Just now',
          isSeller: row.is_seller
        }));
      }
    } catch (e) {
      console.warn('[Supabase] Failed to fetch comments:', e);
    }
  }

  try {
    const local = localStorage.getItem('bhangar_comments');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_COMMENTS;
}

export async function createCommentInDB(comment: ItemComment): Promise<ItemComment> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('comments').insert({
        id: comment.id,
        item_id: comment.itemId,
        author_name: comment.authorName,
        author_tower: comment.authorTower,
        text: comment.text,
        is_seller: comment.isSeller
      });
    } catch (e) {
      console.warn('[Supabase] Exception creating comment:', e);
    }
  }
  return comment;
}

// ==============================================================================
// REALTIME LISTENER
// ==============================================================================

export function subscribeToRealtimeChanges(onItemChange?: () => void, onOfferChange?: () => void) {
  if (!isSupabaseConfigured() || !supabase) return () => {};

  const channel = supabase
    .channel('bhangar-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
      if (onItemChange) onItemChange();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, () => {
      if (onOfferChange) onOfferChange();
    })
    .subscribe();

  return () => {
    if (supabase) supabase.removeChannel(channel);
  };
}

// Live diagnostic testing for Supabase PostgreSQL & Storage Bucket
export async function testSupabaseConnection(): Promise<{
  isConfigured: boolean;
  dbConnected: boolean;
  storageConnected: boolean;
  itemsCount: number;
  latencyMs: number;
  message: string;
  error?: string;
}> {
  const startTime = Date.now();
  if (!isSupabaseConfigured() || !supabase) {
    return {
      isConfigured: false,
      dbConnected: false,
      storageConnected: false,
      itemsCount: 0,
      latencyMs: 0,
      message: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not configured. Running in LocalStorage fallback mode.'
    };
  }

  try {
    // 1. Test database table read
    const { data: dbData, error: dbError, count } = await supabase
      .from('items')
      .select('id', { count: 'exact' })
      .limit(1);

    if (dbError) {
      const detail = dbError.message || dbError.details || dbError.hint || `Permission denied (code: ${dbError.code || '42501'})`;
      return {
        isConfigured: true,
        dbConnected: false,
        storageConnected: false,
        itemsCount: 0,
        latencyMs: Date.now() - startTime,
        message: `Database connection failed: ${detail}. Please execute the GRANT permissions in supabase/schema.sql.`,
        error: detail
      };
    }

    // 2. Test storage bucket access
    const { data: storageData, error: storageError } = await supabase.storage
      .from('listing-images')
      .list('', { limit: 1 });

    const latency = Date.now() - startTime;

    if (storageError) {
      return {
        isConfigured: true,
        dbConnected: true,
        storageConnected: false,
        itemsCount: count || 0,
        latencyMs: latency,
        message: `Connected to Database (${count || 0} items), but Storage bucket 'listing-images' returned error: ${storageError.message}. Make sure the bucket is created in Supabase Dashboard -> Storage.`,
        error: storageError.message
      };
    }

    return {
      isConfigured: true,
      dbConnected: true,
      storageConnected: true,
      itemsCount: count || 0,
      latencyMs: latency,
      message: `Successfully connected to Supabase PostgreSQL (${count || 0} items) and Storage bucket 'listing-images' (CDN active)!`
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      dbConnected: false,
      storageConnected: false,
      itemsCount: 0,
      latencyMs: Date.now() - startTime,
      message: `Exception contacting Supabase: ${err.message || 'Network error'}`,
      error: err.message
    };
  }
}

// ==============================================================================
// PROFILES API (Persistent Cloud Resident Profiles)
// ==============================================================================

export async function fetchUserProfileFromDB(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured() || !supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name || '',
        username: data.username || (data.email ? data.email.split('@')[0] : ''),
        email: data.email || '',
        phone: data.phone || '',
        authProvider: 'google',
        googleAvatar: data.avatar_url,
        customAvatar: data.avatar_url,
        isLoggedIn: true,
        isOnboarded: Boolean(data.is_onboarded && data.phone && data.tower),
        tower: data.tower || '',
        societyId: data.society_id || '',
        societyName: data.society_name || '',
        isVerified: true,
        rating: typeof data.rating === 'number' ? data.rating : 5.0,
        dealsCompleted: typeof data.deals_completed === 'number' ? data.deals_completed : 0,
        joinedDate: 'Resident'
      };
    }
  } catch (e) {
    console.warn('[Supabase] Failed to fetch user profile:', e);
  }

  return null;
}

export async function saveUserProfileToDB(profile: UserProfile, userId: string): Promise<boolean> {
  if (!userId) return false;

  // 1. Immediately cache in localStorage for instant local access
  try {
    localStorage.setItem('bhangar_user_profile', JSON.stringify({ ...profile, id: userId }));
    if (profile.tower) {
      localStorage.setItem('bhangar_tower', profile.tower);
    }
  } catch {}

  // 2. Persist to Supabase profiles table
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        email: profile.email,
        name: profile.name,
        username: profile.username || profile.email.split('@')[0],
        phone: profile.phone || '',
        tower: profile.tower || '',
        society_id: profile.societyId || '',
        society_name: profile.societyName || '',
        avatar_url: profile.customAvatar || profile.googleAvatar || '',
        is_onboarded: Boolean(profile.isOnboarded && profile.phone && profile.tower),
        rating: profile.rating || 5.0,
        deals_completed: profile.dealsCompleted || 0,
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.warn('[Supabase] Failed to save profile to database:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] Exception saving profile:', e);
      return false;
    }
  }

  return true;
}

// ==============================================================================
// SOCIETIES API (Centralized Cloud Directory)
// ==============================================================================

export async function fetchSocietiesFromDB(): Promise<SocietyInfo[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          name: row.name,
          city: row.city,
          pincode: row.pincode,
          area: row.area || row.city,
          towers: Array.isArray(row.towers) ? row.towers : [],
          residentCount: row.resident_count || 0,
          activeListingsCount: row.active_listings_count || 0,
          isLive: true
        }));
      }
    } catch (e) {
      console.warn('[Supabase] Failed to fetch societies from DB:', e);
    }
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem('bhangar_societies');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return [];
}

export async function createSocietyInDB(soc: SocietyInfo): Promise<boolean> {
  // Update local storage
  try {
    const raw = localStorage.getItem('bhangar_societies');
    const existing: SocietyInfo[] = raw ? JSON.parse(raw) : [];
    const updated = [soc, ...existing.filter(s => s.id !== soc.id)];
    localStorage.setItem('bhangar_societies', JSON.stringify(updated));
  } catch {}

  // Save to Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('societies').upsert({
        id: soc.id,
        name: soc.name,
        city: soc.city,
        pincode: soc.pincode || '',
        towers: soc.towers || [],
        resident_count: soc.residentCount || 0,
        active_listings_count: soc.activeListingsCount || 0
      });
      if (error) {
        console.warn('[Supabase] Failed to insert society:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] Exception inserting society:', e);
      return false;
    }
  }

  return true;
}
