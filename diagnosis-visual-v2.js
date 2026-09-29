(()=>{
'use strict';

const NAME_TO_SLUG={
'ヒマワリ':'himawari','ガーベラ':'gerbera','サルビア':'salvia','ダリア':'dahlia','チューリップ':'tulip','マリーゴールド':'marigold','ポピー':'poppy','ハイビスカス':'hibiscus',
'フリージア':'freesia','コスモス':'cosmos','アネモネ':'anemone','クレマチス':'clematis','アイリス':'iris','ネモフィラ':'nemophila','ルピナス':'lupinus','カスミソウ':'kasumisou',
'シロツメクサ':'shirotsumekusa','レンゲ':'renge','ツバキ':'tsubaki','ナデシコ':'nadeshiko','菜の花':'nanohana','ミモザ':'mimosa','リンドウ':'rindou','エーデルワイス':'edelweiss',
'アジサイ':'ajisai','ラベンダー':'lavender','睡蓮':'suiren','桔梗':'kikyo','ワスレナグサ':'wasurenagusa','スミレ':'sumire','タンポポ':'tanpopo','カモミール':'chamomile'
};

const SOCIAL_COPY={
himawari:'気づけば、人の輪の真ん中にいる。',
gerbera:'初対面でも、いつの間にか壁がなくなる。',
salvia:'誰も動かないなら、自分から火をつける。',
dahlia:'せっかくなら、「いい感じ」で終わらせない。',
tulip:'「やってみたい」を、ちゃんと一歩にできる。',
marigold:'明るく見えて、実はかなり粘り強い。',
poppy:'行き詰まったときほど、別の入口を見つける。',
hibiscus:'普通の日にも、ちょっとした見せ場をつくる。',
cosmos:'自由そうに見えて、自分の軸はちゃんとある。',
mimosa:'押しつけないのに、なぜか背中を押される。',
lupinus:'昨日の自分より、少し先に行きたい。',
iris:'ごちゃついた話ほど、すっと整理したくなる。',
freesia:'話しやすい空気は、たぶん無意識につくってる。',
clematis:'人と出会うたび、自分の世界が少し広がる。',
anemone:'みんなが流した違和感を、ひとりだけ拾っている。',
edelweiss:'派手じゃなくても、譲らない基準がある。',
renge:'気づけば、誰かが動きやすい土台をつくっている。',
shirotsumekusa:'大げさじゃない優しさを、毎日に置いていく。',
tanpopo:'どこに行っても、自分なりの居場所をつくれる。',
nadeshiko:'静かに見えて、譲れないところはちゃんとある。',
nanohana:'身近な人の「ちょっといい日」を増やしたい。',
kasumisou:'目立たないところまで、ちゃんと見えている。',
tsubaki:'見せびらかさなくても、自分の基準で立っている。',
sumire:'控えめなのに、あとからじわっと残る。',
nemophila:'小さな変化ほど、先に気づいてしまう。',
wasurenagusa:'「覚えていてくれた」が、自然にできる。',
suiren:'すぐ答えを出すより、ちゃんと深く考えたい。',
kikyo:'言葉は少なくても、伝えるときは丁寧に。',
ajisai:'合わせられる。でも、ただ流されているわけじゃない。',
chamomile:'一緒にいると、少し力が抜けると言われがち。',
lavender:'急がなくても、自分のペースに戻れる。',
rindou:'静かに決めたことほど、最後まで手放さない。'
};

const PHOTO_VERSION='20260918free1';
const SANS='"Noto Sans JP","Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif';
const photoUrl=slug=>`flower-photo-${slug}.webp?v=${PHOTO_VERSION}`;
const legacyUrl=slug=>`${slug}.png?v=${PHOTO_VERSION}`;
let latestCards=null;
let renderToken=0;

function groupAccent(group){
  return {'太陽の花':'#c89b13','風の花':'#4f91aa','里山の花':'#5f8b56','水辺の花':'#6878ae'}[group]||'#174b3b';
}
function ensureFixStyles(){
  if(document.querySelector('link[href*="diagnosis-fixes.css"]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=`diagnosis-fixes.css?v=${PHOTO_VERSION}`;
  document.head.appendChild(link);
}
function roundRectPath(ctx,x,y,w,h,r){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();ctx.moveTo(x+rr,y);
  ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr);
  ctx.arcTo(x,y,x+w,y,rr);
  ctx.closePath();
}
function drawCover(ctx,img,x,y,w,h){
  const scale=Math.max(w/img.width,h/img.height);
  const sw=w/scale,sh=h/scale,sx=(img.width-sw)/2,sy=(img.height-sh)/2;
  ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
}
function fitText(ctx,text,maxWidth,startSize,minSize,weight='800'){
  let size=startSize;
  while(size>minSize){
    ctx.font=`${weight} ${size}px ${SANS}`;
    if(ctx.measureText(text).width<=maxWidth)break;
    size-=2;
  }
  return size;
}
function drawWrapped(ctx,text,x,y,maxWidth,lineHeight,maxLines,font,fill){
  const chars=[...(text||'').trim()];
  ctx.font=font;ctx.fillStyle=fill;
  const lines=[];let current='';
  for(const ch of chars){
    const test=current+ch;
    if(current&&ctx.measureText(test).width>maxWidth){
      lines.push(current);current=ch;
      if(lines.length===maxLines-1)break;
    }else current=test;
  }
  if(current&&lines.length<maxLines)lines.push(current);
  if(lines.join('').length<chars.length&&lines.length){
    let last=lines[lines.length-1];
    while(last&&ctx.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);
    lines[lines.length-1]=last+'…';
  }
  lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));
  return lines.length;
}
function loadImage(src){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=reject;
    img.src=src;
  });
}
async function loadFlowerImage(slug){
  try{return await loadImage(photoUrl(slug));}
  catch{return await loadImage(legacyUrl(slug));}
}
function setPhoto(img,slug,name){
  if(!img)return;
  let fallback=false;
  img.onload=()=>img.classList.add('fd-photo-ready');
  img.onerror=()=>{
    if(!fallback){fallback=true;img.src=legacyUrl(slug);return;}
    img.onerror=null;
  };
  img.src=photoUrl(slug);
  img.alt=`${name}の花の写真`;
}
function bindVisibleFlowerPhoto(img){
  if(!(img instanceof HTMLImageElement))return;
  if(img.complete&&img.naturalWidth>0)img.classList.add('fd-photo-ready');
  img.addEventListener('load',()=>img.classList.add('fd-photo-ready'),{once:true});
}
function bindAllVisibleFlowerPhotos(root=document){
  root.querySelectorAll?.('img[src*="flower-photo-"]').forEach(bindVisibleFlowerPhoto);
}
function compactText(text,max=22){
  const s=(text||'').trim();
  return s.length>max?s.slice(0,max-1)+'…':s;
}
function dataFromDom(){
  const name=(document.getElementById('resultTitle')?.textContent||'花').replace(/タイプ$/,'').trim();
  const slug=NAME_TO_SLUG[name]||'renge';
  const axes=[...document.querySelectorAll('#resultAxisNarratives .axis-narrative-card')].map((el,i)=>{
    const raw=parseFloat(el.querySelector('.axis-position i')?.style.left||'50');
    return{
      key:String(i),
      left:'',
      right:'',
      title:el.querySelector('b')?.textContent?.trim()||'',
      badge:el.querySelector('span')?.textContent?.trim()||'',
      position:Number.isFinite(raw)?raw:50
    };
  });
  return{
    slug,name,
    group:document.getElementById('resultGroup')?.textContent?.trim()||'',
    tagline:document.getElementById('resultLead')?.textContent?.trim()||'',
    keywords:[...document.querySelectorAll('#resultKeywords span')].map(x=>x.textContent.trim()),
    strengths:[...document.querySelectorAll('#resultStrengths li')].map(x=>x.textContent.trim()),
    watch:[document.getElementById('resultQuickWatch')?.textContent?.trim()||''],
    message:document.getElementById('resultMessage')?.textContent?.trim()||'',
    desc:document.getElementById('resultDesc')?.textContent?.trim()||'',
    axes,
    neighbor:{
      name:document.getElementById('resultNeighborName')?.textContent?.trim()||'',
      slug:NAME_TO_SLUG[document.getElementById('resultNeighborName')?.textContent?.trim()]||''
    },
    complementGroup:(document.getElementById('resultPartnerGroup')?.textContent||'').replace('の強みを借りるなら','').trim()
  };
}
function currentData(){
  const d=window.__rebloomShareResult;
  return d?.slug?JSON.parse(JSON.stringify(d)):dataFromDom();
}

