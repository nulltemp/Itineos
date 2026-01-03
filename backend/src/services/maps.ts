import axios from 'axios';
import { Location, RouteSegment, RouteStep } from '../types';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

export class MapsService {
  private apiKey: string;

  constructor() {
    if (!API_KEY) {
      throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set');
    }
    this.apiKey = API_KEY;
  }

  /**
   * 複数の場所間のルートを計算
   */
  async calculateRoute(
    locations: Location[],
    preferences?: {
      transportation?: 'walking' | 'transit' | 'driving';
      avoidTolls?: boolean;
      avoidHighways?: boolean;
    }
  ): Promise<RouteSegment[]> {
    if (locations.length < 2) {
      throw new Error('At least 2 locations are required');
    }

    const segments: RouteSegment[] = [];

    for (let i = 0; i < locations.length - 1; i++) {
      const from = locations[i];
      const to = locations[i + 1];

      const segment = await this.calculateSegment(from, to, preferences);
      segments.push(segment);
    }

    return segments;
  }

  /**
   * 2地点間のルートを計算
   */
  private async calculateSegment(
    from: Location,
    to: Location,
    preferences?: {
      transportation?: 'walking' | 'transit' | 'driving';
      avoidTolls?: boolean;
      avoidHighways?: boolean;
    }
  ): Promise<RouteSegment> {
    try {
      const travelMode = this.mapTransportationMode(preferences?.transportation || 'driving');
      
      // Google Maps Directions API を使用（より確実な方法）
      const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin: `${from.lat},${from.lng}`,
          destination: `${to.lat},${to.lng}`,
          mode: travelMode,
          key: this.apiKey,
          language: 'en',
          alternatives: false,
          ...(preferences?.avoidTolls && { avoid: 'tolls' }),
          ...(preferences?.avoidHighways && { avoid: 'highways' }),
        },
      });

      if (response.data.status !== 'OK' || !response.data.routes?.[0]) {
        throw new Error(`Directions API error: ${response.data.status}`);
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      const steps: RouteStep[] = leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // HTMLタグを除去
        distance: step.distance.value,
        duration: step.duration.value,
        transportation: this.determineTransportationFromStep(step, travelMode),
      }));

      return {
        from,
        to,
        distance: leg.distance.value,
        duration: leg.duration.value,
        transportation: this.mapTravelModeToTransportation(travelMode),
        steps,
        polyline: route.overview_polyline.points,
      };
    } catch (error) {
      console.error('Error calculating route:', error);
      throw new Error(`Failed to calculate route: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 場所名から座標を取得（Geocoding）
   */
  async geocodeLocation(locationName: string): Promise<Location> {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: locationName,
          key: this.apiKey,
          language: 'en',
        },
      });

      if (response.data.status !== 'OK' || !response.data.results?.[0]) {
        throw new Error(`Geocoding failed for: ${locationName}`);
      }

      const result = response.data.results[0];
      const location = result.geometry.location;

      return {
        name: locationName,
        lat: location.lat,
        lng: location.lng,
        address: result.formatted_address,
      };
    } catch (error) {
      console.error('Error geocoding location:', error);
      throw new Error(`Failed to geocode location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapTransportationMode(mode: string): string {
    switch (mode) {
      case 'walking':
        return 'walking';
      case 'transit':
        return 'transit';
      case 'driving':
        return 'driving';
      default:
        return 'driving';
    }
  }

  private mapTravelModeToTransportation(mode: string): 'walking' | 'transit' | 'driving' {
    switch (mode) {
      case 'walking':
        return 'walking';
      case 'transit':
        return 'transit';
      case 'driving':
        return 'driving';
      default:
        return 'driving';
    }
  }

  private determineTransportationFromStep(step: any, travelMode: string): 'walking' | 'transit' | 'driving' {
    if (step.transit_details) {
      return 'transit';
    }
    if (travelMode === 'walking') {
      return 'walking';
    }
    return 'driving';
  }
}

