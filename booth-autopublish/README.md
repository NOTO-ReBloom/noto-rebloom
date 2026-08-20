# BOOTH Auto Publish Queue

このディレクトリは、Windows上で動作するBOOTH自動投稿ボット向けのリモートキューです。

- `queue/index.json`: 出品待ち暗号化商品の一覧
- `queue/*.enc.json` / `queue/*.part*.txt`: AES-256-GCMで暗号化された商品パッケージ
- `public/device_public_key.pem`: 商品パッケージ暗号化用の公開鍵
- `monitor/publication_ledger.json`: buyer-visible公開を独立確認できた商品の正本台帳
- `monitor/recovery_control.json`: 未公開滞留時の強制再試行・復旧指示

有料商品の本文・画像・ZIP・販売説明はGitHub上へ平文で保存しません。Windows側だけが保持する秘密鍵で復号します。

## 状態の意味

`enabled:true` は「品質確認と暗号化・整合性確認を通過し、Windows投稿ボットが取得してよい」という意味です。**BOOTHへ公開済みという意味ではありません。** 公開商品ページを確認できるまでは、管理データ上も `queued` として扱います。

## Consumer契約

Windows側の投稿ボットは定期実行ごとに次を行います。

1. `queue/index.json` と `monitor/publication_ledger.json` と `monitor/recovery_control.json` を取得する。
2. `enabled:true` かつ、ledgerに同一canonical queue IDの `publicUrlVerified:true` がない商品を未公開として扱う。
3. ローカル `state.json` に成功記録があっても、ledgerにbuyer-visible確認がなければ公開済み扱いせず、`invalidateLocalSuccessWithoutVerifiedLedger:true` またはactive recoveryがあれば再処理する。
4. `forceRetryNonce` / `retryGeneration` がローカル最終処理世代より新しければ必ず再処理する。
5. chunksをindex記載順に連結し、復号前にSHA-256がindex記載値と完全一致することを確認する。不一致なら投稿せず次回再試行する。
6. Windows側だけにあるRSA秘密鍵でAES鍵をRSA-OAEP-SHA256復号し、AES-256-GCMで商品パッケージを復号する。
7. 同一タイトルの既存draft / 非公開itemがあれば、新規作成より先にそのitemを復旧・公開する。404、壊れたdraft、内容不一致などでbuyer-visibleにできない場合だけclean rebuildを行う。
8. タイトル、価格、商品説明、ダウンロードファイル、プレビュー画像等を検証しBOOTHへ公開する。
9. 管理画面で成功しても完了扱いにせず、ログアウト/匿名ブラウザ相当で実URLを開き、HTTP成功、完全一致タイトル、期待価格、ダウンロード商品状態、購入導線を確認する。
10. 9を満たした場合だけローカルstateへ成功記録し、GitHub側publication ledgerへqueueId、itemId、実URL、verifiedAt、verificationEvidenceを返す。失敗時は未処理のまま残す。

## Recovery契約

`monitor/recovery_control.json` にactiveRecoveryがある間、そのqueueIdを他の新規商品より最優先する。clearConditionを満たすまで勝手に成功扱いしない。`forceRetry:true` は通常のローカル成功stateによるskipを上書きする。

## 長期無人運用要件

推奨スケジュールは**30分ごと**です。加えてWindows側は次を持ちます。

- noteと同時刻にChromeを起動しないよう実行時刻をずらす
- 二重起動防止ロックと古いロックの自動解除
- ブラウザ処理のタイムアウト監視
- ログローテーション
- 連続失敗回数、最終正常実行、最終公開成功を保持するhealth state
- 連続失敗時のローカル警告
- 管理画面での公開成功と、購入者から見える公開URL確認を別状態として扱う
- 公開URLを定期再確認するverifier
- タスクが削除・無効化された場合に再作成・再有効化するself-heal
- Windowsログイン時のself-heal fallback

少なくとも1時間ごとにconsumerが動き、制作側より公開側の処理能力が低くならないようにします。公開待ちが2時間を超えた場合はpublisher/consumer障害または公開確認遅延として扱い、6時間超または複数回の監視で解消しない場合は重大なパイプライン障害として扱います。

## 重要

キュー投入とストア公開は別状態です。Windows publisherが正常なら商品ごとのユーザー承認は不要です。人間本人にしか解決できない再ログイン、2段階認証、CAPTCHA、本人確認、OS権限が実際に確認された場合だけユーザー介入を要求します。
