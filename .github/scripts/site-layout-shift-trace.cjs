const puppeteer=require('puppeteer-core');

const targets=[
  ['index.html',1440,1000],
  ['index.html',430,932],
  ['partner.html',1440,1000],
  ['partner.html',430,932],
  ['report.html',430,932]
];

(async()=>{
  const browser=await puppeteer.launch({
    headless:true,
    executablePath:process.env.CHROME_PATH,
    args:['--no-sandbox','--disable-dev-shm-usage']
  });
  const out=[];
  for(const [file,width,height] of targets){
    const page=await browser.newPage();
    await page.setViewport({width,height,deviceScaleFactor:1});
    await page.evaluateOnNewDocument(()=>{
      window.__rbShiftTrace=[];
      new PerformanceObserver(list=>{
        for(const entry of list.getEntries()){
          if(entry.hadRecentInput) continue;
          window.__rbShiftTrace.push({
            value:entry.value,
            time:entry.startTime,
            sources:(entry.sources||[]).map(s=>{
              const n=s.node;
              const label=n ? [
                n.tagName?.toLowerCase?.()||'',
                n.id?('#'+n.id):'',
                n.className?('.'+String(n.className).trim().replace(/\s+/g,'.').slice(0,140)):''
              ].join('') : null;
              const rect=r=>r?{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}:null;
              return {node:label,previous:rect(s.previousRect),current:rect(s.currentRect)};
            })
          });
        }
      }).observe({type:'layout-shift',buffered:true});
    });
    await page.goto('http://127.0.0.1:8000/'+file,{waitUntil:'networkidle0',timeout:30000});
    await new Promise(r=>setTimeout(r,1200));
    const data=await page.evaluate(()=>({
      cls:(window.__rbShiftTrace||[]).reduce((n,x)=>n+x.value,0),
      shifts:window.__rbShiftTrace||[]
    }));
    out.push({file,width,...data});
    await page.close();
  }
  await browser.close();
  console.log('SHIFT_TRACE='+JSON.stringify(out));
})().catch(e=>{console.error(e);process.exit(1)});