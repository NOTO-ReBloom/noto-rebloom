const puppeteer=require('puppeteer-core');

(async()=>{
  const browser=await puppeteer.launch({
    headless:true,
    executablePath:process.env.CHROME_PATH,
    args:['--no-sandbox','--disable-dev-shm-usage']
  });
  const page=await browser.newPage();
  const failures=[];

  for(const [width,height] of [[1440,1000],[390,844]]){
    await page.setViewport({width,height,deviceScaleFactor:1});
    await page.goto('http://127.0.0.1:8000/index.html',{waitUntil:'networkidle0',timeout:30000});
    await new Promise(r=>setTimeout(r,800));

    const data=await page.evaluate(()=>{
      const visible=el=>{
        if(!el)return false;
        const s=getComputedStyle(el),r=el.getBoundingClientRect();
        return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0&&r.width>8&&r.height>8;
      };
      const hero=document.querySelector('.hero--home');
      const h1=hero?.querySelector('h1');
      const photo=hero?.querySelector('.photo-frame--home-venue img');
      const media=hero?.querySelector('.hero-media');
      const before=media?getComputedStyle(media,'::before'):null;
      const after=media?getComputedStyle(media,'::after'):null;
      const buttons=[...hero?.querySelectorAll('.button-row .btn')||[]];
      return{
        heroVisible:visible(hero),
        heroHeight:hero?.getBoundingClientRect().height||0,
        h1Visible:visible(h1),
        h1Text:h1?.innerText?.replace(/\s+/g,' ').trim()||'',
        h1Font:getComputedStyle(h1).fontFamily,
        bodyFont:getComputedStyle(document.body).fontFamily,
        photoVisible:visible(photo),
        photoLoaded:!!photo&&photo.naturalWidth>0&&photo.naturalHeight>0,
        photoTop:photo?.getBoundingClientRect().top??99999,
        titleTop:h1?.getBoundingClientRect().top??99999,
        decorativeA:before?.backgroundImage||'none',
        decorativeB:after?.backgroundImage||'none',
        visibleButtons:buttons.filter(visible).length,
        overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+3
      };
    });

    if(!data.heroVisible||!data.h1Visible)failures.push({width,kind:'hero-hidden',data});
    if(width>900&&data.heroHeight<650)failures.push({width,kind:'hero-too-small',height:data.heroHeight});
    if(!data.photoVisible||!data.photoLoaded)failures.push({width,kind:'hero-photo',data});
    if(!(data.photoTop<data.titleTop))failures.push({width,kind:'photo-not-first',photoTop:data.photoTop,titleTop:data.titleTop});
    if(data.decorativeA==='none'||data.decorativeB==='none')failures.push({width,kind:'hero-collage-missing',data});
    if(!/M PLUS Rounded 1c/i.test(data.h1Font))failures.push({width,kind:'heading-font',font:data.h1Font});
    if(!/Noto Sans JP/i.test(data.bodyFont))failures.push({width,kind:'body-font',font:data.bodyFont});
    if(data.visibleButtons<3)failures.push({width,kind:'hero-buttons',visible:data.visibleButtons});
    if(data.overflow)failures.push({width,kind:'overflow'});
    if(!data.h1Text.includes('能登の次へ'))failures.push({width,kind:'headline-copy',text:data.h1Text});
  }

  console.log('HOME_HERO='+JSON.stringify({failures}));
  await browser.close();
  if(failures.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
