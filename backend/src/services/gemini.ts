import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecommendedSpot, Location } from '../types';

const API_KEY = process.env.GEMINI_API_KEY || '';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * ユーザーの気分に基づいてスポットを推薦
   */
  async recommendSpots(
    mood: string,
    locations: Location[],
    currentLocation?: Location
  ): Promise<RecommendedSpot[]> {
    try {
      const prompt = this.buildRecommendationPrompt(mood, locations, currentLocation);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // JSON形式で返されることを期待
      return this.parseRecommendations(text, locations);
    } catch (error) {
      console.error('Error getting recommendations from Gemini:', error);
      // エラーが発生してもルート生成は続行
      return [];
    }
  }

  /**
   * 場所名から詳細情報を取得（自然言語解析）
   */
  async analyzeLocationRequest(locationRequest: string): Promise<{
    locations: string[];
    mood?: string;
  }> {
    try {
      const prompt = `You are a travel assistant. Analyze the following user request and extract:
1. Specific location names or places they want to visit (as a JSON array)
2. Their mood or preferences (as a string, optional)

User request: "${locationRequest}"

Respond ONLY with a valid JSON object in this format:
{
  "locations": ["location1", "location2", ...],
  "mood": "optional mood description"
}

If no specific locations are mentioned, return an empty array for locations.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // JSONを抽出
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { locations: [] };
    } catch (error) {
      console.error('Error analyzing location request:', error);
      // パースに失敗した場合は元のリクエストをそのまま返す
      return { locations: [locationRequest] };
    }
  }

  private buildRecommendationPrompt(
    mood: string,
    locations: Location[],
    currentLocation?: Location
  ): string {
    const locationList = locations.map(loc => `- ${loc.name} (${loc.address || `${loc.lat}, ${loc.lng}`})`).join('\n');
    const currentLocText = currentLocation 
      ? `Current location: ${currentLocation.name} (${currentLocation.address || `${currentLocation.lat}, ${currentLocation.lng}`})`
      : '';

    return `You are a travel concierge for foreign tourists visiting Japan. Based on the user's mood and the locations they want to visit, recommend 2-3 additional spots that would enhance their experience.

User's mood/preference: "${mood}"
Planned locations:
${locationList}
${currentLocText}

Please recommend spots that:
1. Match the user's mood/preference
2. Are near the planned locations or along the route
3. Are popular with foreign tourists
4. Enhance the overall travel experience

Respond with a JSON array of recommendations in this exact format:
[
  {
    "name": "Spot name",
    "description": "Brief description",
    "lat": 35.6762,
    "lng": 139.6503,
    "address": "Full address",
    "reason": "Why this spot was recommended"
  }
]

Return only the JSON array, no other text.`;
  }

  private parseRecommendations(text: string, existingLocations: Location[]): RecommendedSpot[] {
    try {
      // JSON配列を抽出
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return [];
      }

      const recommendations = JSON.parse(jsonMatch[0]);
      
      return recommendations.map((rec: any) => ({
        name: rec.name,
        description: rec.description || '',
        location: {
          name: rec.name,
          lat: rec.lat,
          lng: rec.lng,
          address: rec.address,
        },
        reason: rec.reason || '',
      }));
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      return [];
    }
  }
}

