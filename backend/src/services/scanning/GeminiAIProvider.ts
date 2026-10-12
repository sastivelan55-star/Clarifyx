import https from 'https';
import { DetectionSignal, RiskResult } from '../risk/RiskEngine';
import { MessageDetectionProvider, HeuristicMessageProvider } from './MessageScanner';

export class GeminiAIProvider implements MessageDetectionProvider {
  public readonly mode = 'GEMINI_AI';
  private readonly apiKey: string;
  private readonly fallbackModels = [
    'gemini-3.1-flash-lite',
    'gemini-3.7-flash',
    'gemini-3.5-flash'
  ];
  private readonly heuristicFallback = new HeuristicMessageProvider();

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_KEY || '';
  }

  async analyze(text: string): Promise<{ signals: DetectionSignal[]; baseScore: number; confidence: number; mode: string }> {
    if (!this.apiKey) {
      console.warn('[GeminiAIProvider] No GOOGLE_KEY detected. Falling back to Heuristics.');
      return this.heuristicFallback.analyze(text);
    }

    const prompt = `You are an expert cybersecurity and anti-phishing AI for ClarifyX.
Analyze the following text or message for malicious threats, scams, phishing, social engineering, credential harvesting, or fake news:
"""
${text}
"""

You MUST reply with valid JSON only in this exact schema:
{
  "score": number (0 to 100),
  "level": "SAFE" | "SUSPICIOUS" | "DANGEROUS",
  "verdict": string (one-sentence human readable executive summary of the verdict),
  "confidence": number (between 0.0 and 1.0),
  "recommendation": string (actionable advice for the user),
  "indicators": [
    {
      "category": "PHISHING" | "SOCIAL_ENGINEERING" | "CREDENTIAL_THEFT" | "FINANCIAL_FRAUD" | "OBSFUCATION" | "SAFE",
      "confidence": number (0.0 to 1.0),
      "description": string (clear explanation of why this was flagged),
      "scoreImpact": number
    }
  ]
}`;

    const data = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    for (const model of this.fallbackModels) {
      try {
        const aiResponse = await this.queryGemini(model, data);
        const parsed = JSON.parse(aiResponse);

        return {
          signals: parsed.indicators || [],
          baseScore: typeof parsed.score === 'number' ? parsed.score : 5,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.95,
          mode: `${this.mode} (${model})`
        };
      } catch (err: any) {
        console.warn(`[GeminiAIProvider] Model ${model} failed: ${err.message}. Trying next fallback...`);
      }
    }

    console.warn('[GeminiAIProvider] All Gemini models exhausted. Falling back to Heuristic provider.');
    return this.heuristicFallback.analyze(text);
  }

  private queryGemini(model: string, data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = https.request(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
          }
        },
        res => {
          let body = '';
          res.on('data', chunk => (body += chunk));
          res.on('end', () => {
            try {
              const json = JSON.parse(body);
              if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) {
                resolve(json.candidates[0].content.parts[0].text);
              } else {
                reject(new Error(json.error?.message || `HTTP ${res.statusCode}: ${body}`));
              }
            } catch (e: any) {
              reject(new Error(`Failed to parse response: ${body}`));
            }
          });
        }
      );

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}
