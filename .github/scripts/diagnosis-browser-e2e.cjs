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
    staleThreeChoice:(document.body.innerText||'').includes('3つの選択肢'),
    hasResponseFrame:(document.body.innerText||'').includes('直近3か月くらい'),
    hasValidityDisclosure:(document.body.innerText||'').includes('標準化や妥当性検証を行った心理検査ではありません')
  }));
  if(initial.answers!==4)throw new Error('Expected 4 answer buttons, got '+initial.answers);
  if(initial.count!=='1 / 40')throw new Error('Expected initial progress 1 / 40, got '+initial.count);
  if(!initial.start||!initial.resultToggle)throw new Error('Missing diagnosis controls');
  if(!initial.has40||initial.stale56||initial.staleThreeChoice||!initial.hasResponseFrame||!initial.hasValidityDisclosure)throw new Error('Diagnosis guidance/copy regression: '+JSON.stringify(initial));

  await new Promise(r=>setTimeout(r,1200));
  const flowerPhotos=await page.evaluate(async()=>{
    const atlas=[...document.querySelectorAll('.flower-atlas-card img')];
    const urls=[...new Set(atlas.map(img=>img.src))];
    const failures=[];
    await Promise.all(urls.map(src=>new Promise(resolve=>{
      const test=new Image();
      test.onload=()=>resolve();
      test.onerror=()=>{failures.push(src);resolve();};
      test.src=src;
    })));
    return{
      atlasCount:atlas.length,
      atlasVisible:atlas.filter(img=>Number(getComputedStyle(img).opacity)>0).length,
      fileCount:urls.length,
      fileFailures:failures,
      heroLoaded:document.querySelector('.page-hero--diagnosis .photo-frame img')?.naturalWidth>0
    };
  });
  if(flowerPhotos.atlasCount!==32||flowerPhotos.atlasVisible!==32||flowerPhotos.fileCount!==32||flowerPhotos.fileFailures.length||!flowerPhotos.heroLoaded){
    throw new Error('Flower photos not fully available: '+JSON.stringify(flowerPhotos));
  }
  const photoPresentation=await page.evaluate(()=>{
    const hero=document.querySelector('.page-hero--diagnosis .photo-frame');
    const atlas=document.querySelector('.flower-atlas-card');
    const pseudo=(el,p)=>getComputedStyle(el,p).content;
    return{
      heroBefore:pseudo(hero,'::before'),
      heroAfter:pseudo(hero,'::after'),
      atlasBefore:pseudo(atlas,'::before'),
      resultOverlay:!!document.querySelector('.result-portrait-label'),
      heroCaptionOutside:!!hero?.querySelector('figcaption'),
      creditOutside:!!hero?.querySelector('.hero-photo-credit')
    };
  });
  const activePseudo=v=>v&&v!=='none'&&v!=='normal'&&v!=='""'&&v!=="''";
  if(activePseudo(photoPresentation.heroBefore)||activePseudo(photoPresentation.heroAfter)||activePseudo(photoPresentation.atlasBefore)||photoPresentation.resultOverlay||!photoPresentation.heroCaptionOutside||!photoPresentation.creditOutside){
    throw new Error('Photography overlay regression: '+JSON.stringify(photoPresentation));
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
    responsePattern:document.getElementById('resultResponsePattern')?.textContent?.trim(),
    axisAgreement:[...document.querySelectorAll('.axis-response-agreement')].map(x=>x.textContent.trim()),
    detailExpanded:document.getElementById('resultDetailToggle')?.getAttribute('aria-expanded'),
    overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2
  }));
  if(!result.title||!result.quickStrength||!result.quickAxis||!result.responsePattern||result.axisAgreement.length!==5)throw new Error('Result transparency summary was not populated: '+JSON.stringify(result));
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
  console.log('DIAGNOSIS_E2E_OK='+JSON.stringify({initial,flowerPhotos,photoPresentation,result,expanded,saved}));
  await browser.close();
})().catch(async e=>{
  console.error(e);
  process.exit(1);
});
