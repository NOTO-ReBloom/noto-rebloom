# BOOTH Auto Publish Queue

このディレクトリは、Windows上で動作するBOOTH自動投稿ボット向けのリモートキューです。

- `queue/index.json`: 出品待ち暗号化商品の一覧
- `queue/*.enc.json`: AES-256-GCMで暗号化された商品パッケージ
- `public/device_public_key.pem`: 商品パッケージ暗号化用の公開鍵

有料商品の本文・画像・ZIP・販売説明はGitHub上へ平文で保存しません。Windows側だけが保持する秘密鍵で復号します。

自動投稿ボットは1時間ごとに`index.json`を確認し、`state.json`に未記録の商品を最大1件だけBOOTHへ投稿します。