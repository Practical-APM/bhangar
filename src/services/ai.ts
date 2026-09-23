import { AIDetectionResult, analyzeItemWithAI, AI_CATALOG } from '../data/mockData';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// gemini-2.0-flash is Google's newest, highest-speed, lowest-token consumption model
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';

export const isGeminiConfigured = (): boolean => {
  return (
    typeof GEMINI_API_KEY === 'string' &&
    GEMINI_API_KEY.trim().length > 0 &&
    !GEMINI_API_KEY.includes('your-') &&
    !GEMINI_API_KEY.includes('api-key')
  );
};

// Backwards-compatible alias
export const isGrokConfigured = isGeminiConfigured;

export async function analyzeItemWithGemini(
  userTitle: string,
  presetKey?: string,
  imageUrl?: string
): Promise<AIDetectionResult> {
  // If no Gemini API key is configured, use fast local catalog heuristic
  if (!isGeminiConfigured()) {
    return analyzeItemWithAI(userTitle, presetKey);
  }

  try {
    const prompt = `Analyze this second-hand household/apartment item for sale by a moving tenant in India: "${userTitle}".
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

    const parts: any[] = [{ text: prompt }];

    // If an image is provided as base64 DataURL, pass it as inlineData for multimodal analysis
    if (imageUrl && imageUrl.startsWith('data:image')) {
      const match = imageUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: 'You are an expert valuation and logistics AI for Bhangar.Space, a residential marketplace where moving tenants liquidate apartment furniture, monitors, and appliances in India. Respond strictly with a valid JSON object matching the requested schema.'
            }
          ]
        },
        contents: [
          {
            role: 'user',
            parts
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      console.warn(`[Gemini AI] API call returned status ${response.status}. Falling back to local engine.`);
      return analyzeItemWithAI(userTitle, presetKey);
    }

    const data = await response.json();
    let contentText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!contentText) {
      return analyzeItemWithAI(userTitle, presetKey);
    }

    // Strip markdown formatting if returned
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
      confidence: Number(parsed.confidence) || 96,
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['#CommunityFind', '#VerifiedResident']
    };
  } catch (err) {
    console.warn('[Gemini AI] Parsing error or network failure, using fallback:', err);
    return analyzeItemWithAI(userTitle, presetKey);
  }
}

// Backwards-compatible alias
export const analyzeItemWithGrok = analyzeItemWithGemini;
