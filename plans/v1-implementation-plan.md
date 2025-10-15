# 作業計画書 — Webスライドショーアプリ v1.0

_作成日: 2025-10-14_
_最終更新: 2025-10-15_
_担当: Claude Code_
_ステータス: Phase 5完了 / UI改善・自動化実装中_

---

## 🎯 進捗サマリー（2025-10-15 更新）

| Phase | 状態 | 完了日 | メモ |
|-------|------|--------|------|
| Phase 1 | ✅ 完了 | 2025-10-14 | プロジェクト基盤構築 |
| Phase 2 | ✅ 完了 | 2025-10-14 | スライドショーエンジン実装 |
| Phase 3 | ✅ 完了 | 2025-10-15 | オーバーレイ（時計・天気）実装 |
| Phase 4 | ⚠️ スキップ | - | Phase 2で先行実装済み |
| Phase 5 | ✅ 完了 | 2025-10-15 | フルスクリーン・画像表示モード追加 |
| 追加実装 | ✅ 完了 | 2025-10-15 | オーバーレイUI改善・HEIC変換・自動化 |
| Phase 6-10 | ⬜ 未着手 | - | - |

### 実装済み機能
- ✅ 494枚の画像をスライドショー再生
- ✅ シャッフル再生
- ✅ フェード遷移
- ✅ キーボード/タッチ/マウス操作（←→ Space F）
- ✅ コントロールバー（自動非表示）
- ✅ 時計・日付表示（右下、改善されたフォント・サイズ）
- ✅ 天気表示（OpenWeatherMap API連携）
- ✅ フルスクリーンモード（Fキー・ボタン）
- ✅ 画像表示モード切り替え（contain / cover）

### UI/UX改善
- ✅ オーバーレイ背景削除（黒い枠なし）
- ✅ フォント改善（SF Pro Display、セミボールド、1.5倍サイズ）
- ✅ 透明度統一（rgba 0.7）

### 自動化ツール
- ✅ HEIC→WebP変換スクリプト（scripts/convert_heic_to_webp.py）
- ✅ GitHub Actionsによるimages.json自動更新