function drawAxis(ctx,axis,x,y,w,accent,story=false){
  const ink='#21372e',muted='#738078';
  const titleSize=story?19:15;
  ctx.fillStyle=ink;ctx.font=`800 ${titleSize}px ${SANS}`;
  ctx.fillText(axis.title||'傾向',x,y);

  const labelY=y+(story?28:23);
  ctx.fillStyle=muted;ctx.font=`600 ${story?12:10}px ${SANS}`;
  ctx.fillText(axis.left||'',x,labelY);
  ctx.textAlign='right';ctx.fillText(axis.right||'',x+w,labelY);ctx.textAlign='left';

  const barY=labelY+(story?20:15);
  ctx.strokeStyle='rgba(33,55,46,.16)';
  ctx.lineWidth=story?4:3;
  ctx.beginPath();ctx.moveTo(x,barY);ctx.lineTo(x+w,barY);ctx.stroke();

  ctx.strokeStyle='rgba(33,55,46,.08)';
  ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(x+w/2,barY-(story?9:7));ctx.lineTo(x+w/2,barY+(story?9:7));ctx.stroke();

  const p=Math.max(0,Math.min(100,Number(axis.position)||50))/100;
  const dotX=x+w*p;
  ctx.fillStyle=accent;ctx.beginPath();ctx.arc(dotX,barY,story?8:7,0,Math.PI*2);ctx.fill();
}

