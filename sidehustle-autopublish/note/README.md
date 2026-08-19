# note Remote Publish Queue

`queue/index.json` は、品質確認・暗号化・SHA-256整合性確認を通過したnote有料記事のリモート待機キューです。

## 状態

- `enabled:true`: Windows publisherが取得してよい
- `queued`: まだnote公開確認前
- `published`: note上で公開処理成功を記録
- `publicUrlVerified:true`: 公開ページを外部から確認済み

**キュー追加だけで公開済み扱いにはしません。**

## Windows consumer要件

consumerは各実行で次を行います。

1. `queue/index.json` を取得
2. ローカル成功stateに未記録の `enabled:true` を1件選択
3. `sha256` を検証
4. Windows側だけにあるRSA秘密鍵でAES鍵をRSA-OAEP-SHA256復号
5. AES-256-GCMで記事JSONを復号
6. `title`, `freeBody`, `paidBody`, `tags`, `price` を再検査
7. noteに本文・有料境界・価格・タグを設定
8. ユーザーの商品別確認なしで公開
9. 成功時だけローカルstateへ記録
10. 失敗時は未処理のまま残し、次回再試行

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
- タスクが削除・無効化された場合に再作成・再有効化するself-healを持つ
- Windowsログイン時にもself-healを起動し、再起動後の復旧性を確保する

推奨実行頻度は30分ごとです。公開待ちが2時間を超えた場合、承認待ちではなくpublisher/consumer障害または公開確認遅延として扱い、6時間超または複数回連続で解消しない場合は重大なパイプライン障害として扱います。

## 旧publisherとの違い

旧 `note-bot-v4.mjs` は `config.json` のローカルCSVを読み、GitHubの暗号化キューを読みません。新規キューを自動公開するにはremote queue consumerが必要です。
