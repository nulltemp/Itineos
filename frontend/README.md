# Itineos Frontend

Itineos サービスのフロントエンドアプリケーションです。Next.js (React) + TypeScript で構築されています。

## 機能

- 観光ルート生成フォーム
- 現在地の取得
- ルート結果の表示（移動時間、距離、詳細な経路）
- 天気情報の表示
- AIによるスポット推薦

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/prod
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

## ビルド

静的エクスポートとしてビルドします（Cloudflare Pages用）：

```bash
npm run build
```

ビルド結果は `out/` ディレクトリに出力されます。

## デプロイ

### Cloudflare Pages

1. GitHubリポジトリにプッシュ
2. Cloudflare Pagesでプロジェクトを接続
3. ビルドコマンド: `npm run build`
4. 出力ディレクトリ: `out`

### その他のホスティング

静的ファイル（`out/`ディレクトリ）を任意の静的ホスティングサービスにデプロイできます。

## プロジェクト構成

```
frontend/
├── app/              # Next.js App Router
│   ├── layout.tsx    # ルートレイアウト
│   ├── page.tsx       # メインページ
│   └── globals.css   # グローバルスタイル
├── src/
│   ├── components/   # Reactコンポーネント
│   │   ├── RouteForm.tsx
│   │   └── RouteResult.tsx
│   ├── lib/          # ユーティリティ
│   │   └── api.ts    # API呼び出し
│   └── types/        # TypeScript型定義
│       └── index.ts
└── public/           # 静的ファイル
```

## 技術スタック

- **Next.js 16**: Reactフレームワーク
- **TypeScript**: 型安全性
- **Tailwind CSS**: スタイリング
- **React 19**: UIライブラリ
