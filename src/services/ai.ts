import { AIDetectionResult, analyzeItemWithAI } from '../data/mockData';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// gemini-2.0-flash is Google's newest, highest-speed, lowest-token consumption model
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';

export interface AIUsageRecord {
  id: string;
  timestamp: string;
  title: string;
  engine: 'gemini-2.0-flash' | 'local-catalog';
  type: 'text' | 'multimodal';
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: 'success' | 'fallback' | 'error';
  estimatedCostINR: number;
}

// Log AI Usage to persistent telemetry storage
export function logAIUsage(record: AIUsageRecord) {
  try {
    const raw = localStorage.getItem('bhangar_ai_usage_history');
    const history: AIUsageRecord[] = raw ? JSON.parse(raw) : [];
    history.unshift(record);
    // Keep last 200 telemetry records
    localStorage.setItem('bhangar_ai_usage_history', JSON.stringify(history.slice(0, 200)));
  } catch (e) {
    console.warn('[Telemetry] Failed to log AI usage:', e);
  }
}

// Get AI Usage Telemetry History
export function getAIUsageHistory(): AIUsageRecord[] {
  try {
    const raw = localStorage.getItem('bhangar_ai_usage_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Calculate Aggregate AI & Resource Stats for Admin/PM
export function getAIResourceStats() {
  const history = getAIUsageHistory();
  const totalCalls = history.length;
  const geminiCalls = history.filter(h => h.engine === 'gemini-2.0-flash' && h.status === 'success').length;
  const localCalls = history.filter(h => h.engine === 'local-catalog' || h.status === 'fallback').length;
  const errorCalls = history.filter(h => h.status === 'error').length;
  const multimodalCalls = history.filter(h => h.type === 'multimodal').length;
  const textCalls = history.filter(h => h.type === 'text').length;
  
  const promptTokens = history.reduce((sum, h) => sum + (h.promptTokens || 0), 0);
  const completionTokens = history.reduce((sum, h) => sum + (h.completionTokens || 0), 0);
  const totalTokens = history.reduce((sum, h) => sum + (h.totalTokens || 0), 0);
  const totalCostINR = history.reduce((sum, h) => sum + (h.estimatedCostINR || 0), 0);
  const totalCostUSD = Math.round((totalCostINR / 86.5) * 10000) / 10000;
  
  const avgLatency = history.length > 0 
    ? Math.round(history.reduce((sum, h) => sum + (h.latencyMs || 0), 0) / history.length) 
    : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCalls = history.filter(h => h.timestamp && h.timestamp.startsWith(todayStr)).length;
  const successRate = totalCalls > 0 ? Math.round((geminiCalls / totalCalls) * 100) : 0;

  return {
    totalCalls,
    geminiCalls,
    localCalls,
    errorCalls,
    multimodalCalls,
    textCalls,
    promptTokens,
    completionTokens,
    totalTokens,
    totalCostINR: Math.round(totalCostINR * 1000) / 1000,
    totalCostUSD,
    avgLatencyMs: avgLatency,
    todayCalls,
    successRate,
    recentCalls: history.slice(0, 50),
    isConfigured: isGeminiConfigured(),
    model: GEMINI_MODEL
  };
}

// Clear AI Usage History
export function clearAIUsageHistory(): void {
  try {
    localStorage.removeItem('bhangar_ai_usage_history');
  } catch (e) {
    console.warn('[Telemetry] Failed to clear history:', e);
  }
}

// Test live Gemini latency and token usage
export async function testGeminiConnection(): Promise<{ success: boolean; latencyMs: number; message: string; tokens?: number }> {
  const startTime = Date.now();
  if (!isGeminiConfigured()) {
    return {
      success: false,
      latencyMs: 0,
      message: 'VITE_GEMINI_API_KEY is not configured in environment. Using instant zero-cost local catalog heuristic.'
    };
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Healthcheck ping. Respond with: {"status": "ok"}' }] }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 20 }
      })
    });
    const latency = Date.now() - startTime;
    if (!response.ok) {
      return { success: false, latencyMs: latency, message: `API responded with HTTP ${response.status}: ${response.statusText}` };
    }
    const data = await response.json();
    const tokens = data.usageMetadata?.totalTokenCount || 10;
    return { success: true, latencyMs: latency, message: `Connected to ${GEMINI_MODEL} successfully`, tokens };
  } catch (err: any) {
    return { success: false, latencyMs: Date.now() - startTime, message: err.message || 'Network error' };
  }
}

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
  const startTime = Date.now();
  const isMultimodal = Boolean(imageUrl && imageUrl.startsWith('data:image'));

  // If no Gemini API key is configured, use fast local catalog heuristic
  if (!isGeminiConfigured()) {
    const localResult = analyzeItemWithAI(userTitle, presetKey);
    logAIUsage({
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      title: userTitle,
      engine: 'local-catalog',
      type: isMultimodal ? 'multimodal' : 'text',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      latencyMs: Date.now() - startTime,
      status: 'fallback',
      estimatedCostINR: 0
    });
    return localResult;
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

    if (isMultimodal && imageUrl) {
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
      const localResult = analyzeItemWithAI(userTitle, presetKey);
      logAIUsage({
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
        title: userTitle,
        engine: 'local-catalog',
        type: isMultimodal ? 'multimodal' : 'text',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        latencyMs: Date.now() - startTime,
        status: 'fallback',
        estimatedCostINR: 0
      });
      return localResult;
    }

    const data = await response.json();
    let contentText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!contentText) {
      return analyzeItemWithAI(userTitle, presetKey);
    }

    if (contentText.startsWith('```')) {
      contentText = contentText.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    const parsed = JSON.parse(contentText);

    // Calculate real token usage & cost
    const promptTokens = data.usageMetadata?.promptTokenCount || 160;
    const completionTokens = data.usageMetadata?.candidatesTokenCount || 180;
    const totalTokens = data.usageMetadata?.totalTokenCount || (promptTokens + completionTokens);
    // Cost: $0.10/1M input, $0.40/1M output, 1 USD ~ 86.5 INR
    const costUSD = (promptTokens * 0.10 / 1_000_000) + (completionTokens * 0.40 / 1_000_000);
    const estimatedCostINR = Math.round(costUSD * 86.5 * 1000) / 1000;

    logAIUsage({
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      title: userTitle,
      engine: 'gemini-2.0-flash',
      type: isMultimodal ? 'multimodal' : 'text',
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs: Date.now() - startTime,
      status: 'success',
      estimatedCostINR
    });

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
    const localResult = analyzeItemWithAI(userTitle, presetKey);
    logAIUsage({
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      title: userTitle,
      engine: 'local-catalog',
      type: isMultimodal ? 'multimodal' : 'text',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      latencyMs: Date.now() - startTime,
      status: 'error',
      estimatedCostINR: 0
    });
    return localResult;
  }
}

// Backwards-compatible alias
export const analyzeItemWithGrok = analyzeItemWithGemini;
