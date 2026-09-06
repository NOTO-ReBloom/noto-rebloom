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
    if(latestText) latestText.innerHTML='<strong>会場農地が正式に決定しました。</strong> 珠洲市若山町洲巻の田んぼで、9月20日の参加者を募集中です。服装・着替え・泥落としなど、参加前の案内もページ内で確認できます。';
  }

  document.write('<script src="site-core.js?v=20260906b"><\\/script>');
})();