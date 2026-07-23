# 第四の寝室 公開版 → Final Candidate 2.18 更新キット

1. このZIPを展開します。
2. GitHubリポジトリ内の既存 `site/` を削除します。
3. `UPLOAD_TO_REPOSITORY_ROOT` **フォルダの中身**をリポジトリ直下へコピーします。
4. ZIPや `UPLOAD_TO_REPOSITORY_ROOT` フォルダそのものを、入れ子のまま置かないでください。
5. 変更をcommit/pushし、Actionsの `Deploy GitHub Pages` が緑色になるまで確認します。
6. 公開後 `/fourth-bedroom/version.json` が `2.18.0` を返すことを確認します。

この更新は `site/` を完全置換します。途中バージョンのパッチを順番に適用する必要はありません。
