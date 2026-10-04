// contrast-audit-v2
const puppeteer=require('puppeteer-core');
const fs=require('fs');
const axeSource=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');

const pages=fs.readdirSync('.').filter(name=>/^[^.].*\.html$/i.test(name)).sort();
const viewports=[[375,812],[430,932],[768,1024],[1440,1000]];
const expected={
  'index.html':[['.visual-tile',3],['.handover-card',4],['.home-route-card',5],['.home-archive-summary__card',4]],
  'thoughts.html':[['.visual-tile',3],['.cause-grid>article',4],['.event-values>article',3]],
  'learn.html':[['.definition-card',3],['.data-grid--large>article',3],['.chart-card',2],['.cause-grid>article',4],['#project .event-values>article',4]],
  'event.html':[['.join-step-grid>article',3],['.info-card',5],['.program-grid>.game-card',5],['.time-card',4],['.bring-item',6]],
  'report.html':[['.report-summary-card',4],['.report-photo',5],['.report-impact-card',3],['.game-grid>.game-card',5],['.time-card',4],['.report-voice-card',2]],
  'partner.html':[['.nr-sponsor-wide',3],['.industry-partner-card',3]],
  'contact.html':[['.contact-card',1]],
  'photo-credits.html':[['tbody tr',32]],
  'diagnosis.html':[['.diagnosis-start-card',1],['.flower-group-card',4],['.flower-atlas-card',32]],
  'journal.html':[['.journal-entry',5]],
  'media.html':[['.media-fact',4],['.media-asset',6]],
  'playbook.html':[['.playbook-step',5],['.playbook-lesson',3]]
};
const minPhotos={
  'index.html':5,'thoughts.html':5,'learn.html':4,'event.html':2,'report.html':5,
  'partner.html':4,'diagnosis.html':33,'contact.html':1,'photo-credits.html':0,'journal.html':0,'media.html':0,'playbook.html':1,'404.html':1
};

