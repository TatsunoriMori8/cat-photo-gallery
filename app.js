/**
 * Webスライドショーアプリ
 * Phase 2: スライドショーエンジンの実装
 */

// ============================================
// グローバル変数
// ============================================

let config = null;
let settings = null;
let slideshowEngine = null;
let imageManifest = null;

// ============================================
// 初期化
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('アプリ起動...');

  // Service Workerを登録（PWA対応）
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('sw.js');
      console.log('✅ Service Worker登録成功:', registration.scope);
    } catch (error) {
      console.log('⚠️ Service Worker登録失敗:', error);
    }
  }

  try {
    // 設定ファイルを読み込み
    config = await loadConfig();
    console.log('config.json読み込み完了:', config);

    // 保存された設定を読み込み（localStorage）
    settings = loadSettings();
    console.log('設定読み込み:', settings);

    // 背景タイルを生成
    await generateBackgroundTiles();

    // 初期設定画面を表示
    showSetupScreen();

  } catch (error) {
    console.error('初期化エラー:', error);
    alert('アプリの初期化に失敗しました。config.jsonを確認してください。');
  }
});

// ============================================
// 設定ファイルの読み込み
// ============================================

async function loadConfig() {
  try {
    const response = await fetch('config.json');
    if (!response.ok) {
      throw new Error(`config.json読み込み失敗: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('config.json読み込みエラー:', error);
    throw error;
  }
}

// ============================================
// localStorage から設定を読み込み
// ============================================

function loadSettings() {
  const saved = localStorage.getItem('slideshow-settings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      console.log('保存された設定を復元:', parsed);
      return parsed;
    } catch (error) {
      console.error('設定の読み込みエラー:', error);
    }
  }

  // デフォルト設定を返す
  if (config && config.defaults) {
    return { ...config.defaults };
  }

  // fallback
  return {
    albums: [],
    durationSec: 60,
    shuffle: true,
    clock: true,
    date: true,
    weather: true,
    portraitPairing: true
  };
}

// ============================================
// localStorage に設定を保存
// ============================================

function saveSettings(newSettings) {
  settings = newSettings;
  localStorage.setItem('slideshow-settings', JSON.stringify(settings));
  console.log('設定を保存しました:', settings);
}

// ============================================
// 背景タイル生成
// ============================================

async function generateBackgroundTiles() {
  console.log('🖼️  背景タイル生成開始...');
  const container = document.getElementById('background-tiles');
  if (!container) {
    console.error('❌ background-tiles コンテナが見つかりません');
    return;
  }
  console.log('✅ background-tiles コンテナ発見');

  // サムネイルフォルダから画像を取得
  const thumbnailPath = 'albums/thumbnails/';
  let allImages = [];

  try {
    const response = await fetch(`${thumbnailPath}manifest.json`);
    if (response.ok) {
      const manifest = await response.json();
      allImages = manifest.images.map(img => `${thumbnailPath}${img}`);
      console.log(`サムネイル読み込み: ${manifest.count}枚, ${manifest.total_size_mb}MB`);
    } else {
      console.warn('サムネイルmanifest.jsonが見つかりません');
      return;
    }
  } catch (error) {
    console.error('サムネイル読み込みエラー:', error);
    return;
  }

  if (allImages.length === 0) {
    console.warn('背景用の画像が見つかりませんでした');
    return;
  }

  // 画面の高さに応じて行数を計算（1行 = 200px + 8px margin）
  const rowHeight = 208;
  const numRows = Math.ceil(window.innerHeight / rowHeight) + 1;

  // タイルを2倍にして無限スクロール用に複製
  const doubledImages = [...allImages, ...allImages];

  // 各行を生成
  for (let i = 0; i < numRows; i++) {
    const row = document.createElement('div');
    row.className = `tile-row ${i % 2 === 0 ? 'scroll-left' : 'scroll-right'}`;

    // ランダムな開始位置から画像を配置
    const startIndex = Math.floor(Math.random() * allImages.length);
    const rowImages = [];

    for (let j = 0; j < doubledImages.length; j++) {
      const img = document.createElement('img');
      const imgIndex = (startIndex + j) % doubledImages.length;
      img.src = doubledImages[imgIndex];
      img.className = 'tile-item';
      img.loading = 'lazy'; // 遅延読み込み
      img.alt = '';
      rowImages.push(img);
    }

    rowImages.forEach(img => row.appendChild(img));
    container.appendChild(row);
  }

  console.log(`背景タイル生成完了: ${allImages.length}枚の画像, ${numRows}行`);
}

// ============================================
// 初期設定画面の表示
// ============================================

function showSetupScreen() {
  const setupScreen = document.getElementById('setup-screen');
  const slideshowScreen = document.getElementById('slideshow-screen');

  setupScreen.classList.remove('hidden');
  slideshowScreen.classList.add('hidden');

  // アルバム選択チェックボックスを生成
  renderAlbumCheckboxes('album-checkboxes');

  // 設定値をフォームに反映
  // Duration bar selector - 選択状態を反映
  updateDurationBarSelection(settings.durationSec);
  document.getElementById('shuffle-toggle').checked = settings.shuffle;
  document.getElementById('pairing-toggle').checked = settings.portraitPairing;
  document.getElementById('clock-toggle').checked = settings.clock;
  document.getElementById('date-toggle').checked = settings.date;
  document.getElementById('weather-toggle').checked = settings.weather;
  document.getElementById('fill-screen-toggle').checked = settings.fillScreen || false;

  // イベントリスナーを設定
  setupEventListeners();
}

// ============================================
// Duration Bar Selectorの選択状態を更新
// ============================================

function updateDurationBarSelection(durationSec) {
  const buttons = document.querySelectorAll('.duration-btn:not(.modal-duration-btn)');
  if (buttons.length === 0) {
    console.warn('Duration buttons not found yet');
    return;
  }
  buttons.forEach(btn => {
    const btnDuration = parseInt(btn.dataset.duration);
    if (btnDuration === durationSec) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

// ============================================
// アルバムチェックボックスを動的生成
// ============================================

function renderAlbumCheckboxes(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (!config || !config.albums) {
    container.innerHTML = '<p>アルバムが見つかりません</p>';
    return;
  }

  config.albums.forEach(album => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = album.id;
    checkbox.checked = settings.albums.includes(album.id);

    const span = document.createElement('span');
    span.textContent = album.label;

    label.appendChild(checkbox);
    label.appendChild(span);
    container.appendChild(label);
  });
}

// ============================================
// イベントリスナーの設定
// ============================================

function setupEventListeners() {
  // Duration bar selector - バー選択式のイベントリスナー
  const durationBtns = document.querySelectorAll('.duration-btn:not(.modal-duration-btn)');
  durationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // すべての選択を解除
      durationBtns.forEach(b => b.classList.remove('selected'));
      // クリックされたボタンを選択
      btn.classList.add('selected');
    });
  });

  // すべて選択
  document.getElementById('select-all-albums').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#album-checkboxes input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = true);
  });

  // すべて解除
  document.getElementById('deselect-all-albums').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#album-checkboxes input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
  });

  // スライドショー開始ボタン
  document.getElementById('start-slideshow').addEventListener('click', () => {
    startSlideshow();
  });
}

// ============================================
// スライドショー開始
// ============================================

function startSlideshow() {
  // 選択されたアルバムを取得
  const checkboxes = document.querySelectorAll('#album-checkboxes input[type="checkbox"]:checked');
  const selectedAlbums = Array.from(checkboxes).map(cb => cb.value);

  if (selectedAlbums.length === 0) {
    alert('アルバムを1つ以上選択してください');
    return;
  }

  // 設定を収集
  const selectedDurationBtn = document.querySelector('.duration-btn:not(.modal-duration-btn).selected');
  const durationSec = selectedDurationBtn ? parseInt(selectedDurationBtn.dataset.duration) : 60;

  const newSettings = {
    albums: selectedAlbums,
    durationSec: durationSec,
    shuffle: document.getElementById('shuffle-toggle').checked,
    portraitPairing: document.getElementById('pairing-toggle').checked,
    clock: document.getElementById('clock-toggle').checked,
    date: document.getElementById('date-toggle').checked,
    weather: document.getElementById('weather-toggle').checked,
    fillScreen: document.getElementById('fill-screen-toggle').checked,
    initialized: true
  };

  // 設定を保存
  saveSettings(newSettings);

  // スライドショー画面に遷移
  console.log('スライドショー開始:', newSettings);
  showSlideshowScreen();
}

// ============================================
// スライドショー画面の表示
// ============================================

async function showSlideshowScreen() {
  const setupScreen = document.getElementById('setup-screen');
  const slideshowScreen = document.getElementById('slideshow-screen');

  setupScreen.classList.add('hidden');
  slideshowScreen.classList.remove('hidden');

  try {
    // 画像マニフェストを読み込み
    imageManifest = await loadImageManifest();
    console.log('画像マニフェスト読み込み完了:', imageManifest);

    // 画像URLリストを構築
    const imageUrls = buildImageUrls(settings.albums);
    console.log(`画像数: ${imageUrls.length}枚`);

    if (imageUrls.length === 0) {
      alert('選択されたアルバムに画像がありません');
      location.reload();
      return;
    }

    // スライドショーエンジンを初期化
    slideshowEngine = new SlideshowEngine(imageUrls, settings);

    // コントロールバーのイベントリスナーを設定
    setupControlListeners();

    // キーボード・タッチ操作を設定
    setupInputListeners();

    // オーバーレイを初期化（時計・日付・天気）
    initializeOverlay();

    // スライドショー開始
    slideshowEngine.start();

  } catch (error) {
    console.error('スライドショー初期化エラー:', error);
    alert('スライドショーの初期化に失敗しました');
    location.reload();
  }
}

// ============================================
// 画像マニフェストの読み込み
// ============================================

async function loadImageManifest() {
  try {
    // キャッシュバスティング：タイムスタンプを追加
    const cacheBuster = new Date().getTime();
    const response = await fetch(`data/images.json?v=${cacheBuster}`);
    if (!response.ok) {
      throw new Error(`images.json読み込み失敗: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('images.json読み込みエラー:', error);
    throw error;
  }
}

// ============================================
// 画像URLリストを構築
// ============================================

function buildImageUrls(selectedAlbumIds) {
  const urls = [];

  console.log('=== buildImageUrls デバッグ ===');
  console.log('選択されたアルバムID:', selectedAlbumIds);
  console.log('imageManifest:', imageManifest);

  selectedAlbumIds.forEach(albumId => {
    // config.json からアルバム情報を取得
    const albumInfo = config.albums.find(a => a.id === albumId);
    if (!albumInfo) {
      console.warn(`アルバムID ${albumId} が見つかりません`);
      return;
    }

    console.log(`アルバムID ${albumId} の情報:`, albumInfo);

    // マニフェストキーを取得（明示的に指定されている場合はそれを使用、なければパスから抽出）
    let albumName = albumInfo.manifestKey || albumInfo.path.replace('albums/', '').replace(/\/$/, '');
    console.log(`使用するマニフェストキー: "${albumName}"`);

    // 文字列を正規化（NFCとNFDの違いを解消）
    albumName = albumName.normalize('NFC');

    // マニフェスト内のキーも正規化して検索
    let images = null;
    for (const key of Object.keys(imageManifest)) {
      if (key.normalize('NFC') === albumName) {
        images = imageManifest[key];
        console.log(`✅ マニフェストキー "${key}" にマッチ（正規化後）`);
        break;
      }
    }

    console.log(`マニフェストのキー "${albumName}" の画像:`, images ? `${images.length}枚` : 'なし');

    if (!images || images.length === 0) {
      console.warn(`アルバム ${albumName} に画像がありません`);
      console.warn('利用可能なマニフェストキー:', Object.keys(imageManifest));
      return;
    }

    // 各画像の絶対URLを構築
    images.forEach(filename => {
      const url = `${albumInfo.path}${filename}`;
      urls.push(url);
    });

    console.log(`アルバム ${albumName}: ${images.length}枚追加`);

    // 切り絵latestの場合、WebP画像を明示的にログ出力
    if (albumName.includes('切り絵')) {
      const webpFiles = images.filter(f => f.endsWith('.webp'));
      console.log(`  → WebP画像: ${webpFiles.length}枚`);
      if (webpFiles.length > 0) {
        console.log(`  → 最初のWebP: ${albumInfo.path}${webpFiles[0]}`);
      }
    }
  });

  console.log(`合計画像数: ${urls.length}枚`);
  console.log('=== buildImageUrls 完了 ===');

  return urls;
}

// ============================================
// シャッフル関数（Fisher-Yates）
// ============================================

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================
// スライドショーエンジンクラス
// ============================================

class SlideshowEngine {
  constructor(imageUrls, settings) {
    this.images = settings.shuffle ? shuffleArray(imageUrls) : imageUrls;
    this.settings = settings;
    this.currentIndex = 0;
    this.isPaused = false;
    this.timer = null;
    this.container = document.getElementById('image-container');
    this.preloadedImages = new Map();

    console.log('SlideshowEngine initialized:', {
      imageCount: this.images.length,
      shuffle: settings.shuffle,
      durationSec: settings.durationSec,
      fillScreen: settings.fillScreen
    });
  }

  start() {
    console.log('スライドショー開始');
    this.showImage(this.currentIndex);
    this.startTimer();
  }

  async showImage(index) {
    // インデックスをループ
    if (index >= this.images.length) {
      index = 0;
      this.currentIndex = 0;
    } else if (index < 0) {
      index = this.images.length - 1;
      this.currentIndex = this.images.length - 1;
    } else {
      this.currentIndex = index;
    }

    const imageUrl = this.images[this.currentIndex];
    console.log(`🖼️ 画像表示: ${this.currentIndex + 1}/${this.images.length}`);
    console.log(`   URL: ${imageUrl}`);
    console.log(`   fillScreen: ${this.settings.fillScreen}`);
    console.log(`   portraitPairing: ${this.settings.portraitPairing}`);

    // 古い画像を保持したまま処理を続ける
    this.container.classList.remove('pair-mode');

    // Fill Screen モードの適用
    if (this.settings.fillScreen) {
      this.container.classList.add('fill-screen');
      console.log(`   ✅ fill-screen クラス追加`);
    } else {
      this.container.classList.remove('fill-screen');
      console.log(`   ❌ fill-screen クラス削除`);
    }

    // 縦長画像ペアリングの判定と実行
    if (this.settings.portraitPairing) {
      const pairedImages = await this.tryPairPortraitImages(this.currentIndex);
      if (pairedImages) {
        console.log(`   🖼️🖼️ 縦長画像ペアリング適用`);
        // ペア表示
        this.displayPairedImages(pairedImages);
        this.preloadNext();
        return;
      }
    }

    // 通常の1枚表示
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = `Image ${this.currentIndex + 1}`;

    // 読み込み完了後に表示
    img.onload = () => {
      console.log(`✅ 画像読み込み成功: ${imageUrl}`);

      // 古い画像を即座に削除
      const oldImages = this.container.querySelectorAll('img');
      oldImages.forEach(oldImg => oldImg.remove());

      // 新しい画像を追加
      this.container.appendChild(img);

      // 次のフレームでフェードイン
      requestAnimationFrame(() => {
        img.classList.add('visible');
      });
    };

    // エラー時の処理
    img.onerror = (e) => {
      console.error(`❌ 画像読み込みエラー: ${imageUrl}`);
      console.error(`   絶対パス: ${window.location.origin}/${imageUrl}`);
      console.error(`   ファイル拡張子: ${imageUrl.split('.').pop()}`);
      console.error(`   エラー詳細:`, e);

      // エラーメッセージを表示
      this.container.innerHTML = `
        <div style="color: white; text-align: center; padding: 40px;">
          <h2>❌ 画像読み込みエラー</h2>
          <p>ファイル: ${imageUrl}</p>
          <p style="font-size: 12px; margin-top: 10px;">URL: ${window.location.origin}/${imageUrl}</p>
          <p style="font-size: 14px; margin-top: 20px;">次の画像に進みます...</p>
        </div>
      `;
      // 次の画像へスキップ
      setTimeout(() => this.next(), 2000);
    };

    // 次の画像をプリロード
    this.preloadNext();
  }

  // 縦長画像のペアリング判定
  async tryPairPortraitImages(startIndex) {
    const img1Url = this.images[startIndex];
    const nextIndex = (startIndex + 1) % this.images.length;
    const img2Url = this.images[nextIndex];

    try {
      // 両方の画像の縦横比を取得
      const [img1, img2] = await Promise.all([
        this.loadImageDimensions(img1Url),
        this.loadImageDimensions(img2Url)
      ]);

      const isImg1Portrait = img1.height > img1.width;
      const isImg2Portrait = img2.height > img2.width;

      // 両方とも縦長の場合のみペアリング
      if (isImg1Portrait && isImg2Portrait) {
        // 次の画像もスキップする（ペアで表示するため）
        this.currentIndex = nextIndex;
        return [img1Url, img2Url];
      }

      return null; // ペアリングしない
    } catch (error) {
      console.error('画像サイズ取得エラー:', error);
      return null;
    }
  }

  // 画像のサイズを取得
  loadImageDimensions(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height, url });
      img.onerror = reject;
      img.src = url;
    });
  }

  // ペアリングした画像を表示
  displayPairedImages(imageUrls) {
    console.log(`🖼️🖼️ displayPairedImages呼び出し: ${imageUrls.length}枚`);

    // pair-modeクラスを追加
    this.container.classList.add('pair-mode');

    let loadedCount = 0;
    const newImages = [];

    imageUrls.forEach((url, index) => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = `Paired Image ${index + 1}`;
      // ペアモードではvisibleクラスを最初から付与
      img.classList.add('visible');

      img.onload = () => {
        console.log(`✅ ペア画像${index + 1}読み込み成功: ${url}`);
        loadedCount++;
        newImages.push(img);

        // 両方の画像がロードされたら表示
        if (loadedCount === imageUrls.length) {
          console.log(`✅ ペア画像すべてロード完了、表示開始`);

          // 古い画像を即座に削除
          const oldImages = this.container.querySelectorAll('img');
          oldImages.forEach(oldImg => oldImg.remove());

          // 新しい画像を追加（visibleクラス付き）
          newImages.forEach(newImg => {
            this.container.appendChild(newImg);
          });
        }
      };

      img.onerror = () => {
        console.error(`❌ ペア画像${index + 1}読み込みエラー: ${url}`);
        // エラーでも続行
        loadedCount++;
        if (loadedCount === imageUrls.length && newImages.length > 0) {
          // 読み込めた画像だけ表示
          const oldImages = this.container.querySelectorAll('img');
          oldImages.forEach(oldImg => oldImg.remove());
          newImages.forEach(newImg => {
            this.container.appendChild(newImg);
          });
        }
      };
    });
  }

  preloadNext() {
    const nextIndex = (this.currentIndex + 1) % this.images.length;
    const nextUrl = this.images[nextIndex];

    if (!this.preloadedImages.has(nextUrl)) {
      const img = new Image();
      img.src = nextUrl;
      this.preloadedImages.set(nextUrl, img);
    }
  }

  next() {
    this.stopTimer();
    this.showImage(this.currentIndex + 1);
    if (!this.isPaused) {
      this.startTimer();
    }
  }

  prev() {
    this.stopTimer();
    this.showImage(this.currentIndex - 1);
    if (!this.isPaused) {
      this.startTimer();
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    console.log(this.isPaused ? '一時停止' : '再生');

    // ボタンアイコンを更新
    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.textContent = this.isPaused ? '▶' : '⏸';

    if (this.isPaused) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.stopTimer();
    const durationMs = this.settings.durationSec * 1000;
    this.timer = setTimeout(() => {
      this.next();
    }, durationMs);
  }

  stopTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  updateDuration(newDurationSec) {
    this.settings.durationSec = newDurationSec;
    if (!this.isPaused) {
      this.startTimer();
    }
  }
}

