const puppeteer=require('puppeteer-core');

const expected=[
  ['.definition-card',3,'用語カード'],
  ['.data-grid--large>article',3,'数値カード'],
  ['.chart-card',2,'データグラフ'],
  ['.cause-grid>article',4,'原因カード'],
  ['#project .event-values>article',4,'企画カード']
];

(async()=>{
  const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();
  const failures=[];

  const visibleCount=async selector=>page.$$eval(selector,els=>els.filter(el=>{
    const s=getComputedStyle(el),r=el.getBoundingClientRect();
    return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!>0&&r.width>8&&r.height>8;
  }).length);

  await page.setViewport({width:1440,height:1000});
  await page.goto('http://127.0.0.1:8000/learn.html',{waitUntil:'networkidle0',timeout:30000});
  await page.evaluate(async()=>{
    for(let y=0;y<document.documentElement.scrollHeight;y+=650){scrollTo(0,y);await new Promise(r=>setTimeout(r,20));}
    scrollTo(0,0);
  });
  await new Promise(r=>setTimeout(r,350));

  const desktop={};
  for(const [sel,min,label] of expected){
    const visible=await visibleCount(sel);
    desktop[label]={visible,min};
    if(visible<min)failures.push({kind:'content',label,visible,min});
  }
  desktop.nav=await visibleCount('.site-nav');
  desktop.photos=await page.$$eval('main img',imgs=>imgs.filter(img=>{
    const s=getComputedStyle(img),r=img.getBoundingClientRect();
    return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!>0&&r.width>8&&r.height>8&&img.naturalWidth>0&&img.naturalHeight>0;
  }).length);
  desktop.overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+3);
  if(!desktop.nav||desktop.photos<4||desktop.overflow)failures.push({kind:'desktop-shell',desktop});

  await page.setViewport({width:375,height:812});
  await page.reload({waitUntil:'networkidle0',timeout:30000});
  const before={
    button:await visibleCount('.menu-button'),
    nav:await visibleCount('.site-nav')
  };
  if(!before.button||before.nav)failures.push({kind:'mobile-before',before});
  await page.click('.menu-button');
  await new Promise(r=>setTimeout(r,120));
  const after=await page.evaluate(()=>({
    nav:(()=>{
      const el=document.querySelector('.site-nav');if(!el)return false;
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!>0&&r.width>8&&r.height>8;
    })(),
    expanded:document.querySelector('.menu-button')?.getAttribute('aria-expanded'),
    menuOpen:document.body.classList.contains('menu-open')
  }));
  if(!after.nav||after.expanded!=='true'||!after.menuOpen)failures.push({kind:'mobile-after',after});

  console.log('LEARN_BOTANICAL='+JSON.stringify({desktop,before,after,failures}));
  await browser.close();
  if(failures.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
