const puppeteer=require('puppeteer-core');

const pages=['index.html','thoughts.html','learn.html','event.html','report.html','partner.html','contact.html','photo-credits.html','404.html','diagnosis.html'];
const widths=[[375,812],[430,932],[768,1024],[1440,1000]];
const cardExpectations={
  'index.html':[['.first-visit-grid article',4],['.why-join-grid article',4],['.story-step',7]],
  'thoughts.html':[['.event-values article',3],['.cause-grid article',4]],
  'learn.html':[['.definition-card',3],['.chart-card',2]],
  'event.html':[['.info-card',6],['.game-card',6],['.time-card',4]],
  'report.html':[['.report-summary-card',5],['.report-impact-card',3],['.game-card',5],['.time-card',4]],
  'partner.html':[['.nr-sponsor-wide',3],['.nr-value-grid article',4],['.industry-partner-card',3]],
  'contact.html':[['.contact-card',2]],
  'photo-credits.html':[['.license-card',4]],
  'diagnosis.html':[['.diagnosis-start-card',2],['.flower-group-card',4]]
};

function visibleCardFailure(checks){
  return checks.filter(x=>x.visible<x.min);
}

(async()=>{
  const browser=await puppeteer.launch({
    headless:true,
    executablePath:process.env.CHROME_PATH,
    args:['--no-sandbox','--disable-dev-shm-usage']
  });
  const results=[];
  const typography={};
  for(const file of pages){
    for(const [width,height] of widths){
      const page=await browser.newPage();
      await page.setViewport({width,height,deviceScaleFactor:1});
      const errors=[];
      page.on('console',m=>{if(m.type()==='error')errors.push('console:'+m.text())});
      page.on('pageerror',e=>errors.push('page:'+String(e)));
      const response=await page.goto('http://127.0.0.1:8000/'+file,{waitUntil:'networkidle0',timeout:30000});
      await page.evaluate(async()=>{
        const step=Math.max(320,Math.floor(innerHeight*.75));
        for(let y=0;y<document.documentElement.scrollHeight;y+=step){
          scrollTo(0,y);
          await new Promise(r=>setTimeout(r,45));
        }
        scrollTo(0,document.documentElement.scrollHeight);
      });
      await new Promise(r=>setTimeout(r,650));
      const expected=cardExpectations[file]||[];
      const data=await page.evaluate((expected)=>{
        const root=document.documentElement;
        const images=[...document.images];
        const broken=images
          .filter(img=>img.getAttribute('src')&&img.complete&&img.naturalWidth===0)
          .map(img=>img.currentSrc||img.getAttribute('src'));
        const unloaded=images
          .filter(img=>img.getAttribute('src')&&!img.complete)
          .map(img=>img.currentSrc||img.getAttribute('src'));
        const cardChecks=expected.map(([selector,min])=>{
          const els=[...document.querySelectorAll(selector)];
          const visible=els.filter(el=>{
            const s=getComputedStyle(el),r=el.getBoundingClientRect();
            return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>10&&r.height>10;
          }).length;
          return {selector,min,total:els.length,visible};
        });
        const overflowers=[...document.querySelectorAll('body *')].filter(el=>{
          const s=getComputedStyle(el);
          if(s.position==='fixed'||s.display==='none')return false;
          const r=el.getBoundingClientRect();
          return r.width>0&&(r.right>innerWidth+3||r.left<-3);
        }).slice(0,15).map(el=>{
          const r=el.getBoundingClientRect();
          return {tag:el.tagName,cls:String(el.className||'').slice(0,100),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)};
        });
        const h1=document.querySelector('h1');
        const nav=document.querySelector('.site-nav a');
        return {
          status:document.readyState,
          overflow:root.scrollWidth>root.clientWidth+3,
          overflowBy:root.scrollWidth-root.clientWidth,
          overflowers,
          broken,
          unloaded,
          h1Count:document.querySelectorAll('h1').length,
          cardChecks,
          h1Typography:h1?{fontFamily:getComputedStyle(h1).fontFamily,fontWeight:getComputedStyle(h1).fontWeight}:null,
          navTypography:nav?{fontFamily:getComputedStyle(nav).fontFamily,fontWeight:getComputedStyle(nav).fontWeight}:null
        };
      },expected);
      const cardFailures=visibleCardFailure(data.cardChecks);
      results.push({file,width,httpStatus:response?response.status():0,...data,cardFailures,errors});
      if(width===1440) typography[file]={h1:data.h1Typography,nav:data.navTypography};
      await page.close();
    }
  }

  const featurePage=await browser.newPage();
  await featurePage.setViewport({width:1440,height:1000,deviceScaleFactor:1});
  const features={};
  for(const file of ['index.html','learn.html','event.html','report.html','partner.html','contact.html']){
    await featurePage.goto('http://127.0.0.1:8000/'+file,{waitUntil:'networkidle0',timeout:30000});
    await new Promise(r=>setTimeout(r,300));
    features[file]=await featurePage.evaluate(()=>({
      partnerStrip:!!document.querySelector('.site-partner-strip'),
      footerSocial:!!document.querySelector('.rb-social-links--footer'),
      contactFab:!!document.querySelector('.rb-contact-fab'),
      farmlandStory:!!document.querySelector('#farmland-data-story'),
      faqArchive:document.querySelectorAll('#event-faq .faq-list details').length>=10
    }));
  }
  await featurePage.close();
  await browser.close();

  const failures=results.filter(x=>x.httpStatus>=400||x.overflow||x.broken.length||x.errors.length||x.h1Count!==1||x.cardFailures.length);
  const required=[
    ['index.html','partnerStrip'],['index.html','footerSocial'],['index.html','contactFab'],
    ['learn.html','farmlandStory'],['event.html','faqArchive'],
    ['report.html','partnerStrip'],['partner.html','partnerStrip']
  ];
  const missing=required.filter(([p,k])=>!features[p]?.[k]).map(([p,k])=>p+':'+k);

  const homeFont=typography['index.html']?.h1;
  const diagnosisFont=typography['diagnosis.html']?.h1;
  const homeNav=typography['index.html']?.nav;
  const diagnosisNav=typography['diagnosis.html']?.nav;
  const typographyFailures=[];
  if(!homeFont||!diagnosisFont||homeFont.fontFamily!==diagnosisFont.fontFamily||Number(diagnosisFont.fontWeight)<800){
    typographyFailures.push({kind:'diagnosis-h1-vs-home',homeFont,diagnosisFont});
  }
  if(!homeNav||!diagnosisNav||homeNav.fontFamily!==diagnosisNav.fontFamily||Number(diagnosisNav.fontWeight)<700){
    typographyFailures.push({kind:'diagnosis-nav-vs-home',homeNav,diagnosisNav});
  }

  const summary={tested:results.length,failures,features,missing,typography,typographyFailures};
  console.log('SMOKE_SUMMARY='+JSON.stringify(summary));
  if(failures.length||missing.length||typographyFailures.length) process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
