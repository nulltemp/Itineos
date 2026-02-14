# Itineos Backend

Itineos サービスのバックエンド Lambda 関数です。

## 機能

- 観光ルートの自動生成
  -- Google Maps API によるルート計算
  -- Google Maps Weather API による天気情報取得
- Gemini API によるスポット推薦

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

#### ローカル開発用

プロジェクトルートに `.env` ファイルを作成し、以下の環境変数を設定してください：

```bash
GEMINI_API_KEY=your-gemini-api-key-here
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

`.env` ファイルは自動的に `env.json` に変換され、SAM CLI で使用されます。

または、`env.json` ファイルを直接編集することもできます：

```json
{
  "RouteFunction": {
    "GEMINI_API_KEY": "your-gemini-api-key-here",
    "GOOGLE_MAPS_API_KEY": "your-google-maps-api-key-here",
    "NODE_ENV": "development"
  }
}
```

#### Lambda デプロイ時

Lambda 関数に以下の環境変数を設定してください：

- `GOOGLE_MAPS_API_KEY`: Google Maps Platform API キー
- `GEMINI_API_KEY`: Google Gemini API キー

### 3. ビルド

```bash
npm run build
```

TypeScript が `dist/` ディレクトリにコンパイルされます。

## ローカル開発

AWS SAM CLI を使用してローカルでバックエンドを実行できます。

### 前提条件

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) がインストールされていること
- Docker がインストールされ、実行されていること

### ローカルサーバーの起動

```bash
# ビルドとサーバー起動（ポート3001で起動）
npm run sam:start

# デバッグモードで起動（ポート5858でデバッグ可能）
npm run sam:start:debug
```

サーバーは `http://localhost:3001` で起動し、API エンドポイントは `http://localhost:3001/api/route` で利用可能です。

### フロントエンドとの接続

フロントエンドの `.env.local` ファイル（または環境変数）に以下を設定してください：

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 個別のLambda関数のテスト

```bash
npm run sam:invoke
```

### トラブルシューティング

#### Dockerが起動していない場合

SAM CLIはDockerを使用してLambda関数を実行します。Docker Desktopが起動していることを確認してください。

#### ポートが既に使用されている場合

`samconfig.toml` の `port` 設定を変更するか、別のポートを指定してください：

```bash
sam local start-api --port 3002
```

#### 環境変数が読み込まれない場合

`.env` ファイルが正しく設定されているか確認し、`npm run preload-env` を実行して `env.json` が更新されているか確認してください。

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

AWS SAM を使用してデプロイします。

```bash
# ビルド
npm run sam:build

# デプロイ（初回はガイドに従って設定）
sam deploy --guided
```

## 注意事項

- キャッシュとデータベース機能は現在実装されていません
- API キーは環境変数で管理してください（`.env` ファイルは Git にコミットしないでください）
- エラーハンドリングは基本的な実装のみです
