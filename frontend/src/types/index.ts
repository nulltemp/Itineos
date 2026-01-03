// バックエンドAPIの型定義

export interface RouteRequest {
  locations: string[];
  mood?: string;
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
  totalDuration: number;
  totalDistance: number;
  weather: WeatherInfo[];
  recommendedSpots?: RecommendedSpot[];
}

export interface RouteSegment {
  from: Location;
  to: Location;
  distance: number;
  duration: number;
  transportation: 'walking' | 'transit' | 'driving';
  steps: RouteStep[];
  polyline?: string;
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
    precipitation: number;
  };
}

export interface RecommendedSpot {
  name: string;
  description: string;
  location: Location;
  reason: string;
}

