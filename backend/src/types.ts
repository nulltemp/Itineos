// リクエスト/レスポンスの型定義

export interface RouteRequest {
  locations: string[]; // 行きたい場所のリスト
  mood?: string; // 現在の気分（例: "静かな場所で抹茶を飲みたい"）
  currentLocation?: {
    lat: number;
    lng: number;
  };
  preferences?: {
    transportation?: 'walking' | 'transit' | 'driving' | 'mixed';
    avoidTolls?: boolean;
    avoidHighways?: boolean;
  };
}

export interface RouteResponse {
  route: RouteSegment[];
  totalDuration: number; // 総移動時間（秒）
  totalDistance: number; // 総距離（メートル）
  weather: WeatherInfo[];
  recommendedSpots?: RecommendedSpot[];
}

export interface RouteSegment {
  from: Location;
  to: Location;
  distance: number; // メートル
  duration: number; // 秒
  transportation: 'walking' | 'transit' | 'driving';
  steps: RouteStep[];
  polyline?: string; // ルートのポリライン
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  transportation?: 'walking' | 'transit' | 'driving';
}

export interface Location {
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface WeatherInfo {
  location: Location;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  forecast?: {
    temperature: number;
    condition: string;
    precipitation: number; // mm
  };
}

export interface RecommendedSpot {
  name: string;
  description: string;
  location: Location;
  reason: string; // なぜこのスポットが選ばれたか
}

