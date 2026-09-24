const fs=require('fs');
const path=require('path');
const {PurgeCSS}=require('purgecss');
const CleanCSS=require('clean-css');

const targets=['index.html','partner.html','report.html','contact.html'];
const outDir='assets/css';
fs.mkdirSync(outDir,{recursive:true});
fs.mkdirSync('qa-page-css',{recursive:true});

const rootJs=fs.readdirSync('.').filter(f=>f.endsWith('.js')&&fs.statSync(f).isFile());
const jsContent=rootJs.map(f=>({raw:fs.readFileSync(f,'utf8'),extension:'js'}));

const safeGreedy=[
  /^rb-/,/^nr-/,/^page-/,/^site-/,/^report-/,/^partner-/,/^contact-/,
  /^hero/,/^photo-/,/^story-/,/^faq-/,/^visual-/,/^join-/,/^conversion-/,
  /^scroll-/,/^back-/,/^btn/,/^eyebrow/,/^section/,/^container/,/^brand/,
  /^menu-/,/^is-/,/^js$/, /^no-js$/, /^reveal$/, /^active$/, /^open$/,
  /^current/,/^mobile-/,/^footer-/,/^header-/,/^quick-/,/^data-/,/^field-/,
  /^team-/,/^sponsor-/,/^support-/,/^event-/,/^renge-/,/^timeline/,
  /^people-/,/^first-/,/^why-/,/^choice-/,/^crowd-/,/^ishimo-/
];

const stats=[];

(async()=>{
  for(const page of targets){
    let html=fs.readFileSync(page,'utf8');
    const tags=[...html.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]);
    const cssHrefs=[];
    for(const tag of tags){
      const rel=(tag.match(/\brel=["']([^"']+)["']/i)||[])[1]||'';
      const href=(tag.match(/\bhref=["']([^"']+)["']/i)||[])[1]||'';
      if(!/\bstylesheet\b/i.test(rel)||!href) continue;
      const clean=href.split('?')[0].split('#')[0];
      if(/^https?:/i.test(clean)||!clean.endsWith('.css')||!fs.existsSync(clean)) continue;
      cssHrefs.push({tag,href,clean});
    }
    if(!cssHrefs.length) throw new Error('No local CSS links found for '+page);

    let combined='';
    for(const item of cssHrefs){
      combined+=`\n/* ===== SOURCE: ${item.clean} ===== */\n${fs.readFileSync(item.clean,'utf8')}\n`;
    }

    const purged=(await new PurgeCSS().purge({
      content:[{raw:html,extension:'html'},...jsContent],
      css:[{raw:combined}],
      safelist:{standard:['html','body','main'],greedy:safeGreedy},
      keyframes:true,
      fontFace:true,
      variables:false,
      defaultExtractor:content=>content.match(/[A-Za-z0-9_:\/-]+/g)||[]
    }))[0].css;

    const minified=new CleanCSS({
      level:{1:{all:true},2:false},
      rebase:false,
      compatibility:'*'
    }).minify(purged);

    if(minified.errors.length) throw new Error(page+' CleanCSS: '+minified.errors.join('; '));

    const base=page.replace('.html','');
    const out=`${outDir}/${base}-optimized-20260924.css`;
    const banner=`/* ${page} page-specific CSS bundle. Generated 2026-09-24 from: ${cssHrefs.map(x=>x.clean).join(', ')} */\n`;
    fs.writeFileSync(out,banner+minified.styles+'\n');

    let inserted=false;
    html=html.replace(/<link\b[^>]*>/gi,tag=>{
      const rel=(tag.match(/\brel=["']([^"']+)["']/i)||[])[1]||'';
      const href=(tag.match(/\bhref=["']([^"']+)["']/i)||[])[1]||'';
      const clean=href.split('?')[0].split('#')[0];
      if(!/\bstylesheet\b/i.test(rel)||!href||/^https?:/i.test(clean)||!clean.endsWith('.css')||!fs.existsSync(clean)) return tag;
      if(!inserted){
        inserted=true;
        return `<link rel="stylesheet" href="${out}?v=1" data-rb-optimized="true">`;
      }
      return '';
    });
    if(!inserted) throw new Error('Could not insert optimized CSS link for '+page);
    fs.writeFileSync(page,html);

    stats.push({
      page,
      sourceFiles:cssHrefs.map(x=>x.clean),
      sourceBytes:Buffer.byteLength(combined),
      purgedBytes:Buffer.byteLength(purged),
      finalBytes:Buffer.byteLength(banner+minified.styles+'\n'),
      reductionPct:Number((100*(1-Buffer.byteLength(banner+minified.styles+'\n')/Buffer.byteLength(combined))).toFixed(1))
    });
  }
  fs.writeFileSync('qa-page-css/stats.json',JSON.stringify(stats,null,2));
  console.log('PAGE_CSS_STATS='+JSON.stringify(stats));
})().catch(e=>{console.error(e);process.exit(1)});