function buildEditorialCard(photo,data){
  const W=1080,H=1350,m=62;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const ink='#1d342a',muted='#66746d',paper='#f7f4ec',accent=groupAccent(data.group);

  ctx.fillStyle=paper;ctx.fillRect(0,0,W,H);
  drawCover(ctx,photo,0,0,W,500);

  // Editorial photo caption line.
  ctx.fillStyle='rgba(255,255,255,.96)';
  ctx.font=`700 15px ${SANS}`;
  ctx.fillText(data.group||'花タイプ',m,50);
  ctx.textAlign='right';
  ctx.fillText('FLOWER TYPE / 32',W-m,50);
  ctx.textAlign='left';

  // Main title field.
  ctx.fillStyle=paper;ctx.fillRect(0,500,W,H-500);
  ctx.fillStyle=accent;ctx.fillRect(m,548,72,4);

  ctx.fillStyle=muted;ctx.font=`700 13px ${SANS}`;
  ctx.fillText('RESULT PROFILE',m,580);

  const titleSize=fitText(ctx,data.name,W-m*2,64,48,'900');
  ctx.fillStyle=ink;ctx.font=`900 ${titleSize}px ${SANS}`;
  ctx.fillText(data.name,m,652);
  ctx.fillStyle=muted;ctx.font=`700 18px ${SANS}`;
  ctx.fillText('TYPE',m+ctx.measureText(data.name).width+18,650);

  const copy=SOCIAL_COPY[data.slug]||data.tagline||'';
  drawWrapped(ctx,copy,m,704,W-m*2,35,2,`700 27px ${SANS}`,'#344d42');

  ctx.strokeStyle='rgba(29,52,42,.14)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(m,772);ctx.lineTo(W-m,772);ctx.stroke();

  // Five-axis profile — dense but clean, no pills/cards.
  ctx.fillStyle=muted;ctx.font=`700 12px ${SANS}`;
  ctx.fillText('5 AXES',m,803);

  const axes=(data.axes||[]).slice(0,5);
  const axisW=442;
  axes.forEach((axis,i)=>{
    const col=i<3?0:1;
    const row=col===0?i:i-3;
    const x=col===0?m:W-m-axisW;
    const y=837+row*74;
    drawAxis(ctx,axis,x,y,axisW,accent,false);
  });

  // Bottom editorial information grid.
  const infoTop=1062;
  ctx.beginPath();ctx.moveTo(m,infoTop);ctx.lineTo(W-m,infoTop);ctx.stroke();

  const colGap=26,colW=(W-m*2-colGap*2)/3;
  const labels=['STRENGTH','WATCH','NEAR FLOWER'];
  const values=[
    compactText(data.strengths?.[0]||data.keywords?.[0]||'',28),
    compactText(data.watch?.[0]||'',28),
    compactText((data.neighbor?.name||'')+'タイプ',28)
  ];
  for(let i=0;i<3;i++){
    const x=m+i*(colW+colGap);
    ctx.fillStyle=muted;ctx.font=`700 11px ${SANS}`;
    ctx.fillText(labels[i],x,1096);
    drawWrapped(ctx,values[i],x,1130,colW,24,2,`700 16px ${SANS}`,ink);
  }

  ctx.beginPath();ctx.moveTo(m,1212);ctx.lineTo(W-m,1212);ctx.stroke();

  ctx.fillStyle=ink;ctx.font=`800 17px ${SANS}`;
  ctx.fillText('NOTO Re:Bloom',m,1260);
  ctx.fillStyle=muted;ctx.font=`500 12px ${SANS}`;
  ctx.fillText('花タイプ診断',m,1284);
  ctx.textAlign='right';
  ctx.font=`600 12px ${SANS}`;
  ctx.fillText('noto-rebloom.github.io/noto-rebloom/diagnosis.html',W-m,1262);
  if(data.slug==='renge'){
    ctx.fillText('Photo: houroumono / CC BY 2.0 / crop + WebP',W-m,1284);
  }
  ctx.textAlign='left';

  return canvas.toDataURL('image/png',.97);
}

