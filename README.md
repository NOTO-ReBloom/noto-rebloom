# NOTO Re:Bloom — GitHub Pagesサイト

企業・団体への協賛・地域連携の説明に使える、静的な公式サイトです。HTML / CSS / JavaScriptのみで動き、GitHub Pagesにそのまま公開できます。

## 公開手順（GitHub Pages）

1. GitHubで新しいリポジトリを作成します。例：`noto-rebloom`
2. このフォルダ内のファイルを、リポジトリの**ルート**へすべてアップロードします。
3. GitHubのリポジトリ画面で **Settings → Pages** を開きます。
4. **Build and deployment** を `Deploy from a branch` に設定します。
5. Branchを `main`、Folderを `/ (root)` に設定して **Save** を押します。
6. 数分後、GitHub PagesのURLが表示されます。

## 主な更新箇所

- `index.html`
  - 本文・お知らせ・連絡先・クラウドファンディングのリンク
- `style.css`
  - 色・レイアウト・スマホ表示
- `assets/images/`
  - 紹介資料・画像
- `assets/images/`
  - 企業・団体様向けの説明画像

## 公開前に確認したいこと

- `index.html` の「お知らせ」日付を最新のものに更新
- 連絡先メール・電話番号が正しいか確認
- 掲載画像やロゴの利用許諾を確認
- 独自ドメインを使う場合は、GitHub Pages側でドメインを設定

## 更新例：お知らせを追加する

`index.html` 内の `id="news"` の中に、以下を複製して日付・内容・リンクを置き換えます。

```html
<article>
  <time datetime="2026-07">2026.07</time>
  <div>
    <span class="tag">EVENT</span>
    <h3>ここにお知らせのタイトルを入れます。</h3>
  </div>
  <a href="#" aria-label="詳細を見る">→</a>
</article>
```
