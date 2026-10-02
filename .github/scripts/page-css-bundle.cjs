const fs=require('fs');
const path=require('path');

const targets=['index.html','thoughts.html','learn.html','event.html','report.html','partner.html','diagnosis.html','contact.html','photo-credits.html','404.html'];
const outDir='assets/css';
fs.mkdirSync(outDir,{recursive:true});
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
      combined+=`\n/* ===== SOURCE: ${item.clean} ===== */\n${expandLocalImports(fs.readFileSync(item.clean,'utf8'),item.clean,[item.clean])}\n`;
    }

    /*
      Preserve the exact cascade. Earlier experiments showed that CSS
      optimizer rewrites can change legacy shorthand/cascade behavior.
      The safe performance win is therefore request consolidation only:
      local imports are expanded in place and the source CSS is otherwise
      kept byte-for-byte and in document order.
    */
    const base=page.replace('.html','');
    const out=`${base}-optimized-20261002.css`;
    const banner=`/* ${page} verified CSS request bundle. Generated 2026-10-02 from: ${cssHrefs.map(x=>x.clean).join(', ')} */\n`;
    const bundled=banner+combined+'\n';
    fs.writeFileSync(out,bundled);

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
      bundledBytes:Buffer.byteLength(bundled),
      finalBytes:Buffer.byteLength(bundled),
      reductionPct:Number((100*(1-Buffer.byteLength(bundled)/Buffer.byteLength(combined))).toFixed(1)),
      requestCountBefore:cssHrefs.length,
      requestCountAfter:1
    });
  }
  fs.writeFileSync('qa-page-css/stats.json',JSON.stringify(stats,null,2));
  console.log('PAGE_CSS_STATS='+JSON.stringify(stats));
})().catch(e=>{console.error(e);process.exit(1)});