function buildStoryCard(photo,data){
  const W=1080,H=1920,m=66;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const ink='#1d342a',muted='#66746d',paper='#f7f4ec',accent=groupAccent(data.group);

  ctx.fillStyle=paper;ctx.fillRect(0,0,W,H);
  drawCover(ctx,photo,0,0,W,760);

  ctx.fillStyle='rgba(255,255,255,.96)';
  ctx.font=`700 18px ${SANS}`;
  ctx.fillText(data.group||'花タイプ',m,62);
  ctx.textAlign='right';ctx.fillText('FLOWER TYPE / 32',W-m,62);ctx.textAlign='left';

  ctx.fillStyle=paper;ctx.fillRect(0,760,W,H-760);
  ctx.fillStyle=accent;ctx.fillRect(m,820,80,5);
  ctx.fillStyle=muted;ctx.font=`700 14px ${SANS}`;ctx.fillText('RESULT PROFILE',m,857);

  const titleSize=fitText(ctx,data.name,W-m*2,82,60,'900');
  ctx.fillStyle=ink;ctx.font=`900 ${titleSize}px ${SANS}`;
  ctx.fillText(data.name,m,947);
  ctx.fillStyle=muted;ctx.font=`700 20px ${SANS}`;ctx.fillText('TYPE',m+ctx.measureText(data.name).width+20,944);

  const copy=SOCIAL_COPY[data.slug]||data.tagline||'';
  drawWrapped(ctx,copy,m,1014,W-m*2,44,2,`700 32px ${SANS}`,'#344d42');

  ctx.strokeStyle='rgba(29,52,42,.14)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(m,1116);ctx.lineTo(W-m,1116);ctx.stroke();
  ctx.fillStyle=muted;ctx.font=`700 13px ${SANS}`;ctx.fillText('5 AXES',m,1152);

  const axes=(data.axes||[]).slice(0,5);
  axes.forEach((axis,i)=>drawAxis(ctx,axis,m,1192+i*92,W-m*2,accent,true));

  const infoTop=1682;
  ctx.beginPath();ctx.moveTo(m,infoTop);ctx.lineTo(W-m,infoTop);ctx.stroke();
  const colGap=28,colW=(W-m*2-colGap*2)/3;
  const labels=['STRENGTH','WATCH','NEAR FLOWER'];
  const values=[
    compactText(data.strengths?.[0]||data.keywords?.[0]||'',26),
    compactText(data.watch?.[0]||'',26),
    compactText((data.neighbor?.name||'')+'タイプ',26)
  ];
  for(let i=0;i<3;i++){
    const x=m+i*(colW+colGap);
    ctx.fillStyle=muted;ctx.font=`700 12px ${SANS}`;ctx.fillText(labels[i],x,1720);
    drawWrapped(ctx,values[i],x,1758,colW,26,2,`700 17px ${SANS}`,ink);
  }

  ctx.fillStyle=ink;ctx.font=`800 17px ${SANS}`;ctx.fillText('NOTO Re:Bloom',m,1870);
  ctx.textAlign='right';ctx.fillStyle=muted;ctx.font=`600 12px ${SANS}`;
  ctx.fillText('花タイプ診断',W-m,1870);
  if(data.slug==='renge')ctx.fillText('Photo: houroumono / CC BY 2.0 / crop + WebP',W-m,1894);
  ctx.textAlign='left';

  return canvas.toDataURL('image/png',.97);
}

