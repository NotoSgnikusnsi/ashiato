# あしあと - 旅の記録アプリ

**目的**: 旅の記録を簡単に足跡として残せるようにするアプリ  
**ターゲット**: いろいろな場所に訪れ、それを簡単に記録として残し振り返りたい人

## 主な機能
- **ボタンを押す -> 写真を撮る** の2ステップで、現在位置の座標と撮影した写真を記録に残せる
- 記録されたデータは地図上で足跡としてアイコン表示され、後で振り返ることができる
- 記録に対して後からタイトルを追加できる

## 使用技術

- **ランタイム**: Node.js
- **フロントエンドフレームワーク**: Vite (React + TypeScript)
- **データベース**: IndexedDB
- **写真撮影機能**: MediaDevices API
- **位置情報**: Geolocation API
- **UI/UXフレームワーク**: Chakra UI
- **デプロイ**: Deno Deploy

## デプロイ
[Deno Deploy](https://noto-ashiato.deno.dev/)

## 実装ステップ

### 1. 写真撮影 + 位置情報取得 + IndexedDB保存機能

1. **写真撮影機能の実装**:
   - [x] `capture="environment"` を使用してカメラにアクセス
   - [x] 撮影した画像データ（Blob/Base64形式）を取得
   - [x] プレビューの表示

2. **位置情報の取得**:
   - [x] `Geolocation API`を使用してユーザーの現在位置（緯度・経度）を取得
   - [x]ユーザーに位置情報取得の許可を求め、エラーハンドリングを実装

3. **IndexedDBへのデータ保存**:
   - IndexedDBに保存するためのデータベースをセットアップ
   - 画像データと位置情報を保存するスキーマを設計
   - 保存が成功した際、ユーザーに通知を表示

4. **保存データの取得と表示**:
   - IndexedDBから保存したデータを読み込み、簡単なUIで確認できるようにする