// ============================================
// コントロールバーのイベントリスナー
// ============================================

function setupControlListeners() {
  // 前へ
  document.getElementById('prev-btn').addEventListener('click', () => {
    slideshowEngine.prev();
  });

  // 次へ
  document.getElementById('next-btn').addEventListener('click', () => {
    slideshowEngine.next();
  });

  // 再生/一時停止
  document.getElementById('play-pause-btn').addEventListener('click', () => {
    slideshowEngine.togglePause();
  });

  // アルバム選択ボタン（Phase 6で実装予定）
  document.getElementById('album-btn').addEventListener('click', () => {
    console.log('アルバム選択モーダル（Phase 6で実装予定）');
  });

  // 設定ボタン（Phase 6で実装予定）
  document.getElementById('settings-btn').addEventListener('click', () => {
    console.log('設定モーダル（Phase 6で実装予定）');
  });

  // フルスクリーンボタン
  document.getElementById('fullscreen-btn').addEventListener('click', () => {
    toggleFullscreen();
  });
}

// ============================================
// キーボード・タッチ操作のリスナー
// ============================================

function setupInputListeners() {
  // キーボード操作
  document.addEventListener('keydown', handleKeyDown);

  // タッチ操作
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });

  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // 横スワイプ（縦方向の動きが小さい場合のみ）
    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 30) {
      if (diffX > 0) {
        // 左スワイプ → 次へ
        slideshowEngine.next();
      } else {
        // 右スワイプ → 前へ
        slideshowEngine.prev();
      }
    } else if (Math.abs(diffX) < 20 && Math.abs(diffY) < 20) {
      // タップ → コントロールバー表示/非表示
      toggleControls();
    }
  });

  // マウス移動でコントロールバー表示
  let mouseMoveTimeout = null;
  document.addEventListener('mousemove', () => {
    showControls();

    // 5秒後に自動非表示
    if (mouseMoveTimeout) clearTimeout(mouseMoveTimeout);
    mouseMoveTimeout = setTimeout(() => {
      hideControls();
    }, 5000);
  });
}

