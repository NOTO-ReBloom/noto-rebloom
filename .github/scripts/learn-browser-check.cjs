const puppeteer=require('puppeteer-core');

const expected=[
  ['.term',3,'用語'],
  ['.data-metric',3,'数値'],
  ['.data-panel',2,'データパネル'],
  ['.list-block',8,'理由と企画']
];

(async()=>{
  const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();
  const visible=async selector=>page.$$eval(selector,els=>els.filter(el=>{
    const s=getComputedStyle(el),r=el.getBoundingClientRect();
    return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>8&&r.height>8;
  }).length);

  await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:8000/learn.html',{waitUntil:'networkidle0',timeout:30000});
  const desktop={};
  for(const [selector,min,label] of expected) desktop[label]={visible:await visible(selector),min};
  desktop.nav=await visible('.site-nav');
  desktop.overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+3);

  await page.setViewport({width:375,height:812,deviceScaleFactor:1});
  await page.reload({waitUntil:'networkidle0',timeout:30000});
  const before={toggle:await visible('.menu-toggle'),nav:await visible('.site-nav')};
  await page.click('.menu-toggle');
  await new Promise(r=>setTimeout(r,80));
  const after={nav:await visible('.site-nav'),expanded:await page.$eval('.menu-toggle',el=>el.getAttribute('aria-expanded'))};

  await browser.close();
  const failures=[];
  for(const [label,v] of Object.entries(desktop)){
    if(typeof v==='object'&&v.visible<v.min) failures.push({label,...v});
  }
  if(!desktop.nav||desktop.overflow) failures.push({kind:'desktop-shell',desktop});
  if(!before.toggle||before.nav) failures.push({kind:'mobile-before',before});
  if(!after.nav||after.expanded!=='true') failures.push({kind:'mobile-after',after});
  console.log('LEARN_2026='+JSON.stringify({desktop,before,after,failures}));
  if(failures.length) process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
