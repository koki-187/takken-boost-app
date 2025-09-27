# 危険物取扱者試験 乙4 合格支援アプリ（開発版）

本プロジェクトは、危険物取扱者 乙種第4類（乙4）の合格率向上を目的とした学習用フロントエンド Web アプリです。完全に静的（HTML/CSS/JS）で動作し、ローカルデータ（LocalStorage）を活用。必要に応じて RESTful Table API に拡張可能です。

## 現在実装済みの主な機能
- 受験日カウントダウン（本試験までの日数表示）
- 学習ストリーク／簡易進捗（到達率）
- 本試験形式の模試（35問・タイマー・即時採点・解説表示）
  - 出題モード：標準 / 弱点補強 / 頻出強化 / 直前想定
  - 本試験配分（固定）：法令 43% / 物化 29% / 性消 28%（35問に自動割付）
  - 長期重複回避：recentIds により直近出題を最大210件保持し除外、枯渇時は自動リセット
  - テーマ偏り抑制（テーマ上限 5、index.html で調整可）＋ フィッシャー–イェーツ シャッフル
- 傾向可視化（カテゴリ/テーマ）
  - 過去4年（2022年を含む。未満なら全体）を自動集計
  - Chart.js による可視化（iOS/軽量時はフォールバックの静的表示）
- フェーズ毎の勉強法、合格の秘訣
- 使い方モーダル（2ページ構成）
- PWA 対応（manifest.json + service worker）、アイコン統一
  - favicon / Apple Touch Icon / manifest のアイコンを images/icon-desktop.png に統一

## 主要ファイルと構成
- index.html
  - Tailwind CDN / Font Awesome / Google Fonts / Chart.js（iOS はフォールバック）
  - window.Otsu4YearSources（年度データ定義）、window.Otsu4TrendWeights（43/29/28）を定義
  - すべての画像アイコン参照を images/icon-desktop.png に統一
- css/style.css
  - モーダル、アニメ、reveal、進捗、iOS向け overscroll・スクロール安定化
- js/utils.js（共通ユーティリティ）
- js/data.js（データ取り込み・変換）
  - convertYearJson / loadYearJson / preloadYears / getAllItems ほか
  - data/otsu4_241_500.json.txt も自動取り込み
  - data/trend_analysis.md があれば比率（法令/物化/性消）を上書き（現在は 43/29/28）
- js/main.js（アプリ本体）
  - init時に年度データを preload → ダッシュボード・模試セットアップ
  - 35問選定、配分最適化、長期重複回避、テーマ偏り抑制、採点・履歴保存
  - 傾向集計と可視化（iOSはフォールバック駆動）
- js/ux.js（モーダル、IntersectionObserver、iOS向けスクロール抑制、ナビUI）
- manifest.json（display: standalone、theme_color など）
- images/
  - icon-desktop.png（最終アプリアイコン）
  - badges/…（レベルバッジ PNG/JPEG 実体）
- data/
  - hazardous_otsu4_2022/2023/2024/2025.json.txt（各60問想定、同梱済み）
  - otsu4_241_500.json.txt（追加問題 241〜）
  - trend_analysis.md（比率 43/29/28 を明記）
  - badges.json / badges_conditions.json / badges-structure.json（称号定義＋獲得条件）

## 画面エントリとURI
- /index.html（メイン画面）
  - セクションID: #countdown, #exam, #trends, #study, #tips, #badges
  - インストールボタン: #installAppBtn（beforeinstallprompt 対応ブラウザで自動表示）

## データ仕様（読み込みの柔軟性）
- 年度 JSON は次のいずれにも対応
  - 配列そのもの、または {items:[...]}、{questions:[...]} 形式
  - 各問: { id?, number|no|index?, q|question|text|title, choices|options|opts|A〜E, a|answer|correct, explain|explanation?, cat?, theme?, type?, weight?, year? }
  - 正解は 'A'〜'E' / 1〜5 / choices中の文字列 → 自動で 0〜4 に正規化
  - カテゴリ未指定時は問題テキストから（法令/物理・化学/性質・消火）を推定

## ローカル保存（LocalStorage）
- examDate, scores, history, recentIds, streak, lastStudyDate

## iOS/UX対策
- IntersectionObserver の監視対象を main 配下に限定して安定化
- html, body の overscroll-behavior、-webkit-overflow-scrolling
- モーダル開時の touchmove preventDefault で背景スクロール抑止
- iOS/軽量モードでは Chart.js をフォールバック（静的説明に置換）

## PWA / アイコン
- favicon / Apple Touch Icon / manifest の参照を images/icon-desktop.png に統一済み
- manifest.json icons: 192, 512 を定義（512 は画質向上のため PNG の用意推奨）
- 旧 app-icon 系は削除済み（混在回避）

## 既知の不足・未実装
- バッジ画像の一部が JPEG 実体で PNG 拡張子のため、厳密環境で読み込み失敗の可能性（回避策として onerror フォールバックを実装、ファイルの拡張子統一は次タスク）
- バッジ自動付与ロジック（基礎版）は実装済み。詳細条件の最終調整は今後対応
- 採点結果のモーダル表示（現在はトーストのみ）は未実装
- チャート注釈/凡例の詳細改善（日本語ツールチップ等）は今後対応
- 大量データ時の初回 preload とチャート描画のパフォーマンス計測・最適化

## 次の推奨ステップ
1. バッジ画像の拡張子統一（.png→.jpg へリネーム、参照先も一括置換）し MIME 不一致を解消
2. 採点結果モーダル（新規バッジ獲得時の詳細カード/共有ボタン）実装
3. チャートの注釈・凡例の改善（日本語ラベル/注釈、ツールチップ整備）
4. 勉強法/秘訣の表現をカード化・手順化して更に分かりやすく
5. 本試験配分やテーマ上限の微調整値の最終確定（window.Otsu4TrendWeights / window.Otsu4ThemeLimit）
6. 実機（iOS/Android/PC）で PWA インストールボタンの挙動確認（iOSはガイド表示）

## プロジェクト情報
- 名称: 危険物取扱者試験 乙4 合格支援アプリ
- 目的: 合格率向上のための学習効率最大化
- 主な技術: HTML5, Tailwind CSS (CDN), Chart.js (CDN), Vanilla JS (ES Modules)
- データ: LocalStorage（開発中）→ 将来的に RESTful Table API で CRUD 拡張可

## 公開URL/エンドポイント
- 公開: 未設定（Publish タブから公開可能）
- PWA: sw.js を登録（現在は透過フェッチ、キャッシュは未実装）
- 将来のデータAPI: tables/{table} 系（RESTful Table API）

## データモデル（案）
- items: { id, q, choices[], a, cat, theme, type, weight, year? }
- attempts: { id, date, items[], answers[], score_total, score_law, score_sci, score_prop }
- user_stats: { id, streak, lastStudyDate, scores{law,sci,prop,trend[]} }

## 変更履歴（抜粋）
- アイコン最終確定：icon-desktop.png に統一（index/manifest/フッター/モーダル）
- 出題配分の固定：window.Otsu4TrendWeights = { law:43, sci:29, prop:28 } を定義（trend_analysis.md も同値）
- 年度データ取込：convertYearJson / preloadYears 実装、2023＋追加プール取り込み確認（320件）
- iOS スクロール最下部の不具合対策：overscroll, touchmove 抑止, IntersectionObserver 限定

## デプロイ
To deploy your website and make it live, please go to the Publish tab where you can publish your project with one click. The Publish tab will handle all deployment processes automatically and provide you with the live website URL.
