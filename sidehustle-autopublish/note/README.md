# note Remote Publish Queue

`queue/index.json` は、品質確認・暗号化・SHA-256整合性確認を通過したnote有料記事のリモート待機キューです。

## 状態

- `enabled:true`: Windows publisherが取得してよい
- `queued`: まだnote公開確認前
- `published`: note上で公開処理成功を記録
- `publicUrlVerified:true`: reader-visibleな公開ページを外部から確認済み

**キュー追加・編集画面URL・PUBLISH_SUCCESSだけで公開済み扱いにはしません。**

## 商品完成条件（v2）

今後のnote有料記事は、本文だけでなく見出し画像まで含めて1商品とします。原則として見出し画像なしの記事は `enabled:true` にしません。

暗号化前の商品JSONは、従来の `title`, `freeBody`, `paidBody`, `tags`, `price` に加えて次を持ちます。

- `coverImageBase64`: 1280×670pxのPNGまたはJPGをBase64化したもの
- `coverImageMime`: `image/png` または `image/jpeg`
- `coverAlt`: 記事内容を正確に説明する短い代替テキスト
- `coverCopy`: 見出し画像上に置いた短い訴求文
- `coverQa`: 画像サイズ、可読性、内容一致、誤字、過度な煽りがないことのQA結果

見出し画像は有料本文と同様に暗号化ペイロード内へ入れ、公開前の販売素材をGitHubへ平文で置かない方針を維持します。

### 見出し画像の品質基準

- 1280×670px（note公式推奨サイズ）を基本とする
- 小さな一覧表示でも意味が伝わる大きな構図・色面を使う
- 画像内テキストは短くし、記事タイトル全文を重複させない
- 記事内容と直接関係するビジュアルだけを使う
- 「絶対」「必ず儲かる」など根拠のない煽りを避ける
- タイトル＋見出し画像を1セットとしてクリック率と購入率の両方を考える
- スマホ表示で重要要素が切れないよう中央セーフエリアを意識する
- 生成画像を使う場合も、誤字・不自然な文字・誤認を招く表現を目視QAする

## Windows consumer要件

consumerは各実行で次を行います。

1. `queue/index.json` を取得
2. `enabled:true` かつ reader-visible公開確認が未完了の商品を1件選択
3. `retryGeneration` / `forceRetryNonce` がローカル最終処理世代より新しい場合、過去のローカル成功stateを無効化して必ず再処理する。`invalidateLocalSuccessWithoutReaderVerification:true` の商品は、reader-visible URLが確認できるまでskipしてはならない
4. `sha256` を検証
5. Windows側だけにあるRSA秘密鍵でAES鍵をRSA-OAEP-SHA256復号
6. AES-256-GCMで記事JSONを復号
7. `title`, `freeBody`, `paidBody`, `tags`, `price`, `coverImageBase64`, `coverImageMime` を再検査
8. `coverImageBase64` を一時PNG/JPGへ復元し、サイズ・容量・MIMEを検証
9. noteに見出し画像をアップロードして設定
10. noteに本文・有料境界・価格・タグを設定
11. 公開直前に見出し画像が設定済みであることを再確認
12. ユーザーの商品別確認なしで公開
13. 公開後は編集画面ではなくreader-visible URLを取得し、匿名/ログアウト相当でタイトル、価格、無料/有料境界、専用見出し画像が実際に表示されることを確認する
14. 本文1枚目の自動サムネイルだけ、無関係画像、明らかな文字崩れ、画像欠落があれば成功扱いにせず補修して再公開確認する
15. 13と14を満たした成功時だけローカルstateへ記録する
16. 失敗時は未処理のまま残し、次回再試行する

見出し画像のアップロードまたは設定に失敗した場合、本文だけを公開して成功扱いにしません。記事品質を守るため、見出し画像込みで再試行します。

## 無料note導線（v3）

無料記事は有料記事の価格0円版として扱わず、有料publisherから完全に分離します。

- 無料queue: `free_queue/index.json`
- 無料publisher: `free_publisher/note-free-bot.mjs.gz.b64`
- Windows導入: `free_publisher/INSTALL_FREE_NOTE_PUBLISHER.cmd`
- Cloud QA: `.github/workflows/note-free-publisher-qa.yml`
- 原稿バッチ: `free_drafts/`

