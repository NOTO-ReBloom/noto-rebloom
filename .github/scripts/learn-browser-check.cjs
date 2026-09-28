const puppeteer=require('puppeteer-core');

const expected=[
  ['.definition-card',3,'基本用語カード'],
  ['.data-grid.data-grid--large>article',3,'数値カード'],
  ['.chart-card',2,'データグラフカード'],
  ['.cause-grid>article',4,'原因カード'],
  ['#project .event-values>article',4,'企画カード'],
  ['#project .rb-project-map-inline',1,'企画図カード']
];
const visible=el=>{
  const s=getComputedStyle(el),r=el.getBoundingClientRect();
  return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>10&&r.height>10;
};

(async()=>{
  const browser=await puppeteer.launch({
    headless:true,
    executablePath:process.env.CHROME_PATH,
    args:['--no-sandbox','--disable-dev-shm-usage']
  });
  const page=await browser.newPage();
  const results={};

  await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:8000/learn.html',{waitUntil:'networkidle0',timeout:30000});
  await new Promise(r=>setTimeout(r,1200));
  results.desktop=await page.evaluate((expected)=>{
    const v=el=>{
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>10&&r.height>10;
    };
    const nav=document.querySelector('.site-nav');
    return {
      navVisible:!!nav&&v(nav),
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+3,
      groups:expected.map(([selector,min,label])=>{
        const els=[...document.querySelectorAll(selector)];
        return {selector,label,min,total:els.length,visible:els.filter(v).length};
      })
    };
  },expected);

  await page.setViewport({width:375,height:812,deviceScaleFactor:1});
  await page.reload({waitUntil:'networkidle0',timeout:30000});
  await new Promise(r=>setTimeout(r,500));
  results.mobileClosed=await page.evaluate(()=>{
    const v=el=>{
      if(!el)return false;
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>10&&r.height>10;
    };
    return {
      menuButtonVisible:v(document.querySelector('.menu-button')),
      navVisible:v(document.querySelector('.site-nav')),
      expanded:document.querySelector('.menu-button')?.getAttribute('aria-expanded'),
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+3
    };
  });
  await page.click('.menu-button');
  await new Promise(r=>setTimeout(r,180));
  results.mobileOpen=await page.evaluate((expected)=>{
    const v=el=>{
      if(!el)return false;
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>10&&r.height>10;
    };
    const nav=document.querySelector('.site-nav');
    return {
      navVisible:v(nav),
      expanded:document.querySelector('.menu-button')?.getAttribute('aria-expanded'),
      menuOpen:document.body.classList.contains('menu-open'),
      groups:expected.map(([selector,min,label])=>{
        const els=[...document.querySelectorAll(selector)];
        return {selector,label,min,total:els.length,visible:els.filter(v).length};
      })
    };
  },expected);

  await browser.close();

  const groupFailures=[...results.desktop.groups,...results.mobileOpen.groups]
    .filter(x=>x.total<x.min||x.visible<x.min);
  const failures=[];
  if(!results.desktop.navVisible||results.desktop.overflow) failures.push(['desktop-shell',results.desktop]);
  if(!results.mobileClosed.menuButtonVisible||results.mobileClosed.navVisible||results.mobileClosed.expanded!=='false'||results.mobileClosed.overflow) failures.push(['mobile-closed',results.mobileClosed]);
  if(!results.mobileOpen.navVisible||results.mobileOpen.expanded!=='true'||!results.mobileOpen.menuOpen) failures.push(['mobile-open',results.mobileOpen]);
  failures.push(...groupFailures.map(x=>['card-group',x]));

  console.log('LEARN_UI_CHECK='+JSON.stringify({results,failures}));
  if(failures.length) process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