const PUBLIC_COPY_BANNED=[
  'GOOD DAY','LOW BATTERY','THIS IS YOU','SHARE CARD',
  'SUPPORTED BY','SPONSORSHIP','TRANSPARENCY','PROGRAM / ARCHIVE',
  'HOW TO JOIN / ARCHIVE','BEFORE YOU COME / ARCHIVE',
  'DAY FLOW / ARCHIVE','WHAT TO BRING / ARCHIVE',
  'SAFETY & SUPPORT / ARCHIVE','FAQ / ARCHIVE',
  '<small>YES</small>','LEAN YES','LEAN NO','<small>NO</small>',
  'わたしを再発見','あなたの輪郭','自分を守る境界線',
  '小さな循環','一つの見方です','同じ情報設計で',
  'エネルギーの戻し方','BLOOM /','LANGUAGE /'
];
const copyGuardFiles=[...pages,'plant-art-20260929.js','diagnosis-visual-v2.js','diagnosis.js'];
const copyFailures=[];
for(const file of copyGuardFiles){
  const source=fs.readFileSync(file,'utf8');
  for(const phrase of PUBLIC_COPY_BANNED){
    if(source.includes(phrase)) copyFailures.push({file,phrase});
  }
}
if(copyFailures.length){
  console.error('PUBLIC_COPY_GUARD='+JSON.stringify(copyFailures));
  process.exit(1);
}

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
        const universalChrome={
          partnerStripVisible:visible(document.querySelector('.site-partner-strip--universal')),
          partnerLogoCount:[...document.querySelectorAll('.site-partner-strip--universal .site-partner-strip__logo')].filter(visible).length,
          footerVisible:visible(document.querySelector('.rb-footer--universal')),
          footerSocialCount:[...document.querySelectorAll('.rb-footer--universal .rb-footer-social a')].filter(visible).length,
          headerSocialCount:[...document.querySelectorAll('.rb-header-social a')].filter(visible).length,
          menuSocialCount:[...document.querySelectorAll('.rb-menu-social a')].filter(visible).length
        };
        const rgb=v=>{const m=String(v||'').match(/rgba?\((\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)(?:[,/\s]+([\d.]+))?\)/i);return m?{r:+m[1],g:+m[2],b:+m[3],a:m[4]==null?1:+m[4]}:null};
        const lum=x=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(x.r)+.7152*f(x.g)+.0722*f(x.b)};
        const effectiveBg=el=>{let node=el;for(let depth=0;node&&depth<9;depth++,node=node.parentElement){const s=getComputedStyle(node),bg=rgb(s.backgroundColor);if(bg&&bg.a>=.55)return bg;if(s.backgroundImage&&s.backgroundImage!=='none')return null;if(node.matches?.('.rb-footer,.section--soil,.visual-tile,.photo-frame'))return null;}return null;};
        const whiteOnLight=[...document.querySelectorAll('h1,h2,h3,h4,p,li,span,strong,b,small,a,td,th,label')].filter(el=>{
          const text=(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();
          if(!text||!visible(el)||el.matches('.story-dot,.rb-contact-fab__icon,[class*="badge"],[class*="chip"],[class*="tag"],[class*="label"]')||el.closest('.rb-footer,.visual-tile,.photo-frame figcaption,.btn,button,[class*="badge"],[class*="chip"],[class*="tag"],[class*="label"]'))return false;
          const color=rgb(getComputedStyle(el).color); if(!color||lum(color)<.78)return false;
          const bg=effectiveBg(el); return !!(bg&&lum(bg)>.78);
        }).slice(0,20).map(el=>({tag:el.tagName,cls:String(el.className||'').slice(0,100),text:(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim().slice(0,90)}));

        const contrastRatio=(a,b)=>{
          const la=lum(a),lb=lum(b);
          return (Math.max(la,lb)+.05)/(Math.min(la,lb)+.05);
        };
        const explicitContrastWarnings=[...document.querySelectorAll(
          'button,.btn,a.btn,h1,h2,h3,h4,strong,b,[class*="number"],[class*="stat"],[class*="metric"],[class*="count"],[class*="amount"],[class*="total"]'
        )].filter(el=>{
          const text=(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();
          if(!text||!visible(el)||el.closest('.visual-tile,.photo-frame figcaption'))return false;
          const isButton=el.matches('button,.btn,a.btn');
          const isNumeric=/\d/.test(text)&&text.length<=48;
          if(!isButton&&!isNumeric)return false;
          const style=getComputedStyle(el),color=rgb(style.color),bg=effectiveBg(el);
          if(!color||!bg)return false;
          const fs=parseFloat(style.fontSize)||16,fw=parseInt(style.fontWeight,10)||400;
          const large=fs>=24||(fs>=18.66&&fw>=700);
          const min=large?3:4.5;
          return contrastRatio(color,bg)+.01<min;
        }).slice(0,24).map(el=>{
          const style=getComputedStyle(el),color=rgb(style.color),bg=effectiveBg(el);
          return {
            tag:el.tagName,
            cls:String(el.className||'').slice(0,100),
            text:(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim().slice(0,90),
            ratio:Number(contrastRatio(color,bg).toFixed(2))
          };
        });
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
          diagnosisHeroFont:document.body.classList.contains('page-diagnosis')?getComputedStyle(document.querySelector('.page-hero--diagnosis h1')).fontFamily:null,
          universalChrome,
          whiteOnLight,
          explicitContrastWarnings
        };
      },expected[file]||[],minPhotos[file]||0);

      await page.addStyleTag({content:'main>section{content-visibility:visible!important;contain:none!important;contain-intrinsic-size:auto!important}'});
      const layoutWarnings=await page.evaluate(()=>{
        const visible=el=>{
          if(!el)return false;
          const s=getComputedStyle(el),r=el.getBoundingClientRect();
          return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0&&r.width>8&&r.height>8;
        };
        const intersects=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
        const label=el=>({tag:el.tagName,cls:String(el.className||'').slice(0,100),id:el.id||'',text:(el.innerText||'').replace(/\\s+/g,' ').trim().slice(0,90)});
        const warnings=[];

        scrollTo(0,0);
        const header=document.querySelector('.site-header');
        const firstMain=[...document.querySelectorAll('main h1,main .eyebrow,main p')].find(visible);
        if(visible(header)&&visible(firstMain)){
          const hr=header.getBoundingClientRect(),fr=firstMain.getBoundingClientRect();
          if(intersects(hr,fr))warnings.push({kind:'header-content-overlap',headerBottom:Math.round(hr.bottom),contentTop:Math.round(fr.top),content:label(firstMain)});
        }

        const clipSelectors='h1,h2,h3,h4,p,figcaption,a,button,li,td,th,strong,b,small,span';
        for(const el of document.querySelectorAll(clipSelectors)){
          if(!visible(el)||!(el.textContent||'').trim())continue;
          const s=getComputedStyle(el);
          const clips=/(hidden|clip)/.test(s.overflow+s.overflowX+s.overflowY);
          if(clips&&(el.scrollWidth>el.clientWidth+3||el.scrollHeight>el.clientHeight+3)){
            warnings.push({kind:'content-clipping',el:label(el),client:[el.clientWidth,el.clientHeight],scroll:[el.scrollWidth,el.scrollHeight],overflow:[s.overflow,s.overflowX,s.overflowY]});
          }
        }

        const layoutParents=[...document.querySelectorAll('[class*="grid"],.button-row,.site-nav,.header-actions')].filter(visible);
        for(const parent of layoutParents){
          const children=[...parent.children].filter(visible);
          for(let i=0;i<children.length;i++)for(let j=i+1;j<children.length;j++){
            const a=children[i],b=children[j];
            if(a.contains(b)||b.contains(a))continue;
            if(intersects(a.getBoundingClientRect(),b.getBoundingClientRect())){
              const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
              warnings.push({kind:'sibling-overlap',parent:label(parent),a:label(a),b:label(b),aRect:[Math.round(ar.left),Math.round(ar.top),Math.round(ar.right),Math.round(ar.bottom)],bRect:[Math.round(br.left),Math.round(br.top),Math.round(br.right),Math.round(br.bottom)],intersection:[Math.round(Math.min(ar.right,br.right)-Math.max(ar.left,br.left)),Math.round(Math.min(ar.bottom,br.bottom)-Math.max(ar.top,br.top))]});
              if(warnings.filter(x=>x.kind==='sibling-overlap').length>=12)break;
            }
          }
        }

        for(const sec of document.querySelectorAll('main>section')){
          if(!visible(sec)||sec.matches('.hero,.page-hero,.contact-page-hero,.final-cta,.diagnosis-section'))continue;
          const sr=sec.getBoundingClientRect();
          let kids=[...sec.children].filter(visible);
          if(kids.length===1&&kids[0].classList.contains('container')) kids=[...kids[0].children].filter(visible);
          if(!kids.length)continue;
          const tops=kids.map(x=>x.getBoundingClientRect().top), bottoms=kids.map(x=>x.getBoundingClientRect().bottom);
          const topGap=Math.max(0,Math.min(...tops)-sr.top), bottomGap=Math.max(0,sr.bottom-Math.max(...bottoms));
          if(topGap>190||bottomGap>190)warnings.push({kind:'large-section-blank-space',section:label(sec),topGap:Math.round(topGap),bottomGap:Math.round(bottomGap),height:Math.round(sr.height)});
        }

        const dock=document.querySelector('.rb-mobile-join,.diagnosis-mobile-start');
        if(visible(dock)) warnings.push({kind:'visible-mobile-dock',dock:label(dock),position:getComputedStyle(dock).position,bottom:getComputedStyle(dock).bottom});

        scrollTo(0,document.documentElement.scrollHeight);
        const fixed=[...document.querySelectorAll('body *')].filter(el=>{
          if(!visible(el))return false;
          const s=getComputedStyle(el),r=el.getBoundingClientRect();
          return s.position==='fixed'&&r.bottom>innerHeight-120&&r.top<innerHeight&&r.width>80&&r.height>30&&!el.matches('.site-header,.site-nav,.menu-button');
        });
        const bottomTargets=[...document.querySelectorAll('footer a,footer p,footer small,footer strong,main>section:last-of-type h1,main>section:last-of-type h2,main>section:last-of-type h3,main>section:last-of-type p,main>section:last-of-type a')].filter(visible);
        for(const fx of fixed){
          const fr=fx.getBoundingClientRect();
          const hits=bottomTargets.filter(t=>!fx.contains(t)&&intersects(fr,t.getBoundingClientRect())).slice(0,8).map(label);
          if(hits.length)warnings.push({kind:'fixed-bottom-overlap',fixed:label(fx),hits});
        }
        scrollTo(0,0);
        return warnings.slice(0,40);
      });

      if(!response||response.status()>=400) failures.push({file,width,kind:'http',status:response?.status()});
      if(data.overflow) failures.push({file,width,kind:'overflow',by:data.overflowBy});
      if(!data.universalChrome.partnerStripVisible||data.universalChrome.partnerLogoCount<6) failures.push({file,width,kind:'universal-partner-strip',chrome:data.universalChrome});
      if(!data.universalChrome.footerVisible||data.universalChrome.footerSocialCount<2) failures.push({file,width,kind:'universal-footer',chrome:data.universalChrome});
      if(data.whiteOnLight.length) failures.push({file,width,kind:'white-on-light',elements:data.whiteOnLight});
      if(data.explicitContrastWarnings.length) failures.push({file,width,kind:'button-or-number-contrast',elements:data.explicitContrastWarnings});
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

      if(data.universalChrome.headerSocialCount<2) failures.push({file,width,kind:'header-social-missing',chrome:data.universalChrome});
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
          const menuSocial=await page.evaluate(()=>[...document.querySelectorAll('.rb-menu-social a')].filter(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0&&r.width>8&&r.height>8;}).length);
          if(menuSocial<2) failures.push({file,width,kind:'mobile-social-missing',visible:menuSocial});
        }
      }

      summary.push({file,width,...data,layoutWarnings});
      await page.close();
    }
  }

  await browser.close();
  const layoutWarnings=summary.filter(x=>x.layoutWarnings?.length).map(x=>({file:x.file,width:x.width,warnings:x.layoutWarnings}));
  console.log('BOTANICAL_SMOKE='+JSON.stringify({tested:summary.length,failures,layoutWarnings}));
  if(failures.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
