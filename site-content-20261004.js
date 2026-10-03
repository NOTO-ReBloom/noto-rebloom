/* NOTO Re:Bloom site content data
   日々の更新は原則このファイルだけを編集します。
   - currentStatus: トップ「現在の状況」
   - journal: 活動ジャーナル
*/
window.RB_CONTENT = Object.freeze({
  currentStatus: Object.freeze({
    heading: "9月20日の一日を、次の活動につなげています。",
    lead: "泥ん子運動会2026は終了しました。開催後の記録を残しながら、今回できたつながりを次の活動へ引き継いでいます。",
    items: Object.freeze([
      Object.freeze({
        label: "イベント",
        title: "開催終了",
        description: "2026年9月20日の開催レポートと活動動画を公開中",
        href: "report.html",
        linkLabel: "開催レポート"
      }),
      Object.freeze({
        label: "土地",
        title: "2027年春へ",
        description: "今回使用した土地はレンコン栽培への活用を予定",
        href: "learn.html",
        linkLabel: "土地と企画"
      }),
      Object.freeze({
        label: "次へ",
        title: "次の活動を検討中",
        description: "今回の手順や失敗も残し、次の運営者へ引き継ぎます",
        href: "thoughts.html",
        linkLabel: "活動の考え方"
      }),
      Object.freeze({
        label: "連携",
        title: "連携相談を受付中",
        description: "企業・団体・地域との今後の連携相談を受け付けています",
        href: "partner.html",
        linkLabel: "協賛・協力"
      })
    ])
  }),
  journal: Object.freeze([
    Object.freeze({
      date: "2026-10-04",
      category: "動画",
      title: "活動動画が完成しました",
      description: "泥ん子運動会2026の当日の様子をまとめた動画を公開しました。写真だけでは伝わりにくい、田んぼの空気や参加者の表情も見ることができます。",
      href: "https://youtu.be/320Msvza8g0",
      linkLabel: "YouTubeで見る"
    }),
    Object.freeze({
      date: "2026-10-01",
      category: "掲載",
      title: "Mebaellでの掲載が始まりました",
      description: "団体・活動を紹介するMebaellにNOTO Re:Bloomの掲載が始まりました。活動を知ってもらう入口を少しずつ増やしています。",
      href: "https://mebaell.com/org-noto-re-bloom",
      linkLabel: "掲載ページを見る"
    }),
    Object.freeze({
      date: "2026-09-20",
      category: "開催",
      title: "泥ん子運動会2026を開催しました",
      description: "珠洲市若山町洲巻の田んぼで、5つの泥競技とRe:Bloomレンゲカップを実施しました。競技参加者15名、見学を含め約30名が会場に集まりました。",
      href: "report.html",
      linkLabel: "開催レポート"
    }),
    Object.freeze({
      date: "2026-09-19",
      category: "発表",
      title: "RE-BOOST STUDIOで活動を発表",
      description: "金沢香林坊で、これまでの活動と翌日に控えた泥ん子運動会について発表しました。",
      href: "https://reboost-studio.jp/",
      linkLabel: "RE-BOOST STUDIO"
    }),
    Object.freeze({
      date: "2026-08-15",
      category: "支援",
      title: "クラウドファンディングを終了",
      description: "10名の方から合計186,000円のご支援をいただきました。いただいた支援を9月20日の開催へつなげました。",
      href: "https://readyfor.jp/projects/kousakuhoukiti-saisei",
      linkLabel: "READYFORを見る"
    })
  ])
});
