import { AIDetectionResult, analyzeItemWithAI, AI_CATALOG } from '../data/mockData';

const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY;
const GROK_MODEL = import.meta.env.VITE_GROK_MODEL || 'grok-2-latest';

export const isGrokConfigured = (): boolean => {
  return (
    typeof GROK_API_KEY === 'string' &&
    GROK_API_KEY.trim().length > 0 &&
    !GROK_API_KEY.includes('your-api-key')
  );
};

export async function analyzeItemWithGrok(
  userTitle: string,
  presetKey?: string,
  imageUrl?: string
): Promise<AIDetectionResult> {
  // If no Grok API key is configured, use fast local catalog heuristic
  if (!isGrokConfigured()) {
    return analyzeItemWithAI(userTitle, presetKey);
  }

  try {
    const prompt = `Analyze this second-hand household/apartment item for sale by a moving tenant: "${userTitle}".
Return realistic moving-out liquidation pricing in Indian Rupees (INR ₹), condition, dimensions, elevator fit, and hashtags.

Output ONLY a JSON object with this exact structure:
{
  "title": "${userTitle}",
  "category": "furniture" | "electronics" | "appliances" | "kitchen" | "decor" | "fixer",
  "roomType": "wfh" | "living" | "kitchen" | "appliances" | "fixer",
  "estimatedRetail": number,
  "suggestedPrice": number,
  "pricePresets": [number, number, number],
  "dimensions": string (e.g. "65 × 60 × 120 cm"),
  "assemblyStatus": "Ready Assembled (Zero assembly needed)" | "Flat-pack / Disassembled" | "Plug & Play",
  "liftFriendly": "Fits standard passenger lift" | "Service lift recommended" | "Hand-carry 1 person",
  "condition": "like_new" | "gently_used" | "fixer_upper",
  "confidence": number (between 85 and 99),
  "tags": ["#tag1", "#tag2", "#tag3", "#tag4"]
}`;

    const messages: any[] = [
      {
        role: 'system',
        content:
          'You are a professional valuation and logistics AI for Bhangar.Space, a residential marketplace where moving tenants liquidate apartment furniture, monitors, and appliances. You respond strictly in valid JSON without markdown wrapping.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    // If an image is provided and starts with data:image or https, add vision payload if supported
    if (imageUrl && (imageUrl.startsWith('https://') || imageUrl.startsWith('data:image'))) {
      messages[1] = {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'low'
            }
          }
        ]
      };
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      console.warn(`[Grok AI] API call returned status ${response.status}. Falling back to local engine.`);
      return analyzeItemWithAI(userTitle, presetKey);
    }

    const data = await response.json();
    let contentText = data.choices?.[0]?.message?.content?.trim();

    if (!contentText) {
      return analyzeItemWithAI(userTitle, presetKey);
    }

    // Strip markdown formatting if returned (e.g. ```json ... ```)
    if (contentText.startsWith('```')) {
      contentText = contentText.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    const parsed = JSON.parse(contentText);

    // Validate and guarantee defaults
    return {
      title: parsed.title || userTitle,
      category: parsed.category || 'furniture',
      roomType: parsed.roomType || 'wfh',
      estimatedRetail: Number(parsed.estimatedRetail) || 12000,
      suggestedPrice: Number(parsed.suggestedPrice) || 3000,
      pricePresets: Array.isArray(parsed.pricePresets) && parsed.pricePresets.length === 3
        ? parsed.pricePresets.map(Number)
        : [
            Math.round((parsed.suggestedPrice || 3000) * 0.85),
            parsed.suggestedPrice || 3000,
            Math.round((parsed.suggestedPrice || 3000) * 1.15)
          ],
      dimensions: parsed.dimensions || 'Standard apartment dimensions',
      assemblyStatus: parsed.assemblyStatus || 'Ready Assembled (Zero assembly needed)',
      liftFriendly: parsed.liftFriendly || 'Fits standard passenger lift',
      condition: parsed.condition || 'gently_used',
      confidence: Number(parsed.confidence) || 94,
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['#CommunityFind', '#VerifiedResident']
    };
  } catch (err) {
    console.warn('[Grok AI] Parsing error or network failure, using fallback:', err);
    return analyzeItemWithAI(userTitle, presetKey);
  }
}
