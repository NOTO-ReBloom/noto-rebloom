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
const DIAGNOSIS_URL='https://noto-rebloom.github.io/noto-rebloom/diagnosis.html';
const QR_MATRIX=[
'00000000000000000000000000000000000000000',
'00000000000000000000000000000000000000000',
'00000000000000000000000000000000000000000',
'00000000000000000000000000000000000000000',
'00001111111010011010011001000011111110000',
'00001000001010011000111110100010000010000',
'00001011101010100001100011100010111010000',
'00001011101001011001011101011010111010000',
'00001011101011011111011101000010111010000',
'00001000001001001110000011110010000010000',
'00001111111010101010101010101011111110000',
'00000000000000000100000110010000000000000',
'00001001111110001001110000011100101110000',
'00000001010100101011011111111000111100000',
'00001111101111010011000001010010111110000',
'00001000010110001011011010000011001110000',
'00001100111000101110100010001011000000000',
'00000011000101100000111000011101011000000',
'00001100001111111010101111000010101000000',
'00000110010101010011000110000101111010000',
'00001001101100001000000010101111110000000',
'00001101010111101111100110100010101010000',
'00000011101100101101111101111001011010000',
'00001110100001010111001000100110111100000',
'00000110011101001101110010001001010010000',
'00001011100000110110100100110001110000000',
'00001000101111101011010000010101100110000',
'00001000100110000110011110100010111010000',
'00001110101101010000100010001111110100000',
'00000000000010100001101000011000101100000',
'00001111111011111101000110011010101000000',
'00001000001010110100001100011000111100000',
'00001011101011101001000110111111100100000',
'00001011101011110001001111100101000110000',
'00001011101000111011011111000101101110000',
'00001000001000001100101000000001111110000',
'00001111111011001100010000011011110000000',
'00000000000000000000000000000000000000000',
'00000000000000000000000000000000000000000',
'00000000000000000000000000000000000000000',
'00000000000000000000000000000000000000000'
];
const photoUrl=slug=>`flower-photo-${slug}.webp?v=${PHOTO_VERSION}`;
const legacyUrl=slug=>`${slug}.png?v=${PHOTO_VERSION}`;
let latestCards=null;
let renderToken=0;