### 次の実装予定
- ⬜ アルバム選択・設定モーダル
- ⬜ 縦長画像ペアリング
- ⬜ 最終テスト・デプロイ

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [目標と成果物](#目標と成果物)
3. [技術スタック](#技術スタック)
4. [実装フェーズ](#実装フェーズ)
5. [タスク管理](#タスク管理)
6. [リスクと対策](#リスクと対策)
7. [テスト計画](#テスト計画)
8. [完了条件](#完了条件)

---

## プロジェクト概要

### 目的
GitHub Pages上で動作する静的Webスライドショーアプリを構築し、TCL Google TV、iPad、iPhone、PCで高画質画像を快適に表示する。

### 主要機能
- 複数アルバム選択・シャッフル再生
- 時計・日付・天気のオーバーレイ表示
- 縦長画像の2枚並べ表示
- デバイス別操作対応（リモコン/タッチ/マウス）
- 設定の永続化（localStorage）

### 参照ドキュメント
- `/docs/web-slideshow_requirements.md` - 要件定義書（英語）
- `/docs/ui-design.md` - UI設計書（日本語）

---

## 目標と成果物

### v1.0の成果物

| # | 成果物 | 説明 |
|---|--------|------|
| 1 | `index.html` | アプリのメインHTML |
| 2 | `style.css` | 全体のスタイルシート |
| 3 | `app.js` | スライドショーエンジン + UI制御 |
| 4 | `config.json` | 設定ファイル（アルバム定義・デフォルト値） |
| 5 | `albums/` | 画像格納ディレクトリ（サンプル含む） |
| 6 | `data/images.json` | 画像リスト（手動管理版） |
| 7 | `.github/workflows/generate-manifest.yml` | GitHub Actions（画像リスト自動生成） |
| 8 | `README.md` | 使い方ガイド |

### 非機能要件
- 初期ロード時間: 3秒以内（通常回線）
- TVでの操作レスポンス: 即座（200ms以内）
- メモリ使用量: 安定動作（500枚以上の画像でもリーク無し）

---

## 技術スタック

### フロントエンド
- **HTML5**: セマンティックマークアップ
- **CSS3**: Flexbox/Grid、アニメーション、メディアクエリ
- **Vanilla JavaScript (ES6+)**: フレームワーク不使用
  - `fetch` API: 設定・画像リスト取得
  - `localStorage` API: 設定永続化
  - DOM API: UI制御

### 外部API
- **OpenWeatherMap API (v3)**: 天気情報取得
  - 無料プラン:1日1000回
  - 更新間隔: 1時間

### デプロイ
- **GitHub Pages**: 静的ホスティング
- **GitHub Actions**: 画像マニフェスト自動生成（オプション）

### 開発ツール
- ブラウザ開発者ツール（Chrome DevTools）
- Git / GitHub
- テキストエディタ（Claude Code）

---

## 実装フェーズ

## Phase 1: プロジェクト基盤構築 🏗️

### 目的
プロジェクトの基本構造を構築し、静的ファイルをGitHub Pagesで配信できる状態にする。

### タスク

#### 1.1 ディレクトリ構造の作成
```
project_root/
├── index.html
├── style.css
├── app.js
├── config.json
├── albums/                          # 既存のアルバム（合計494枚）
│   ├── Nohn/                        # 268枚
│   ├── ぽんちょねこ/                 # 74枚
│   ├── nekonoe 日常には猫がいる/     # 52枚
│   ├── nekonoe 猫永遠幻想/           # 43枚
│   ├── 畏怖の獣絵/                   # 43枚
│   └── 切り絵latest/                 # 14枚
└── data/
    └── images.json
```

**実装内容:**
- ディレクトリ構造確認（`albums/`は既存）
- `.gitignore` 作成（不要ファイル除外用）

#### 1.2 `config.json` の作成
```json
{
  "defaults": {
    "albums": ["nohn", "poncho-neko"],
    "durationSec": 60,
    "shuffle": true,
    "clock": true,
    "date": true,
    "weather": true,
    "portraitPairing": true
  },
  "weather": {
    "provider": "openweathermap",
    "apiKey": "",
    "city": "Tokyo",
    "units": "metric",
    "refreshSec": 3600
  },
  "albums": [
    {"id":"nohn", "label":"Nohn", "path":"albums/Nohn/"},
    {"id":"poncho-neko", "label":"ぽんちょねこ", "path":"albums/ぽんちょねこ/"},
    {"id":"nekonoe-daily", "label":"nekonoe 日常には猫がいる", "path":"albums/nekonoe 日常には猫がいる/"},
    {"id":"nekonoe-fantasy", "label":"nekonoe 猫永遠幻想", "path":"albums/nekonoe 猫永遠幻想/"},
    {"id":"beast-art", "label":"畏怖の獣絵", "path":"albums/畏怖の獣絵/"},
    {"id":"paper-cut", "label":"切り絵latest", "path":"albums/切り絵latest/"}
  ]
}
```

#### 1.3 `data/images.json` の自動生成
**注：** 494枚の画像があるため、手動作成ではなくPythonスクリプトで自動生成します。

Phase 1では簡易版スクリプトを作成し、Phase 8でGitHub Actions化します。

#### 1.4 基本HTMLの作成 (`index.html`)
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Webスライドショー</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- メインコンテナ -->
  <div id="app">
    <!-- 初期設定画面 -->
    <div id="setup-screen" class="screen"></div>

    <!-- スライドショー画面 -->
    <div id="slideshow-screen" class="screen hidden">
      <!-- 画像表示エリア -->
      <div id="image-container"></div>

      <!-- オーバーレイ -->
      <div id="overlay"></div>

      <!-- コントロールバー -->
      <div id="controls" class="hidden"></div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

#### 1.5 基本CSSの作成 (`style.css`)
- リセットCSS
- 基本レイアウト（全画面、黒背景）
- フォント設定

**完了条件:**
- [ ] ディレクトリ構造確認完了（既存アルバム6個、494枚）
- [ ] `config.json` 作成完了（実際のアルバム名を反映）
- [ ] 画像マニフェスト生成スクリプト作成完了
- [ ] `data/images.json` 自動生成完了
- [ ] 基本HTML作成完了
- [ ] 基本CSS作成完了
- [ ] ローカルで `index.html` を開いて表示確認

---

## Phase 2: 初期設定画面の実装 🎨

### 目的
初回アクセス時にアルバム選択できる設定画面を実装。

### タスク

#### 2.1 設定画面UIの実装 (HTML/CSS)
- アルバム選択チェックボックス
- 表示時間スライダー
- シャッフルトグル
- 「スライドショー開始」ボタン

#### 2.2 設定ロジックの実装 (JavaScript)
```javascript
// app.js の主要関数
function loadConfig() {
  // config.json 読み込み
}

function loadSettings() {
  // localStorage から設定読み込み
  // 無ければ config.json のデフォルトを使用
}

function saveSettings(settings) {
  // localStorage に保存
}

function showSetupScreen() {
  // 初期設定画面を表示
}

function startSlideshow() {
  // 設定画面を非表示
  // スライドショー画面を表示
}
```

#### 2.3 初回 vs 2回目以降の分岐
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const config = await loadConfig();
  const settings = loadSettings();

  if (!settings || !settings.initialized) {
    // 初回アクセス → 設定画面
    showSetupScreen(config);
  } else {
    // 2回目以降 → 直接スライドショー開始
    startSlideshow(settings);
  }
});
```

#### 2.4 レスポンシブ対応
- TV: 大きめボタン、リモコンフォーカス
- タブレット/スマホ: タッチ対応

**完了条件:**
- [ ] 設定画面UI実装完了
- [ ] アルバム選択機能動作確認
- [ ] localStorage保存・読み込み動作確認
- [ ] 初回/2回目以降の分岐動作確認
- [ ] TV・タブレット・PCで表示確認

---

## Phase 3: スライドショーエンジンの実装 🎬

### 目的
画像を順次またはランダムに表示し、フェード遷移を実装。

### タスク

#### 3.1 画像リスト取得
```javascript
async function loadImageList() {
  // data/images.json を fetch
  // 選択されたアルバムの画像URLリストを生成
  return imageUrls;
}
```

#### 3.2 シャッフル機能
```javascript
function shuffleArray(array) {
  // Fisher-Yates シャッフル
}
```

#### 3.3 画像表示とフェード遷移
```javascript
class SlideshowEngine {
  constructor(imageUrls, settings) {
    this.images = imageUrls;
    this.currentIndex = 0;
    this.settings = settings;
    this.timer = null;
    this.isPaused = false;
  }

  async preloadImage(url) {
    // 次の画像をプリロード
  }

  showImage(index) {
    // 画像を表示、フェードイン
  }

  next() {
    // 次の画像に進む
  }

  prev() {
    // 前の画像に戻る
  }

  play() {
    // タイマー開始
  }

  pause() {
    // タイマー停止
  }

  startTimer() {
    // settings.durationSec 後に next() を実行
  }
}
```

#### 3.4 CSS遷移の実装
```css
.image-container img {
  transition: opacity 1s ease-in-out;
}

.image-container img.fade-in {
  opacity: 1;
}

.image-container img.fade-out {
  opacity: 0;
}
```

#### 3.5 エラーハンドリング
- 画像読み込み失敗時はスキップして次へ
- タイムアウト設定（5秒）

**完了条件:**
- [ ] 画像リスト取得機能実装完了
- [ ] シャッフル機能実装完了
- [ ] 画像表示・遷移動作確認
- [ ] プリロード機能実装完了
- [ ] 前へ/次へボタン動作確認
- [ ] 一時停止/再生動作確認
- [ ] エラーハンドリング動作確認

---

## Phase 4: コントロールバーの実装 🎛️

### 目的
画面下部にコントロールバーを実装し、デバイス別操作に対応。

### タスク

#### 4.1 コントロールバーUIの実装
- HTML構造
- CSS（半透明背景、大きめボタン）
- アイコン（絵文字 or SVG）

#### 4.2 表示/非表示ロジック
```javascript
class ControlsManager {
  constructor() {
    this.hideTimeout = null;
    this.isVisible = false;
  }

  show() {
    // コントロールバーを表示
    // 5秒後に自動非表示
  }

  hide() {
    // フェードアウト
  }

  resetTimer() {
    // タイマーリセット
  }
}
```

#### 4.3 デバイス別イベントハンドリング

**キーボード（TV・PC）:**
```javascript
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowLeft': slideshow.prev(); break;
    case 'ArrowRight': slideshow.next(); break;
    case ' ': slideshow.togglePause(); break;
    case 'ArrowUp':
    case 'ArrowDown': controls.show(); break;
  }
});
```

**タッチ（スマホ・タブレット）:**
```javascript
let touchStartX = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchend', (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > 50) {
    if (diff > 0) slideshow.next(); // 左スワイプ
    else slideshow.prev(); // 右スワイプ
  } else {
    controls.toggle(); // タップ
  }
});
```

**マウス（PC）:**
```javascript
document.addEventListener('mousemove', () => {
  controls.show();
});
```

#### 4.4 ボタン機能の実装
- 前へ/次へボタン
- 再生/一時停止ボタン
- アルバムボタン（モーダル表示）
- 設定ボタン（パネル表示）

**完了条件:**
- [ ] コントロールバーUI実装完了
- [ ] 自動表示/非表示動作確認
- [ ] キーボード操作動作確認（TV・PC）
- [ ] タッチ操作動作確認（スマホ・タブレット）
- [ ] マウス操作動作確認（PC）
- [ ] 各ボタン機能動作確認

---

## Phase 5: オーバーレイの実装 🕐

### 目的
右下に時計・日付・天気を常時表示。

### タスク

#### 5.1 オーバーレイUIの実装
```html
<div id="overlay">
  <div id="date-line">10月14日 Tuesday</div>
  <div id="info-line">
    <span id="weather">☀ 23°C</span>
    <span id="clock">23:45</span>
  </div>
