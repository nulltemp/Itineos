import { MapsService } from './maps';
import { WeatherService } from './weather';
import { GeminiService } from './gemini';
import { RouteRequest, RouteResponse, Location, RecommendedSpot, WeatherInfo } from '../types';

export class RouteGenerator {
  private mapsService: MapsService;
  private weatherService: WeatherService;
  private geminiService: GeminiService;

  constructor() {
    this.mapsService = new MapsService();
    this.weatherService = new WeatherService();
    this.geminiService = new GeminiService();
  }

  /**
   * ルートを生成
   */
  async generateRoute(request: RouteRequest): Promise<RouteResponse> {
    try {
      // 1. 場所名を座標に変換（Geocoding）
      const locations = await this.geocodeLocations(request.locations);

      // 2. 現在地がある場合は先頭に追加
      const allLocations = request.currentLocation
        ? [{ ...request.currentLocation, name: 'Current Location' }, ...locations]
        : locations;

      // 3. ルート計算
      const routeSegments = await this.mapsService.calculateRoute(
        allLocations,
        request.preferences
      );

      // 4. 天気情報を取得（各場所ごと）
      const weatherPromises = allLocations.map(loc => 
        this.weatherService.getWeather(loc).catch(err => {
          console.error(`Failed to get weather for ${loc.name}:`, err);
          return null;
        })
      );
      const weatherResults = await Promise.all(weatherPromises);
      const weather = weatherResults.filter((w): w is WeatherInfo => w !== null);

      // 5. 気分に基づくスポット推薦（オプション）
      let recommendedSpots: RecommendedSpot[] = [];
      if (request.mood) {
        recommendedSpots = await this.geminiService.recommendSpots(
          request.mood,
          allLocations,
          request.currentLocation ? allLocations[0] : undefined
        );
      }

      // 6. 総移動時間と距離を計算
      const totalDuration = routeSegments.reduce((sum, seg) => sum + seg.duration, 0);
      const totalDistance = routeSegments.reduce((sum, seg) => sum + seg.distance, 0);

      return {
        route: routeSegments,
        totalDuration,
        totalDistance,
        weather,
        recommendedSpots: recommendedSpots.length > 0 ? recommendedSpots : undefined,
      };
    } catch (error) {
      console.error('Error generating route:', error);
      throw error;
    }
  }

  /**
   * 場所名のリストを座標に変換
   */
  private async geocodeLocations(locationNames: string[]): Promise<Location[]> {
    const geocodePromises = locationNames.map(name => 
      this.mapsService.geocodeLocation(name).catch(err => {
        console.error(`Failed to geocode ${name}:`, err);
        throw new Error(`Failed to find location: ${name}`);
      })
    );

    return Promise.all(geocodePromises);
  }
}

