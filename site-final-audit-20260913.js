(()=>{
  'use strict';
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const OFFICIAL_GAMES='親子お宝ハンター＆玉入れ、泥んこ綱引き、泥んこバケツリレー、泥んこ手押し相撲、泥んこドッジボール';

  const ensureFooterFacts=()=>{
    const footer=document.querySelector('.site-footer');
    if(!footer) return;
    const text=(footer.textContent||'');
    if(!text.includes('北國新聞社・MRO北陸放送')){
      const line=document.createElement('div');
      line.className='rb-current-footer-facts';
      line.style.cssText='box-sizing:border-box;width:min(1120px,calc(100% - 40px));margin:12px auto 0;padding:12px 0 0;border-top:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.76);font-size:12px;line-height:1.7';
      line.textContent='後援：北國新聞社・MRO北陸放送';
      footer.appendChild(line);
    }
  };

  const fixPartnerHeader=()=>{
    if(page!=='partner.html') return;
    document.querySelectorAll('.header-actions a').forEach(a=>{
      if((a.textContent||'').trim()==='協賛について相談') a.textContent='今後の連携を相談';
    });
  };

  const fixHome=()=>{
    if(page!=='index.html') return;
    const facts=document.querySelector('#visual-day .join-facts');
    if(facts){
      facts.innerHTML=`<div class="join-fact"><small>GAMES</small><strong>5種目</strong><span>お宝ハンター・綱引き・バケツリレー・手押し相撲・ドッジボール</span></div><div class="join-fact"><small>TAKE HOME</small><strong>レンゲ</strong><span>カップを作って持ち帰る</span></div><div class="join-fact"><small>DRINK</small><strong>水分補給</strong><span>アクエリアスをご用意する予定</span></div><div class="join-fact"><small>FIELD</small><strong>約1,000㎡</strong><span>洲巻の田んぼが会場</span></div>`;
      const action=facts.nextElementSibling;
      const b=action?.querySelector('b');
      const span=action?.querySelector('span');
      if(b) b.textContent='5つの泥競技と、持ち帰れるレンゲカップ。';
      if(span) span.textContent='親子お宝ハンター＆玉入れ、綱引き、バケツリレー、手押し相撲、ドッジボールを行います。';
    }
    const hero=document.querySelector('.nr-home-hero .hero-lead');
    if(hero) hero.textContent='9月20日、珠洲市若山町洲巻で「泥ん子運動会2026」を開催。約1,000㎡の田んぼで5つの泥競技を楽しみ、最後はレンゲカップを持ち帰ります。';
  };

  const fixEvent=()=>{
    if(page!=='event.html') return;
    const hero=document.querySelector('.page-hero--event h1 + p,.page-hero--event .page-hero-grid > div > h1 + p');
    if(hero) hero.textContent='使われなくなった土地を、みんなが集まり、笑い合える場所へ。珠洲市若山町洲巻の田んぼで、子どもから大人まで泥の中で思いっきり遊ぶ一日です。5つの正式競技と、当日の来場・着替え・泥落としの方法が決まっています。';

    document.querySelectorAll('p,span,div').forEach(el=>{
      if(el.children.length) return;
      const t=(el.textContent||'').trim();
      if(t==='綱引きやリレーなど5つの競技を楽しみます。') el.textContent=`${OFFICIAL_GAMES}の5種目を行います。`;
    });
  };

  ensureFooterFacts();
  fixPartnerHeader();
  fixHome();
  fixEvent();
})();