</div>
```

```css
#overlay {
  position: fixed;
  right: 24px;
  bottom: 24px;
  background: rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.7);
  padding: 12px;
  border-radius: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}
```

#### 5.2 時計機能の実装
```javascript
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}`;
}

setInterval(updateClock, 1000); // 1秒ごとに更新
```

#### 5.3 日付・曜日の実装
```javascript
function updateDate() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];

  // 曜日を3文字に短縮
  const shortWeekday = weekday.substring(0, 3);

  document.getElementById('date-line').textContent = `${month}月${day}日 ${shortWeekday}`;
}

updateDate();
setInterval(updateDate, 60000); // 1分ごとに更新
```

#### 5.4 天気APIの実装
```javascript
async function fetchWeather(apiKey, city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=en`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main, // Clear, Clouds, Rain, etc.
      icon: getWeatherIcon(data.weather[0].main)
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
}

function getWeatherIcon(condition) {
  const icons = {
    'Clear': '☀',
    'Clouds': '☁',
    'Rain': '🌧',
    'Snow': '❄️',
    'Mist': '🌫',
    'Fog': '🌫'
  };
  return icons[condition] || '🌤';
}

function updateWeather() {
  // APIキーが設定されていれば天気取得
  // 2分（120秒）ごとに更新
}
```

#### 5.5 表示/非表示の切り替え
```javascript
function toggleOverlay() {
  const overlay = document.getElementById('overlay');
  const settings = loadSettings();

  overlay.classList.toggle('hidden', !settings.clock && !settings.weather);

  document.getElementById('date-line').classList.toggle('hidden', !settings.date);
  document.getElementById('weather').classList.toggle('hidden', !settings.weather);
  document.getElementById('clock').classList.toggle('hidden', !settings.clock);
}
```

**完了条件:**
- [ ] オーバーレイUI実装完了
- [ ] 時計機能動作確認（1秒更新）
- [ ] 日付・曜日表示動作確認
- [ ] 天気API連携動作確認
- [ ] 天気アイコン表示確認
- [ ] 設定による表示/非表示切り替え確認
- [ ] TV・タブレット・PCで視認性確認

---

## Phase 6: アルバム選択・設定モーダルの実装 ⚙️

### 目的
スライドショー再生中にアルバムや設定を変更できるUIを実装。

### タスク

#### 6.1 アルバム選択モーダルの実装
```html
<div id="album-modal" class="modal hidden">
  <div class="modal-content">
    <h2>📁 アルバムを選択</h2>
    <div id="album-checkboxes"></div>
    <div class="modal-actions">
      <button id="select-all">すべて選択</button>
      <button id="deselect-all">すべて解除</button>
    </div>
    <div class="modal-buttons">
      <button id="cancel-album">キャンセル</button>
      <button id="apply-album">適用 ✓</button>
    </div>
  </div>
