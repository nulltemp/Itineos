import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { RouteGenerator } from './services/routeGenerator';
import { RouteRequest } from './types';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // CORS ヘッダー
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONS リクエストの処理（CORS プリフライト）
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // リクエストボディの解析
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const body = JSON.parse(event.body) as RouteRequest;

    // バリデーション
    if (!body.locations || !Array.isArray(body.locations) || body.locations.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'At least one location is required' }),
      };
    }

    // ルート生成
    const routeGenerator = new RouteGenerator();
    const route = await routeGenerator.generateRoute(body);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(route),
    };
  } catch (error) {
    console.error('Error in handler:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = errorMessage.includes('not found') || errorMessage.includes('Failed to find') 
      ? 404 
      : 500;

    return {
      statusCode,
      headers,
      body: JSON.stringify({ 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined })
      }),
    };
  }
};