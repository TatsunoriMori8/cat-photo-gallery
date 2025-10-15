# 📸 画像追加ワークフロー

## 現在の仕組み

### images.jsonとは？

`data/images.json` は**画像マニフェストファイル**で、全アルバムの画像一覧を記録しています。

```json
{
  "Nohn": [
    "image001.jpg",
    "image002.webp",
    ...
  ],
  "ぽんちょねこ": [
    "cat001.jpg",
    ...
  ]
}
```

このファイルは**JavaScriptが画像を読み込むために必要**です。
GitHub Pagesは静的サイトなので、サーバー側でディレクトリを動的に読み取ることができません。そのため、事前に画像リストを生成しておく必要があります。

---

## 画像を5枚追加する場合の手順（現状）

**❌ 現状：2ステップ必要**

```bash
# 1. 画像をアルバムフォルダに追加
cp ~/Downloads/*.jpg albums/Nohn/

# 2. images.jsonを再生成（手動実行）
python3 scripts/generate_manifest.py

# 3. GitHubにプッシュ
git add albums/ data/images.json
git commit -m "Add 5 new images"
git push
```

**問題点：**
- 画像追加のたびに `generate_manifest.py` を手動実行する必要がある
- 実行し忘れるとスライドショーに新しい画像が表示されない

---

## 解決策：自動化オプション

### オプション1: GitHub Actions（推奨）

GitHubに画像をプッシュすると**自動的に**images.jsonが更新されます。

#### メリット
- ✅ 完全自動化：画像を追加してpushするだけ
- ✅ 実行忘れゼロ
- ✅ GitHub上で完結（ローカル環境不要）

#### デメリット
- GitHub Actionsの設定が必要（初回のみ）

#### 実装方法

`.github/workflows/update-manifest.yml` を作成：

```yaml
name: Update Images Manifest

on:
  push:
    paths:
      - 'albums/**'  # albumsフォルダ内の変更を検知

jobs:
  update-manifest:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Generate images.json
        run: python3 scripts/generate_manifest.py

      - name: Commit and push if changed
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add data/images.json
          git diff --quiet && git diff --staged --quiet || \
            (git commit -m "Auto-update images.json [skip ci]" && git push)
```

**使い方：**
```bash
# 画像を追加してプッシュするだけ
cp ~/Downloads/*.jpg albums/Nohn/
git add albums/Nohn/
git commit -m "Add 5 new cat photos"
git push

# → GitHub Actionsが自動でimages.jsonを更新してコミット
```

---

### オプション2: Git Hooks（ローカル自動化）

コミット前に自動実行されるスクリプトを設定。

#### メリット
- ✅ ローカルで完結
- ✅ プッシュ前に自動生成

#### デメリット
- ❌ 各PC/環境で個別に設定が必要
- ❌ 他の人が画像を追加する際も設定が必要

#### 実装方法

`.git/hooks/pre-commit` を作成：

```bash
#!/bin/bash
# albums/に変更があればimages.jsonを自動生成

if git diff --cached --name-only | grep -q '^albums/'; then
    echo "🔄 Regenerating images.json..."
    python3 scripts/generate_manifest.py
    git add data/images.json
    echo "✅ images.json updated"
fi
```

---

### オプション3: 手動実行スクリプト（簡易版）

毎回実行するシェルスクリプトを用意。

#### メリット
- ✅ シンプル
- ✅ 設定不要

#### デメリット
- ❌ 実行忘れのリスクあり

#### 実装方法

`scripts/add_images.sh` を作成：

```bash
#!/bin/bash
# 画像追加→マニフェスト生成→コミット を一括実行

echo "📸 Images added. Updating manifest..."
python3 scripts/generate_manifest.py

echo "✅ Ready to commit"
echo ""
echo "Run:"
echo "  git add albums/ data/images.json"
echo "  git commit -m 'Add new images'"
echo "  git push"
```

**使い方：**
```bash
# 画像追加後に実行
./scripts/add_images.sh
```

---

## 推奨ワークフロー

**GitHub Actionsによる完全自動化**を推奨します。

### 理由
1. **人的ミスゼロ**：実行忘れがない
2. **複数人対応**：他の人が画像を追加しても自動適用
3. **メンテナンスフリー**：一度設定すれば永続的に動作

### 設定手順

```bash
# 1. GitHub Actionsワークフローを作成
mkdir -p .github/workflows
# （上記のYAMLファイルを作成）

# 2. コミット＆プッシュ
git add .github/workflows/update-manifest.yml
git commit -m "Add auto-update workflow for images.json"
git push

# 3. 完了！以降は画像をpushするだけ
```

---

## よくある質問

### Q1: 画像を追加したのにスライドショーに表示されない
**A:** images.jsonが更新されていない可能性があります。
```bash
python3 scripts/generate_manifest.py
git add data/images.json
git commit -m "Update images.json"
git push
```

### Q2: HEIC形式の画像を追加したい
**A:** まずWebPに変換してから追加してください。
```bash
# 1. HEIC→WebP変換
python3 scripts/convert_heic_to_webp.py

# 2. マニフェスト更新（自動実行される）
# 3. コミット
git add albums/ data/images.json
git commit -m "Add new images (converted from HEIC)"
git push
```

### Q3: 画像を削除した場合は？
**A:** 同様にimages.jsonの更新が必要です。GitHub Actionsなら自動適用されます。

---

## まとめ

| 方法 | 自動化レベル | 推奨度 |
|------|------------|--------|
| **GitHub Actions** | ★★★★★ 完全自動 | ⭐⭐⭐⭐⭐ |
| Git Hooks | ★★★☆☆ ローカル自動 | ⭐⭐⭐☆☆ |
| 手動スクリプト | ★☆☆☆☆ 手動実行 | ⭐⭐☆☆☆ |
| generate_manifest.py直接実行 | ☆☆☆☆☆ 完全手動 | ⭐☆☆☆☆ |

**推奨：GitHub Actions を導入して完全自動化**
