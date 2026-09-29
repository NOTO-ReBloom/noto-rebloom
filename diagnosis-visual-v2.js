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
const photoUrl=slug=>`flower-photo-${slug}.webp?v=${PHOTO_VERSION}`;
const legacyUrl=slug=>`${slug}.png?v=${PHOTO_VERSION}`;
const SANS='"Noto Sans JP","Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif';

let latestCards=null;
let renderToken=0;

function groupAccent(group){
  return {'太陽の花':'#d4a81e','風の花':'#4c91a8','里山の花':'#62885b','水辺の花':'#6876a6'}[group]||'#174b3b';
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
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr);
  ctx.arcTo(x,y,x+w,y,rr);
  ctx.closePath();
}
function drawCover(ctx,img,x,y,w,h,r=0){
  const scale=Math.max(w/img.width,h/img.height);
  const sw=w/scale,sh=h/scale,sx=(img.width-sw)/2,sy=(img.height-sh)/2;
  ctx.save();
  if(r){roundRectPath(ctx,x,y,w,h,r);ctx.clip();}
  ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
  ctx.restore();
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
  return y+(Math.max(1,lines.length)-1)*lineHeight;
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
function slugFromTitle(){
  return NAME_TO_SLUG[(document.getElementById('resultTitle')?.textContent||'').replace(/タイプ$/,'').trim()]||'renge';
}
function compactTags(data){
  const source=[...(data.keywords||[]),...(data.strengths||[])];
  const seen=new Set();
  const out=[];
  for(let item of source){
    item=(item||'').trim().replace(/こと$/,'').replace(/できる$/,'').replace(/がある$/,'');
    if(!item||seen.has(item))continue;
    seen.add(item);out.push(item);
    if(out.length===4)break;
  }
  return out;
}
function dataFromDom(){
  const name=(document.getElementById('resultTitle')?.textContent||'花').replace(/タイプ$/,'').trim();
  const slug=NAME_TO_SLUG[name]||'renge';
  const axes=[...document.querySelectorAll('#resultAxisNarratives .axis-narrative-card')].map((el,i)=>{
    const marker=el.querySelector('.axis-position i');
    const raw=parseFloat(marker?.style.left||'50');
    return{
      key:String(i),
      left:'',right:'',
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
    message:document.getElementById('resultMessage')?.textContent?.trim()||'',
    axes,
    neighbor:{
      name:document.getElementById('resultNeighborName')?.textContent?.trim()||'',
      slug:NAME_TO_SLUG[document.getElementById('resultNeighborName')?.textContent?.trim()]||''
    },
    complementGroup:(document.getElementById('resultPartnerGroup')?.textContent||'').replace('の強みを借りるなら','').trim()
  };
}
function currentData(){
  const fromWindow=window.__rebloomShareResult;
  if(fromWindow?.slug)return JSON.parse(JSON.stringify(fromWindow));
  return dataFromDom();
}

function drawFooter(ctx,W,H,m,label,index){
  ctx.strokeStyle='rgba(24,55,45,.12)';
  ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(m,H-92);ctx.lineTo(W-m,H-92);ctx.stroke();
  ctx.fillStyle='#18372d';
  ctx.font=`800 18px ${SANS}`;
  ctx.fillText('NOTO Re:Bloom',m,H-50);
  ctx.textAlign='right';
  ctx.fillStyle='#6b7771';
  ctx.font=`600 14px ${SANS}`;
  ctx.fillText(`${label}  ·  ${index}`,W-m,H-50);
  ctx.textAlign='left';
}

function buildCoverCard(photo,data){
  const W=1080,H=1350,m=58;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const accent=groupAccent(data.group);
  ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);

  drawCover(ctx,photo,0,0,W,790,0);
  const grad=ctx.createLinearGradient(0,560,0,790);
  grad.addColorStop(0,'rgba(0,0,0,0)');
  grad.addColorStop(1,'rgba(0,0,0,.36)');
  ctx.fillStyle=grad;ctx.fillRect(0,530,W,260);
  ctx.fillStyle='rgba(255,255,255,.94)';
  ctx.font=`700 17px ${SANS}`;
  ctx.fillText('MY FLOWER TYPE',m,72);

  ctx.fillStyle='#fff';ctx.fillRect(0,790,W,H-790);
  ctx.fillStyle=accent;ctx.fillRect(m,838,78,5);

  ctx.fillStyle='#69756f';
  ctx.font=`700 18px ${SANS}`;
  ctx.fillText(data.group||'花タイプ',m,886);

  const title=`${data.name}タイプ`;
  const size=fitText(ctx,title,W-m*2,78,54,'800');
  ctx.fillStyle='#18372d';
  ctx.font=`800 ${size}px ${SANS}`;
  ctx.fillText(title,m,982);

  const copy=SOCIAL_COPY[data.slug]||data.tagline||'';
  drawWrapped(ctx,copy,m,1048,W-m*2,42,2,`600 28px ${SANS}`,'#3f544b');

  const tags=compactTags(data).slice(0,3);
  ctx.fillStyle='#65716b';
  ctx.font=`600 18px ${SANS}`;
  ctx.fillText(tags.map(x=>'#'+x.replace(/\s+/g,'')).join('   '),m,1168);

  drawFooter(ctx,W,H,m,'32 FLOWER TYPES','01 / 03');
  return canvas.toDataURL('image/png',.96);
}

function buildProfileCard(data){
  const W=1080,H=1350,m=62;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const accent=groupAccent(data.group);
  ctx.fillStyle='#f5f3ec';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#fff';roundRectPath(ctx,30,30,W-60,H-60,26);ctx.fill();

  ctx.fillStyle=accent;ctx.fillRect(m,72,72,5);
  ctx.fillStyle='#68746e';ctx.font=`700 16px ${SANS}`;
  ctx.fillText('MY FLOWER PROFILE  ·  02 / 03',m,112);

  ctx.fillStyle='#18372d';ctx.font=`800 48px ${SANS}`;
  ctx.fillText('わたしをつくる、5つの咲き方。',m,184);
  ctx.fillStyle='#647169';ctx.font=`600 20px ${SANS}`;
  ctx.fillText(`${data.name}タイプ  /  ${data.group}`,m,226);

  const axes=(data.axes||[]).slice(0,5);
  const rowTop=278,rowH=158,barX=m,barW=W-m*2;
  axes.forEach((axis,i)=>{
    const y=rowTop+i*rowH;
    ctx.fillStyle='#18372d';ctx.font=`800 25px ${SANS}`;
    ctx.fillText(axis.title||`傾向 ${i+1}`,m,y);

    ctx.textAlign='right';
    ctx.fillStyle='#7a8580';ctx.font=`700 14px ${SANS}`;
    ctx.fillText(axis.badge||'',W-m,y);
    ctx.textAlign='left';

    const ly=y+46;
    ctx.fillStyle='#738079';ctx.font=`600 14px ${SANS}`;
    ctx.fillText(axis.left||'',m,ly);
    ctx.textAlign='right';ctx.fillText(axis.right||'',W-m,ly);ctx.textAlign='left';

    const barY=y+72;
    ctx.strokeStyle='rgba(24,55,45,.18)';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(barX,barY);ctx.lineTo(barX+barW,barY);ctx.stroke();
    ctx.strokeStyle='rgba(24,55,45,.08)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(barX+barW/2,barY-14);ctx.lineTo(barX+barW/2,barY+14);ctx.stroke();

    const p=Math.max(0,Math.min(100,Number(axis.position)||50))/100;
    const dotX=barX+barW*p;
    ctx.fillStyle=accent;ctx.beginPath();ctx.arc(dotX,barY,10,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(dotX,barY,10,0,Math.PI*2);ctx.stroke();
  });

  const tags=compactTags(data);
  const tagY=1092;
  ctx.fillStyle='#66736c';ctx.font=`700 16px ${SANS}`;
  ctx.fillText('こんなところが出やすい',m,tagY);
  drawWrapped(
    ctx,
    tags.map(x=>'#'+x.replace(/\s+/g,'')).join('   '),
    m,tagY+42,W-m*2,34,2,
    `700 21px ${SANS}`,
    '#29483d'
  );

  drawFooter(ctx,W,H,m,'5 AXES','02 / 03');
  return canvas.toDataURL('image/png',.96);
}

function buildRelationCard(photo,neighborPhoto,data){
  const W=1080,H=1350,m=62;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const accent=groupAccent(data.group);
  ctx.fillStyle='#f7f5ef';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#fff';roundRectPath(ctx,30,30,W-60,H-60,26);ctx.fill();

  ctx.fillStyle=accent;ctx.fillRect(m,72,72,5);
  ctx.fillStyle='#68746e';ctx.font=`700 16px ${SANS}`;
  ctx.fillText('FLOWER CONNECTION  ·  03 / 03',m,112);

  ctx.fillStyle='#18372d';ctx.font=`800 49px ${SANS}`;
  ctx.fillText('あなたに近い、もう一輪。',m,185);
  ctx.fillStyle='#66736c';ctx.font=`500 20px ${SANS}`;
  ctx.fillText('答え方が少し変わると、近くに咲くタイプです。',m,226);

  const gap=28,imgW=(W-m*2-gap)/2,imgH=360,imgY=286;
  drawCover(ctx,photo,m,imgY,imgW,imgH,20);
  if(neighborPhoto)drawCover(ctx,neighborPhoto,m+imgW+gap,imgY,imgW,imgH,20);
  else{
    ctx.fillStyle='#eef0eb';roundRectPath(ctx,m+imgW+gap,imgY,imgW,imgH,20);ctx.fill();
  }

  ctx.fillStyle='#18372d';ctx.font=`800 31px ${SANS}`;
  ctx.fillText(data.name,m,690);
  ctx.fillText(data.neighbor?.name||'近い花',m+imgW+gap,690);

  ctx.fillStyle='#7a8580';ctx.font=`600 15px ${SANS}`;
  ctx.fillText('YOUR TYPE',m,721);
  ctx.fillText('NEAR FLOWER',m+imgW+gap,721);

  ctx.fillStyle='#f3f5f0';roundRectPath(ctx,m,775,W-m*2,160,18);ctx.fill();
  ctx.fillStyle='#647169';ctx.font=`700 15px ${SANS}`;
  ctx.fillText('違う強みを借りるなら',m+26,816);
  ctx.fillStyle='#18372d';ctx.font=`800 36px ${SANS}`;
  ctx.fillText(data.complementGroup||'別の花グループ',m+26,868);
  ctx.fillStyle='#68746e';ctx.font=`500 18px ${SANS}`;
  ctx.fillText('自分と違う咲き方を持つ人と組むと、見える景色が増える。',m+26,908);

  ctx.fillStyle='#18372d';ctx.font=`800 52px ${SANS}`;
  ctx.fillText('友達は、何の花？',m,1022);
  ctx.fillStyle='#596a62';ctx.font=`600 22px ${SANS}`;
  ctx.fillText('見せ合うと、同じところも違うところも面白い。',m,1065);
  ctx.fillStyle=accent;ctx.font=`800 20px ${SANS}`;
  ctx.fillText('32種類の花タイプから見つける →',m,1114);

  drawFooter(ctx,W,H,m,'SHARE WITH FRIENDS','03 / 03');
  return canvas.toDataURL('image/png',.96);
}

function buildStoryCard(photo,data){
  const W=1080,H=1920,m=66;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const accent=groupAccent(data.group);
  ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);

  drawCover(ctx,photo,0,0,W,1180,0);
  const grad=ctx.createLinearGradient(0,760,0,1180);
  grad.addColorStop(0,'rgba(0,0,0,0)');
  grad.addColorStop(1,'rgba(0,0,0,.48)');
  ctx.fillStyle=grad;ctx.fillRect(0,700,W,480);

  ctx.fillStyle='rgba(255,255,255,.95)';ctx.font=`700 20px ${SANS}`;
  ctx.fillText('私の花タイプは——',m,92);

  ctx.fillStyle='#fff';
  const title=`${data.name}タイプ`;
  const size=fitText(ctx,title,W-m*2,88,62,'800');
  ctx.font=`800 ${size}px ${SANS}`;
  ctx.fillText(title,m,1040);
  ctx.font=`600 22px ${SANS}`;
  ctx.fillText(data.group,m,1090);

  ctx.fillStyle='#fff';ctx.fillRect(0,1180,W,H-1180);
  ctx.fillStyle=accent;ctx.fillRect(m,1244,84,6);

  const copy=SOCIAL_COPY[data.slug]||data.tagline||'';
  drawWrapped(ctx,copy,m,1340,W-m*2,58,2,`700 39px ${SANS}`,'#18372d');

  const tags=compactTags(data).slice(0,3);
  ctx.fillStyle='#66736c';ctx.font=`700 21px ${SANS}`;
  ctx.fillText(tags.map(x=>'#'+x.replace(/\s+/g,'')).join('   '),m,1492);

  ctx.fillStyle='#18372d';ctx.font=`800 40px ${SANS}`;
  ctx.fillText('私っぽい？',m,1615);
  ctx.fillStyle='#7b8781';ctx.font=`500 18px ${SANS}`;
  ctx.fillText('ここに投票・質問スタンプを重ねて使えます',m,1652);

  ctx.strokeStyle='rgba(24,55,45,.18)';ctx.setLineDash([10,10]);ctx.lineWidth=2;
  roundRectPath(ctx,m,1692,W-m*2,108,18);ctx.stroke();ctx.setLineDash([]);

  ctx.fillStyle='#18372d';ctx.font=`800 19px ${SANS}`;
  ctx.fillText('NOTO Re:Bloom',m,1862);
  ctx.textAlign='right';ctx.fillStyle='#6b7771';ctx.font=`600 15px ${SANS}`;
  ctx.fillText('あなたは何の花？  /  Flower Type',W-m,1862);ctx.textAlign='left';

  return canvas.toDataURL('image/png',.96);
}

function dataUrlToFile(dataUrl,name){
  const [head,body]=dataUrl.split(',');
  const mime=(head.match(/data:(.*?);/)||[])[1]||'image/png';
  const bin=atob(body),bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return new File([bytes],name,{type:mime});
}
function applyCard(anchorId,imageId,dataUrl,fileName,label){
  const a=document.getElementById(anchorId);
  if(a){a.href=dataUrl;a.download=fileName;if(label)a.textContent=label;}
  const img=document.getElementById(imageId);
  if(img)img.src=dataUrl;
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
    let neighborPhoto=null;
    if(data.neighbor?.slug){
      try{neighborPhoto=await loadFlowerImage(data.neighbor.slug);}catch{}
    }
    if(token!==renderToken)return;

    const cover=buildCoverCard(photo,data);
    const profile=buildProfileCard(data);
    const relation=buildRelationCard(photo,neighborPhoto,data);
    const story=buildStoryCard(photo,data);
    latestCards={cover,profile,relation,story,data};

    applyCard('downloadCard','resultShareImage',cover,`01_${data.name}タイプ_表紙.png`,'1枚目を保存');
    applyCard('downloadProfileCard','resultShareProfileImage',profile,`02_${data.name}タイプ_5つの咲き方.png`,'2枚目を保存');
    applyCard('downloadRelationCard','resultShareRelationImage',relation,`03_${data.name}タイプ_近い花.png`,'3枚目を保存');
    applyCard('downloadStoryCard','resultStoryImage',story,`${data.name}タイプ_ストーリー.png`,'ストーリー用を保存');
  }catch(e){
    console.warn('social card render failed',e);
  }
}

async function shareCards(){
  const status=document.getElementById('diagnosisCopyStatus');
  if(!latestCards){if(status)status.textContent='カードを準備しています。';return;}
  const {cover,profile,relation,data}=latestCards;
  const files=[
    dataUrlToFile(cover,'flower-type-01.png'),
    dataUrlToFile(profile,'flower-type-02.png'),
    dataUrlToFile(relation,'flower-type-03.png')
  ];
  const shareText=`私は「${data.name}タイプ」でした。あなたは何の花？`;
  try{
    if(navigator.share&&navigator.canShare?.({files})){
      await navigator.share({files,title:'NOTO Re:Bloom 花タイプ診断',text:shareText});
      if(status)status.textContent='投稿用3枚の共有メニューを開きました。';
    }else if(navigator.share&&navigator.canShare?.({files:[files[0]]})){
      await navigator.share({files:[files[0]],title:'NOTO Re:Bloom 花タイプ診断',text:shareText});
      if(status)status.textContent='この端末では複数画像共有に対応していないため、表紙カードを共有しました。';
    }else{
      if(status)status.textContent='この端末では画像共有に対応していません。下の保存ボタンから画像を保存してください。';
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

  document.getElementById('shareDiagnosisCard')?.addEventListener('click',shareCards);
  window.addEventListener('rebloom:diagnosis-result',()=>setTimeout(refreshResult,50));

  const title=document.getElementById('resultTitle');
  if(title)new MutationObserver(()=>setTimeout(refreshResult,80)).observe(title,{childList:true,subtree:true,characterData:true});
  setTimeout(refreshResult,160);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();