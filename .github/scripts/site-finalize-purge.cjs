const fs=require('fs');
const {PurgeCSS}=require('purgecss');

(async()=>{
  fs.mkdirSync('qa',{recursive:true});
  const contentFiles=[
    'index.html','thoughts.html','learn.html','event.html','report.html','partner.html',
    'contact.html','photo-credits.html','404.html','diagnosis.html',
    'site-core.js','site-postevent.js','rebloom-unified.js','rebloom-detail.js','site.js',
    'partner-final.js','partner-oteru-profile.js',
    'diagnosis.js','diagnosis-group-colors.js','diagnosis-visual-v2.js'
  ];
  const cssFiles=[
    'site.css',
    'legacy-base-20260924.css',
    'legacy-core-20260924.css',
    'legacy-tuning-20260924.css'
  ];
  const report=[];
  for(const css of cssFiles){
    const before=fs.readFileSync(css,'utf8');
    const res=await new PurgeCSS().purge({
      content:contentFiles,
      css:[{raw:before}],
      safelist:{
        standard:['menu-open','is-visible','is-active','rb-inview','diagnosis-running','diagnosis-has-result'],
        deep:[/^js$/]
      },
      variables:false,
      keyframes:false,
      fontFace:false
    });
    const after=(res[0]&&res[0].css)||before;
    const ratio=after.length/before.length;
    const accepted=ratio<0.98;
    if(accepted)fs.writeFileSync(css,after);
    report.push({
      css,
      before:before.length,
      after:accepted?after.length:before.length,
      reduction:accepted?1-ratio:0,
      accepted
    });
  }
  fs.writeFileSync('qa/css-purge.json',JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1)});