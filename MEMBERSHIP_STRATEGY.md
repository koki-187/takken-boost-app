# 宅建BOOST 会員制度 × My Agent Series 連動戦略仕様書

**作成日**: 2026年5月17日
**目的**: 宅建BOOST利用者を My Agent Series へ誘導するファネル設計

---

## 0. 戦略概要

```
┌────────────────────────────────────────────┐
│  宅建BOOST (B2C 無料アプリ)                 │
│  ・受験生・宅建業従業者の集客プール          │
│  ・会員登録で学習データ同期 + 特典付与       │
│       │                                    │
│       ▼ 会員ID紐付け                       │
│  ┌──────────────────────────────────────┐  │
│  │ My Agent Series (B2B SaaS)            │  │
│  │ ・宅建合格 → 不動産業従事 → エージェント│  │
│  │ ・会員専用クーポン: 20-30% OFF        │  │
│  │ ・早期導入特典: 初期費用免除          │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘

戦略軸: 「無料で学んだ人が、プロになる時にも選ばれる」
```

### 想定ファネル

| 段階 | ユーザー像 | 行動 | 数 (年間想定) |
|------|----------|------|--------------|
| 認知 | 受験生 | LP訪問・SNS流入 | 50,000人 |
| 体験 | 受験生 | アプリ利用 (匿名) | 10,000人 |
| **会員登録** | 受験生・既存従業者 | **アカウント作成** | **3,000人** |
| 合格 | 元受験生 | 試験合格 | 600人 (15%-17%) |
| 業務開始 | 新人エージェント | 不動産業就職・独立 | 200人 |
| **My Agent変換** | エージェント | **会員クーポン使用** | **30-50人** |
| 継続 | 法人化 | エンタープライズ移行 | 5-10社 |

**収益試算**: 30人 × Pro ¥39,800/月 = **¥1,194,000/月** (会員クーポン20% OFF適用後)

---

## 1. 会員制度設計

### 1.1 会員プラン（宅建BOOST側は全プラン無料）

| プラン | 月額 | 特典 |
|--------|------|------|
| **ゲスト** (未登録) | ¥0 | 全機能利用可能・データはlocalStorage限定 |
| **無料会員** (登録) | ¥0 | + クラウド同期・複数端末利用・**My Agent 20% OFFクーポン** |
| **プレミアム会員** (将来) | ¥980/月 | + AI個別指導・優先サポート・**My Agent 30% OFFクーポン** |
| **合格者会員** (試験合格後) | ¥0 | + **My Agent 初期費用免除 + 3ヶ月無料** |

### 1.2 会員登録項目（最小限）

```yaml
必須:
  - メールアドレス
  - パスワード (8文字以上、bcryptハッシュ化)
  - ニックネーム

任意:
  - 試験予定年度 (令和8年/9年など)
  - 受験回数
  - 現職: [学生/会社員/宅建業従業者/その他]
  - 都道府県
  - 紹介コード (アフィリエイト用)

自動取得:
  - 登録日時
  - 最終ログイン
  - 端末数
  - 学習統計サマリー
```

### 1.3 認証方式

**推奨**: メール+パスワード + Magic Link（パスワードレス）
- メール認証必須（不正登録防止）
- パスワード忘れ→ワンタイムリンク
- OAuth (Google/Apple) は将来追加

---

## 2. My Agent Series 連動ベネフィット

### 2.1 段階別クーポン

| トリガー | クーポン内容 | コード命名規則 |
|---------|------------|---------------|
| 会員登録 | **20% OFF 3ヶ月** | `BOOST-WELCOME-20` |
| 学習100問達成 | **+5% (合計25%)** | `BOOST-100Q-25` |
| 模擬試験5回完了 | **+5% (合計30%)** | `BOOST-MOCK-30` |
| 試験合格報告 | **初期費用免除 + 3ヶ月無料** | `BOOST-PASS-FREE` |
| 紹介3名以上 | **永年20% OFF** | `BOOST-AMB-20` |

### 2.2 ユーザーフロー

