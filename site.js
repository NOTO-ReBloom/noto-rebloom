(()=>{
  const nav=document.querySelector('.site-nav');
  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  if(nav){
    nav.setAttribute('aria-label','メインナビゲーション');
    if(!nav.querySelector('a[href="thoughts.html"]')){
      const link=document.createElement('a');
      link.href='thoughts.html';
      link.textContent='私たちの思い';
      if(current==='thoughts.html') link.setAttribute('aria-current','page');
      const before=nav.querySelector('a[href="learn.html"]');
      if(before) nav.insertBefore(link,before); else nav.appendChild(link);
    }
  }

  document.querySelectorAll('a[target="_blank"]').forEach(link=>{
    const rel=new Set((link.getAttribute('rel')||'').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    link.setAttribute('rel',[...rel].join(' '));
  });

  document.querySelectorAll('img').forEach((img,index)=>{
    if(!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
    const isHero=!!img.closest('.page-hero,.hero--home,.nr-home-hero');
    if(isHero && index<3){
      if(!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority','high');
    }else if(!img.hasAttribute('loading')){
      img.setAttribute('loading','lazy');
    }
  });

  if(current==='event.html'){
    const latestLabel=document.querySelector('.event-latest__label');
    const latestText=document.querySelector('.event-latest p');
    if(latestLabel) latestLabel.textContent='LATEST UPDATE / 2026.9.6';
    if(latestText) latestText.innerHTML='<strong>会場農地が正式に決定しました。</strong> 珠洲市若山町洲巻の田んぼで、9月20日の参加者を募集中です。服装・着替え・泥落としなど、参加前の案内もページ内で確認できます。天候や駐車位置など最終調整中の事項は、確定後に更新します。';

    document.querySelectorAll('.event-summary .summary-grid > div').forEach(item=>{
      const label=item.querySelector('span');
      const value=item.querySelector('b');
      if(label && value && label.textContent.trim()==='天候'){
        value.textContent='対応は確定後に案内';
      }
    });

    document.querySelectorAll('.event-fun-chip').forEach(chip=>{
      if(chip.textContent.trim()==='5つの競技') chip.textContent='泥んこ競技';
    });

    document.querySelectorAll('.faq-card').forEach(card=>{
      const q=card.querySelector('.q');
      const p=card.querySelector('p');
      if(!q || !p) return;
      const question=q.textContent.trim();
      if(question==='雨天時はどうなりますか？'){
        p.innerHTML='<strong>現在、最終調整中です。</strong> 安全を最優先に、天候や田んぼの状態を見て判断します。開催方法に変更がある場合は、このサイトや参加者向けの案内でお知らせします。';
      }
      if(question==='どんな競技をしますか？'){
        p.innerHTML='<strong>綱引き、宝探し、泥バケツリレー、台風の目</strong>を中心に予定しています。田んぼや天候の状態、安全面を踏まえて競技内容や進行方法を変更する場合があります。';
      }
      if(question==='飲み物はありますか？'){
        p.innerHTML='熱中症対策のため、<strong>十分な飲み物をご自身でもご持参ください。</strong> 会場側での飲料提供については、内容が確定後に案内します。';
      }
    });
  }

  document.write('<script src="site-core.js?v=20260906c"><\/script>');
})();