</div>
```

```javascript
function showAlbumModal(config) {
  // アルバムリストを動的生成
  // チェックボックスの状態を現在の設定から復元
}

function applyAlbumSelection() {
  // 選択されたアルバムを取得
  // 設定を更新
  // スライドショーを再起動（即座に反映）
}
```

#### 6.2 設定パネルの実装
```html
<div id="settings-modal" class="modal hidden">
  <div class="modal-content">
    <h2>⚙ 設定</h2>

    <div class="setting-item">
      <label>🕐 表示時間</label>
      <input type="range" id="duration-slider" min="3" max="120" value="60">
      <span id="duration-value">60秒</span>
    </div>

    <div class="setting-item">
      <label>🔀 シャッフル再生</label>
      <input type="checkbox" id="shuffle-toggle">
    </div>

    <div class="setting-item">
      <label>🖼️ 縦長画像ペアリング</label>
      <input type="checkbox" id="pairing-toggle">
    </div>

    <div class="setting-item">
      <label>🕐 時計を表示</label>
      <input type="checkbox" id="clock-toggle">
    </div>

    <div class="setting-item">
      <label>🌤️ 天気を表示</label>
      <input type="checkbox" id="weather-toggle">
    </div>

    <button id="close-settings">閉じる</button>
  </div>
</div>
```

```javascript
function showSettingsModal(currentSettings) {
  // 現在の設定値をフォームに反映
}

function applySettings() {
  // フォームから設定を取得
  // localStorage に保存
  // 即座に反映（次の画像から）
}
```

#### 6.3 モーダルの開閉制御
```javascript
// ESCキーで閉じる
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllModals();
  }
});