function dataUrlToFile(dataUrl,name){
  const [head,body]=dataUrl.split(',');
  const mime=(head.match(/data:(.*?);/)||[])[1]||'image/png';
  const bin=atob(body),bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return new File([bytes],name,{type:mime});
}

async function refreshResult(){
  const result=document.getElementById('diagnosisResult');
  if(!result?.classList.contains('is-active'))return;
  const data=currentData();
  if(!data?.slug)return;
  setPhoto(document.getElementById('resultImage'),data.slug,data.name);
  const token=++renderToken;

  try{
    if(document.fonts?.ready)await document.fonts.ready;
    const photo=await loadFlowerImage(data.slug);
    if(token!==renderToken)return;

    const feed=buildEditorialCard(photo,data);
    const story=buildStoryCard(photo,data);
    latestCards={feed,story,data};

    const preview=document.getElementById('resultShareImage');
    if(preview)preview.src=feed;
    const storyPreview=document.getElementById('resultStoryImage');
    if(storyPreview)storyPreview.src=story;

    const dl=document.getElementById('downloadCard');
    if(dl){
      dl.href=feed;
      dl.download=`${data.name}タイプ_花タイプ診断.png`;
      dl.textContent='投稿用を保存';
    }
    const storyDl=document.getElementById('downloadStoryCard');
    if(storyDl){
      storyDl.href=story;
      storyDl.download=`${data.name}タイプ_花タイプ診断_story.png`;
      storyDl.textContent='ストーリー用を保存';
    }
  }catch(e){
    console.warn('social card render failed',e);
  }
}

async function shareCard(){
  const status=document.getElementById('diagnosisCopyStatus');
  if(!latestCards){if(status)status.textContent='カードを準備しています。';return;}
  const {feed,data}=latestCards;
  const file=dataUrlToFile(feed,'flower-type-result.png');
  const shareText=`私は「${data.name}タイプ」でした。\n${SOCIAL_COPY[data.slug]||data.tagline||''}`;
  try{
    if(navigator.share&&navigator.canShare?.({files:[file]})){
      await navigator.share({files:[file],title:'NOTO Re:Bloom 花タイプ診断',text:shareText});
      if(status)status.textContent='共有メニューを開きました。';
    }else{
      if(status)status.textContent='この端末では画像共有に対応していません。画像を保存して投稿してください。';
    }
  }catch(e){
    if(e?.name!=='AbortError'&&status)status.textContent='共有できませんでした。画像を保存して投稿してください。';
  }
}

function init(){
  ensureFixStyles();
  bindAllVisibleFlowerPhotos();
  new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes||[]){
        if(node.nodeType!==1)continue;
        if(node.matches?.('img[src*="flower-photo-"]'))bindVisibleFlowerPhoto(node);
        bindAllVisibleFlowerPhotos(node);
      }
    }
  }).observe(document.body,{subtree:true,childList:true});

  document.getElementById('shareDiagnosisCard')?.addEventListener('click',shareCard);
  window.addEventListener('rebloom:diagnosis-result',()=>setTimeout(refreshResult,50));

  const title=document.getElementById('resultTitle');
  if(title)new MutationObserver(()=>setTimeout(refreshResult,80)).observe(title,{childList:true,subtree:true,characterData:true});
  setTimeout(refreshResult,160);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();