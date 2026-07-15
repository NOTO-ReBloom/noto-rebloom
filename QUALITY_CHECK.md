# 品質確認記録

確認日：2026-07-15

## 構文・参照
- `site.js`：Node.js構文チェック済み
- `diagnosis.js`：Node.js構文チェック済み
- HTML 6ページ：重複IDなし
- CSS・JavaScript・画像のローカル参照切れなし
- 差し替え用の「〇〇」「TODO」等なし

## 写真
- トップ、耕作放棄地、イベント、法人、診断ページの主要写真を確認
- 画像とキャプションの重なりは0px
- キャプションをabsolute配置から通常フローへ変更
- 画像は高さ固定による引き伸ばしを行わない

## 花タイプ診断
- 56問をキーボードのみで完了できることを確認
- 診断結果の表示を確認
- 4つの花グループ説明、花ごとの長文アドバイス、3つの実践項目を確認
- 32種類の花データと4グループの対応を確認

## 導線
- イベント参加フォーム：`https://forms.gle/6ZMrhrhtWmBCQViD8`
- 協賛・連携フォーム：`https://forms.gle/cRdr2oa2pxBhrFE3A`
- READYFOR：`https://readyfor.jp/projects/kousakuhoukiti-saisei`
- 法人ページのメール導線：`infonotorebloom@gmail.com`

## 公開後の確認
GitHub Pages反映後、PCとスマートフォンで以下を再確認してください。
1. 写真の表示とキャプション位置
2. 花タイプ診断の1・2・3キー操作
3. 参加・協賛フォームの遷移
4. 法人ページの印刷・PDF保存ボタン
5. 強制再読み込み後のCSS反映