無料記事は検索・発見・信頼形成・需要検証を担い、有料記事は完全手順・テンプレ・再利用可能な実装資産を担います。無料記事を公開しても `publication_quota.json` の有料note debtは1件も減らしません。

### 無料記事の厳格公開条件

次の4項目をすべて満たして初めてnote無料記事を公開済みとします。

1. 一般読者向け `https://note.com/.../n/...` URLが取得できる
2. タイトルがqueueと完全一致する
3. 有料価格・購入導線が表示されず、無料記事であることを確認できる
4. 専用の1280×670見出し画像が実ページに表示される

編集画面、公開ボタン押下、ローカル成功ログ、検索結果だけでは成功扱いにしません。

### 無料publisherの安全設計

- `kind:"free"` かつ `price:0` 以外を拒否する
- 公開設定で無料モードを明示的に選択する
- 価格入力欄が残っている場合は公開を中止する
- 記事ごとに専用1280×670 PNGをローカル生成する
- `関連有料候補:` など内部管理文を本文から除去する
- reader-visible確認済みでない有料URLを推測してCTAに入れない
- 有料publisherとは別のstate/lockを持ち、相互に成功判定を汚染しない
- 一記事失敗してもログイン喪失以外は次候補へ進む

初回無料バッチは6本を準備済みで、Cloud QAはruntime SHA-256、JavaScript構文、6件queue、原稿抽出、内部管理文除去、paid ID対応、公開済みsource insight、installer契約まで検証します。note.comへの実公開だけはWindows側の認証済みChrome profileを使用します。

### 無料記事の運用・計測

- 初期は14日間、2本/日程度を公開頻度の実験値とする
- 原稿制作は4〜10本程度をまとめてバッチ化してよい
- 24h / 72h / 7dで取得できるPV・スキ・フォロー・関連有料クリック・購入を比較する
- 無料記事は単なる広告にせず、それ単体で実用価値を完結させる
- CTAは原則1記事1本、内容が一致するreader-visible確認済み有料記事だけに向ける
- 無料で流入があるのに有料転換が弱い場合は、派生量産前にCTA・価値差・テーマ一致・価格を検証する
- 無料も有料も反応が弱いテーマを名前違いで量産しない

## 長期無人運用要件

Windows側は30分ごとのconsumer実行に加えて、次を満たすことを推奨します。

- BOOTHと同時刻にChromeを起動しないよう実行時刻をずらす
- 二重起動を防ぐロックを持つ
- 異常終了で残った古いロックを自動解除する
- ブラウザ処理が一定時間を超えた場合はタイムアウトさせる
- ログをローテーションして無制限に肥大化させない
- 連続失敗回数、最終正常実行、最終公開成功をローカルhealth stateへ記録する
- 連続失敗時は利用者が気付ける警告を出す
- 公開処理成功と公開URL確認を別状態として扱い、公開URLを定期再確認する
- 公開URL確認では見出し画像の表示有無も検証する
- タスクが削除・無効化された場合に再作成・再有効化するself-healを持つ
- Windowsログイン時にもself-healを起動し、再起動後の復旧性を確保する

有料publisherの推奨実行頻度は30分ごとです。無料publisherは初期運用として08:05/17:05へずらし、BOOTH・有料noteとのChrome競合を避けます。公開待ちが2時間を超えた場合、承認待ちではなくpublisher/consumer障害または公開確認遅延として扱い、6時間超または複数回連続で解消しない場合は重大なパイプライン障害として扱います。

## 旧publisherとの違い

旧 `note-bot-v4.mjs` は `config.json` のローカルCSVを読み、GitHubの暗号化キューを読みません。新規有料キューを自動公開するにはremote queue consumerが必要です。

有料v2以降はremote queue consumerが見出し画像の復号・一時ファイル化・アップロード・reader-visible表示確認まで対応して初めて完成です。無料v3はこれとは別経路で、free queue、無料モード検証、専用cover生成、匿名reader-visible検証までを一体化します。
