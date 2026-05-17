# 宅建BOOST LP（ランディングページ）構築仕様書

**作成日**: 2026年5月17日
**バージョン**: 1.0（事前仕様書）
**対象**: PDFアップデート資料に基づくランディングページ実装

---

## 0. プロジェクト概要

| 項目 | 内容 |
|------|------|
| **プロジェクト名** | 宅建BOOST LP（Landing Page） |
| **目的** | 新規ユーザー獲得、サービス価値訴求、PWAインストール誘導 |
| **ターゲット** | 宅建試験受験予定者・宅建業従業者 |
| **公開URL** | `https://takken-boost.pages.dev/lp` |
| **インフラ** | Cloudflare Pages（完全無料枠） |
| **公開予定日** | 仕様書承認後 即日デプロイ可能 |

---

## 1. ページ構成（PDF準拠 4セクション）

```
┌────────────────────────────────────────┐
│  Hero Section (Page 1)                 │
│  - キャッチコピー: "AI時代へ。"          │
│  - サブ: AI × PWA × マルチOS対応        │
│  - 大型CTA: "無料で学習を始める"         │
│  - デバイスモックアップ（phone/tablet/PC）│
├────────────────────────────────────────┤
│  Features Section (Page 2)             │
│  - サブヘッダー: "アップデート"          │
│  - 8機能カード (2×4 / 1×8)              │
│  - 4つのベネフィット                    │
├────────────────────────────────────────┤
│  Version Up Section (Page 3)           │
│  - AI軌道ビジュアル                     │
│  - 旧バージョン vs 新バージョン比較表    │
│  - 6つの新機能                          │
├────────────────────────────────────────┤
│  Install Section (Page 4)              │
│  - 3ステップインストール手順             │
│  - 5OS対応グリッド                      │
│  - URLカード（最新版/旧版）              │
│  - 最終CTA                              │
└────────────────────────────────────────┘
```

---

## 2. デザイン仕様

### 2.1 カラーパレット（PDF基調）

| 用途 | カラーコード | 名称 |
|------|------------|------|
| Background Primary | `#0a0e27` | ミッドナイトネイビー |
| Background Secondary | `#1e1b4b` | ディープパープルナイト |
| Background Tertiary | `#312e81` | インディゴ |
| Accent Primary | `#22d3ee` | ネオンシアン |
| Accent Secondary | `#60a5fa` | テックブルー |
| Accent Tertiary | `#a78bfa` | ライトパープル |
| Highlight | `#fde047` | ゴールド |
| Text Primary | `#ffffff` | ホワイト |
| Text Secondary | `#cbd5e1` | ライトグレー |
| Text Muted | `#94a3b8` | スレートグレー |

### 2.2 グラデーション

```css
--lp-bg: radial-gradient(ellipse at top, rgba(59,130,246,.15), transparent 50%),
         radial-gradient(ellipse at bottom right, rgba(124,58,237,.2), transparent 60%),
         linear-gradient(180deg, #0a0e27 0%, #1e1b4b 50%, #0a0e27 100%);
--lp-cta: linear-gradient(135deg, #22d3ee, #60a5fa);
--lp-orbit: linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #1e3a8a 100%);
```

### 2.3 タイポグラフィ（日本語フォント仕様）

| 用途 | フォント | ウェイト | サイズ |
|------|---------|---------|--------|
| ヘッドライン | Noto Sans JP | 900 | 34px (mobile) / 56px (desktop) |
| セクションタイトル | Noto Sans JP | 900 | 26px / 38px |
| 本文 | Noto Sans JP | 400 | 14px / 16px |
| サブテキスト | Noto Sans JP | 500 | 12px / 14px |
| キャプション | Noto Sans JP | 600 | 11px / 12px |
| 英字（BOOST等） | Inter / system-ui | 900 | 強調用 |

