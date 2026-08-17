(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.classList.contains('rb-purpose-ready'))return;
  body.classList.add('rb-purpose-ready');
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  const mark=(el,purpose,priority='normal')=>{
    if(!el)return;
    el.classList.add('rb-purpose-section',`rb-purpose--${purpose}`);
    el.dataset.rbPurpose=purpose;
    el.dataset.rbPriority=priority;
  };
  const tag=(selector,purpose,priority='normal')=>document.querySelectorAll(selector).forEach(el=>mark(el,purpose,priority));
  const tagParent=(selector,purpose,priority='normal')=>document.querySelectorAll(selector).forEach(el=>mark(el.closest('section')||el,purpose,priority));
  const last=(selector)=>{const list=[...document.querySelectorAll(selector)];return list[list.length-1]||null};

  /* HOME — orientation → experience → proof → story → rationale → progress → people → action. */
  if(page==='index.html'){
    tag('.nr-home-hero','orientation','high');
    tag('#visual-day','experience','high');
    tag('.nr-choice-grid','routing');
    tag('#crowdfunding-result','proof','high');
    tag('#origin','story');
    tag('#purpose','rationale');
    tag('#project-story','progress');
    tag('#people-behind-project','people','high');
    tag('main>.conversion-band','action','high');

    document.querySelectorAll('#visual-day .join-fact').forEach(el=>el.classList.add('rb-key-fact'));
    document.querySelector('#visual-day .visual-tile:first-child')?.classList.add('rb-primary-visual');
    const timeline=[...document.querySelectorAll('#project-story .story-step')];
    timeline.at(-1)?.classList.add('rb-progress-next');
    timeline.at(-2)?.classList.add('rb-progress-proof');
  }

  /* LEARN — definitions compare; numbers prove; causes explain; role sets boundaries; model connects; venue proves feasibility. */
  if(page==='learn.html'){
    tag('.page-hero--learn','orientation','high');
    tag('#learn-visual','evidence');
    tag('#words','definition');
    tag('#numbers','proof','high');
    tagParent('.cause-grid','rationale');
    tag('main>.section--soil','role','high');
    tag('#project','model','high');
    tag('#learn-join-cta','action','high');
    mark(last('main>.section--mint'),'venue','high');

    const numbers=document.querySelector('#numbers .container');
    if(numbers&&!numbers.querySelector('.rb-data-source')){
      const source=document.createElement('p');
      source.className='rb-data-source';
      source.innerHTML='出典：<a href="https://www.maff.go.jp/j/nousin/tikei/houkiti/" target="_blank" rel="noopener">農林水産省「荒廃農地の発生防止・解消等」</a>';
      numbers.appendChild(source);
    }
    document.querySelectorAll('#words .definition-card').forEach((card,i)=>card.classList.add(`rb-definition-${i+1}`));
  }

  /* EVENT — logistics answer quickly; experience creates anticipation; program shows fun; safety removes anxiety. */
  if(page==='event.html'){
    tag('.page-hero--event','orientation','high');
    tag('.event-summary','logistics','high');
    tag('#event-visual','experience');
    tag('.event-flow-section','logistics');
    tagParent('.game-grid','program');
    tagParent('.check-list','safety','high');
    tagParent('.section img[src*="renge-cup-illustration"]','memory');
    tag('main>.section--soil','support');
    tag('#event-faq','questions');
    mark(last('main>.section--paper'),'action','high');

    document.querySelector('.check-list>div:nth-child(3)')?.classList.add('rb-safety-core');
    document.querySelectorAll('.event-flow article').forEach((el,i)=>el.classList.add(`rb-flow-${i+1}`));
  }

  /* PARTNER — benefit explains value; current sponsor proves trust; network broadens credibility; deadline converts. */
  if(page==='partner.html'){
    tag('.page-hero--partner','orientation','high');
    tag('.nr-value-prop','benefit');
    tag('#current-partners','proof','high');
    tagParent('.industry-grid','network');
    tag('main>.section--soil','deadline','high');
    document.querySelectorAll('.nr-value-grid article').forEach((el,i)=>el.classList.add(`rb-benefit-${i+1}`));
  }

  /* DIAGNOSIS — first explain the utility, then let users start, browse, answer and finally read the result. */
  if(page==='diagnosis.html'){
    tag('.page-hero--diagnosis','orientation');
    tag('.diagnosis-section','utility');
    tag('.diagnosis-shell','onboarding','high');
    tag('.flower-group-showcase','preview');
    tag('.flower-atlas','browse');
    tag('.diagnosis-panel','interaction','high');
    tag('.diagnosis-result','result','high');

    const countTag=[...document.querySelectorAll('.diagnosis-tags li')].find(li=>li.textContent.includes('30種類以上'));
    if(countTag)countTag.textContent='32種類';
    document.querySelector('.diagnosis-start-card')?.classList.add('rb-primary-start');
  }

  /* Crowdfunding result = evidence, not decoration. */
  if(page==='index.html'){
    const result=document.querySelector('#crowdfunding-result');
    const cards=[...result?.querySelectorAll('.event-values article')||[]];
    const labels=['支援総額','支援者数'];
    cards.forEach((card,i)=>{
      card.classList.add('rb-proof-card');
      const h3=card.querySelector('h3');
      if(h3&&!card.querySelector('.rb-proof-label')){
        const label=document.createElement('small');
        label.className='rb-proof-label';
        label.textContent=labels[i]||'実績';
        h3.before(label);
      }
    });
    result?.querySelector('.event-values')?.classList.add('rb-proof-grid');
    result?.querySelector('a[href*="readyfor.jp"]')?.classList.add('rb-proof-source');
  }

  /* Any top-level section that has not received a specific role stays visually quiet. */
  document.querySelectorAll('main>section').forEach(section=>{
    if(!section.dataset.rbPurpose)mark(section,'supporting');
  });

  /* Dense layouts must not shrink interactive controls below a comfortable hit area. */
  document.querySelectorAll('.btn,.nr-btn,.rb-header-secondary,.rb-mobile-join a,.faq-card .q,.diagnosis-answer,.flower-atlas-filters button,.atlas-dialog-close').forEach(el=>el.classList.add('rb-purpose-target'));
})();
