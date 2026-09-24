const fs=require('fs');
const puppeteer=require('puppeteer-core');
const mode=process.argv[2]||'final';
const out='qa-'+mode;
fs.mkdirSync(out,{recursive:true});
const pages=['index.html','thoughts.html','learn.html','event.html','report.html','partner.html','contact.html','photo-credits.html','404.html','diagnosis.html'];
const widths=[375,430,768,1440];
const heights={375:812,430:932,768:1024,1440:1000};

(async()=>{
  const browser=await puppeteer.launch({
    headless:true,
    executablePath:process.env.CHROME_PATH,
    args:['--no-sandbox','--disable-dev-shm-usage','--font-render-hinting=none']
  });
  const summary=[];
  for(const file of pages){
    for(const width of widths){
      const page=await browser.newPage();
      await page.setViewport({width,height:heights[width],deviceScaleFactor:1});
      const errors=[];
      page.on('console',msg=>{if(msg.type()==='error')errors.push('console:'+msg.text())});
      page.on('pageerror',err=>errors.push('page:'+String(err)));
      await page.goto('http://127.0.0.1:8000/'+file,{waitUntil:'networkidle0',timeout:30000});
      await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}html{scroll-behavior:auto!important}'});
      await new Promise(r=>setTimeout(r,400));
      const metrics=await page.evaluate(()=>{
        const vw=document.documentElement.clientWidth;
        const offenders=[...document.querySelectorAll('body *')].filter(el=>{
          const s=getComputedStyle(el);
          if(s.display==='none'||s.visibility==='hidden'||s.position==='fixed')return false;
          const r=el.getBoundingClientRect();
          return r.width>0&&(r.right>vw+2||r.left<-2);
        }).slice(0,20).map(el=>{
          const r=el.getBoundingClientRect();
          return {tag:el.tagName,cls:String(el.className||'').slice(0,120),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)};
        });
        const brokenImages=[...document.images].filter(img=>img.complete&&img.naturalWidth===0).map(img=>img.src);
        const tinyTargets=[...document.querySelectorAll('a,button,input,select,textarea')].filter(el=>{
          const r=el.getBoundingClientRect(),s=getComputedStyle(el);
          return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0&&(r.width<36||r.height<36);
        }).slice(0,40).map(el=>({tag:el.tagName,text:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,60),w:Math.round(el.getBoundingClientRect().width),h:Math.round(el.getBoundingClientRect().height)}));
        return {
          scrollWidth:document.documentElement.scrollWidth,
          clientWidth:vw,
          horizontalOverflow:document.documentElement.scrollWidth>vw+2,
          offenders,
          brokenImages,
          h1:document.querySelectorAll('h1').length,
          tinyTargets
        };
      });
      const name=file.replace('.html','')+'-'+width+'.png';
      await page.screenshot({path:out+'/'+name,fullPage:true});
      summary.push(Object.assign({file,width},metrics,{errors}));
      await page.close();
    }
  }
  fs.writeFileSync(out+'/layout.json',JSON.stringify(summary,null,2));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});