const puppeteer=require('puppeteer-core');

const pages=['index.html','thoughts.html','learn.html','event.html','report.html','partner.html','diagnosis.html','contact.html','photo-credits.html','404.html'];
const viewports=[[375,812],[430,932],[768,1024],[1440,1000]];
const expected={
  'index.html':[['.stat',4],['.feature',4],['.journey-step',4],['.partner-logo',6]],
  'thoughts.html':[['.list-block',6],['.article-media',3]],
  'learn.html':[['.term',3],['.data-metric',3],['.data-panel',2],['.list-block',8]],
  'event.html':[['.report-step',7],['.list-block',11]],
  'report.html':[['.stat',4],['.report-gallery figure',5],['.list-block',8],['.finance-block',2]],
  'partner.html':[['.sponsor',3],['.partner-mini',3],['.list-block',4]],
  'contact.html':[['.contact-card2',1],['.list-block',3]],
  'photo-credits.html':[['.license-card',4],['tbody tr',32]],
  'diagnosis.html':[['.diagnosis-start-card',2],['.flower-group-card',4],['.flower-atlas-card',32]]
};
const visible=el=>{
  if(!el)return false;
  const s=getComputedStyle(el),r=el.getBoundingClientRect();
  return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>8&&r.height>8;
};

(async()=>{
  const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
  const failures=[];
  const summary=[];

  for(const file of pages){
    for(const [width,height] of viewports){
      const page=await browser.newPage();
      await page.setViewport({width,height,deviceScaleFactor:1});
      const jsErrors=[];
      page.on('pageerror',e=>jsErrors.push(String(e)));

      const response=await page.goto('http://127.0.0.1:8000/'+file,{waitUntil:'networkidle0',timeout:30000});
      await new Promise(r=>setTimeout(r,file==='diagnosis.html'?900:250));

      await page.evaluate(async()=>{
        const max=document.documentElement.scrollHeight;
        const step=Math.max(420,Math.floor(innerHeight*.8));
        for(let y=0;y<max;y+=step){scrollTo(0,y);await new Promise(r=>setTimeout(r,20));}
        scrollTo(0,0);
      });
      await new Promise(r=>setTimeout(r,250));

      const data=await page.evaluate((expectedList)=>{
        const visibleLocal=el=>{
          if(!el)return false;
          const s=getComputedStyle(el),r=el.getBoundingClientRect();
          return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>8&&r.height>8;
        };
        const root=document.documentElement;
        const groups=(expectedList||[]).map(([selector,min])=>{
          const els=[...document.querySelectorAll(selector)];
          return {selector,min,total:els.length,visible:els.filter(visibleLocal).length};
        });
        const broken=[...document.images].filter(img=>img.complete&&img.getAttribute('src')&&img.naturalWidth===0).map(img=>img.getAttribute('src'));
        const h1=document.querySelectorAll('h1').length;
        const nav=document.querySelector('.site-nav');
        const toggle=document.querySelector('.menu-toggle');
        const cta=document.querySelector('.site-cta');
        return {
          overflow:root.scrollWidth>root.clientWidth+3,
          overflowBy:root.scrollWidth-root.clientWidth,
          h1,
          broken,
          groups,
          navVisible:visibleLocal(nav),
          toggleVisible:visibleLocal(toggle),
          ctaVisible:visibleLocal(cta)
        };
      },expected[file]||[]);

      const groupFailures=data.groups.filter(g=>g.total<g.min||g.visible<g.min);
      if(!response||response.status()>=400) failures.push({file,width,kind:'http',status:response?.status()});
      if(data.overflow) failures.push({file,width,kind:'overflow',by:data.overflowBy});
      if(data.h1!==1) failures.push({file,width,kind:'h1',count:data.h1});
      if(data.broken.length) failures.push({file,width,kind:'broken-images',images:data.broken});
      if(jsErrors.length) failures.push({file,width,kind:'js-errors',errors:jsErrors});
      if(groupFailures.length) failures.push({file,width,kind:'content',groups:groupFailures});

      if(width>760){
        if(!data.navVisible) failures.push({file,width,kind:'desktop-nav-hidden'});
        if(!data.ctaVisible) failures.push({file,width,kind:'desktop-cta-hidden'});
      }else{
        if(!data.toggleVisible) failures.push({file,width,kind:'mobile-toggle-hidden'});
        if(data.navVisible) failures.push({file,width,kind:'mobile-nav-open-before-click'});
        const toggle=await page.$('.menu-toggle');
        if(toggle){
          await toggle.click();
          await new Promise(r=>setTimeout(r,80));
          const opened=await page.evaluate(()=>{
            const n=document.querySelector('.site-nav'),b=document.querySelector('.menu-toggle');
            if(!n)return false;
            const s=getComputedStyle(n),r=n.getBoundingClientRect();
            return s.display!=='none'&&s.visibility!=='hidden'&&r.width>8&&r.height>8&&b?.getAttribute('aria-expanded')==='true'&&document.body.classList.contains('menu-open');
          });
          if(!opened) failures.push({file,width,kind:'mobile-nav-did-not-open'});
        }
      }

      summary.push({file,width,...data});
      await page.close();
    }
  }

  await browser.close();
  console.log('REDESIGN_SMOKE='+JSON.stringify({tested:summary.length,failures}));
  if(failures.length) process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
