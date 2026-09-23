import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ThriftItem, SellerOffer, ItemComment, INITIAL_THRIFT_ITEMS, INITIAL_SELLER_OFFERS, INITIAL_COMMENTS } from '../data/mockData';

// Map database row to ThriftItem
function mapRowToItem(row: any): ThriftItem {
  return {
    id: row.id,
    articleNumber: row.article_number || '804.249.12',
    ikeaStyleName: row.ikea_style_name || row.title,
    title: row.title,
    category: row.category,
    roomType: row.room_type || 'wfh',
    price: row.price,
    originalPrice: row.original_price || row.price * 2,
    bottomLinePrice: row.bottom_line_price || Math.round(row.price * 0.85),
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
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : ['/images/chair.jpg'],
    hasVideoProof: Boolean(row.has_video_proof),
    videoProofNote: row.video_proof_note,
    seller: row.seller || {
      name: 'Resident Neighbor',
      alias: 'Neighbor',
      tower: 'Tower 4',
      society: 'DLF Phase 5',
      city: 'Gurugram',
      verifiedResident: true,
      rating: 5.0,
      dealsCompleted: 1,
      responseTime: '< 15 mins'
    },
    locationNote: `${row.seller?.tower || 'Tower 4'} · Elevator handover`,
    isMovingOut: Boolean(row.is_moving_out),
    movingOutDate: row.moving_out_date,
    status: row.status || 'available',
    tags: Array.isArray(row.tags) ? row.tags : ['#VerifiedResident'],
    listedAgo: 'Just now'
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

export async function fetchItemsFromDB(societyId?: string): Promise<ThriftItem[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('items').select('*').order('created_at', { ascending: false });
      if (societyId) {
        query = query.eq('society_id', societyId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map(mapRowToItem);
      }
    } catch (e) {
      console.warn('[Supabase] Failed to fetch items, using local fallback:', e);
    }
  }

  // LocalStorage / Seed fallback
  try {
    const local = localStorage.getItem('bhangar_items');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_THRIFT_ITEMS;
}

export async function createItemInDB(item: ThriftItem): Promise<ThriftItem> {
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

      const dbItem = { ...item, images: uploadedImages };

      const { error } = await supabase.from('items').insert({
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
        society_id: 'dlf-phase-5',
        is_seed: false
      });

      if (!error) {
        return dbItem;
      }
      console.warn('[Supabase] Insert failed:', error.message);
    } catch (e) {
      console.warn('[Supabase] Exception inserting item:', e);
    }
  }

  return item;
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

      if (!error && data && data.length > 0) {
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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
