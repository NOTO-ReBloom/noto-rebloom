const {chromium}=require('playwright-core');
const fs=require('fs');
const base='http://127.0.0.1:8000/';
const files=['index.html','learn.html','event.html','partner.html','diagnosis.html','404.html'];
const vps=[{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}];
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome'});
  const report=[];
  let hardError=null;
  for(const vp of vps){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},reducedMotion:'reduce'});
    for(const file of files){
      const page=await ctx.newPage(); const errors=[];
      page.on('pageerror',e=>errors.push(String(e)));
      await page.route('**/*',route=>{const u=route.request().url();if(u.startsWith(base)||u.startsWith('data:')||u.startsWith('blob:'))return route.continue();return route.abort()});
      const res=await page.goto(base+file,{waitUntil:'load',timeout:20000});
      await page.waitForTimeout(1000);
      await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=620){scrollTo(0,y);await new Promise(r=>setTimeout(r,10));}scrollTo(0,0)});
      await page.waitForTimeout(150);
      const m=await page.evaluate(()=>{
        const visible=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity!==0&&r.width>8&&r.height>8};
        const cards=[...new Set([...document.querySelectorAll('article,.visual-tile,.join-fact,.nr-choice,.rb-detail-card,.definition-card,.faq-card,.story-step,.rbpc-venue-facts>span')])].filter(visible);
        const outside=[];
        for(const card of cards){
          const cr=card.getBoundingClientRect();const walker=document.createTreeWalker(card,NodeFilter.SHOW_TEXT);let n,bad=false,sample='';
          while(n=walker.nextNode()){
            if(!n.textContent.trim())continue;
            const parent=n.parentElement;
            if(parent){if(parent.closest('.visual-label'))continue;const ps=getComputedStyle(parent);if(ps.position==='absolute'||ps.position==='fixed')continue;}
            const range=document.createRange();range.selectNodeContents(n);
            for(const r of range.getClientRects()){
              if(r.width<1||r.height<1)continue;
              if(r.left<cr.left-2||r.right>cr.right+2||r.top<cr.top-2||r.bottom>cr.bottom+2){bad=true;sample=n.textContent.trim().slice(0,70);break}
            }
            if(bad)break;
          }
          if(bad)outside.push({tag:card.tagName.toLowerCase(),cls:(card.className||'').toString().slice(0,140),sample,w:Math.round(cr.width),h:Math.round(cr.height)});
        }
        const cols=sel=>{const e=document.querySelector(sel);if(!e||!visible(e))return null;return getComputedStyle(e).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length};
        const sections=[...document.querySelectorAll('main>section')].filter(visible).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {cls:(e.className||'').toString().slice(0,120),h:Math.round(r.height),pad:Math.round((parseFloat(s.paddingTop)||0)+(parseFloat(s.paddingBottom)||0))}});
        return {docOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,outside,partnerCols:cols('.nr-value-prop .nr-value-grid'),faqCols:cols('#event-faq .faq-grid'),processCols:cols('#purpose .event-values'),excessive:sections.filter(x=>x.h>680&&x.pad>145)};
      });
      const item={file,vp:vp.name,status:res?.status(),errors,...m};report.push(item);
      await page.screenshot({path:`final-card-audit-x/${file.replace('.html','')}-${vp.name}.png`,fullPage:true});
      const failures=[];
      if(!res||res.status()>=400)failures.push('HTTP');
      if(errors.length)failures.push(`JS ${errors.join(' | ')}`);
      if(m.docOverflow>2)failures.push(`document overflow ${m.docOverflow}`);
      if(m.outside.length)failures.push(`text outside ${JSON.stringify(m.outside.slice(0,5))}`);
      if(file==='partner.html'&&vp.name==='desktop'&&m.partnerCols!==2)failures.push(`partner desktop columns ${m.partnerCols}`);
      if(file==='partner.html'&&vp.name==='mobile'&&m.partnerCols!==1)failures.push(`partner mobile columns ${m.partnerCols}`);
      if(file==='event.html'&&vp.name==='mobile'&&m.faqCols!==1)failures.push(`FAQ mobile columns ${m.faqCols}`);
      if(file==='index.html'&&vp.name==='mobile'&&m.processCols!==1)failures.push(`process mobile columns ${m.processCols}`);
      if(failures.length&&!hardError)hardError=new Error(`${file}/${vp.name}: ${failures.join(' | ')}`);
      await page.close();
    }
    await ctx.close();
  }
  fs.writeFileSync('final-card-audit-x/report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report.map(({file,vp,status,docOverflow,outside,partnerCols,faqCols,processCols,excessive,errors})=>({file,vp,status,docOverflow,outside:outside.length,partnerCols,faqCols,processCols,excessive:excessive.length,errors:errors.length})),null,2));
  await browser.close();
  if(hardError)throw hardError;
})().catch(e=>{console.error(e);process.exit(1)});
