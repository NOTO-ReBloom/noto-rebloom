(()=>{
'use strict';
const NAME_TO_SLUG={
'ヒマワリ':'himawari','ガーベラ':'gerbera','サルビア':'salvia','ダリア':'dahlia','チューリップ':'tulip','マリーゴールド':'marigold','ポピー':'poppy','ハイビスカス':'hibiscus',
'フリージア':'freesia','コスモス':'cosmos','アネモネ':'anemone','クレマチス':'clematis','アイリス':'iris','ネモフィラ':'nemophila','ルピナス':'lupinus','カスミソウ':'kasumisou',
'シロツメクサ':'shirotsumekusa','レンゲ':'renge','ツバキ':'tsubaki','ナデシコ':'nadeshiko','ナノハナ':'nanohana','ミモザ':'mimosa','リンドウ':'rindou','エーデルワイス':'edelweiss',
'アジサイ':'ajisai','ラベンダー':'lavender','スイレン':'suiren','キキョウ':'kikyo','ワスレナグサ':'wasurenagusa','スミレ':'sumire','タンポポ':'tanpopo','カモミール':'chamomile'
};
const VERSION='20260918free1';
const photoUrl=slug=>`flower-photo-${slug}.webp?v=${VERSION}`;
const legacyUrl=slug=>`${slug}.png?v=${VERSION}`;
function ensureFixStyles(){
  if(document.querySelector('link[href*="diagnosis-fixes.css"]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href=`diagnosis-fixes.css?v=${VERSION}`;document.head.appendChild(link);
}
function slugFromTitle(){return NAME_TO_SLUG[(document.getElementById('resultTitle')?.textContent||'').replace(/タイプ$/,'').trim()]||'renge';}
function setPhoto(img,slug,name){
  if(!img)return;
  const card=img.closest('.flower-atlas-card');
  card?.classList.remove('is-photo-missing');
  img.classList.remove('fd-photo-ready');
  let fallbackTried=false;
  img.onload=()=>{img.classList.add('fd-photo-ready');card?.classList.remove('is-photo-missing');};
  img.onerror=()=>{
    if(!fallbackTried){fallbackTried=true;img.src=legacyUrl(slug);return;}
    img.onerror=null;img.onload=null;img.classList.remove('fd-photo-ready');card?.classList.add('is-photo-missing');
  };
  img.src=photoUrl(slug);
  img.alt=`${name||slug}の花の写真`;
}
function refreshAtlas(){
  document.querySelectorAll('.flower-atlas-card[data-flower-slug]').forEach(card=>{
    const slug=card.dataset.flowerSlug;const name=card.querySelector('b')?.textContent||'花';setPhoto(card.querySelector('img'),slug,name);
  });
  const reps={'太陽の花':'himawari','風の花':'freesia','里山の花':'renge','水辺の花':'ajisai'};
  document.querySelectorAll('[data-group-preview]').forEach(box=>{
    const slug=reps[box.dataset.groupPreview]||'renge';setPhoto(box.querySelector('img'),slug,box.dataset.groupPreview);
  });
}
function refreshDialog(){const name=document.getElementById('atlasDialogName')?.textContent?.trim();const slug=NAME_TO_SLUG[name];if(slug)setPhoto(document.getElementById('atlasDialogImage'),slug,name);}
function refreshHero(){
  const img=document.querySelector('.page-hero--diagnosis .photo-frame img');setPhoto(img,'renge','レンゲ');
  const cap=document.querySelector('.page-hero--diagnosis .photo-frame figcaption');if(cap)cap.textContent='実際の花の姿を知りながら、自分らしい一輪を見つける診断です。';
}
function rewriteHero(){
  const h1=document.querySelector('.page-hero--diagnosis h1');if(h1)h1.innerHTML='花から、<br><span class="headline-marker">わたしを再発見。</span>';
  const p=document.querySelector('.page-hero--diagnosis .reveal>p:not(.eyebrow)');if(p)p.textContent='56の質問から、考え方や人との関わり方の傾向を32種類の花に重ねて読み解きます。花の姿も写真で知りながら、自分らしい一輪を見つけてください。';
  const note=document.querySelector('.hero-sticker-note');if(note)note.textContent='約6〜10分 / 登録不要 / 途中保存できます';
  const tags=[...document.querySelectorAll('.diagnosis-tags li')];tags.forEach(tag=>{if(/30種類以上/.test(tag.textContent))tag.textContent='32種類';});
}
function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines=4){let line='',lines=[];for(const ch of [...text]){const test=line+ch;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=ch;if(lines.length>=maxLines-1)break;}else line=test;}if(line&&lines.length<maxLines)lines.push(line);lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight));}
async function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});}
async function loadFlowerImage(slug){try{return await loadImage(photoUrl(slug));}catch{return await loadImage(legacyUrl(slug));}}
let cardToken=0;
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
function drawPill(ctx,text,x,y,fill,ink,font='800 22px "Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif'){
  ctx.font=font;
  const padX=20,h=46,w=Math.ceil(ctx.measureText(text).width)+padX*2;
  ctx.fillStyle=fill;roundRectPath(ctx,x,y,w,h,23);ctx.fill();
  ctx.fillStyle=ink;ctx.fillText(text,x+padX,y+31);
  return w;
}
function cardAccent(group){
  return {'太陽の花':'#c89b13','風の花':'#4f91aa','里山の花':'#5f8b56','水辺の花':'#6878ae'}[group]||'#174b3b';
}
function fitText(ctx,text,maxWidth,startSize,minSize,weight='900'){
  let size=startSize;
  while(size>minSize){
    ctx.font=`${weight} ${size}px "Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif`;
    if(ctx.measureText(text).width<=maxWidth)break;
    size-=2;
  }
  return size;
}
function drawChip(ctx,text,x,y,maxW){
  ctx.font='800 22px "Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif';
  const w=Math.min(maxW,Math.ceil(ctx.measureText(text).width)+36),h=48;
  ctx.fillStyle='#eef4ee';roundRectPath(ctx,x,y,w,h,24);ctx.fill();
  ctx.fillStyle='#355d4d';ctx.fillText(text,x+18,y+32);
  return w;
}
function buildShareCard(photo,data,story=false){
  const W=1080,H=story?1920:1350;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const accent=cardAccent(data.group);
  ctx.fillStyle='#fbf6ed';ctx.fillRect(0,0,W,H);

  // paper texture / botanical dots
  ctx.globalAlpha=.07;ctx.fillStyle=accent;
  for(let i=0;i<24;i++){const x=70+(i*137)%940,y=80+(i*211)%(H-160);ctx.beginPath();ctx.arc(x,y,3+(i%4),0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;

  const px=54,py=54,pw=972,ph=story?930:610;
  drawCover(ctx,photo,px,py,pw,ph,42);
  const grad=ctx.createLinearGradient(0,py+ph*.48,0,py+ph);
  grad.addColorStop(0,'rgba(10,35,28,0)');
  grad.addColorStop(1,'rgba(10,35,28,.50)');
  ctx.fillStyle=grad;roundRectPath(ctx,px,py,pw,ph,42);ctx.fill();

  ctx.fillStyle='#fff';
  ctx.font='900 24px "Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif';
  ctx.fillText('Re:Bloom 花タイプ診断',px+34,py+46);
  ctx.font='700 17px "Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif';
  ctx.fillStyle='rgba(255,255,255,.82)';
  ctx.fillText('32 FLOWERS / 5 AXES',px+34,py+76);

  const labelY=py+ph-76;
  drawPill(ctx,data.group,px+34,labelY,'rgba(255,253,248,.92)',accent,'900 21px "Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif');

  const contentY=py+ph+(story?82:64);
  ctx.fillStyle=accent;
  ctx.font='900 18px "Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif';
  ctx.fillText('YOUR FLOWER TYPE',64,contentY);

  const nameSize=fitText(ctx,data.name,900,story?104:92,60);
  ctx.fillStyle='#173f33';
  ctx.font=`900 ${nameSize}px "Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif`;
  ctx.fillText(data.name,64,contentY+(story?108:94));

  ctx.fillStyle='#50685d';
  ctx.font=`700 ${story?34:30}px "Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif`;
  const leadY=contentY+(story?174:148);
  wrapText(ctx,data.lead,64,leadY,920,story?49:43,3);

  const strengthsY=leadY+(story?176:146);
  ctx.fillStyle='#8a7640';
  ctx.font='900 16px "Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif';
  ctx.fillText('STRENGTHS',64,strengthsY);
  let x=64,y=strengthsY+22;
  for(const s of data.strengths){
    ctx.font='800 22px "Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif';
    const needed=Math.min(420,Math.ceil(ctx.measureText(s).width)+36);
    if(x+needed>1016){x=64;y+=60;}
    const used=drawChip(ctx,s,x,y,420);x+=used+10;
  }

  const flowerY=story?H-246:H-168;
  ctx.strokeStyle='rgba(23,75,59,.16)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(64,flowerY-38);ctx.lineTo(1016,flowerY-38);ctx.stroke();
  ctx.fillStyle='#6c7d75';ctx.font='700 18px "Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif';ctx.fillText('FLOWER LANGUAGE',64,flowerY);
  ctx.fillStyle='#173f33';ctx.font='900 27px "Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif';ctx.fillText(data.language,64,flowerY+40);
  ctx.fillStyle='#7a8982';ctx.font='600 15px "Hiragino Sans","Yu Gothic UI","Yu Gothic",Meiryo,sans-serif';ctx.textAlign='right';ctx.fillText('noto-rebloom.github.io/noto-rebloom/diagnosis.html',1016,flowerY+38);ctx.textAlign='left';

  return canvas.toDataURL('image/png',.94);
}
async function refreshResult(){
  const result=document.getElementById('diagnosisResult');if(!result?.classList.contains('is-active'))return;
  const slug=slugFromTitle(),title=document.getElementById('resultTitle')?.textContent||'花タイプ',name=title.replace(/タイプ$/,'');
  setPhoto(document.getElementById('resultImage'),slug,name);
  const token=++cardToken;
  try{
    if(document.fonts?.ready)await document.fonts.ready;
    const photo=await loadFlowerImage(slug);if(token!==cardToken)return;
    const group=document.getElementById('resultGroup')?.textContent||'';
    const lead=document.getElementById('resultLead')?.textContent||'';
    const language=document.getElementById('resultLanguage')?.textContent||'';
    const strengths=[...document.querySelectorAll('#resultStrengths li')].slice(0,3).map(el=>el.textContent.trim());
    const data={name,group,lead,language,strengths};
    const feed=buildShareCard(photo,data,false);
    const story=buildShareCard(photo,data,true);
    const share=document.getElementById('resultShareImage');if(share)share.src=feed;
    const dl=document.getElementById('downloadCard');if(dl){dl.href=feed;dl.download=`${name}タイプ_ReBloom_4x5.png`;dl.textContent='4:5カードを保存';}
    const storyDl=document.getElementById('downloadStoryCard');if(storyDl){storyDl.href=story;storyDl.download=`${name}タイプ_ReBloom_story.png`;}
  }catch(e){console.warn('share card render failed',e);}
}
function init(){
  ensureFixStyles();rewriteHero();refreshHero();refreshAtlas();setTimeout(refreshAtlas,120);
  const atlas=document.getElementById('flowerAtlasGrid');if(atlas)new MutationObserver(()=>refreshAtlas()).observe(atlas,{childList:true,subtree:true});
  const dialog=document.getElementById('flowerAtlasDialog');if(dialog)new MutationObserver(()=>refreshDialog()).observe(dialog,{attributes:true,childList:true,subtree:true});
  const title=document.getElementById('resultTitle');if(title)new MutationObserver(()=>setTimeout(refreshResult,120)).observe(title,{childList:true,subtree:true,characterData:true});
  document.addEventListener('click',e=>{if(e.target.closest('.flower-atlas-card'))setTimeout(refreshDialog,40);});
  ['renge','himawari','freesia','ajisai','tsubaki'].forEach(slug=>{const i=new Image();i.src=photoUrl(slug)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();