**読み込み方式**: Google Fonts CDN
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800;900&display=swap">
```

### 2.4 アニメーション

| 要素 | 効果 | 時間 |
|------|------|------|
| 星空背景 | starsDrift（無限スクロール） | 60s linear |
| AI軌道リング | orbitSpin | 20s linear |
| キューブ光彩 | cubeGlowPulse | 3s ease-in-out |
| Hero fade-in | fadeInUp | 0.8s ease |
| CTA hover | scale + shadow強化 | 0.2s |
| `prefers-reduced-motion` | 全アニメ無効化 | - |

### 2.5 レスポンシブブレイクポイント

| デバイス | 幅 | レイアウト |
|---------|-----|----------|
| Mobile (Small) | <360px | 1カラム、フォント縮小 |
| Mobile | 360-599px | 1カラム、機能カード 2×4 |
| Tablet | 600-1023px | 機能カード 4列、ヒーロー左寄せ |
| Desktop | 1024px+ | 機能カード 4列、最大幅 1200px center |

---

## 3. 機能仕様

### 3.1 インタラクション

| 要素 | 動作 |
|------|------|
| CTA「無料で学習を始める」 | クリック → `/` (アプリホーム) へ遷移、`lp-mode`解除 |
| 「使い方ガイドを見る」 | クリック → `/help` |
| 機能カード | ホバーで上昇+シアン光彩、クリック → 該当機能説明モーダル |
| AI軌道ピル | クリックで該当機能のtooltip表示 |
| OSアイコン | クリックで該当OSのインストール手順モーダル |
| URLカード | クリックでクリップボードコピー + toast |

### 3.2 PWAインストール促進

- `beforeinstallprompt` イベント捕捉
- LP訪問から10秒経過 + スクロール50% 到達でインストールバナー表示
- バナー無視/閉じる→localStorage に dismissed記録

### 3.3 動作計測（プライバシー配慮）

| 計測項目 | 方法 | 注意 |
|---------|------|------|
| ページビュー | Cloudflare Web Analytics（無料） | Cookie不要、個人特定なし |
| CTAクリック率 | 同上 + カスタムイベント | - |
| スクロール深度 | localStorageに保存（送信なし） | プライバシー優先 |
| 滞在時間 | 同上 | - |

---

## 4. SEO仕様

### 4.1 メタタグ

```html
<title>宅建BOOST | AI予測模試付き 宅建士試験PWA学習アプリ（無料）</title>
<meta name="description" content="宅地建物取引士試験対策 702問完全収録。過去5年本試験モデル+令和8年AI予測模試。詳細法令解説で次回正答率UP。完全無料・登録不要・全OS対応。">
<meta name="keywords" content="宅建,宅地建物取引士,試験対策,過去問,模擬試験,AI予測,PWA,無料アプリ,iOS,Android">
<meta name="robots" content="index, follow">
<meta name="author" content="宅建BOOST">
<link rel="canonical" href="https://takken-boost.pages.dev/lp">
```

### 4.2 OpenGraph + Twitter Card

```html
<meta property="og:type" content="website">
<meta property="og:title" content="宅建BOOST - AI時代の宅建試験対策">
<meta property="og:description" content="702問完全収録のPWA学習アプリ。AI予測模試+詳細法令解説で合格力UP。完全無料。">
<meta property="og:image" content="https://takken-boost.pages.dev/icons/icon-1024x1024.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://takken-boost.pages.dev/lp">
<meta property="og:site_name" content="宅建BOOST">
<meta property="og:locale" content="ja_JP">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="宅建BOOST - AI時代の宅建試験対策">
<meta name="twitter:description" content="702問完全収録のPWA学習アプリ。完全無料。">
<meta name="twitter:image" content="https://takken-boost.pages.dev/icons/icon-1024x1024.png">
```

### 4.3 JSON-LD 構造化データ

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MobileApplication",
      "name": "宅建BOOST",
      "operatingSystem": "iOS, Android, Windows, macOS",
      "applicationCategory": "EducationalApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "JPY"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "0"
      }
    },
    {
      "@type": "LearningResource",
      "name": "宅建BOOST 学習プラットフォーム",
      "description": "宅地建物取引士試験対策の702問題集",
      "inLanguage": "ja-JP",
      "isAccessibleForFree": true,
      "learningResourceType": "Practice Quiz",
      "teaches": "宅建業法、民法、借地借家法、区分所有法、都市計画法、建築基準法、不動産税法"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {"@type":"Question","name":"費用はかかりますか？","acceptedAnswer":{"@type":"Answer","text":"完全無料です。広告も無くログイン不要でお使いいただけます。"}},
        {"@type":"Question","name":"オフラインで使えますか？","acceptedAnswer":{"@type":"Answer","text":"PWAインストール後は一度開いた問題をオフラインで閲覧可能です。"}}
      ]
    }
  ]
}
```

