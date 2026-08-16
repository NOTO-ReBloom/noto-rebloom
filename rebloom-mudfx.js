(()=>{
  'use strict';
  const body=document.body;
  if(!body||body.classList.contains('rb-mudfx-ready')) return;
  body.classList.add('rb-mudfx-ready');

  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const hero=document.querySelector('.hero,.page-hero');
  const heroCopy=document.querySelector('.hero-copy,.page-hero-grid>div');

  /* Keep one quiet mud signature in the hero. The large splash is handled separately and only once per session. */
  const wordMap={
    'index.html':['田んぼ','みんなの遊び場'],
    'event.html':['9月20日','泥ん子運動会']
  };

  if(hero&&heroCopy&&wordMap[page]){
    const [before,after]=wordMap[page];
    const word=document.createElement('span');
    word.className='rb-mud-word rb-mud-word--quiet';
    word.setAttribute('aria-label',after);
    word.innerHTML=`<span class="rb-mud-word-before" aria-hidden="true">${before}</span><span class="rb-mud-word-after" aria-hidden="true">${after}</span>`;
    heroCopy.querySelector('.eyebrow')?.after(word);
    if(reduce){word.classList.add('rb-mud-word-done');return}
    setTimeout(()=>{
      word.classList.add('rb-mud-impact');
      setTimeout(()=>word.classList.add('rb-mud-word-done'),180);
    },680);
  }
})();
