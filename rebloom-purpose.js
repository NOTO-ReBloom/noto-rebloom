(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.classList.contains('rb-purpose-ready'))return;
  body.classList.add('rb-purpose-ready');
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  const tag=(selector,purpose,priority='normal')=>{
    document.querySelectorAll(selector).forEach(el=>{
      el.classList.add('rb-purpose-section',`rb-purpose--${purpose}`);
      el.dataset.rbPurpose=purpose;
      el.dataset.rbPriority=priority;
    });
  };

  /* Each block gets a visual role before it gets styling. */
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
  }
  if(page==='learn.html'){
    tag('.page-hero--learn','orientation','high');
    tag('#learn-visual','evidence');
    tag('#words','definition');
    tag('#numbers','proof','high');
    tag('.cause-grid','rationale');
    tag('#project','model','high');
    tag('#learn-join-cta','action','high');
  }
  if(page==='event.html'){
    tag('.page-hero--event','orientation','high');
    tag('.event-summary','logistics','high');
    tag('#event-visual','experience');
    tag('.event-flow-section','logistics');
    tag('.game-grid','program');
    tag('.check-list','safety','high');
    tag('#event-faq','questions');
    tag('main>.section:last-child','action','high');
  }
  if(page==='partner.html'){
    tag('.page-hero--partner','orientation','high');
    tag('.nr-value-prop','benefit');
    tag('#current-partners','proof','high');
    tag('.industry-grid','network');
    tag('main>.section--soil','action','high');
  }
  if(page==='diagnosis.html'){
    tag('.page-hero--diagnosis','orientation');
    tag('.diagnosis-section','utility','high');
    tag('.flower-group-showcase','browse');
    tag('.flower-atlas','browse');
  }

  /* Crowdfunding result = evidence, not decoration. Make the meaning of each metric explicit. */
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

  /* Important interactive controls keep a comfortable hit area even in the denser layout. */
  document.querySelectorAll('.btn,.rb-header-secondary,.rb-mobile-join a,.faq-card .q').forEach(el=>el.classList.add('rb-purpose-target'));
})();