### 4.4 パフォーマンス目標（Lighthouse）

| 指標 | 目標 |
|------|------|
| Performance | 90+ |
| Accessibility | 95+ |
| Best Practices | 95+ |
| SEO | 100 |
| PWA | 100 |
| LCP（最大コンテンツ描画） | <2.5s |
| CLS（レイアウトシフト） | <0.1 |
| FID（初回入力遅延） | <100ms |

### 4.5 アクセシビリティ

- ARIA labels: 全インタラクティブ要素
- セマンティックHTML: `<main>`, `<section>`, `<nav>`, `<article>`
- カラーコントラスト: WCAG AA 4.5:1以上
- キーボード操作: Tab navigation完全対応
- `prefers-reduced-motion` 完全対応
- スクリーンリーダー対応

---

## 5. 料金・運用コスト

### 5.1 ユーザー向け料金

| 項目 | 内容 |
|------|------|
| **アプリ利用料** | **完全無料**（登録不要） |
| **広告表示** | **なし** |
| **アプリ内課金** | **なし** |
| **データ通信費** | ユーザー負担（一般的なWebアプリと同等） |

### 5.2 開発・運用コスト（提供側）

| 項目 | サービス | 料金 | 備考 |
|------|---------|------|------|
| **ホスティング** | Cloudflare Pages | 無料 | 500ビルド/月、無制限リクエスト |
| **DB** | Cloudflare D1 | 無料 | 5GB / 5M reads/日 / 100k writes/日 |
| **CDN** | Cloudflare（自動） | 無料 | グローバル配信 |
| **DNS** | `*.pages.dev` サブドメイン | 無料 | 独自ドメイン不要 |
| **SSL証明書** | Cloudflare（自動） | 無料 | Let's Encrypt |
| **CDN（外部）** | jsdelivr | 無料 | Three.js / Chart.js |
| **解析** | Cloudflare Web Analytics | 無料 | プライバシー配慮 |
| **合計月額** | | **¥0** | |

### 5.3 入金方法

| 用途 | 入金有無 |
|------|---------|
| **ユーザーからの入金** | **なし**（完全無料サービスのため） |
| **提供側の支払い** | **なし**（全Cloudflare無料枠内） |

**将来的な収益化案**（実装予定なし、参考）:
- ❌ 広告表示（ユーザー体験悪化のため非推奨）
- ❌ 月額課金（無料方針継続）
- ⚠️ 寄付ボタン（任意・Buy Me a Coffee等）— 採用時別途検討
- ⚠️ 関連書籍アフィリエイト — 採用時別途検討

---

## 6. 日本語フォント詳細仕様

### 6.1 フォントスタック

```css
font-family:
  'Noto Sans JP',      /* メイン日本語 */
  'Hiragino Sans',     /* macOS/iOS フォールバック */
  'Hiragino Kaku Gothic ProN',  /* macOS 旧 */
  'BIZ UDPGothic',     /* Windows モダン */
  'Meiryo',            /* Windows フォールバック */
  'Yu Gothic',         /* Windows 10+ */
  sans-serif;
```

### 6.2 字体使い分け

| 用途 | 字体 | 理由 |
|------|------|------|
| ヘッドライン「AI時代」 | Noto Sans JP 900 | 強い印象 |
| 本文 | Noto Sans JP 400-500 | 可読性優先 |
| 強調（**太字**） | Noto Sans JP 700 | コントラスト |
| 数字（**702問**等） | Inter / system-ui Bold | 西洋数字の視認性 |
| 英字（**BOOST**） | Inter Black | ブランドアクセント |

### 6.3 行間・字間