```
受験生 (匿名) → 宅建BOOST利用
        ↓
[アカウント作成バナー: "クラウド保存+特典"]
        ↓
会員登録 → メール認証 → ログイン
        ↓
[ホームに表示] "🎁 My Agent Series 会員特典"
        ↓
クーポンコード自動生成 → コピー
        ↓
[ボタン] "My Agent Seriesで使う" → 外部リンク
        ↓
My Agent Series LP → クーポン入力欄に貼付
        ↓
20% OFF 自動適用 → 契約
        ↓
宅建BOOST側にWebhook通知 → アンバサダー特典付与
```

### 2.3 My Agent Series側で必要な対応

- クーポンコード受付システム（Stripe Promo Code等）
- 宅建BOOSTからのリファラル追跡（UTMパラメータ）
- 双方向Webhook（契約成立を宅建BOOSTに通知）

---

## 3. 営業導線（CTA配置）

### 3.1 宅建BOOST内の表示箇所

| 箇所 | 訴求内容 | 表示タイミング |
|------|---------|---------------|
| **ホーム下部** | 「合格後はこちらで活躍」バナー | 全員 |
| **進捗ページ** | 「将来の不動産業務を効率化」 | 学習100問以上 |
| **試験結果画面** | 合格者向け「次のステップ」 | スコア≥72% |
| **オンボーディング** | ステップ5に「合格後特典」 | 初回起動時 |
| **プロフィール** | 会員特典一覧 | 会員のみ |
| **メール通知** | 月1ニュースレター | 会員のみ |

### 3.2 訴求コピー例

**ホームバナー**:
> 🎯 **合格後の不動産業務を加速**
> AI業務OS「My Agent Series」を会員特典 **20% OFF** でご利用可能
> [詳しく見る]

**試験合格画面**:
> 🏆 合格おめでとうございます！
> エージェントとして活躍するなら、My Agent Seriesが業務時間を1/3に。
> 宅建BOOST会員特典: **初期費用免除 + 3ヶ月無料**
> [特典を受け取る]

---

## 4. 技術実装仕様

### 4.1 アーキテクチャ

```
[宅建BOOST PWA]
       ↓
[Cloudflare Pages + Workers]
       ↓
[Cloudflare D1] users / sessions / coupons
[Cloudflare KV] session tokens
[Resend無料枠] 認証メール送信
       ↓
[My Agent Series API] クーポン検証・契約Webhook
```

### 4.2 D1 スキーマ追加

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname TEXT NOT NULL,
  exam_year INTEGER,
  profession TEXT,
  prefecture TEXT,
  referral_code TEXT,
  email_verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  passed_exam_at DATETIME
);

