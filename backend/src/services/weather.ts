import axios from 'axios';
import { Location, WeatherInfo } from '../types';

// 環境変数名を Google Maps のキーに切替
const API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

export class WeatherService {
  // Google Maps Weather API（Maps Platform の Weather エンドポイント想定）
  private baseUrl = 'https://maps.googleapis.com/maps/api';
  private apiKey: string;

  constructor() {
    if (!API_KEY) {
      throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set');
    }
    this.apiKey = API_KEY;
  }

  /**
   * 指定した場所の天気情報を取得
   */
  async getWeather(location: Location): Promise<WeatherInfo> {
    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        this.getCurrentWeather(location),
        this.getForecast(location),
      ]);

      return {
        location,
        current: currentResponse,
        forecast: forecastResponse,
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw new Error(`Failed to fetch weather: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 現在の天気を取得（Google Maps Weather API 形式からマッピング）
   */
  private async getCurrentWeather(location: Location) {
    const response = await axios.get(`${this.baseUrl}/weather`, {
      params: {
        location: `${location.lat},${location.lng}`,
        key: this.apiKey,
        units: 'metric',
        language: 'en',
      },
    });

    const data = response.data || {};

    // レスポンスの形はプロバイダによって差があるため、複数パスで抽出する
    const current = data.current || data.currently || data.current_weather || data;

    const temperature = current?.temp ?? current?.temperature ?? current?.temp_c ?? 0;
    const condition = (
      current?.conditions?.[0]?.main ||
      current?.weather?.[0]?.main ||
      current?.summary ||
      'Unknown'
    );
    const humidity = current?.humidity ?? current?.humidity_percent ?? 0;
    const windSpeed = current?.wind?.speed ?? current?.wind_speed ?? 0;

    return {
      temperature,
      condition,
      humidity,
      windSpeed,
    };
  }

  /**
   * 天気予報を取得（24時間後）
   */
  private async getForecast(location: Location) {
    const response = await axios.get(`${this.baseUrl}/forecast`, {
      params: {
        location: `${location.lat},${location.lng}`,
        key: this.apiKey,
        units: 'metric',
        language: 'en',
      },
    });

    const data = response.data || {};

    // 優先的に daily を参照し、なければ hourly を使って24時間後の予報を探す
    let targetForecast: any = null;

    const now = new Date();
    const targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (Array.isArray(data.daily) && data.daily.length > 0) {
      // daily 配列は日単位の予報（0: 当日, 1: 翌日）
      targetForecast = data.daily[1] || data.daily[0];
    } else if (Array.isArray(data.hourly) && data.hourly.length > 0) {
      // hourly は時間ごとの予報
      let closest = data.hourly[0];
      let minDiff = Math.abs(new Date((closest.dt || closest.time) * 1000).getTime() - targetTime.getTime());
      for (const h of data.hourly) {
        const t = new Date((h.dt || h.time) * 1000);
        const diff = Math.abs(t.getTime() - targetTime.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closest = h;
        }
      }
      targetForecast = closest;
    } else if (Array.isArray(data.list) && data.list.length > 0) {
      // OpenWeatherMap 互換の list 配列があればそれを利用
      let closest = data.list[0];
      let minDiff = Math.abs(new Date(closest.dt * 1000).getTime() - targetTime.getTime());
      for (const f of data.list) {
        const ft = new Date(f.dt * 1000);
        const diff = Math.abs(ft.getTime() - targetTime.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closest = f;
        }
      }
      targetForecast = closest;
    }

    // マッピング: 値が存在するキーを順に扱う
    const temperature = targetForecast?.temp?.day ?? targetForecast?.temp ?? targetForecast?.main?.temp ?? targetForecast?.temperature ?? 0;
    const condition = targetForecast?.conditions?.[0]?.main || targetForecast?.weather?.[0]?.main || targetForecast?.summary || 'Unknown';
    const precipitation = targetForecast?.rain ?? targetForecast?.precipitation ?? targetForecast?.pop ?? 0;

    return {
      temperature,
      condition,
      precipitation,
    };
  }
}

