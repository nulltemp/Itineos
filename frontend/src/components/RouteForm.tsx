'use client';

import { useState } from 'react';
import { RouteRequest } from '@/types';

interface RouteFormProps {
  onSubmit: (request: RouteRequest) => void;
  isLoading: boolean;
}

export default function RouteForm({ onSubmit, isLoading }: RouteFormProps) {
  const [locations, setLocations] = useState<string[]>(['']);
  const [mood, setMood] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [transportation, setTransportation] = useState<'walking' | 'transit' | 'driving' | 'mixed'>('mixed');
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [avoidHighways, setAvoidHighways] = useState(false);

  const addLocationField = () => {
    setLocations([...locations, '']);
  };

  const removeLocationField = (index: number) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
    }
  };

  const updateLocation = (index: number, value: string) => {
    const newLocations = [...locations];
    newLocations[index] = value;
    setLocations(newLocations);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('位置情報の取得に失敗しました');
        }
      );
    } else {
      alert('このブラウザは位置情報をサポートしていません');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validLocations = locations.filter(loc => loc.trim() !== '');
    if (validLocations.length === 0) {
      alert('少なくとも1つの場所を入力してください');
      return;
    }

    onSubmit({
      locations: validLocations,
      mood: mood.trim() || undefined,
      currentLocation: currentLocation || undefined,
      preferences: {
        transportation,
        avoidTolls,
        avoidHighways,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          行きたい場所 <span className="text-red-500">*</span>
        </label>
        {locations.map((location, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={location}
              onChange={(e) => updateLocation(index, e.target.value)}
              placeholder="例: Tokyo Station, Shibuya, Harajuku"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {locations.length > 1 && (
              <button
                type="button"
                onClick={() => removeLocationField(index)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                削除
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addLocationField}
          className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          + 場所を追加
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          現在の気分・要望（オプション）
        </label>
        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="例: 静かな場所で抹茶を飲みたい"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          現在地
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {currentLocation ? '✓ 位置情報を取得済み' : '現在地を取得'}
          </button>
          {currentLocation && (
            <button
              type="button"
              onClick={() => setCurrentLocation(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              クリア
            </button>
          )}
        </div>
        {currentLocation && (
          <p className="mt-2 text-sm text-gray-600">
            緯度: {currentLocation.lat.toFixed(6)}, 経度: {currentLocation.lng.toFixed(6)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          移動手段
        </label>
        <select
          value={transportation}
          onChange={(e) => setTransportation(e.target.value as any)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="mixed">自動選択（推奨）</option>
          <option value="walking">徒歩</option>
          <option value="transit">電車・バス</option>
          <option value="driving">車</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={avoidTolls}
            onChange={(e) => setAvoidTolls(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">有料道路を避ける</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={avoidHighways}
            onChange={(e) => setAvoidHighways(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">高速道路を避ける</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? 'ルート生成中...' : 'ルートを生成'}
      </button>
    </form>
  );
}

