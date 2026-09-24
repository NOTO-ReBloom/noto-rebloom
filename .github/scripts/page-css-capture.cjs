const fs=require('fs');
const puppeteer=require('puppeteer-core');

const mode=process.argv[2]||'before';
const out='qa-page-css-'+mode;
fs.mkdirSync(out,{recursive:true});
const pages=['index.html','partner.html','report.html','contact.html'];
const viewports=[[430,932],[1440,1000]];

(async()=>{
  const browser=await puppeteer.launch({
    headless:true,
    executablePath:process.env.CHROME_PATH,
    args:['--no-sandbox','--disable-dev-shm-usage','--font-render-hinting=none']
  });
  const summary=[];
  for(const file of pages){
    for(const [width,height] of viewports){
      const page=await browser.newPage();
      await page.setViewport({width,height,deviceScaleFactor:1});
      const errors=[];
      page.on('console',m=>{if(m.type()==='error')errors.push('console:'+m.text())});
      page.on('pageerror',e=>errors.push('page:'+String(e)));
      await page.goto('http://127.0.0.1:8000/'+file,{waitUntil:'networkidle0',timeout:30000});
      await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}html{scroll-behavior:auto!important}'});
      await new Promise(r=>setTimeout(r,500));
      const metrics=await page.evaluate(()=>({
        width:document.documentElement.clientWidth,
        scrollWidth:document.documentElement.scrollWidth,
        broken:[...document.images].filter(i=>i.getAttribute('src')&&i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src')),
        h1:document.querySelectorAll('h1').length
      }));
      await page.screenshot({path:`${out}/${file.replace('.html','')}-${width}.png`,fullPage:true});
      summary.push({file,width,...metrics,errors});
      await page.close();
    }
  }
  await browser.close();
  fs.writeFileSync(out+'/layout.json',JSON.stringify(summary,null,2));
})().catch(e=>{console.error(e);process.exit(1)});