| 用途 | line-height | letter-spacing |
|------|------------|---------------|
| ヘッドライン | 1.25 | -0.5px (タイト) |
| セクションタイトル | 1.3 | -0.3px |
| 本文 | 1.7 | 0 (デフォルト) |
| キャプション | 1.5 | 0.5px (ゆとり) |
| 英字大文字 | 1.2 | 1-3px |

### 6.4 フォントウェイト

ウェイト一覧（必要分のみロード）:
- 400 (Regular): 本文
- 500 (Medium): 強調なし強調
- 600 (SemiBold): キャプション
- 700 (Bold): 強調・小タイトル
- 800 (ExtraBold): セクションタイトル
- 900 (Black): ヘッドライン

---

## 7. 技術仕様

### 7.1 アーキテクチャ

```
Cloudflare Pages
  └─ Hono v4.9.9 (TypeScript)
      ├─ / (アプリホーム)
      ├─ /lp (新LP)
      ├─ /help (使い方ガイド)
      └─ /api/* (D1 backed APIs)
```

### 7.2 ファイル構成案

```
src/
  ├─ index-v9.tsx  (既存メインアプリ - 編集不要)
  └─ lp.tsx        (新規・任意・別ルート化する場合)

public/
  ├─ manifest.json
  ├─ icons/        (LP用OGイメージ含む)
  └─ favicon.ico
```

実装方針: 既存 `renderLP()` 関数を本仕様に基づき全面刷新（別ファイル化はしない）。

### 7.3 ビルド & デプロイ

- ビルドコマンド: `npm run build`
- デプロイ: `npx wrangler pages deploy dist --project-name takken-boost --branch master`
- 自動デプロイ: GitHub master push → Cloudflare auto-build

### 7.4 セキュリティ

- CSP: 既存ポリシー維持（CDN許可済み）
- SRI: 外部スクリプトに sha384 integrity
- HSTS: 有効
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin

---

## 8. ワイヤーフレーム（イメージ図）

### 8.1 Mobile (375×667)

```
┌─────────────────────────┐
│ 🚀 宅建BOOST    [Tt][?][🌙][⬇]│ ← Header
├─────────────────────────┤
│                         │
│  [AI × PWA × マルチOS対応]│
│                         │
│   宅建学習を、          │
│   "AI時代"へ。          │ ← Hero (cyan glow)
│                         │
│   702問完全収録...       │
│                         │
│   [📚702][🤖AI][🔊TTS][📱PWA]│ ← Badge pills
│                         │
│   ╔═══════════════╗     │
│   ║ 無料で学習を始める  ║   │ ← CTA (cyan→blue)
│   ╚═══════════════╝     │
│                         │
│   ╭─📱─╮ ╭─📱─╮ ╭─💻─╮    │ ← Device mockups
│   │72%│ │ダ │ │分析│      │
│   ╰───╯ ╰───╯ ╰───╯       │
│                         │
├─────────────────────────┤
│  "従来の宅建学習"を       │
│  アップデート。          │ ← Section title
│                         │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐    │
│  │📚│ │🤖│ │📊│ │📇│    │ ← 8 features (2x4)
│  └──┘ └──┘ └──┘ └──┘    │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐    │
│  │🎯│ │📝│ │🔖│ │📱│    │
│  └──┘ └──┘ └──┘ └──┘    │
├─────────────────────────┤
│  "覚える"から            │
│  "最適化して受かる"へ。   │
│                         │
│       ┌────┐            │
│   苦手 │ AI │ 予測       │ ← AI orbit
│       └────┘            │
│       効率  レコメンド    │
│                         │
│  ┌───────────────────┐  │
│  │ 旧版 ▶ 新版         │  │ ← Compare table
│  │ 旧版 ▶ 新版         │  │
│  └───────────────────┘  │
├─────────────────────────┤
│  たった3ステップで       │
│  すぐにアプリ化。        │
│                         │
│  ① ブラウザでアクセス    │
│  ② ホーム画面に追加      │
│  ③ アプリ化完了！        │
│                         │
│  [🍎][🤖][📱][🖥️][💻]    │ ← 5 OS
│                         │
│  ┌──────┐ ┌──────┐      │
│  │最新版 │ │旧版   │     │ ← URL cards
│  └──────┘ └──────┘      │
│                         │
│  ╔═══════════════╗      │
│  ║  最短合格へ。  ║      │ ← Final CTA
│  ╚═══════════════╝      │
└─────────────────────────┘
```

