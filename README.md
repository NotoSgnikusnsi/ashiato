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