// ============================================
// キーボードイベントハンドラー
// ============================================

function handleKeyDown(e) {
  switch(e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      slideshowEngine.prev();
      break;
    case 'ArrowRight':
      e.preventDefault();
      slideshowEngine.next();
      break;
    case ' ':
      e.preventDefault();
      slideshowEngine.togglePause();
      break;
    case 'ArrowUp':
    case 'ArrowDown':
      e.preventDefault();
      toggleControls();
      break;
    case 'Escape':
      e.preventDefault();
      hideControls();
      break;
    case 'f':
    case 'F':
      e.preventDefault();
      toggleFullscreen();
      break;
  }
}

// ============================================
// コントロールバーの表示/非表示
// ============================================

function showControls() {
  const controls = document.getElementById('controls');
  controls.classList.remove('hidden');
}

function hideControls() {
  const controls = document.getElementById('controls');
  controls.classList.add('hidden');
}

function toggleControls() {
  const controls = document.getElementById('controls');
  controls.classList.toggle('hidden');
}

// ============================================
// Phase 3: オーバーレイ（時計・日付・天気）
// ============================================

let clockInterval = null;
let weatherInterval = null;
let weatherData = null;

// ============================================
// オーバーレイの初期化
// ============================================

function initializeOverlay() {
  console.log('オーバーレイ初期化...');

  // 時計・日付の表示/非表示
  updateOverlayVisibility();

  // 時計の初期表示と更新開始
  if (settings.clock) {
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
  }

  // 日付の初期表示と更新開始
  if (settings.date) {
    updateDate();
    // 日付は1分ごとに更新（日付変更検出のため）
    setInterval(updateDate, 60000);
  }

  // 天気の初期取得と更新開始
  if (settings.weather && config.weather && config.weather.apiKey) {
    fetchAndUpdateWeather();
    // 設定された間隔で天気を更新（デフォルト1時間）
    const refreshMs = (config.weather.refreshSec || 3600) * 1000;
    weatherInterval = setInterval(fetchAndUpdateWeather, refreshMs);
  }
}

