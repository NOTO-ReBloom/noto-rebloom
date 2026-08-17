(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.classList.contains('rb-purpose-complete-ready'))return;
  body.classList.add('rb-purpose-complete-ready');
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  const mark=(selector,purpose,priority='normal')=>{
    document.querySelectorAll(selector).forEach(el=>{
      el.classList.add('rbpc-section',`rbpc--${purpose}`);
      el.dataset.rbpcPurpose=purpose;
      el.dataset.rbpcPriority=priority;
    });
  };
  const add=(selector,...classes)=>document.querySelectorAll(selector).forEach(el=>el.classList.add(...classes));

  /* Global: navigation/footer are supporting architecture, not main content. */
  mark('.site-header','navigation');
  mark('.rb-footer,.site-footer','footer');
  add('.rb-footer-cta','rbpc-footer-action');

  if(page==='index.html'){
    mark('.nr-home-hero','orientation','high');
    mark('#visual-day','experience','high');
    mark('.nr-choice-grid','routing');
    mark('#crowdfunding-result','proof','high');
    mark('#origin','story','high');
    mark('#purpose','process','high');
    mark('#project-story','progress','high');
    mark('#people-behind-project','identity','high');
    mark('main>.conversion-band','action','high');

    add('.nr-home-hero .status-chips','rbpc-key-facts');
    add('#visual-day .visual-mosaic','rbpc-experience-grid');
    add('.nr-choice-grid .nr-choice','rbpc-route-card');
    add('#crowdfunding-result .rb-proof-grid','rbpc-proof-grid');
    add('#origin .split-story','rbpc-story-split');
    add('#purpose .event-values','rbpc-process-flow');
    add('#purpose .event-values article','rbpc-process-step');
    add('#project-story .story-timeline','rbpc-progress');
    const steps=[...document.querySelectorAll('#project-story .story-step')];
    steps.forEach((step,i)=>step.classList.add(i<5?'is-complete':'is-upcoming'));
    if(steps[4])steps[4].classList.add('is-latest');
    if(steps[5])steps[5].classList.add('is-next');
    add('#people-behind-project','rbpc-identity-proof');
    add('#people-behind-project .people-trust-tags','rbpc-trust-badges');
  }

  if(page==='learn.html'){
    mark('.page-hero--learn','orientation','high');
    mark('#learn-visual','evidence','high');
    mark('#words','comparison');
    mark('#numbers','proof','high');
    mark('.cause-grid','causes');
    const causeSection=document.querySelector('.cause-grid')?.closest('section');
    if(causeSection){causeSection.classList.add('rbpc-section','rbpc--causes');causeSection.dataset.rbpcPurpose='causes'}
    const scope=[...document.querySelectorAll('main>.section--soil')].find(s=>(s.textContent||'').includes('私たちにできること'));
    if(scope){scope.classList.add('rbpc-section','rbpc--scope');scope.dataset.rbpcPurpose='scope';scope.dataset.rbpcPriority='high'}
    mark('#project','model','high');
    mark('#learn-join-cta','action','high');
    const venue=[...document.querySelectorAll('main>.section--mint')].find(s=>(s.textContent||'').includes('まずは、洲巻地区の田んぼから'));
    if(venue){
      venue.classList.add('rbpc-section','rbpc--venue-proof');venue.dataset.rbpcPurpose='venue-proof';venue.dataset.rbpcPriority='high';
      const copy=venue.querySelector('.split-story>div');
      if(copy&&!copy.querySelector('.rbpc-venue-facts')){
        const facts=document.createElement('div');facts.className='rbpc-venue-facts';
        facts.innerHTML='<span><b>約1,000㎡</b><small>約20m × 50m</small></span><span><b>使用許可済み</b><small>9月20日の会場</small></span>';
        const buttons=copy.querySelector('.button-row');
        if(buttons)copy.insertBefore(facts,buttons);else copy.appendChild(facts);
      }
    }
    add('#words .definition-grid','rbpc-comparison-grid');
    add('#numbers .data-grid','rbpc-data-proof');
    add('.cause-grid','rbpc-cause-grid');
    add('#project .rb-project-map-inline','rbpc-model-map');
  }

  if(page==='event.html'){
    mark('.page-hero--event','orientation','high');
    mark('.event-summary','logistics','high');
    mark('#event-visual','experience','high');
    mark('.event-flow-section','schedule','high');
    const program=document.querySelector('.game-grid')?.closest('section');
    if(program){program.classList.add('rbpc-section','rbpc--program');program.dataset.rbpcPurpose='program'}
    const safety=document.querySelector('.check-list')?.closest('section');
    if(safety){safety.classList.add('rbpc-section','rbpc--safety');safety.dataset.rbpcPurpose='safety';safety.dataset.rbpcPriority='high'}
    const memory=[...document.querySelectorAll('main>.section--mint')].find(s=>(s.textContent||'').includes('レンゲは、おうちで育ててもらいます'));
    if(memory){memory.classList.add('rbpc-section','rbpc--memory');memory.dataset.rbpcPurpose='memory'}
    const report=[...document.querySelectorAll('main>.section--soil')].find(s=>(s.textContent||'').includes('前日は、香林坊で報告会'));
    if(report){
      report.classList.add('rbpc-section','rbpc--support-info');report.dataset.rbpcPurpose='support-info';
      const panels=[...report.querySelectorAll('.split-story>div')];
      panels[0]?.classList.add('rbpc-report-panel');
      panels[1]?.classList.add('rbpc-contact-panel');
      const contact=panels[1];
      if(contact&&!contact.querySelector('a[href^="mailto:"]')){
        const a=document.createElement('a');a.className='btn btn--paper rbpc-contact-button';a.href='mailto:infonotorebloom@gmail.com';a.textContent='メールで問い合わせる';contact.appendChild(a);
      }
    }
    mark('#event-faq','questions');
    mark('main>.section:last-child','action','high');

    add('.event-summary .summary-grid','rbpc-logistics-grid');
    const facts=[...document.querySelectorAll('.event-summary .summary-grid>div')];
    facts.forEach((el,i)=>el.classList.add(`rbpc-logistic-${i+1}`));
    add('.event-flow','rbpc-schedule-flow');
    add('.game-grid','rbpc-program-grid');
    add('.check-list','rbpc-safety-grid');
    const safetyCards=[...document.querySelectorAll('.check-list>div')];
    safetyCards[2]?.classList.add('rbpc-safety-primary');
    add('#event-faq .faq-grid','rbpc-question-grid');
  }

  if(page==='partner.html'){
    mark('.page-hero--partner','orientation','high');
    mark('.nr-value-prop','benefits');
    mark('#current-partners','proof','high');
    const network=document.querySelector('.industry-grid')?.closest('section');
    if(network){network.classList.add('rbpc-section','rbpc--network');network.dataset.rbpcPurpose='network'}
    const deadline=[...document.querySelectorAll('main>.section--soil')].find(s=>(s.textContent||'').includes('8月21日'));
    if(deadline){
      deadline.classList.add('rbpc-section','rbpc--deadline');deadline.dataset.rbpcPurpose='deadline';deadline.dataset.rbpcPriority='high';
      const panels=[...deadline.querySelectorAll('.split-story>div')];
      panels[0]?.classList.add('rbpc-deadline-panel');
      panels[1]?.classList.add('rbpc-partner-contact-panel');
    }
    add('.nr-value-grid','rbpc-benefit-grid');
    add('#current-partners .nr-main-sponsor','rbpc-sponsor-proof');
    add('.industry-grid','rbpc-network-grid');
  }

  if(page==='diagnosis.html'){
    mark('.page-hero--diagnosis','orientation');
    mark('.diagnosis-section','utility','high');
    mark('.flower-group-showcase','browse');
    mark('.flower-atlas','browse');
    mark('.diagnosis-panel','interaction','high');
    mark('.diagnosis-result','result','high');
    mark('.final-cta','action');

    add('.diagnosis-shell','rbpc-diagnosis-start');
    add('.diagnosis-intro','rbpc-diagnosis-explain');
    add('.diagnosis-start-card','rbpc-diagnosis-primary');
    add('.flower-group-grid','rbpc-flower-groups');
    add('.flower-atlas-filters','rbpc-atlas-filters');
    add('.diagnosis-question-card','rbpc-question-card');
    add('.diagnosis-answer-grid','rbpc-answer-grid');

    const resultRoles=[
      ['.result-hero','identity'],['.result-group-profile','profile'],['.result-life-scenes','application'],['.result-reflection','reflection'],
      ['.result-card','data'],['.result-tendency-section','data'],['.result-neighbor-section','relationship'],['.result-month-plan','plan'],
      ['.result-share-section','share'],['.result-next-action','action']
    ];
    resultRoles.forEach(([sel,role])=>document.querySelectorAll(sel).forEach(el=>{el.classList.add('rbpc-result-block',`rbpc-result--${role}`);el.dataset.rbpcResultPurpose=role}));
  }

  /* Maintain generous targets without allowing buttons to inflate sections. */
  document.querySelectorAll('a.btn,button.btn,.diagnosis-answer,.flower-atlas-filters button,.menu-button').forEach(el=>el.classList.add('rbpc-hit-target'));
})();
