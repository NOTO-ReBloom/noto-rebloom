const fs=require('fs');
const path=require('path');

const targets=['diagnosis.html'];
const sourceManifest={
  'diagnosis.html':[
    'site.css',
    'rebloom-unified.css',
    'rebloom-polish.css',
    'rebloom-detail.css',
    'rebloom-refine.css',
    'rebloom-balance.css',
    'rebloom-tight.css',
    'rebloom-purpose.css',
    'rebloom-purpose-complete.css',
    'brand-refresh.css',
    'diagnosis-v2.css',
    'diagnosis-fixes.css',
    'diagnosis-ux-v3.css',
    'site-consistency.css',
    'typography-responsive-20260928.css',
    'plant-art-20260929.css',
    'diagnosis-site-match-20260929.css',
    'diagnosis-result-clean-20260929.css',
    'diagnosis-social-20260929.css',
    'diagnosis-polish-20261002.css'
  ]
};

fs.mkdirSync('qa-page-css',{recursive:true});
const stats=[];

function expandLocalImports(css,sourcePath,stack=[]){
  const dir=path.dirname(sourcePath);
  return css.replace(/@import\s+(?:url\()?\s*["']?([^"'\)\s;]+)["']?\s*\)?\s*;/gi,(full,href)=>{
    if(/^https?:/i.test(href)||href.startsWith('//')) return full;
    const clean=href.split('?')[0].split('#')[0];
    if(!clean.endsWith('.css')) return full;
    const resolved=path.normalize(path.join(dir,clean));
    if(!fs.existsSync(resolved)) return full;
    if(stack.includes(resolved)) return '';
    const nested=fs.readFileSync(resolved,'utf8');
    return `\n/* ===== INLINED IMPORT: ${resolved} ===== */\n${expandLocalImports(nested,resolved,[...stack,resolved])}\n`;
  });
}

(async()=>{
  for(const page of targets){
    let html=fs.readFileSync(page,'utf8');
    const sourceFiles=sourceManifest[page];
    if(!sourceFiles?.length) throw new Error('No CSS source manifest for '+page);
    for(const file of sourceFiles){
      if(!fs.existsSync(file)) throw new Error(page+': missing CSS source '+file);
    }

    let combined='';
    for(const clean of sourceFiles){
      combined+=`\n/* ===== SOURCE: ${clean} ===== */\n${expandLocalImports(fs.readFileSync(clean,'utf8'),clean,[clean])}\n`;
    }

    const base=page.replace('.html','');
    const out=`${base}-optimized-20261002.css`;
    const banner=`/* ${page} verified CSS request bundle. Generated 2026-10-02 from: ${sourceFiles.join(', ')} */\n`;
    const bundled=banner+combined+'\n';
    fs.writeFileSync(out,bundled);

    const optimizedTag=`<link rel="stylesheet" href="${out}?v=1" data-rb-optimized="true">`;
    if(!html.includes('data-rb-optimized="true"')){
      let inserted=false;
      html=html.replace(/<link\b[^>]*>/gi,tag=>{
        const rel=(tag.match(/\brel=["']([^"']+)["']/i)||[])[1]||'';
        const href=(tag.match(/\bhref=["']([^"']+)["']/i)||[])[1]||'';
        if(!/\bstylesheet\b/i.test(rel)||!href) return tag;
        const clean=href.split('?')[0].split('#')[0];
        if(!sourceFiles.includes(clean)) return tag;
        if(!inserted){
          inserted=true;
          return optimizedTag;
        }
        return '';
      });
      if(!inserted) throw new Error('Could not insert optimized CSS link for '+page);
    }else{
      html=html.replace(/<link\b[^>]*data-rb-optimized=["']true["'][^>]*>/i,optimizedTag);
    }
    fs.writeFileSync(page,html);

    stats.push({
      page,
      sourceFiles,
      sourceBytes:Buffer.byteLength(combined),
      bundledBytes:Buffer.byteLength(bundled),
      requestCountBefore:sourceFiles.length,
      requestCountAfter:1
    });
  }
  fs.writeFileSync('qa-page-css/stats.json',JSON.stringify(stats,null,2));
  console.log('PAGE_CSS_STATS='+JSON.stringify(stats));
})().catch(e=>{console.error(e);process.exit(1)});