function groupAccent(group){
  return {'太陽の花':'#c89b13','風の花':'#4f91aa','里山の花':'#5f8b56','水辺の花':'#6878ae'}[group]||'#174b3b';
}
function groupPalette(group){
  return {
    '太陽の花':{panel:'#fff0b8',ink:'#513c05',copy:'#6a5217',soft:'#fff8df'},
    '風の花':{panel:'#e3f0f4',ink:'#18495a',copy:'#355d68',soft:'#f2f8fa'},
    '里山の花':{panel:'#e7f0df',ink:'#29492d',copy:'#476049',soft:'#f4f8f0'},
    '水辺の花':{panel:'#e9eaf7',ink:'#303a69',copy:'#525b82',soft:'#f5f5fb'}
  }[group]||{panel:'#e7efe9',ink:'#17362c',copy:'#365248',soft:'#f5f8f5'};
}
function drawQr(ctx,x,y,size){
  const n=QR_MATRIX.length;
  const cell=size/n;
  ctx.fillStyle='#fff';
  ctx.fillRect(x,y,size,size);
  ctx.fillStyle='#111';
  for(let row=0;row<n;row++){
    const line=QR_MATRIX[row];
    for(let col=0;col<n;col++){
      if(line[col]==='1'){
        const x0=x+col*cell,y0=y+row*cell;
        const x1=x+(col+1)*cell,y1=y+(row+1)*cell;
        ctx.fillRect(Math.floor(x0),Math.floor(y0),Math.ceil(x1)-Math.floor(x0),Math.ceil(y1)-Math.floor(y0));
      }
    }
  }
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
  const ink='#18382e',muted='#596b62';
  const titleSize=story?19:15;
  ctx.fillStyle=ink;ctx.font=`800 ${titleSize}px ${SANS}`;
  ctx.fillText(axis.title||'傾向',x,y);

  const labelY=y+(story?28:23);
  ctx.fillStyle=muted;ctx.font=`700 ${story?12:10}px ${SANS}`;
  ctx.fillText(axis.left||'',x,labelY);
  ctx.textAlign='right';ctx.fillText(axis.right||'',x+w,labelY);ctx.textAlign='left';

  const barY=labelY+(story?20:15);
  ctx.strokeStyle='#d9e0d9';
  ctx.lineWidth=story?5:4;
  ctx.beginPath();ctx.moveTo(x,barY);ctx.lineTo(x+w,barY);ctx.stroke();

  ctx.strokeStyle='rgba(24,56,46,.16)';
  ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(x+w/2,barY-(story?10:8));ctx.lineTo(x+w/2,barY+(story?10:8));ctx.stroke();

  const p=Math.max(0,Math.min(100,Number(axis.position)||50))/100;
  const dotX=x+w*p;
  ctx.fillStyle=accent;ctx.beginPath();ctx.arc(dotX,barY,story?9:8,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=story?3:2;
  ctx.beginPath();ctx.arc(dotX,barY,story?9:8,0,Math.PI*2);ctx.stroke();
}

function drawPaperPanel(ctx,x,y,w,h,fill='#fbf8f0',alpha=1){
  ctx.save();
  ctx.globalAlpha=alpha;
  ctx.fillStyle=fill;
  ctx.beginPath();
  ctx.moveTo(x+18,y);
  ctx.quadraticCurveTo(x+w*.18,y-10,x+w*.34,y+3);
  ctx.quadraticCurveTo(x+w*.55,y+12,x+w*.72,y-2);
  ctx.quadraticCurveTo(x+w*.9,y-8,x+w-10,y+6);
  ctx.lineTo(x+w,y+h-10);
  ctx.quadraticCurveTo(x+w*.82,y+h+8,x+w*.66,y+h-2);
  ctx.quadraticCurveTo(x+w*.43,y+h-12,x+w*.24,y+h+4);
  ctx.quadraticCurveTo(x+8,y+h+10,x,y+h-8);
  ctx.lineTo(x,y+10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
function drawLeafSprig(ctx,x,y,scale,color){
  ctx.save();
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=Math.max(1,2*scale);
  ctx.globalAlpha=.55;
  ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+30*scale,y-58*scale,x+24*scale,y-118*scale);ctx.stroke();
  [[10,-30,-20],[18,-54,20],[20,-80,-18],[22,-104,18]].forEach(([ox,oy,dir])=>{
    ctx.save();ctx.translate(x+ox*scale,y+oy*scale);ctx.rotate((dir*Math.PI)/180);
    ctx.beginPath();ctx.ellipse(0,0,9*scale,18*scale,0,0,Math.PI*2);ctx.fill();ctx.restore();
  });
  ctx.restore();
}
function drawSoftWash(ctx,x,y,r,color,alpha=.12){
  const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,color);g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();
}

function buildEditorialCard(photo,landscape,data){
  const W=1080,H=1350,m=56;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const ink='#17362c',muted='#5d6d65',paper='#f7f2e8',accent=groupAccent(data.group);
  const palette=groupPalette(data.group);

  ctx.fillStyle=paper;ctx.fillRect(0,0,W,H);
  drawSoftWash(ctx,92,120,210,accent,.12);
  drawSoftWash(ctx,980,570,190,'#e8c85a',.10);

  // Hero flower photography.
  drawCover(ctx,photo,0,0,W,560);
  const shade=ctx.createLinearGradient(0,250,0,560);
  shade.addColorStop(0,'rgba(0,0,0,0)');
  shade.addColorStop(1,'rgba(10,34,26,.18)');
  ctx.fillStyle=shade;ctx.fillRect(0,250,W,310);

  ctx.fillStyle='rgba(255,255,255,.93)';
  ctx.font=`700 14px ${SANS}`;ctx.fillText('NOTO Re:Bloom',m,44);
  ctx.textAlign='right';ctx.fillText('花タイプ / 32',W-m,44);ctx.textAlign='left';

  // Colored title sheet: clearly separated from the neutral parameter area.
  const panelX=m,panelY=365,panelW=690,panelH=265;
  ctx.save();
  ctx.shadowColor='rgba(18,48,38,.16)';
  ctx.shadowBlur=24;
  ctx.shadowOffsetY=8;
  drawPaperPanel(ctx,panelX,panelY,panelW,panelH,palette.panel,.99);
  ctx.restore();
  ctx.fillStyle=accent;ctx.fillRect(panelX+26,panelY+34,74,5);
  ctx.fillStyle=palette.ink;ctx.font=`800 12px ${SANS}`;
  ctx.fillText(data.group||'花タイプ',panelX+26,panelY+67);

  const titleSize=fitText(ctx,data.name,panelW-52,72,52,'900');
  ctx.fillStyle=palette.ink;ctx.font=`900 ${titleSize}px ${SANS}`;
  ctx.fillText(data.name,panelX+26,panelY+134);

  const copy=SOCIAL_COPY[data.slug]||data.tagline||'';
  drawWrapped(ctx,copy,panelX+26,panelY+188,panelW-54,34,2,`800 25px ${SANS}`,palette.copy);

  // Main information field: neutral background so it does not merge with the title sheet.
  ctx.fillStyle='#fffdf8';ctx.fillRect(0,560,W,595);
  drawSoftWash(ctx,970,690,150,palette.panel,.22);
  drawLeafSprig(ctx,W-78,735,.72,accent);

  ctx.fillStyle=ink;ctx.font=`900 12px ${SANS}`;ctx.fillText('わたしをつくる 5つの咲き方',m,686);
  ctx.strokeStyle='rgba(23,54,44,.22)';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(m,704);ctx.lineTo(W-m,704);ctx.stroke();

  const axes=(data.axes||[]).slice(0,5);
  axes.forEach((axis,i)=>{
    const y=744+i*66;
    drawAxis(ctx,axis,m,y,560,accent,false);
  });

  // Strength / caution / near flower editorial column.
  const rightX=674,rightW=350;
  const info=[
    ['強み',compactText(data.strengths?.[0]||data.keywords?.[0]||'',32)],
    ['注意点',compactText(data.watch?.[0]||'',32)],
    ['近い花',compactText((data.neighbor?.name||'')+'タイプ',32)]
  ];
  info.forEach((row,i)=>{
    const y=744+i*112;
    ctx.fillStyle=muted;ctx.font=`800 10px ${SANS}`;ctx.fillText(row[0],rightX,y);
    drawWrapped(ctx,row[1],rightX,y+29,rightW,24,2,`700 16px ${SANS}`,ink);
    ctx.strokeStyle='rgba(23,54,44,.11)';
    ctx.beginPath();ctx.moveTo(rightX,y+76);ctx.lineTo(rightX+rightW,y+76);ctx.stroke();
  });

  // Noto landscape as the final visual route back to the project.
  if(landscape) drawCover(ctx,landscape,0,1155,W,195);
  const landscapeShade=ctx.createLinearGradient(0,1155,0,1350);
  landscapeShade.addColorStop(0,'rgba(20,48,37,.10)');
  landscapeShade.addColorStop(1,'rgba(12,34,27,.54)');
  ctx.fillStyle=landscapeShade;ctx.fillRect(0,1155,W,195);

  drawPaperPanel(ctx,632,1171,392,152,'#fbf7ed',.97);
  const qrSize=112,qrX=650,qrY=1191;
  drawQr(ctx,qrX,qrY,qrSize);
  ctx.fillStyle=ink;ctx.font=`800 15px ${SANS}`;
  ctx.fillText('あなたの花タイプを診断する',786,1212);
  ctx.fillStyle=muted;ctx.font=`600 10px ${SANS}`;
  ctx.fillText('QRから診断ページへ',786,1238);
  ctx.fillText('noto-rebloom.github.io',786,1261);

  ctx.fillStyle='rgba(255,255,255,.94)';
  ctx.font=`800 18px ${SANS}`;ctx.fillText('NOTO Re:Bloom',m,1298);
  ctx.font=`600 11px ${SANS}`;ctx.fillText('泥臭い挑戦で、能登を咲かせる。',m,1321);

  if(data.slug==='renge'){
    ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.9)';ctx.font=`500 9px ${SANS}`;
    ctx.fillText('Photo: houroumono / CC BY 2.0 / crop + WebP',W-m,1331);ctx.textAlign='left';
  }
  return canvas.toDataURL('image/png',.97);
}