// モーダル外クリックで閉じる
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});
```

#### 6.4 設定の即座反映
```javascript
// 設定変更時の処理
function onSettingsChanged(newSettings) {
  // シャッフル変更 → 画像リスト再構築
  if (oldSettings.shuffle !== newSettings.shuffle) {
    rebuildImageQueue();
  }

  // 表示時間変更 → タイマー再設定
  if (oldSettings.durationSec !== newSettings.durationSec) {
    slideshow.updateDuration(newSettings.durationSec);
  }

  // オーバーレイ表示設定変更 → 即座に反映
  toggleOverlay();
}
```

**完了条件:**
- [ ] アルバム選択モーダルUI実装完了
- [ ] 設定パネルUI実装完了
- [ ] アルバム変更の即座反映動作確認
- [ ] 設定変更の即座反映動作確認
- [ ] モーダル開閉動作確認（ESC、外クリック）
- [ ] TV・タブレット・PCで操作確認

---

## Phase 7: 縦長画像ペアリングの実装 🖼️

### 目的
縦長画像を自動判定し、2枚並べて表示。

### タスク

#### 7.1 縦長判定ロジック
```javascript
function isPortrait(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.height / img.width;
      resolve(aspectRatio >= 1.25); // 縦長の閾値
    };
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
}
```

#### 7.2 ペアリング判定
```javascript
async function shouldShowPair(currentIndex, images) {
  const settings = loadSettings();

  if (!settings.portraitPairing) return false;
  if (currentIndex >= images.length - 1) return false;

  const current = await isPortrait(images[currentIndex]);
  const next = await isPortrait(images[currentIndex + 1]);

  return current && next;
}
```

#### 7.3 2枚並べ表示の実装
```html
<!-- 通常モード -->
<div id="image-container" class="single-mode">
  <img src="image1.jpg" alt="Image">
</div>

<!-- ペアリングモード -->
<div id="image-container" class="pair-mode">
  <img src="image1.jpg" alt="Portrait 1">
  <img src="image2.jpg" alt="Portrait 2">
</div>
```

```css
#image-container.pair-mode {
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 0 24px;
}

#image-container.pair-mode img {
  max-height: 100vh;
  max-width: 48%;
  object-fit: contain;
}
```

#### 7.4 スライドショーエンジンへの統合
```javascript
async showNextImage() {
  const shouldPair = await this.shouldShowPair(this.currentIndex);

  if (shouldPair) {
    // 2枚表示
    this.showImagePair(this.currentIndex, this.currentIndex + 1);
    this.currentIndex += 2; // 2枚進める
  } else {
    // 1枚表示
    this.showSingleImage(this.currentIndex);
    this.currentIndex += 1;
  }
}
```

**完了条件:**
- [ ] 縦長判定ロジック実装完了
- [ ] ペアリング判定ロジック実装完了
- [ ] 2枚並べ表示UI実装完了
- [ ] スライドショーエンジンへの統合完了
- [ ] 縦長/横長混在アルバムでの動作確認
- [ ] ペアリングON/OFF切り替え動作確認

---

## Phase 8: GitHub Actions（画像マニフェスト自動生成） 🤖

### 目的
画像追加時に `data/images.json` を自動生成し、手動更新を不要にする。

### タスク

#### 8.1 GitHub Actions ワークフローファイル作成
```yaml
# .github/workflows/generate-manifest.yml
name: Generate Image Manifest

on:
  push:
    branches: [main]
    paths:
      - 'albums/**'
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Generate manifest
        run: |
          python3 scripts/generate_manifest.py

      - name: Commit manifest
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/images.json
          git diff --quiet && git diff --staged --quiet || git commit -m "Update image manifest"
          git push
```

#### 8.2 マニフェスト生成スクリプト
```python
# scripts/generate_manifest.py
import os
import json

def generate_manifest():
    albums_dir = 'albums'
    manifest = {}

    for album in os.listdir(albums_dir):
        album_path = os.path.join(albums_dir, album)
        if os.path.isdir(album_path):
            images = [
                f for f in os.listdir(album_path)
                if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.avif'))
            ]
            images.sort()
            manifest[album] = images

    with open('data/images.json', 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"Generated manifest with {len(manifest)} albums")

if __name__ == '__main__':
    generate_manifest()
