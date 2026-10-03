(()=>{
  'use strict';

  const data=window.RB_CONTENT;
  if(!data) return;

  const formatDate=(iso)=>{
    const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');
    return m ? `${m[1]}.${m[2]}.${m[3]}` : String(iso||'');
  };

  const isExternal=(href)=>{
    try{
      const u=new URL(href,location.href);
      return u.origin!==location.origin;
    }catch(e){ return false; }
  };

  const decorateLink=(a,label,href)=>{
    a.href=href;
    a.textContent=label+(isExternal(href)?' ↗':' →');
    if(isExternal(href)){
      a.target='_blank';
      a.rel='noopener';
    }else{
      a.removeAttribute('target');
      a.removeAttribute('rel');
    }
  };

  const renderCurrentStatus=()=>{
    const section=document.querySelector('.home-current-status[data-rb-content="current-status"]');
    if(!section||!data.currentStatus) return;

    const title=section.querySelector('#current-status-title');
    const lead=section.querySelector('.home-current-status__head > p:last-child');
    if(title) title.textContent=data.currentStatus.heading;
    if(lead) lead.textContent=data.currentStatus.lead;

    const grid=section.querySelector('.home-current-status__grid');
    if(!grid||!Array.isArray(data.currentStatus.items)) return;

    const fallback=[...grid.children];
    data.currentStatus.items.forEach((item,index)=>{
      let article=fallback[index];
      if(!article){
        article=document.createElement('article');
        grid.appendChild(article);
      }
      const small=article.querySelector('small')||article.appendChild(document.createElement('small'));
      const strong=article.querySelector('strong')||article.appendChild(document.createElement('strong'));
      const span=article.querySelector('span')||article.appendChild(document.createElement('span'));
      const link=article.querySelector('a')||article.appendChild(document.createElement('a'));
      small.textContent=item.label;
      strong.textContent=item.title;
      span.textContent=item.description;
      decorateLink(link,item.linkLabel,item.href);
    });
    fallback.slice(data.currentStatus.items.length).forEach(el=>el.remove());
  };

  const renderJournal=()=>{
    const list=document.querySelector('.journal-list[data-rb-content="journal"]');
    if(!list||!Array.isArray(data.journal)) return;

    const frag=document.createDocumentFragment();
    const sorted=[...data.journal].sort((a,b)=>String(b.date).localeCompare(String(a.date)));

    for(const item of sorted){
      const article=document.createElement('article');
      article.className='journal-entry';

      const time=document.createElement('time');
      time.dateTime=item.date;
      time.textContent=formatDate(item.date);

      const body=document.createElement('div');
      const category=document.createElement('small');
      category.textContent=item.category;
      const h3=document.createElement('h3');
      h3.textContent=item.title;
      const p=document.createElement('p');
      p.textContent=item.description;
      body.append(category,h3,p);

      const link=document.createElement('a');
      decorateLink(link,item.linkLabel,item.href);

      article.append(time,body,link);
      frag.appendChild(article);
    }

    list.replaceChildren(frag);
  };

  try{
    renderCurrentStatus();
    renderJournal();
  }catch(error){
    console.error('[NOTO Re:Bloom] content rendering failed; static fallback kept where possible.',error);
  }
})();
