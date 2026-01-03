'use client';

import { RouteResponse, RouteSegment, WeatherInfo, RecommendedSpot } from '@/types';

interface RouteResultProps {
  result: RouteResponse;
}

export default function RouteResult({ result }: RouteResultProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${meters}m`;
  };

  const getTransportationIcon = (transportation: string): string => {
    switch (transportation) {
      case 'walking':
        return '🚶';
      case 'transit':
        return '🚃';
      case 'driving':
        return '🚗';
      default:
        return '📍';
    }
  };

  const getWeatherIcon = (condition: string): string => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain') || lower.includes('shower')) return '🌧️';
    if (lower.includes('snow')) return '❄️';
    if (lower.includes('cloud')) return '☁️';
    if (lower.includes('clear') || lower.includes('sun')) return '☀️';
    if (lower.includes('fog')) return '🌫️';
    if (lower.includes('thunder')) return '⛈️';
    return '🌤️';
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">ルート概要</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">総移動時間</p>
            <p className="text-2xl font-bold">{formatDuration(result.totalDuration)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">総距離</p>
            <p className="text-2xl font-bold">{formatDistance(result.totalDistance)}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">ルート詳細</h3>
        <div className="space-y-4">
          {result.route.map((segment: RouteSegment, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getTransportationIcon(segment.transportation)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{segment.from.name}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-semibold">{segment.to.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{segment.from.address}</p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>⏱️ {formatDuration(segment.duration)}</span>
                    <span>📏 {formatDistance(segment.distance)}</span>
                  </div>
                  {segment.steps.length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                        詳細な経路を見る ({segment.steps.length}ステップ)
                      </summary>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        {segment.steps.slice(0, 5).map((step, stepIndex) => (
                          <li key={stepIndex} className="pl-4 border-l-2 border-gray-200">
                            {step.instruction}
                          </li>
                        ))}
                        {segment.steps.length > 5 && (
                          <li className="text-gray-400 text-xs pl-4">
                            ...他 {segment.steps.length - 5} ステップ
                          </li>
                        )}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {result.weather && result.weather.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">天気情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.weather.map((weather: WeatherInfo, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getWeatherIcon(weather.current.condition)}</span>
                  <h4 className="font-semibold">{weather.location.name}</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <p>🌡️ 気温: {weather.current.temperature.toFixed(1)}°C</p>
                  <p>☁️ 天気: {weather.current.condition}</p>
                  <p>💧 湿度: {weather.current.humidity}%</p>
                  <p>💨 風速: {weather.current.windSpeed.toFixed(1)} m/s</p>
                  {weather.forecast && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">24時間後</p>
                      <p>🌡️ {weather.forecast.temperature.toFixed(1)}°C</p>
                      <p>☁️ {weather.forecast.condition}</p>
                      {weather.forecast.precipitation > 0 && (
                        <p>🌧️ 降水量: {weather.forecast.precipitation.toFixed(1)}mm</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.recommendedSpots && result.recommendedSpots.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">おすすめスポット</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.recommendedSpots.map((spot: RecommendedSpot, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">{spot.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{spot.description}</p>
                <p className="text-xs text-gray-500 mb-2">📍 {spot.location.address || `${spot.location.lat.toFixed(4)}, ${spot.location.lng.toFixed(4)}`}</p>
                <div className="mt-2 p-2 bg-blue-50 rounded">
                  <p className="text-xs text-blue-800">
                    <strong>推奨理由:</strong> {spot.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