// ============================================
// オーバーレイの表示/非表示制御
// ============================================

function updateOverlayVisibility() {
  const overlay = document.getElementById('overlay');
  const dateLine = document.getElementById('date-line');
  const clock = document.getElementById('clock');
  const weather = document.getElementById('weather');

  // 時計・日付・天気のいずれかが有効なら表示
  const shouldShow = settings.clock || settings.date || settings.weather;
  overlay.style.display = shouldShow ? 'block' : 'none';

  // 各要素の表示/非表示
  dateLine.style.display = settings.date ? 'block' : 'none';
  clock.style.display = settings.clock ? 'inline' : 'none';
  weather.style.display = settings.weather ? 'inline' : 'none';
}

// ============================================
// 時計の更新
// ============================================

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const clockElement = document.getElementById('clock');
  clockElement.textContent = `${hours}:${minutes}`;
}

// ============================================
// 日付・曜日の更新
// ============================================

function updateDate() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // 曜日（英語3文字）
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekday = weekdays[now.getDay()];

  const dateElement = document.getElementById('date-line');
  dateElement.textContent = `${month}月${day}日 ${weekday}`;
}

// ============================================
// 天気の取得と更新
// ============================================

async function fetchAndUpdateWeather() {
  if (!config.weather || !config.weather.apiKey) {
    console.warn('天気APIキーが設定されていません');
    return;
  }

  const apiKey = config.weather.apiKey;
  const city = config.weather.city || 'Tokyo';
  const units = config.weather.units || 'metric';

  // OpenWeatherMap API v3 (One Call API 3.0)
  // 注: 無料プランではv2.5のCurrent Weatherを使用
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}&lang=en`;

  try {
    console.log('天気情報取得中...');
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`天気API エラー: ${response.status} ${response.statusText}`);
    }

    weatherData = await response.json();
    console.log('天気情報取得成功:', weatherData);

    updateWeatherDisplay();

  } catch (error) {
    console.error('天気情報取得エラー:', error);
    // エラー時は天気表示を隠す
    const weatherElement = document.getElementById('weather');
    weatherElement.style.display = 'none';
  }
}

// ============================================
// 天気表示の更新
// ============================================

function updateWeatherDisplay() {
  if (!weatherData) return;

  const temp = Math.round(weatherData.main.temp);
  const condition = weatherData.weather[0].main;
  const icon = getWeatherIcon(condition);

  const weatherElement = document.getElementById('weather');
  weatherElement.textContent = `${icon} ${temp}°C`;
  weatherElement.style.display = settings.weather ? 'inline' : 'none';

  console.log(`天気表示更新: ${condition} ${temp}°C`);
}

// ============================================
// 天気アイコンの取得
// ============================================

function getWeatherIcon(condition) {
  const icons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️',
    'Smoke': '🌫️',
    'Dust': '🌫️',
    'Sand': '🌫️',
    'Ash': '🌫️',
    'Squall': '💨',
    'Tornado': '🌪️'
  };

  return icons[condition] || '🌤️';
}

// ============================================
// オーバーレイのクリーンアップ
// ============================================

function cleanupOverlay() {
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
  if (weatherInterval) {
    clearInterval(weatherInterval);
    weatherInterval = null;
  }
}

// ============================================
// フルスクリーン機能
// ============================================

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    // フルスクリーンに入る
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { // Safari
      elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
      elem.msRequestFullscreen();
    }
    console.log('フルスクリーン ON');
  } else {
    // フルスクリーンを解除
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { // Safari
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) { // IE/Edge
      document.msExitFullscreen();
    }
    console.log('フルスクリーン OFF');
  }
}

// フルスクリーン状態の変化を監視してボタンアイコンを更新
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('mozfullscreenchange', updateFullscreenButton);
document.addEventListener('MSFullscreenChange', updateFullscreenButton);

function updateFullscreenButton() {
  const btn = document.getElementById('fullscreen-btn');
  if (btn) {
    if (document.fullscreenElement) {
      btn.textContent = '⛶'; // フルスクリーン中
      btn.title = 'フルスクリーン解除 (Fキー)';
    } else {
      btn.textContent = '⛶'; // 通常
      btn.title = 'フルスクリーン (Fキー)';
    }
  }
}

// ============================================
// モーダル機能（アルバム選択・設定）
// ============================================

// アルバム選択モーダルを開く
function openAlbumModal() {
  const modal = document.getElementById('album-modal');
  const checkboxContainer = document.getElementById('album-modal-checkboxes');

  // チェックボックスを動的生成
  checkboxContainer.innerHTML = '';
  config.albums.forEach(album => {
    const isChecked = settings.albums.includes(album.id);
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox" value="${album.id}" ${isChecked ? 'checked' : ''}>
      <span>${album.label}</span>
    `;
    checkboxContainer.appendChild(label);
  });

  modal.classList.remove('hidden');

  // コントロールバーを非表示
  hideControls();
}

