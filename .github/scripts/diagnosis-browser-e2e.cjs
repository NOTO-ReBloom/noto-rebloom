const puppeteer=require('puppeteer-core');

(async()=>{
  const browser=await puppeteer.launch({
    headless:true,
    executablePath:process.env.CHROME_PATH,
    args:['--no-sandbox','--disable-dev-shm-usage']
  });
  const page=await browser.newPage();
  await page.setViewport({width:390,height:844,deviceScaleFactor:1});
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push('console:'+m.text())});
  page.on('pageerror',e=>errors.push('page:'+String(e)));

  await page.evaluateOnNewDocument(()=>{
    window.__diagnosisShiftTrace=[];
    new PerformanceObserver(list=>{
      for(const entry of list.getEntries()){
        if(entry.hadRecentInput)continue;
        const rect=r=>r?{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}:null;
        window.__diagnosisShiftTrace.push({
          value:entry.value,
          time:Math.round(entry.startTime),
          sources:(entry.sources||[]).map(src=>{
            const n=src.node;
            const node=n?[
              n.tagName?.toLowerCase?.()||'',
              n.id?('#'+n.id):'',
              n.className?('.'+String(n.className).trim().replace(/\s+/g,'.').slice(0,140)):''
            ].join(''):null;
            return{node,previous:rect(src.previousRect),current:rect(src.currentRect)};
          })
        });
      }
    }).observe({type:'layout-shift',buffered:true});
  });

  const url='http://127.0.0.1:8000/diagnosis.html';
  await page.goto(url,{waitUntil:'networkidle0',timeout:30000});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'networkidle0',timeout:30000});
  await new Promise(r=>setTimeout(r,1200));
  const initialShiftTrace=await page.evaluate(()=>window.__diagnosisShiftTrace||[]);

  const initial=await page.evaluate(()=>({
    answers:document.querySelectorAll('.diagnosis-answer').length,
    count:document.getElementById('questionCount')?.textContent?.trim(),
    start:!!document.getElementById('startDiagnosis'),
    resultToggle:!!document.getElementById('resultDetailToggle'),
    has40:(document.body.innerText||'').includes('全40問'),
    stale56:(document.body.innerText||'').includes('全56問'),
    staleThreeChoice:(document.body.innerText||'').includes('3つの選択肢')
  }));
  if(initial.answers!==4)throw new Error('Expected 4 answer buttons, got '+initial.answers);
  if(initial.count!=='1 / 40')throw new Error('Expected initial progress 1 / 40, got '+initial.count);
  if(!initial.start||!initial.resultToggle)throw new Error('Missing diagnosis controls');
  if(!initial.has40||initial.stale56||initial.staleThreeChoice)throw new Error('Stale diagnosis copy detected: '+JSON.stringify(initial));

  await page.waitForFunction(()=>{
    const imgs=[...document.querySelectorAll('.flower-atlas-card img')];
    return imgs.length===32&&imgs.every(img=>img.complete&&img.naturalWidth>0&&Number(getComputedStyle(img).opacity)>0);
  },{timeout:10000});
  const flowerPhotos=await page.evaluate(()=>({
    atlasCount:document.querySelectorAll('.flower-atlas-card img').length,
    atlasLoaded:[...document.querySelectorAll('.flower-atlas-card img')].filter(img=>img.complete&&img.naturalWidth>0).length,
    atlasVisible:[...document.querySelectorAll('.flower-atlas-card img')].filter(img=>Number(getComputedStyle(img).opacity)>0).length,
    groupLoaded:[...document.querySelectorAll('.flower-group-visual img')].filter(img=>img.complete&&img.naturalWidth>0).length,
    heroLoaded:document.querySelector('.page-hero--diagnosis .photo-frame img')?.naturalWidth>0
  }));
  if(flowerPhotos.atlasCount!==32||flowerPhotos.atlasLoaded!==32||flowerPhotos.atlasVisible!==32||flowerPhotos.groupLoaded!==4||!flowerPhotos.heroLoaded){
    throw new Error('Flower photos not fully visible: '+JSON.stringify(flowerPhotos));
  }

  await page.evaluate(()=>document.getElementById('startDiagnosis').click());
  for(let i=0;i<40;i++){
    const state=await page.evaluate(()=>({
      running:document.getElementById('diagnosisPanel')?.classList.contains('is-active'),
      result:document.getElementById('diagnosisResult')?.classList.contains('is-active'),
      count:document.getElementById('questionCount')?.textContent?.trim()
    }));
    if(i<39&&!state.running)throw new Error('Diagnosis stopped before question '+(i+1));
    if(i<39&&state.count!==`${i+1} / 40`)throw new Error('Unexpected question counter at '+(i+1)+': '+state.count);
    await page.evaluate((answerIndex)=>{
      const buttons=[...document.querySelectorAll('.diagnosis-answer')];
      buttons[answerIndex%buttons.length].click();
    },i);
    await new Promise(r=>setTimeout(r,8));
  }

  await page.waitForFunction(()=>document.getElementById('diagnosisResult')?.classList.contains('is-active'),{timeout:5000});
  const result=await page.evaluate(()=>({
    title:document.getElementById('resultTitle')?.textContent?.trim(),
    quickStrength:document.getElementById('resultQuickStrength')?.textContent?.trim(),
    quickAxis:document.getElementById('resultQuickAxis')?.textContent?.trim(),
    detailExpanded:document.getElementById('resultDetailToggle')?.getAttribute('aria-expanded'),
    overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2
  }));
  if(!result.title||!result.quickStrength||!result.quickAxis)throw new Error('Result summary was not populated');
  if(result.detailExpanded!=='false')throw new Error('Mobile result details should start collapsed');
  if(result.overflow)throw new Error('Horizontal overflow on diagnosis result');

  await page.evaluate(()=>document.getElementById('resultDetailToggle').click());
  const expanded=await page.evaluate(()=>({
    classOpen:document.getElementById('diagnosisResult')?.classList.contains('show-result-details'),
    aria:document.getElementById('resultDetailToggle')?.getAttribute('aria-expanded'),
    deepDisplay:getComputedStyle(document.getElementById('resultDeepDive')).display
  }));
  if(!expanded.classOpen||expanded.aria!=='true'||expanded.deepDisplay==='none')throw new Error('Result details did not expand');

  await page.reload({waitUntil:'networkidle0',timeout:30000});
  const saved=await page.evaluate(()=>({
    hidden:document.getElementById('resumeDiagnosis')?.hidden,
    text:document.getElementById('resumeDiagnosis')?.textContent?.trim()
  }));
  if(saved.hidden||saved.text!=='前回の結果を見る')throw new Error('Completed result was not restored as a saved result');

  await page.evaluate(()=>document.getElementById('resumeDiagnosis').click());
  await page.waitForFunction(()=>document.getElementById('diagnosisResult')?.classList.contains('is-active'),{timeout:5000});

  if(errors.length)throw new Error('Browser errors: '+errors.join(' | '));
  console.log('DIAGNOSIS_SHIFT_TRACE='+JSON.stringify(initialShiftTrace));
  console.log('DIAGNOSIS_E2E_OK='+JSON.stringify({initial,flowerPhotos,result,expanded,saved}));
  await browser.close();
})().catch(async e=>{
  console.error(e);
  process.exit(1);
});
