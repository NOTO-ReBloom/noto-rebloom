const fs=require('fs');
const dir='qa/lighthouse';
const out=[];
if(fs.existsSync(dir)){
  for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){
    try{
      const j=JSON.parse(fs.readFileSync(dir+'/'+f,'utf8'));
      const c=j.categories||{};
      out.push({
        file:f,
        performance:Math.round((c.performance?.score||0)*100),
        accessibility:Math.round((c.accessibility?.score||0)*100),
        bestPractices:Math.round((c['best-practices']?.score||0)*100),
        seo:Math.round((c.seo?.score||0)*100),
        lcp:j.audits?.['largest-contentful-paint']?.numericValue||null,
        cls:j.audits?.['cumulative-layout-shift']?.numericValue||null,
        tbt:j.audits?.['total-blocking-time']?.numericValue||null
      });
    }catch(e){}
  }
}
fs.writeFileSync('qa/lighthouse-summary.json',JSON.stringify(out,null,2));