function buildStoryCard(photo,landscape,data){
  const W=1080,H=1920,m=60;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const ink='#17362c',muted='#5d6d65',paper='#f7f2e8',accent=groupAccent(data.group);
  const palette=groupPalette(data.group);

  ctx.fillStyle=paper;ctx.fillRect(0,0,W,H);
  drawCover(ctx,photo,0,0,W,760);
  drawSoftWash(ctx,930,930,220,accent,.11);

  ctx.fillStyle='rgba(255,255,255,.94)';ctx.font=`700 17px ${SANS}`;
  ctx.fillText('NOTO Re:Bloom',m,58);
  ctx.textAlign='right';ctx.fillText('花タイプ / 32',W-m,58);ctx.textAlign='left';

  ctx.save();
  ctx.shadowColor='rgba(18,48,38,.16)';
  ctx.shadowBlur=26;
  ctx.shadowOffsetY=9;
  drawPaperPanel(ctx,m,610,W-m*2,310,palette.panel,.99);
  ctx.restore();
  ctx.fillStyle=accent;ctx.fillRect(m+28,650,82,5);
  ctx.fillStyle=palette.ink;ctx.font=`800 14px ${SANS}`;ctx.fillText(data.group,m+28,686);
  const titleSize=fitText(ctx,data.name,W-m*2-56,84,62,'900');
  ctx.fillStyle=palette.ink;ctx.font=`900 ${titleSize}px ${SANS}`;ctx.fillText(data.name,m+28,776);
  drawWrapped(ctx,SOCIAL_COPY[data.slug]||data.tagline||'',m+28,834,W-m*2-56,43,2,`800 31px ${SANS}`,palette.copy);

  ctx.fillStyle='#fffdf8';ctx.fillRect(0,900,W,720);
  drawSoftWash(ctx,930,1010,170,palette.panel,.22);
  ctx.fillStyle=ink;ctx.font=`900 12px ${SANS}`;ctx.fillText('わたしをつくる 5つの咲き方',m,962);
  ctx.strokeStyle='rgba(23,54,44,.22)';ctx.beginPath();ctx.moveTo(m,980);ctx.lineTo(W-m,980);ctx.stroke();

  const axes=(data.axes||[]).slice(0,5);
  axes.forEach((axis,i)=>drawAxis(ctx,axis,m,1022+i*92,W-m*2,accent,true));

  const infoY=1504;
  ctx.strokeStyle='rgba(23,54,44,.13)';ctx.beginPath();ctx.moveTo(m,infoY);ctx.lineTo(W-m,infoY);ctx.stroke();
  const colW=(W-m*2-36*2)/3;
  const rows=[
    ['強み',compactText(data.strengths?.[0]||data.keywords?.[0]||'',24)],
    ['注意点',compactText(data.watch?.[0]||'',24)],
    ['近い花',compactText((data.neighbor?.name||'')+'タイプ',24)]
  ];
  rows.forEach((row,i)=>{
    const x=m+i*(colW+36);
    ctx.fillStyle=muted;ctx.font=`800 10px ${SANS}`;ctx.fillText(row[0],x,1542);
    drawWrapped(ctx,row[1],x,1572,colW,24,2,`700 15px ${SANS}`,ink);
  });

  if(landscape) drawCover(ctx,landscape,0,1650,W,270);
  const shade=ctx.createLinearGradient(0,1650,0,1920);
  shade.addColorStop(0,'rgba(10,34,27,.06)');shade.addColorStop(1,'rgba(10,34,27,.52)');
  ctx.fillStyle=shade;ctx.fillRect(0,1650,W,270);

  drawPaperPanel(ctx,626,1688,398,176,'#fbf7ed',.97);
  const qrSize=130,qrX=646,qrY=1710;drawQr(ctx,qrX,qrY,qrSize);
  ctx.fillStyle=ink;ctx.font=`800 15px ${SANS}`;ctx.fillText('花タイプ診断はこちら',798,1737);
  ctx.fillStyle=muted;ctx.font=`600 10px ${SANS}`;ctx.fillText('QRから診断ページへ',798,1764);
  ctx.fillText('noto-rebloom.github.io',798,1787);

  ctx.fillStyle='rgba(255,255,255,.95)';ctx.font=`800 17px ${SANS}`;ctx.fillText('NOTO Re:Bloom',m,1875);
  ctx.font=`600 10px ${SANS}`;ctx.fillText('泥臭い挑戦で、能登を咲かせる。',m,1898);
  if(data.slug==='renge'){
    ctx.textAlign='right';ctx.font=`500 9px ${SANS}`;ctx.fillText('Photo: houroumono / CC BY 2.0 / crop + WebP',W-m,1898);ctx.textAlign='left';
  }
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
    const [photo,landscape]=await Promise.all([
      loadFlowerImage(data.slug),
      loadImage('field-overview.webp?v=20260929share1').catch(()=>null)
    ]);
    if(token!==renderToken)return;

    const feed=buildEditorialCard(photo,landscape,data);
    const story=buildStoryCard(photo,landscape,data);
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
  const shareText=`私は「${data.name}タイプ」でした。\n${SOCIAL_COPY[data.slug]||data.tagline||''}\n\n花タイプ診断はこちら\n${DIAGNOSIS_URL}`;
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