### 8.2 Desktop (1280×720)

```
┌──────────────────────────────────────────────────────────────┐
│ 🚀 宅建BOOST                            [Tt][?][🌙][⬇]      │
├──────────────────────────────────────────────────────────────┤
│  [AI × PWA × マルチOS対応]                                    │
│  宅建学習を、              ╭─📱─╮╭─📱─╮╭─💻─╮                │
│  "AI時代"へ。              │72%││ダ ││分析│                  │
│  702問完全収録...           ╰───╯╰───╯╰───╯                  │
│  [📚702][🤖AI][🔊][📱]                                       │
│  ╔════════════════╗                                          │
│  ║ 無料で学習を始める  ║                                       │
│  ╚════════════════╝                                          │
├──────────────────────────────────────────────────────────────┤
│  "従来の宅建学習"を アップデート。                             │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                   │
│  │📚│ │🤖│ │📊│ │📇│ │🎯│ │📝│ │🔖│ │📱│ ← 1x8 grid         │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘                   │
├──────────────────────────────────────────────────────────────┤
│  "覚える"から "最適化して受かる"へ。                           │
│                                                              │
│       苦手 ──╮  ╭── 予測                                     │
│              ╲ ╱                                             │
│              ┌─AI─┐                                          │
│              ╱ ╲                                             │
│       効率 ──╯  ╰── レコメンド                                │
│                                                              │
│  旧版 ▶ 新版 (5行比較表)                                      │
├──────────────────────────────────────────────────────────────┤
│  たった3ステップで、 すぐにアプリ化。                          │
│  ┌──Step1──┐ ┌──Step2──┐ ┌──Step3──┐                       │
│                                                              │
│  [🍎][🤖][📱][🖥️][💻]   ┌URLカード┐ ┌URLカード┐              │
│                                                              │
│  ╔═══════════════════════════════════╗                       │
│  ║   最短合格へ。 [無料で体験]         ║                       │
│  ╚═══════════════════════════════════╝                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. 実装スケジュール

| Phase | 内容 | 所要時間 | 状態 |
|-------|------|---------|------|
| 1 | 仕様書承認 | - | **承認待ち（本書）** |
| 2 | LP CSS刷新（PDF準拠） | 30分 | 既存ベースあり |
| 3 | LP HTML刷新（8機能/比較/3step） | 30分 | 既存ベースあり |
| 4 | SEOメタ・JSON-LD完備 | 15分 | 既存改善 |
| 5 | フォント最適化（Noto Sans JP複数weight） | 10分 | 新規 |
| 6 | アクセシビリティ強化（ARIA） | 15分 | 部分実装済 |
| 7 | ビルド・デプロイ | 5分 | 自動化済 |
| 8 | Lighthouse検証・修正 | 30分 | 新規 |
| **合計** | | **約2.5時間** | |

---

## 10. 確認事項（ユーザー判断）

仕様書承認前に以下をご確認ください:

1. **配色**: ダークネイビー×ネオンシアン主体で良いか？（紫主体にする選択肢もあり）
2. **CTA文言**: 「無料で学習を始める」「最短合格へ。」で良いか？
3. **デバイスモックアップ**: CSS実装（軽量）でいいか？実機写真風が必要か？
4. **計測ツール**: Cloudflare Web Analytics（無料・プライバシー優先）で良いか？
5. **将来の収益化**: 寄付ボタン/アフィリエイト等の導入余地を残すか？
6. **独自ドメイン**: `takken-boost.pages.dev` のままで良いか？（独自ドメインは年間費用発生）
7. **言語**: 日本語のみで良いか？（英語等の多言語対応は要追加実装）

---

**仕様書 終わり**

ご確認の上、ご承認いただければ実装に移ります。修正・追加要望ありましたらお知らせください。
