# BOOTH Auto Publish Queue

このディレクトリは、Windows上で動作するBOOTH自動投稿ボット向けのリモートキューです。

- `queue/index.json`: 出品待ち暗号化商品の一覧
- `queue/*.enc.json` / `queue/*.part*.txt`: AES-256-GCMで暗号化された商品パッケージ
- `public/device_public_key.pem`: 商品パッケージ暗号化用の公開鍵

有料商品の本文・画像・ZIP・販売説明はGitHub上へ平文で保存しません。Windows側だけが保持する秘密鍵で復号します。

## 状態の意味

`enabled:true` は「品質確認と暗号化・整合性確認を通過し、Windows投稿ボットが取得してよい」という意味です。**BOOTHへ公開済みという意味ではありません。** 公開商品ページを確認できるまでは、管理データ上も `queued` として扱います。

## Consumer契約

Windows側の投稿ボットは、定期実行ごとに `queue/index.json` を取得し、ローカル `state.json` に成功記録のない `enabled:true` 商品を1件処理します。投稿が成功した場合だけstateへ記録し、失敗した場合は未処理のまま残して次回再試行します。

推奨スケジュールは**30分ごと**です。少なくとも1時間ごとに実行し、制作側より公開側の処理能力が低くならないようにします。READMEに頻度を書くだけでは実際のWindowsタスクを保証できないため、公開待ちが2時間を超えた場合はpublisherのスケジュールまたはconsumer障害として扱います。

## 重要

ChatGPT側の自動制作タスクはキューへ追加するところまでで、Windowsのブラウザセッションを直接操作できません。したがって「キュー投入」と「ストア公開」は別状態として監視します。Windows publisherが正常なら、ユーザーによる商品ごとの承認は不要です。
