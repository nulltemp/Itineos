# Itineos Backend

Itineos サービスのバックエンド Lambda 関数です。

## 機能

- 観光ルートの自動生成
- Google Maps API によるルート計算
- OpenWeatherMap API による天気情報取得
- Gemini API によるスポット推薦

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

Lambda 関数に以下の環境変数を設定してください：

- `GOOGLE_MAPS_API_KEY`: Google Maps Platform API キー
- `OPENWEATHERMAP_API_KEY`: OpenWeatherMap API キー
- `GEMINI_API_KEY`: Google Gemini API キー

### 3. ビルド

```bash
npm run build
```

TypeScript が `dist/` ディレクトリにコンパイルされます。

## API エンドポイント

### POST /api/route

観光ルートを生成します。

#### リクエスト例

```json
{
  "locations": ["Tokyo Station", "Shibuya", "Harajuku"],
  "mood": "静かな場所で抹茶を飲みたい",
  "currentLocation": {
    "lat": 35.6812,
    "lng": 139.7671
  },
  "preferences": {
    "transportation": "mixed",
    "avoidTolls": false,
    "avoidHighways": false
  }
}
```

#### レスポンス例

```json
{
  "route": [
    {
      "from": {
        "name": "Tokyo Station",
        "lat": 35.6812,
        "lng": 139.7671,
        "address": "1 Chome Marunouchi, Chiyoda City, Tokyo"
      },
      "to": {
        "name": "Shibuya",
        "lat": 35.6580,
        "lng": 139.7016,
        "address": "Shibuya City, Tokyo"
      },
      "distance": 8500,
      "duration": 1800,
      "transportation": "transit",
      "steps": [...],
      "polyline": "..."
    }
  ],
  "totalDuration": 3600,
  "totalDistance": 12000,
  "weather": [...],
  "recommendedSpots": [...]
}
```

## デプロイ

AWS SAM または Serverless Framework を使用してデプロイします。

### AWS SAM の場合

```bash
sam build
sam deploy
```

## 注意事項

- キャッシュとデータベース機能は現在実装されていません
- API キーは環境変数で管理してください
- エラーハンドリングは基本的な実装のみです