```

#### 8.3 手動実行での動作確認
```bash
# ローカルでスクリプトを実行してテスト
python3 scripts/generate_manifest.py
cat data/images.json
```

#### 8.4 GitHub Pages設定
1. リポジトリ Settings → Pages
2. Source: Deploy from a branch
3. Branch: main / root
4. Save

**完了条件:**
- [ ] GitHub Actions ワークフローファイル作成完了
- [ ] マニフェスト生成スクリプト作成完了
- [ ] ローカルでスクリプト動作確認
- [ ] GitHub Actionsでの自動生成動作確認
- [ ] GitHub Pages デプロイ設定完了

---

## Phase 9: 最終調整とテスト 🧪

### 目的
全機能を統合し、デバイス横断テストを実施。

### タスク

#### 9.1 パフォーマンス最適化
- 画像プリロードの改善
- メモリリーク確認（Chrome DevTools）
- 大量画像（494枚）での動作確認
  - 特にNohnアルバム（268枚）での長時間再生テスト

#### 9.2 レスポンシブ対応の最終調整
- TV（1920x1080）
- タブレット（768x1024）
- スマホ横（812x375）
- スマホ縦（375x812）

#### 9.3 エラーハンドリングの強化
- ネットワークエラー時の動作
- 画像読み込み失敗時のフォールバック
- APIキー未設定時の天気表示制御

#### 9.4 アクセシビリティチェック
- キーボードナビゲーション確認
- スクリーンリーダー対応（aria-label）
- コントラスト比確認

#### 9.5 デバイス実機テスト

| デバイス | テスト項目 | 結果 |
|---------|-----------|------|
| TCL Google TV | リモコン操作、フルスクリーン、遷移速度 | ✓ |
| iPad | タッチ操作、スワイプ、画面回転 | ✓ |
| iPhone | タッチ操作、縦持ち対応 | ✓ |
| Mac Chrome | マウス操作、キーボード操作 | ✓ |

#### 9.6 負荷テスト
- 494枚の画像で長時間再生（メモリ安定性）
  - 全アルバム選択での連続再生（1時間以上）
  - Nohnアルバム単体での長時間再生
- 高解像度画像（4K）での表示確認
- 低速ネットワークでの読み込み確認

**完了条件:**
- [ ] パフォーマンス最適化完了
- [ ] レスポンシブ対応確認完了
- [ ] エラーハンドリング強化完了
- [ ] アクセシビリティチェック完了
- [ ] 全デバイスでの実機テスト完了
- [ ] 負荷テスト完了

---

## Phase 10: ドキュメント整備とリリース 📚

### 目的
使い方ガイドを作成し、GitHub Pagesで公開。

### タスク

#### 10.1 README.md の作成
```markdown
# Webスライドショー

GitHub Pagesで動作する静的スライドショーアプリ

## 使い方

1. リポジトリをクローン
2. `albums/` に画像を追加
3. `config.json` でアルバムを定義
4. `git push` でデプロイ

## 設定

- `config.json`: アルバム定義・デフォルト設定
- OpenWeatherMap APIキー設定方法

## 操作方法

- TV: リモコンの←→で画像送り
- スマホ: スワイプで画像送り
- PC: キーボード←→、マウスクリックでコントロール表示

## ライセンス

MIT License
```

#### 10.2 使い方ガイド (`docs/usage-guide.md`)
- 画像追加方法
- アルバム追加方法
- 設定カスタマイズ方法
- OpenWeatherMap APIキー取得手順

#### 10.3 トラブルシューティング (`docs/troubleshooting.md`)
- 画像が表示されない
- 天気が表示されない
- TVで操作できない

#### 10.4 リリースノート (`CHANGELOG.md`)
```markdown
# Changelog

## [1.0.0] - 2025-10-14

