import { RouteRequest, RouteResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-api-gateway-url.execute-api.region.amazonaws.com/prod';

export async function generateRoute(request: RouteRequest): Promise<RouteResponse> {
  const response = await fetch(`${API_BASE_URL}/api/route`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