// アルバム選択モーダルを閉じる
function closeAlbumModal() {
  const modal = document.getElementById('album-modal');
  modal.classList.add('hidden');
}

// アルバム選択を適用
function applyAlbumSelection() {
  const checkboxes = document.querySelectorAll('#album-modal-checkboxes input[type="checkbox"]');
  const selectedAlbums = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (selectedAlbums.length === 0) {
    alert('少なくとも1つのアルバムを選択してください');
    return;
  }

  // 設定を更新
  settings.albums = selectedAlbums;
  saveSettings(settings);

  // スライドショーを再起動
  closeAlbumModal();
  restartSlideshow();
}

// モーダル内の「すべて選択」「すべて解除」
function selectAllAlbums(modalId) {
  const checkboxes = document.querySelectorAll(`#${modalId} input[type="checkbox"]`);
  checkboxes.forEach(cb => cb.checked = true);
}

function deselectAllAlbums(modalId) {
  const checkboxes = document.querySelectorAll(`#${modalId} input[type="checkbox"]`);
  checkboxes.forEach(cb => cb.checked = false);
}

// モーダル内のDuration Bar Selectorの選択状態を更新
function updateModalDurationBarSelection(durationSec) {
  const buttons = document.querySelectorAll('.modal-duration-btn');
  buttons.forEach(btn => {
    const btnDuration = parseInt(btn.dataset.duration);
    if (btnDuration === durationSec) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

// 設定モーダルを開く
function openSettingsModal() {
  const modal = document.getElementById('settings-modal');

  // 現在の設定を反映
  updateModalDurationBarSelection(settings.durationSec);
  document.getElementById('modal-shuffle-toggle').checked = settings.shuffle;
  document.getElementById('modal-pairing-toggle').checked = settings.portraitPairing;
  document.getElementById('modal-clock-toggle').checked = settings.clock;
  document.getElementById('modal-date-toggle').checked = settings.date;
  document.getElementById('modal-weather-toggle').checked = settings.weather;
  document.getElementById('modal-fill-screen-toggle').checked = settings.fillScreen;

  modal.classList.remove('hidden');

  // コントロールバーを非表示
  hideControls();
}

// 設定モーダルを閉じる
function closeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  modal.classList.add('hidden');

  // 設定を保存して即座に反映
  const selectedModalDurationBtn = document.querySelector('.modal-duration-btn.selected');
  settings.durationSec = selectedModalDurationBtn ? parseInt(selectedModalDurationBtn.dataset.duration) : 60;
  settings.shuffle = document.getElementById('modal-shuffle-toggle').checked;
  settings.portraitPairing = document.getElementById('modal-pairing-toggle').checked;
  settings.clock = document.getElementById('modal-clock-toggle').checked;
  settings.date = document.getElementById('modal-date-toggle').checked;
  settings.weather = document.getElementById('modal-weather-toggle').checked;
  settings.fillScreen = document.getElementById('modal-fill-screen-toggle').checked;

  saveSettings(settings);

  // 時計・天気の表示/非表示を更新
  updateOverlayVisibility();

  // 表示時間が変更された場合はタイマーをリセット
  if (slideshowEngine) {
    slideshowEngine.settings.durationSec = settings.durationSec;
    slideshowEngine.settings.portraitPairing = settings.portraitPairing;
    slideshowEngine.settings.fillScreen = settings.fillScreen;

    // fillScreenモードの変更を即座に反映
    const container = document.getElementById('image-container');
    if (settings.fillScreen) {
      container.classList.add('fill-screen');
    } else {
      container.classList.remove('fill-screen');
    }
  }

  console.log('設定を更新:', settings);
}

// スライドショーを再起動
function restartSlideshow() {
  console.log('スライドショーを再起動...');

  // 古いスライドショーエンジンを停止
  if (slideshowEngine) {
    slideshowEngine.stopTimer();
  }

  // 画面をクリアして真っ黒にする（前の画像を消す）
  const container = document.getElementById('image-container');
  container.innerHTML = '';
  container.classList.remove('pair-mode', 'fill-screen');

  // 新しい画像リストを構築
  const imageUrls = buildImageUrls(settings.albums);

  if (imageUrls.length === 0) {
    alert('選択されたアルバムに画像がありません');
    return;
  }

  // スライドショーエンジンを再作成
  slideshowEngine = new SlideshowEngine(imageUrls, settings);
  slideshowEngine.start();

  console.log(`スライドショー再起動完了: ${imageUrls.length}枚`);
}

// オーバーレイの表示/非表示を更新
function updateOverlayVisibility() {
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('date-line');
  const weatherEl = document.getElementById('weather');

  if (clockEl) {
    clockEl.style.display = settings.clock ? 'block' : 'none';
  }
  if (dateEl) {
    dateEl.style.display = settings.date ? 'inline' : 'none';
  }
  if (weatherEl) {
    weatherEl.style.display = settings.weather ? 'inline' : 'none';
  }
}

// ============================================
// イベントリスナー登録（モーダル）
// ============================================

// アルバムモーダル
document.getElementById('album-btn')?.addEventListener('click', openAlbumModal);
document.getElementById('cancel-album-modal')?.addEventListener('click', closeAlbumModal);
document.getElementById('apply-album-modal')?.addEventListener('click', applyAlbumSelection);
document.getElementById('modal-select-all')?.addEventListener('click', () => selectAllAlbums('album-modal-checkboxes'));
document.getElementById('modal-deselect-all')?.addEventListener('click', () => deselectAllAlbums('album-modal-checkboxes'));

// 設定モーダル
document.getElementById('settings-btn')?.addEventListener('click', openSettingsModal);
document.getElementById('close-settings-modal')?.addEventListener('click', closeSettingsModal);

// モーダル内のDuration Bar Selectorのイベントリスナー
document.addEventListener('DOMContentLoaded', () => {
  const modalDurationBtns = document.querySelectorAll('.modal-duration-btn');
  modalDurationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // すべての選択を解除
      modalDurationBtns.forEach(b => b.classList.remove('selected'));
      // クリックされたボタンを選択
      btn.classList.add('selected');
    });
  });
});

// ============================================
// デバッグ用
// ============================================

console.log('app.js loaded - Phase 6 (モーダル + フルスクリーン + Fill Screen)');
