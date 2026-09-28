const puppeteer=require('puppeteer-core');
const fs=require('fs');
const axeSource=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');

const pages=['index.html','thoughts.html','learn.html','event.html','report.html','partner.html','diagnosis.html','contact.html','photo-credits.html','404.html'];
const viewports=[[375,812],[430,932],[768,1024],[1440,1000]];
const expected={
  'index.html':[['.visual-tile',3],['.story-step',4],['.event-values>article',2]],
  'thoughts.html':[['.visual-tile',3],['.cause-grid>article',4],['.event-values>article',3]],
  'learn.html':[['.definition-card',3],['.data-grid--large>article',3],['.chart-card',2],['.cause-grid>article',4],['#project .event-values>article',4]],
  'event.html':[['.join-step-grid>article',3],['.info-card',5],['.program-grid>.game-card',5],['.time-card',4],['.bring-item',6]],
  'report.html':[['.report-summary-card',4],['.report-photo',5],['.report-impact-card',3],['.game-grid>.game-card',5],['.time-card',4],['.report-voice-card',2]],
  'partner.html':[['.nr-sponsor-wide',3],['.industry-partner-card',3]],
  'contact.html':[['.contact-card',1]],
  'photo-credits.html':[['tbody tr',32]],
  'diagnosis.html':[['.diagnosis-start-card',1],['.flower-group-card',4],['.flower-atlas-card',32]]
};
const minPhotos={
  'index.html':5,'thoughts.html':5,'learn.html':4,'event.html':2,'report.html':5,
  'partner.html':4,'diagnosis.html':33,'contact.html':1,'photo-credits.html':0,'404.html':1
};

