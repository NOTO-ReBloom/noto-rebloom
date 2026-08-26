(()=>{
  'use strict';
  if(document.documentElement.dataset.rbParticipantFinal==='1') return;
  document.documentElement.dataset.rbParticipantFinal='1';

  const JOIN_URL='https://forms.gle/6ZMrhrhtWmBCQViD8';
  const CONTACT='mailto:infonotorebloom@gmail.com';
  const MAP_URL='https://www.google.com/maps/search/?api=1&query=%E6%97%A7%E4%B8%8A%E9%BB%92%E4%B8%B8%E5%B0%8F%E4%B8%AD%E5%AD%A6%E6%A0%A1+%E7%8F%A0%E6%B4%B2%E5%B8%82%E8%8B%A5%E5%B1%B1%E7%94%BA%E4%B8%8A%E9%BB%92%E4%B8%B810-34';

  const style=document.createElement('style');
  style.id='rb-participant-final-style';
  style.textContent=`
    .rb-participant-guide{padding:72px 24px;background:#fffdf8}
    .rb-participant-guide>.container,.rb-participant-guide .rb-pg-inner{max-width:1180px;margin:0 auto}
    .rb-pg-head,.rb-participant-guide__head{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(260px,.75fr);gap:32px;align-items:end;margin-bottom:28px}
    .rb-pg-head h2,.rb-participant-guide__head h2{margin:8px 0 0;font-size:clamp(30px,4vw,52px);line-height:1.12;letter-spacing:-.03em}
    .rb-pg-head>p,.rb-participant-guide__head>p{margin:0;line-height:1.9;color:#50605b}
    .rb-pg-label{margin:0;font-size:12px;font-weight:900;letter-spacing:.12em;color:#6f4b8d}
    .rb-pg-grid,.rb-guide-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
    .rb-pg-card,.rb-guide-item{border:1px solid rgba(24,75,61,.14);border-radius:18px;padding:20px;background:#fff;min-height:165px}
    .rb-pg-card small,.rb-guide-item small{display:inline-flex;align-items:center;gap:6px;margin-bottom:12px;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:900;letter-spacing:.08em;background:#eaf4ed;color:#245441}
    .rb-pg-card h3,.rb-guide-item strong{display:block;margin:0 0 8px;font-size:20px;line-height:1.35;color:#1f332c}
    .rb-pg-card p,.rb-guide-item p{margin:0;line-height:1.75;color:#50605b;font-size:14px}
    .rb-pg-card--pending{background:#fbf8ff;border-color:rgba(111,75,141,.2)}
    .rb-pg-card--pending small{background:#eee7f5;color:#6f4b8d}
    .rb-pg-access{margin-top:18px;padding:22px;border-radius:18px;background:#eef6f1;border:1px solid rgba(24,75,61,.14)}
    .rb-pg-access h3{margin:0 0 8px;font-size:21px}.rb-pg-access p{margin:7px 0;line-height:1.75;color:#40534c}
    .rb-pg-actions,.rb-guide-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
    .rb-pg-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 16px;border-radius:999px;text-decoration:none;font-weight:800}
    .rb-pg-actions .rb-pg-primary{background:#184b3d;color:#fff}.rb-pg-actions .rb-pg-secondary{background:#fff;color:#184b3d;border:1px solid rgba(24,75,61,.22)}
    .rb-pg-note,.rb-guide-note{margin-top:18px;padding:16px 18px;border-left:4px solid #6f4b8d;background:#fbf8ff;border-radius:0 12px 12px 0;line-height:1.75;color:#4d4554}
    .rb-pg-note strong{color:#6f4b8d}
    .rb-participant-guide__groups{display:grid;gap:18px}
    .rb-guide-panel{padding:22px;border:1px solid rgba(24,75,61,.14);border-radius:20px;background:#fff}
    .rb-guide-panel--pending{background:#fbf8ff;border-color:rgba(111,75,141,.2)}
    .rb-guide-panel__label{display:inline-flex;margin-bottom:14px;padding:6px 10px;border-radius:999px;background:#eaf4ed;color:#245441;font-size:12px;font-weight:900;letter-spacing:.04em}
    .rb-guide-panel--pending .rb-guide-panel__label{background:#eee7f5;color:#6f4b8d}
    .rb-guide-panel .rb-guide-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
    @media(max-width:900px){.rb-pg-head,.rb-participant-guide__head{grid-template-columns:1fr;gap:12px}.rb-pg-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.rb-guide-panel .rb-guide-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:620px){.rb-participant-guide{padding:52px 18px}.rb-pg-grid,.rb-guide-panel .rb-guide-grid{grid-template-columns:1fr}.rb-pg-card,.rb-guide-item{min-height:0;padding:18px}.rb-guide-panel{padding:16px}}
  `;
  document.head.appendChild(style);

  const eventSection=()=>{
    if(!document.body.classList.contains('nr-new-event')||document.querySelector('#participant-readiness')) return;
    const summary=document.querySelector('.event-summary');
    if(!summary) return;
    const section=document.createElement('section');
    section.className='rb-participant-guide';
    section.id='participant-readiness';
    section.innerHTML=`
      <div class="rb-pg-inner">
        <div class="rb-pg-head">
          <div><p class="rb-pg-label">BEFORE YOU JOIN / 参加前に</p><h2>服装・着替え・アクセスを<br>先に確認できます。</h2></div>
          <p>決まっていることと、まだ最終調整中のことを分けて掲載しています。未定事項は確定次第、このページで更新します。</p>
        </div>
        <div class="rb-pg-grid">
          <article class="rb-pg-card"><small>確定</small><h3>田んぼの中は裸足</h3><p>競技は裸足で行います。長靴は不要です。田んぼの外を移動するための履物は各自でご用意ください。</p></article>
          <article class="rb-pg-card"><small>確定</small><h3>水着はおすすめ・必須ではありません</h3><p>水着の上にTシャツなど、泥がついてもよい服を着るのがおすすめです。水着の着用は必須ではありません。</p></article>
          <article class="rb-pg-card"><small>確定</small><h3>更衣スペースを用意します</h3><p>競技後に着替えられる場所を設けます。着替え・タオル・汚れた衣類を入れる袋をご持参ください。</p></article>
          <article class="rb-pg-card"><small>確定</small><h3>泥は水で落とせます</h3><p>会場で泥を水で流せるように準備します。シャワー設備ではなく、簡易的に泥を落とすための水洗いを想定しています。</p></article>
          <article class="rb-pg-card"><small>確定</small><h3>車での来場をおすすめします</h3><p>9月20日は日曜日です。上黒丸・洲巻口を通る「すずバス 若山飯田ルート」は土日運休のため、公共交通だけでの来場は難しい状況です。</p></article>
          <article class="rb-pg-card rb-pg-card--pending"><small>調整中</small><h3>トイレ</h3><p>現時点では会場用トイレを確保できていません。利用場所を調整し、確定次第こちらで案内します。</p></article>
        </div>
        <div class="rb-pg-access">
          <h3>アクセス・駐車について</h3>
          <p><strong>会場：</strong>石川県珠洲市若山町洲巻の田んぼ。田んぼの近くに駐車できる場所を設ける予定です。</p>
          <p><strong>目印：</strong>旧上黒丸小中学校（珠洲市若山町上黒丸10-34）周辺。最終的な集合場所・駐車位置・台数・誘導方法は調整中です。</p>
          <p><strong>公共交通：</strong>すずバス「若山飯田ルート」は平日に上黒丸・洲巻口を通りますが、現在の時刻表では土・日曜日は運休です。当日はお車での来場をおすすめします。</p>
          <div class="rb-pg-actions"><a class="rb-pg-primary" href="${JOIN_URL}" target="_blank" rel="noopener">無料で参加申込</a><a class="rb-pg-secondary" href="${MAP_URL}" target="_blank" rel="noopener">旧上黒丸小中学校を地図で見る ↗</a><a class="rb-pg-secondary" href="${CONTACT}">アクセスを相談する</a></div>
        </div>
        <div class="rb-pg-note"><strong>まだ確定していないこと：</strong> 旧上黒丸小中学校周辺を含む駐車場所の最終確定、駐車可能台数・誘導方法、トイレの利用場所。これらは決まり次第更新します。</div>
      </div>`;
    summary.insertAdjacentElement('afterend',section);

    const faqGrid=document.querySelector('#event-faq .faq-grid');
    if(faqGrid&&!faqGrid.querySelector('[data-rb-final-faq]')){
      faqGrid.insertAdjacentHTML('beforeend',`
        <article class="faq-card" data-rb-final-faq="1"><div class="q">どんな服装がいいですか？</div><p>水着の上にTシャツなど、泥がついてもよい服がおすすめです。水着は必須ではありません。</p></article>
        <article class="faq-card" data-rb-final-faq="1"><div class="q">靴や長靴は必要ですか？</div><p>田んぼの中は裸足で競技します。長靴は不要です。田んぼの外で履くものは各自ご用意ください。</p></article>
        <article class="faq-card" data-rb-final-faq="1"><div class="q">着替えや泥落としはできますか？</div><p>更衣スペースを用意し、泥を水で流せるように準備します。着替え・タオル・汚れ物を入れる袋をご持参ください。</p></article>
        <article class="faq-card" data-rb-final-faq="1"><div class="q">車を停められますか？</div><p>田んぼ周辺に駐車場所を設ける予定です。最終的な場所・台数・誘導方法は調整中で、確定次第案内します。</p></article>
        <article class="faq-card" data-rb-final-faq="1"><div class="q">公共交通で行けますか？</div><p>上黒丸・洲巻口を通るすずバス若山飯田ルートは現在、土・日曜日が運休です。9月20日は日曜日のため、お車での来場をおすすめします。</p></article>
        <article class="faq-card" data-rb-final-faq="1"><div class="q">トイレはありますか？</div><p>現在、利用場所を調整中です。確保でき次第、このページで案内します。</p></article>`);
    }
  };

  const run=()=>eventSection();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();