### Added
- 複数アルバム対応
- シャッフル再生
- 時計・日付・天気オーバーレイ
- 縦長画像ペアリング
- デバイス別操作対応
```

**完了条件:**
- [ ] README.md 作成完了
- [ ] 使い方ガイド作成完了
- [ ] トラブルシューティング作成完了
- [ ] リリースノート作成完了
- [ ] GitHub Pages公開確認

---

## タスク管理

### 全体進捗（To-Doリスト）

| Phase | タスク | ステータス |
|-------|--------|-----------|
| Phase 1 | プロジェクト基盤構築 | ⬜ 未着手 |
| Phase 2 | 初期設定画面の実装 | ⬜ 未着手 |
| Phase 3 | スライドショーエンジンの実装 | ⬜ 未着手 |
| Phase 4 | コントロールバーの実装 | ⬜ 未着手 |
| Phase 5 | オーバーレイの実装 | ⬜ 未着手 |
| Phase 6 | アルバム選択・設定モーダルの実装 | ⬜ 未着手 |
| Phase 7 | 縦長画像ペアリングの実装 | ⬜ 未着手 |
| Phase 8 | GitHub Actions実装 | ⬜ 未着手 |
| Phase 9 | 最終調整とテスト | ⬜ 未着手 |
| Phase 10 | ドキュメント整備とリリース | ⬜ 未着手 |

### 優先順位
1. **Phase 1-3**: 基本機能（必須）
2. **Phase 4-5**: UI/UX（重要）
3. **Phase 6-7**: 高度な機能（重要）
4. **Phase 8**: 自動化（便利）
5. **Phase 9-10**: 品質保証・公開（必須）

---

## リスクと対策

### リスク1: TV操作の互換性問題
**内容:** TCL Google TVのリモコンキーイベントが想定通り動作しない

**対策:**
- 標準的なキーコード（ArrowLeft/ArrowRight等）を使用
- 実機での早期テスト実施
- フォールバック操作（マウスクリック）を用意

### リスク2: 大容量画像によるパフォーマンス低下
**内容:** 高解像度画像が多いとメモリ不足やロード遅延が発生

**対策:**
- 画像圧縮ガイドラインを提供（推奨: 1920x1080、JPEG 80%品質）
- プリロード枚数を制限（最大2枚）
- 画像読み込みタイムアウト設定

### リスク3: GitHub Pagesのファイルサイズ制限
**内容:** 1リポジトリあたり1GB、1ファイル100MBの制限

**対策:**
- Git LFSの導入検討（必要に応じて）
- アルバムごとにリポジトリ分割も視野
- ガイドラインで画像枚数・サイズを推奨

### リスク4: OpenWeatherMap APIの制限超過
**内容:** 無料プランの1分60回制限に到達

**対策:**
- 更新間隔を2分（120秒）に設定
- API呼び出し失敗時は前回の値を表示
- キャッシュ機能の実装

### リスク5: localStorage非対応ブラウザ
**内容:** 古いデバイスでlocalStorageが使えない

**対策:**
- localStorageの有効性チェック
- 非対応時はセッション内のメモリ保存にフォールバック
- URLパラメータでの設定上書き機能を用意

---

## テスト計画

### 機能テスト

| # | テスト項目 | 期待動作 | 結果 |
|---|-----------|---------|------|
| 1 | 初回アクセス時に設定画面表示 | 設定画面が表示される | ⬜ |
| 2 | 2回目以降は自動再生開始 | 前回の設定で即座にスライドショー開始 | ⬜ |
| 3 | アルバム選択（複数） | 選択したアルバムの画像が表示される | ⬜ |
| 4 | シャッフルON | ランダムな順序で画像表示 | ⬜ |
| 5 | シャッフルOFF | ファイル名順で画像表示 | ⬜ |
| 6 | 表示時間変更 | 設定した秒数で画像遷移 | ⬜ |
| 7 | 前へ/次へボタン | 前後の画像に移動 | ⬜ |
| 8 | 一時停止/再生 | タイマーが停止/再開 | ⬜ |
| 9 | 時計表示 | 現在時刻が1秒ごとに更新 | ⬜ |
| 10 | 日付・曜日表示 | 正しい日付と英語曜日が表示 | ⬜ |
| 11 | 天気表示 | APIから取得した天気・気温が表示 | ⬜ |
| 12 | 縦長ペアリング | 縦長画像2枚が横並びで表示 | ⬜ |
| 13 | コントロールバー自動非表示 | 5秒後に自動的に消える | ⬜ |
| 14 | 設定の即座反映 | 変更した設定が次の画像から適用 | ⬜ |

### 操作テスト（デバイス別）

#### TV（リモコン）
- [ ] ← → キーで画像送り
- [ ] OKキーで一時停止/再生
- [ ] ↑↓キーでコントロールバー表示
- [ ] フォーカスが明確に表示される
- [ ] 操作レスポンスが遅延しない

#### スマホ/タブレット（タッチ）
- [ ] 左右スワイプで画像送り
- [ ] タップでコントロールバー表示/非表示
- [ ] 画面回転に対応
- [ ] ピンチイン/アウト無効化

#### PC（マウス・キーボード）
- [ ] マウス移動でコントロールバー表示
- [ ] ← → キーで画像送り
- [ ] Spaceキーで一時停止/再生
- [ ] Fキーでフルスクリーン

### パフォーマンステスト
- [ ] 初期ロード3秒以内（50枚アルバム）
- [ ] 画像遷移が滑らか（フレーム落ちなし）
- [ ] 500枚の画像で30分再生してもメモリ安定
- [ ] 4K画像でも正常に表示

### ブラウザ互換性テスト
- [ ] Chrome 120+
- [ ] Safari 17+
- [ ] Firefox 120+
- [ ] Android TV Chromiumベースブラウザ

---

## 完了条件

### 必須条件（v1.0リリース基準）

1. ✅ **全Phaseの実装完了**
   - Phase 1〜10の全タスク完了

2. ✅ **機能テスト全項目パス**
   - 上記14項目の機能テストすべて成功

3. ✅ **デバイス実機テスト完了**
   - TV、iPad、iPhone、PCで動作確認

4. ✅ **パフォーマンス基準クリア**
   - 初期ロード3秒以内
   - 500枚画像でメモリ安定

5. ✅ **GitHub Pages公開完了**
   - URLアクセスで正常動作確認

6. ✅ **ドキュメント整備完了**
   - README、使い方ガイド、トラブルシューティング

### オプション条件（v1.1以降）
- Ken Burns効果（ズーム・パン）
- パスワード保護機能
- 複数言語対応（日本語UI）
- ダークモード/ライトモード切り替え

---

## 🐛 トラブルシューティング（実装中に遭遇した問題）

### 問題1: CORSエラーで画像が表示されない

**発生日:** 2025-10-15
**症状:**
```
Access to fetch at 'file:///Users/.../config.json' from origin 'null'
has been blocked by CORS policy
```

**原因:**
`file://`プロトコルで直接HTMLを開くと、JavaScriptの`fetch`でローカルファイルを読み込めない。

**解決方法:**
ローカルHTTPサーバーを起動して`http://localhost`経由でアクセス。

```bash
# プロジェクトルートで実行
python3 -m http.server 8000

# ブラウザで開く
open http://localhost:8000
```

