'use client';

import { useState } from 'react';
import RouteForm from '@/components/RouteForm';
import RouteResult from '@/components/RouteResult';
import { RouteRequest, RouteResponse } from '@/types';
import { generateRoute } from '@/lib/api';

export default function Home() {
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (request: RouteRequest) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateRoute(request);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ルート生成に失敗しました');
      console.error('Error generating route:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Itineos
          </h1>
          <p className="text-lg text-gray-600">
            スマート観光ルート・コンシェルジュ
          </p>
          <p className="text-sm text-gray-500 mt-2">
            訪日外国人観光客向けの最適な観光ルートを自動生成
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">ルート生成</h2>
            {!result && (
              <RouteForm onSubmit={handleSubmit} isLoading={isLoading} />
            )}
            {result && (
              <div>
                <button
                  onClick={handleReset}
                  className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  ← 新しいルートを生成
                </button>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold">エラー</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">結果</h2>
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-gray-600">ルートを生成中...</p>
              </div>
            )}
            {!isLoading && !result && !error && (
              <div className="text-center py-12 text-gray-500">
                <p>左側のフォームからルートを生成してください</p>
              </div>
            )}
            {result && <RouteResult result={result} />}
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 Itineos. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
