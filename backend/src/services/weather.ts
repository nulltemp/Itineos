import axios from 'axios';
import { Location, WeatherInfo } from '../types';

const API_KEY = process.env.OPENWEATHERMAP_API_KEY || '';

export class WeatherService {
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private apiKey: string;

  constructor() {
    if (!API_KEY) {
      throw new Error('OPENWEATHERMAP_API_KEY environment variable is not set');
    }
    this.apiKey = API_KEY;
  }

  /**
   * 指定した場所の天気情報を取得
   */
  async getWeather(location: Location): Promise<WeatherInfo> {
    try {
      // 現在の天気と予報を取得
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
   * 現在の天気を取得
   */
  private async getCurrentWeather(location: Location) {
    const response = await axios.get(`${this.baseUrl}/weather`, {
      params: {
        lat: location.lat,
        lon: location.lng,
        appid: this.apiKey,
        units: 'metric', // 摂氏で取得
        lang: 'en',
      },
    });

    const data = response.data;

    return {
      temperature: data.main.temp,
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
    };
  }

  /**
   * 天気予報を取得（24時間後）
   */
  private async getForecast(location: Location) {
    const response = await axios.get(`${this.baseUrl}/forecast`, {
      params: {
        lat: location.lat,
        lon: location.lng,
        appid: this.apiKey,
        units: 'metric', // 摂氏で取得
        lang: 'en',
      },
    });

    const data = response.data;

    // 24時間後のデータを取得（3時間ごとのデータなので、list[8]が約24時間後）
    // より正確には、現在時刻から24時間後のデータを探す
    const now = new Date();
    const targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // 24時間に最も近いデータを取得
    let closestForecast = data.list[0];
    let minTimeDiff = Math.abs(new Date(data.list[0].dt * 1000).getTime() - targetTime.getTime());
    
    for (const forecast of data.list) {
      const forecastTime = new Date(forecast.dt * 1000);
      const timeDiff = Math.abs(forecastTime.getTime() - targetTime.getTime());
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestForecast = forecast;
      }
    }

    // 降水量はrainオブジェクトから取得（存在する場合）
    const precipitation = closestForecast.rain?.['3h'] || 0;

    return {
      temperature: closestForecast.main.temp,
      condition: closestForecast.weather[0].main,
      precipitation,
    };
  }
}