**教訓:**
- 静的サイトでも開発時はHTTPサーバー必須
- GitHub Pagesでは問題なし（本番環境はHTTP/HTTPS）

---

### 問題2: Fill-screen（画面いっぱい表示）モードが効かない

**発生日:** 2025-10-15
**症状:**
`fillScreen: true`を設定しても、画像が余白付きで表示される（object-fit: containのまま）。

**原因:**
CSSの優先度不足。base styleの`.image-container img`が`.fill-screen img`より強かった。

**解決方法:**
Fill-screen用のCSSルールに`!important`を追加。

```css
/* Before */
.image-container.fill-screen img {
  object-fit: cover;
}

/* After */
.image-container.fill-screen img {
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: cover !important;
}
```

**教訓:**
- CSS詳細度の理解が重要
- デバッグ時はブラウザDevToolsで適用されているスタイルを確認

---

### 問題3: オーバーレイのフォントが細くて見づらい

**発生日:** 2025-10-15
**症状:**
`font-weight: 300`（thin）が背景画像に埋もれて可読性が低い。

**解決方法:**
1. `font-weight: 600`（semi-bold）に変更
2. `text-shadow`を強化（2px 2px 8px rgba(0,0,0,0.9)）
3. フォントサイズを1.5倍に拡大

**教訓:**
- 背景が変動する場合は太めのフォント + 強いシャドウが必要
- ユーザーフィードバックを受けて段階的に調整

---

## 📦 作成されたスクリプト・ワークフロー

### scripts/convert_heic_to_webp.py

**目的:** HEIC形式の画像をWebPに一括変換

**機能:**
- albums/内の全HEIC/HEIFファイルをスキャン
- WebP形式に変換（quality=85%、method=6）
- EXIF メタデータを保持
- 元のHEICファイルを`.heic_archive/`に移動（削除ではない）
- 変換後、自動で`generate_manifest.py`を実行

**使い方:**
```bash
# 依存ライブラリをインストール（初回のみ）
pip install pillow pillow-heif

# 実行
python3 scripts/convert_heic_to_webp.py
```

**出力例:**
```
🔄 HEIC to WebP Converter
==================================================

📁 Found 12 HEIC file(s) across 3 album(s):
   • Nohn: 8 file(s)
   • ぽんちょねこ: 4 file(s)

⚙️  Conversion settings:
   • WebP quality: 85%
   • Original files will be moved to: [album]/.heic_archive/

❓ Proceed with conversion? [y/N]: y

🚀 Starting conversion...

📂 Album: Nohn
   🔄 IMG_1234.heic → IMG_1234.webp... ✅
   ...

✅ Conversion complete!
   • Converted: 12 file(s)

📋 Regenerating images.json manifest...
✅ images.json updated successfully
```

---

### .github/workflows/update-manifest.yml

**目的:** GitHub Actionsで画像追加時にimages.jsonを自動更新

**トリガー:** `albums/`ディレクトリ内のファイル変更をpush

**動作:**
1. リポジトリをチェックアウト
2. Python 3.12をセットアップ
3. `scripts/generate_manifest.py`を実行
4. `data/images.json`に変更があればコミット＆プッシュ

**メリット:**
- ✅ 画像を追加してpushするだけで自動的にimages.jsonが更新される
- ✅ 手動実行忘れゼロ
- ✅ 複数人で画像を追加する場合も問題なし

**使い方:**
```bash
# 画像を追加
cp ~/Downloads/new_photo.jpg albums/Nohn/

# GitHubにプッシュ（いつも通り）
git add albums/Nohn/new_photo.jpg
git commit -m "Add new photo"
git push

# → GitHub Actionsが自動実行される
# → 数秒後、images.jsonが自動更新されてコミットされる
```

**詳細ドキュメント:** [docs/workflow-images.md](../docs/workflow-images.md)

---

## 次のアクション

### ユーザー承認待ち
この計画書の内容を確認し、承認をお願いします。

**確認ポイント:**
- [ ] 実装範囲は適切か？
- [ ] Phase分割は妥当か？
- [ ] 優先順位は正しいか？
- [ ] 追加・変更したい要件はないか？

### 承認後の流れ
1. **Phase 1から順次実装開始**
2. **各Phase完了時に動作確認**
3. **問題があれば計画書を更新**
4. **全Phase完了後、v1.0リリース**

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 承認 |
|------|-----------|---------|------|
| 2025-10-14 | v1.0 | 初版作成 | ✅ 承認済み |
| 2025-10-15 | v1.1 | Phase 1-5完了、追加実装セクション追加 | ✅ 進行中 |
| 2025-10-15 | v1.2 | オーバーレイUI改善、HEIC変換、自動化実装完了 | ⬜ 確認待ち |

---

**作成者:** Claude Code
**承認者:** [ユーザー名]
**承認日:** [yyyy-mm-dd]
