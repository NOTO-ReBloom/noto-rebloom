# GitHub Pages 反映手順

この完成版は、GitHubリポジトリの**最上位（ルート）に全ファイルを置く構成**です。

## 1. バックアップ
現在のGitHubリポジトリで `Code` → `Download ZIP` を押し、現行版を保存します。

## 2. 完成版をアップロード
1. このZIPを解凍します。
2. 解凍したフォルダを開き、中のファイルをすべて選択します。
3. GitHubのリポジトリで `Add file` → `Upload files` を開きます。
4. 選択したファイルをすべてドラッグ＆ドロップします。
5. コミットメッセージを `Rebuild NOTO ReBloom website` とし、`Commit changes` を押します。

外側のフォルダやZIPそのものはアップロードしません。`index.html`、`site.css`、`site.js`、画像ファイルがリポジトリ直下に並ぶ状態が正解です。

## 3. 公開後の確認
反映には数分かかることがあります。公開後、次のページを確認します。

- `https://noto-rebloom.github.io/noto-rebloom/index.html`
- `https://noto-rebloom.github.io/noto-rebloom/learn.html`
- `https://noto-rebloom.github.io/noto-rebloom/event.html`
- `https://noto-rebloom.github.io/noto-rebloom/partner.html`
- `https://noto-rebloom.github.io/noto-rebloom/diagnosis.html`

古い表示が残る場合は、Windowsでは `Ctrl + Shift + R`、スマートフォンではシークレットタブで再確認します。

## 4. 最低限の動作確認
- トップの写真が縦横比を保って表示される
- 「耕作放棄地を知る」が `learn.html` へ移動する
- 参加ボタンがイベント参加フォームへ移動する
- 法人・団体ボタンが協賛・連携フォームへ移動する
- 花タイプ診断を最後まで進められる
- スマートフォンで横スクロールが発生しない

## 5. 旧ファイル
旧 `style.css`、`script.js`、未使用画像が残っていても、新版から参照していなければ表示には影響しません。新サイトの正常表示を確認した後に整理してください。
