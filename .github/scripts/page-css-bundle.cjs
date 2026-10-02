const fs=require('fs');
const path=require('path');
const CleanCSS=require('clean-css');

const targets=['index.html','thoughts.html','learn.html','event.html','report.html','partner.html','diagnosis.html','contact.html','photo-credits.html','404.html'];
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

function localStylesheetMatches(html){
  const matches=[];
  const re=/<link\b[^>]*>/gi;
  let m;
  while((m=re.exec(html))){
    const tag=m[0];
    const rel=(tag.match(/\brel=["']([^"']+)["']/i)||[])[1]||'';
    const href=(tag.match(/\bhref=["']([^"']+)["']/i)||[])[1]||'';
    const clean=href.split('?')[0].split('#')[0];
    if(!/\bstylesheet\b/i.test(rel)||!href||/^https?:/i.test(clean)||!clean.endsWith('.css')||!fs.existsSync(clean)) continue;
    matches.push({tag,href,clean,start:m.index,end:m.index+tag.length});
  }
  return matches;
}

function groupContiguousLinks(html,matches){
  const groups=[];
  let current=[];
  for(const item of matches){
    if(!current.length){
      current=[item];
      continue;
    }
    const prev=current[current.length-1];
    const between=html.slice(prev.end,item.start);
    // Only collapse links that were already adjacent in cascade order.
    // Comments and inline <style> blocks deliberately break a group.
    if(/^\s*$/.test(between)) current.push(item);
    else {
      groups.push(current);
      current=[item];
    }
  }
  if(current.length) groups.push(current);
  return groups;
}

(async()=>{
  for(const page of targets){
    let html=fs.readFileSync(page,'utf8');
    const matches=localStylesheetMatches(html);
    if(!matches.length) throw new Error('No local CSS links found for '+page);
    const groups=groupContiguousLinks(html,matches);

    const replacements=[];
    const groupStats=[];
    let totalSource=0,totalFinal=0;

    for(let gi=0;gi<groups.length;gi++){
      const group=groups[gi];
      let combined='';
      for(const item of group){
        combined+=`\n/* ===== SOURCE: ${item.clean} ===== */\n${expandLocalImports(fs.readFileSync(item.clean,'utf8'),item.clean,[item.clean])}\n`;
      }

      const minified=new CleanCSS({
        level:{1:{all:true},2:false},
        rebase:false,
        compatibility:'*'
      }).minify(combined);
      if(minified.errors.length) throw new Error(page+' group '+(gi+1)+' CleanCSS: '+minified.errors.join('; '));

      const base=page.replace('.html','');
      const suffix=groups.length===1?'':`-${gi+1}`;
      const out=`${base}-optimized-20261002${suffix}.css`;
      const banner=`/* ${page} verified CSS run ${gi+1}/${groups.length}. Generated 2026-10-02 from: ${group.map(x=>x.clean).join(', ')} */\n`;
      const finalCss=banner+minified.styles+'\n';
      fs.writeFileSync(out,finalCss);

      const replacement=`<link rel="stylesheet" href="${out}?v=1" data-rb-optimized="true">`;
      replacements.push({
        start:group[0].start,
        end:group[group.length-1].end,
        replacement
      });

      const sourceBytes=Buffer.byteLength(combined);
      const finalBytes=Buffer.byteLength(finalCss);
      totalSource+=sourceBytes;
      totalFinal+=finalBytes;
      groupStats.push({
        group:gi+1,
        sourceFiles:group.map(x=>x.clean),
        sourceBytes,
        finalBytes,
        reductionPct:Number((100*(1-finalBytes/sourceBytes)).toFixed(1))
      });
    }

    // Replace from the end so original offsets stay valid.
    for(const r of replacements.sort((a,b)=>b.start-a.start)){
      html=html.slice(0,r.start)+r.replacement+html.slice(r.end);
    }
    fs.writeFileSync(page,html);

    stats.push({
      page,
      originalRequests:matches.length,
      bundledRequests:groups.length,
      requestReduction:matches.length-groups.length,
      sourceBytes:totalSource,
      finalBytes:totalFinal,
      reductionPct:Number((100*(1-totalFinal/totalSource)).toFixed(1)),
      groups:groupStats
    });
  }
  fs.writeFileSync('qa-page-css/stats.json',JSON.stringify(stats,null,2));
  console.log('PAGE_CSS_STATS='+JSON.stringify(stats));
})().catch(e=>{console.error(e);process.exit(1)});
