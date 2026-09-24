const puppeteer=require('puppeteer-core');

const pages=['index.html','thoughts.html','learn.html','event.html','report.html','partner.html','contact.html','photo-credits.html','404.html','diagnosis.html'];
const widths=[[375,812],[430,932],[768,1024],[1440,1000]];

(async()=>{
  const browser=await puppeteer.launch({
    headless:true,
    executablePath:process.env.CHROME_PATH,
    args:['--no-sandbox','--disable-dev-shm-usage']
  });
  const results=[];
  for(const file of pages){
    for(const [width,height] of widths){
      const page=await browser.newPage();
      await page.setViewport({width,height,deviceScaleFactor:1});
      const errors=[];
      page.on('console',m=>{if(m.type()==='error')errors.push('console:'+m.text())});
      page.on('pageerror',e=>errors.push('page:'+String(e)));
      await page.goto('http://127.0.0.1:8000/'+file,{waitUntil:'networkidle0',timeout:30000});
      await new Promise(r=>setTimeout(r,250));
      const data=await page.evaluate(()=>{
        const root=document.documentElement;
        const broken=[...document.images].filter(img=>img.getAttribute('src')&&img.complete&&img.naturalWidth===0).map(img=>img.getAttribute('src'));
        return {
          overflow:root.scrollWidth>root.clientWidth+2,
          broken,
          h1:document.querySelectorAll('h1').length
        };
      });
      results.push({file,width,...data,errors});
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
      faqCategory:!!document.querySelector('.faq-category')
    }));
  }
  await featurePage.close();
  await browser.close();

  const failures=results.filter(x=>x.overflow||x.broken.length||x.errors.length||x.h1!==1);
  const required=[
    ['index.html','partnerStrip'],['index.html','footerSocial'],['index.html','contactFab'],
    ['learn.html','farmlandStory'],['event.html','faqCategory'],
    ['report.html','partnerStrip'],['partner.html','partnerStrip']
  ];
  const missing=required.filter(([p,k])=>!features[p]?.[k]).map(([p,k])=>p+':'+k);
  console.log('SMOKE_SUMMARY='+JSON.stringify({tested:results.length,failures,features,missing}));
  if(failures.length||missing.length) process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});