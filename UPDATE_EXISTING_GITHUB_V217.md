# GitHub更新手順 V2.17

1. 現在のリポジトリをバックアップする。
2. 差分ZIPを展開する。
3. ZIP内の内容をリポジトリ直下へ上書きする。
4. `node scripts/validate-site.mjs`を実行する。
5. `git add -A && git commit -m "Fix title launch controls for v2.17" && git push`。
6. GitHub ActionsのPagesデプロイ成功を確認する。
7. 公開ページで`VERSION 2.17.0`と、画面下部の`調査を始める`を確認する。
8. 旧Service Worker対策として一度強制再読込する。