(async()=>{
  const browser=await puppeteer.launch({
    headless:true,
    executablePath:process.env.CHROME_PATH,
    args:['--no-sandbox','--disable-dev-shm-usage']
  });
  const failures=[];
  const summary=[];

  for(const file of pages){
    for(const [width,height] of viewports){
      const page=await browser.newPage();
      await page.setViewport({width,height,deviceScaleFactor:1});
      const jsErrors=[];
      const consoleErrors=[];
      page.on('pageerror',e=>jsErrors.push(String(e)));
      page.on('console',m=>{ if(m.type()==='error') consoleErrors.push(m.text()); });

      const response=await page.goto('http://127.0.0.1:8000/'+file,{waitUntil:'networkidle0',timeout:30000});
      await new Promise(r=>setTimeout(r,file==='diagnosis.html'?900:300));

      if(file==='diagnosis.html'){
        const atlasLink=await page.$('a[href="#flower-atlas"]');
        if(atlasLink)await atlasLink.click();
        await page.waitForFunction(()=>document.querySelectorAll('.flower-atlas-card').length===32,{timeout:15000});
      }

      await page.evaluate(async()=>{
        const max=document.documentElement.scrollHeight;
        const step=Math.max(380,Math.floor(innerHeight*.72));
        for(let y=0;y<max;y+=step){
          scrollTo(0,y);
          await new Promise(r=>setTimeout(r,28));
        }
        scrollTo(0,0);
      });
      await new Promise(r=>setTimeout(r,650));

      await page.addScriptTag({content:axeSource});
      const contrastViolations=await page.evaluate(async()=>{
        const r=await axe.run(document,{runOnly:{type:'rule',values:['color-contrast']}});
        return r.violations.map(v=>({
          id:v.id,
          impact:v.impact,
          nodes:v.nodes.slice(0,20).map(n=>({target:n.target,html:n.html,summary:n.failureSummary}))
        }));
      });

      const data=await page.evaluate((expectedList,minPhotoCount)=>{
        const visible=el=>{
          if(!el)return false;
          const s=getComputedStyle(el),r=el.getBoundingClientRect();
          return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0&&r.width>8&&r.height>8;
        };
        const root=document.documentElement;
        const groups=(expectedList||[]).map(([selector,min])=>{
          const els=[...document.querySelectorAll(selector)];
          return {selector,min,total:els.length,visible:els.filter(visible).length};
        });

        const allImages=[...document.images];
        const visibleImages=allImages.filter(visible);
        const brokenVisible=visibleImages
          .filter(img=>img.complete&&(img.naturalWidth===0||img.naturalHeight===0))
          .map(img=>img.getAttribute('src'));
        const zeroSizeVisible=visibleImages
          .filter(img=>{
            const r=img.getBoundingClientRect();
            return r.width<9||r.height<9;
          })
          .map(img=>({src:img.getAttribute('src'),w:img.getBoundingClientRect().width,h:img.getBoundingClientRect().height}));
        const mainVisiblePhotos=[...document.querySelectorAll('main img')].filter(visible);
        const nav=document.querySelector('.site-nav');
        const toggle=document.querySelector('.menu-button,.menu-toggle');
        return {
          overflow:root.scrollWidth>root.clientWidth+3,
          overflowBy:root.scrollWidth-root.clientWidth,
          h1:document.querySelectorAll('h1').length,
          groups,
          brokenVisible,
          zeroSizeVisible,
          visiblePhotoCount:mainVisiblePhotos.length,
          minPhotoCount,
          navVisible:visible(nav),
          toggleVisible:visible(toggle),
          toggleSelector:toggle?.classList.contains('menu-button')?'.menu-button':toggle?'.menu-toggle':null,
          diagnosisHeroFont:document.body.classList.contains('page-diagnosis')?getComputedStyle(document.querySelector('.page-hero--diagnosis h1')).fontFamily:null
        };
      },expected[file]||[],minPhotos[file]||0);

      if(!response||response.status()>=400) failures.push({file,width,kind:'http',status:response?.status()});
      if(data.overflow) failures.push({file,width,kind:'overflow',by:data.overflowBy});
      if(data.h1!==1) failures.push({file,width,kind:'h1',count:data.h1});
      const groupFailures=data.groups.filter(g=>g.total<g.min||g.visible<g.min);
      if(groupFailures.length) failures.push({file,width,kind:'content',groups:groupFailures});
      if(data.brokenVisible.length) failures.push({file,width,kind:'broken-visible-images',images:data.brokenVisible});
      if(data.zeroSizeVisible.length) failures.push({file,width,kind:'zero-size-visible-images',images:data.zeroSizeVisible});
      if(data.visiblePhotoCount<data.minPhotoCount) failures.push({file,width,kind:'too-few-visible-photos',visible:data.visiblePhotoCount,min:data.minPhotoCount});
      if(file==='diagnosis.html'&&!/M PLUS Rounded 1c/i.test(data.diagnosisHeroFont||'')) failures.push({file,width,kind:'diagnosis-heading-font',font:data.diagnosisHeroFont});
      if(jsErrors.length) failures.push({file,width,kind:'js-errors',errors:jsErrors});
      if(contrastViolations.length) failures.push({file,width,kind:'color-contrast',violations:contrastViolations});
      const realConsoleErrors=consoleErrors.filter(x=>!/favicon\.ico/i.test(x));
      if(realConsoleErrors.length) failures.push({file,width,kind:'console-errors',errors:realConsoleErrors});

      if(width>820){
        if(!data.navVisible) failures.push({file,width,kind:'desktop-nav-hidden'});
      }else{
        if(!data.toggleVisible) failures.push({file,width,kind:'mobile-toggle-hidden',selector:data.toggleSelector});
        const selector=data.toggleSelector;
        if(selector){
          const beforeNav=data.navVisible;
          if(beforeNav) failures.push({file,width,kind:'mobile-nav-open-before-click'});
          await page.click(selector);
          await new Promise(r=>setTimeout(r,120));
          const opened=await page.evaluate((selector)=>{
            const n=document.querySelector('.site-nav');
            const b=document.querySelector(selector);
            if(!n||!b)return false;
            const s=getComputedStyle(n),r=n.getBoundingClientRect();
            return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0&&r.width>8&&r.height>8&&
              b.getAttribute('aria-expanded')==='true'&&document.body.classList.contains('menu-open');
          },selector);
          if(!opened) failures.push({file,width,kind:'mobile-nav-did-not-open',selector});
        }
      }

      summary.push({file,width,...data});
      await page.close();
    }
  }

  await browser.close();
  console.log('BOTANICAL_SMOKE='+JSON.stringify({tested:summary.length,failures}));
  if(failures.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
