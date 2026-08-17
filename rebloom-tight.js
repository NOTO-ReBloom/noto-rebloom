(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.classList.contains('rb-tight-ready'))return;
  body.classList.add('rb-tight-ready');
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  /* HOME: participation is already clear in the hero and visual CTA. Keep only the two useful navigation cards. */
  if(page==='index.html'){
    const grid=document.querySelector('.nr-choice-grid');
    if(grid){
      const repeatedJoin=[...grid.querySelectorAll('.nr-choice')].find(a=>(a.getAttribute('href')||'').includes('forms.gle/6ZMrhrhtWmBCQViD8'));
      repeatedJoin?.remove();
      grid.classList.add('rb-choice-grid--two');
    }
  }

  /* LEARN: the diagram and the four idea cards said almost the same thing. Put the diagram inside the existing project section. */
  if(page==='learn.html'){
    const injected=document.querySelector('#rb-learn-illustrations');
    const map=injected?.querySelector('.rb-project-map')?.cloneNode(true);
    const project=document.querySelector('#project .container');
    const oldCards=project?.querySelector('.event-values');
    if(project&&oldCards&&map){
      const figure=document.createElement('figure');
      figure.className='rb-illustration-card rb-project-map-card rb-project-map-inline';
      figure.appendChild(map);
      const cap=document.createElement('figcaption');
      cap.textContent='NOTO Re:Bloomの全体像';
      figure.appendChild(cap);
      oldCards.replaceWith(figure);
    }
    injected?.remove();
  }

  /* EVENT: hero, sticky mobile action and final CTA are enough. Remove the duplicate middle CTA. */
  if(page==='event.html') document.querySelector('#event-mid-cta')?.remove();

  /* PARTNER: sponsorship information should appear immediately after the hero, not after another photo gallery. */
  if(page==='partner.html') document.querySelector('#partner-visual')?.remove();

  /* Content-aware spacing classes. Sparse sections no longer receive the same vertical padding as dense sections. */
  document.querySelectorAll('main>section').forEach(section=>{
    const text=(section.innerText||'').replace(/\s/g,'');
    const images=section.querySelectorAll('img').length;
    const cards=section.querySelectorAll('article,.faq-card,.definition-card,.nr-choice,.join-fact,.summary-grid>div,.check-list>div').length;
    section.classList.add('rb-tight-section');
    if(text.length<270&&images<=1&&cards<=2&&!section.matches('.hero,.page-hero,.visual-mosaic-section,.event-flow-section,.diagnosis-section')) section.classList.add('rb-tight-sparse');
    if(section.querySelector('.split-story')) section.classList.add('rb-tight-split');
    if(section.querySelector('.section-heading--center')) section.classList.add('rb-tight-centered');
  });

  document.querySelectorAll('.rb-section-thread').forEach(el=>el.remove());

  /* The live overview still gets one quiet build animation after being moved. */
  const maps=[...document.querySelectorAll('.rb-project-map')];
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){
    maps.forEach(map=>map.classList.add('is-visible'));
  }else{
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }),{threshold:.28,rootMargin:'0px 0px -7% 0px'});
    maps.forEach(map=>io.observe(map));
  }
})();