CREATE TABLE study_data (
  user_id INTEGER NOT NULL,
  data_type TEXT NOT NULL,  -- 'history', 'wrong', 'exam', 'bookmark'
  data TEXT NOT NULL,        -- JSON
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, data_type),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,        -- 'welcome20', 'pass_free', etc.
  expires_at DATETIME,
  used_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_coupons_user ON coupons(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

### 4.3 API エンドポイント

| Method | Path | 機能 |
|--------|------|------|
| POST | `/api/auth/register` | 会員登録 |
| POST | `/api/auth/verify` | メール認証確認 |
| POST | `/api/auth/login` | ログイン |
| POST | `/api/auth/logout` | ログアウト |
| POST | `/api/auth/reset` | パスワードリセット |
| GET  | `/api/user/me` | 自分のプロフィール |
| PUT  | `/api/user/me` | プロフィール更新 |
| POST | `/api/sync/upload` | localStorage→D1 同期 |
| GET  | `/api/sync/download` | D1→localStorage 復元 |
| GET  | `/api/coupons` | クーポン一覧 |
| POST | `/api/coupons/generate` | 新クーポン生成 |
| POST | `/api/coupons/use` | クーポン使用報告 |

### 4.4 セキュリティ

- パスワードハッシュ: bcrypt (cost 10)
- セッショントークン: crypto.randomUUID() + HMAC
- HTTPS強制
- Rate limiting: 5 attempts/15min for /login
- CSRF token for state-changing operations
- メール認証必須（不正登録防止）

---

## 5. 法務・コンプライアンス

### 5.1 個人情報保護法（PII）

| 項目 | 対応 |
|------|------|
| 利用目的の明示 | プライバシーポリシーに明記 |
| 第三者提供 | **My Agent Seriesへの提供は事前同意制** |
| 削除権 | アカウント削除機能必須 |
| アクセス権 | プロフィール閲覧・エクスポート機能 |
| 保管期間 | 最終ログインから2年で自動削除 |

### 5.2 利用規約への追記

```text
第◯条 会員特典
1. 当社は会員に対し、提携サービス「My Agent Series」の
   割引クーポンを提供することがあります。
2. クーポンの利用条件は提携先の規約に従います。
3. 当社は会員の同意なく個人情報を第三者へ提供しません。

第◯条 リファラル
1. 当社は会員のMy Agent Series契約状況を
   提携先APIから取得することがあります（同意取得済みの場合のみ）。
```

### 5.3 特商法・プライバシーポリシー

- 特商法: My Agent Series側で記載済み前提
- プライバシーポリシー: 宅建BOOST側で **第三者提携先の明示** が必要

---

## 6. ロードマップ（段階的実装）

### Phase 1: 会員基盤（2週間）
- [ ] D1スキーマ作成・マイグレーション
- [ ] 認証API実装（register/login/logout/verify）
- [ ] メール認証（Resend無料枠）
- [ ] フロント UI: ログイン/登録モーダル
- [ ] プロフィールページ
- [ ] localStorage→D1 自動同期

### Phase 2: ベネフィット（1週間）
- [ ] クーポン生成ロジック
- [ ] クーポン一覧UI
- [ ] My Agent Series 訴求バナー配置
- [ ] 試験合格報告フロー

### Phase 3: 営業導線（1週間）
- [ ] UTM追跡パラメータ
- [ ] My Agent Series 連動API
- [ ] アンバサダー紹介プログラム
- [ ] メール通知（月1ニュースレター）

### Phase 4: 分析・最適化（継続）
- [ ] Cloudflare Web Analytics
- [ ] コンバージョン率測定
- [ ] A/Bテスト

---

## 7. 運用コスト見積もり

| サービス | 月額 | 備考 |
|---------|------|------|
| Cloudflare Pages | ¥0 | 無料枠 |
| Cloudflare D1 | ¥0 | 5GB / 5M reads/日 |
| Cloudflare Workers | ¥0 (無料枠超過時 ~¥750) | 100k req/日まで無料 |
| Resend (メール) | ¥0 | 100通/日 無料 |
| **会員1,000人運用試算** | **¥0** | 無料枠内で完結 |
| **会員10,000人** | **~¥750** | Workers Paid Plan |

---

## 8. 想定リターン

### 8.1 1年目想定
- 会員登録: 3,000人
- My Agent Series 紹介クリック: 600人 (20%)
- 契約変換: 30-50人 (5-8%)
- **月次収益**: ¥1,194,000 (30人 × ¥39,800)
- **年間収益**: ¥14,328,000

### 8.2 紹介料モデル（My Agent Series側との契約）
| パターン | 報酬 |
|----------|------|
| 初年度紹介料 | 契約額の **30%** (¥143,280/件) |
| 継続紹介料 | 契約継続期間 **10%** (¥47,760/件・年) |
| アンバサダー（紹介3件以上） | **+10%加算** |

---

## 9. 確認事項（ユーザー判断）

1. **会員登録の必須化**: 任意 / 一部機能制限あり
2. **メール送信サービス**: Resend (無料100/日) / Cloudflare Email (β版・無料)
3. **OAuth対応**: 初期はメールのみ / Google/Apple即時対応
4. **クーポン割引率**: 提案20-30%、確定値
5. **試験合格報告**: 自己申告 / 証明書アップロード
6. **My Agent Series側のAPI**: 既に存在するか / 共同開発が必要か
7. **紹介料契約**: 別途My Agent Series運営との合意要

---

## 10. 推奨次アクション

1. **本仕様書のレビュー・承認** (1-2日)
2. **My Agent Series 側との合意形成** (1週間)
   - 紹介料率
   - クーポン受付システム
   - API/Webhook設計
3. **法務確認** (1週間)
   - プライバシーポリシー改訂
   - 利用規約追記
4. **Phase 1 実装開始** (2週間)

---

**仕様書終わり**

ご確認の上、修正・追加要望・実装着手のご指示をお願いします。
本仕様で進める場合、Phase 1から段階的に実装可能です。
