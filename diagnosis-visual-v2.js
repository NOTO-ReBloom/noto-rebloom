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
function drawPill(ctx,text,x,y,fill,ink,font='800 22px "M PLUS Rounded 1c","Noto Sans JP",sans-serif'){
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
    ctx.font=`${weight} ${size}px "M PLUS Rounded 1c","Noto Sans JP",sans-serif`;
    if(ctx.measureText(text).width<=maxWidth)break;
    size-=2;
  }
  return size;
}
function drawChip(ctx,text,x,y,maxW){
  ctx.font='800 22px "M PLUS Rounded 1c","Noto Sans JP",sans-serif';
  const w=Math.min(maxW,Math.ceil(ctx.measureText(text).width)+36),h=48;
  ctx.fillStyle='#eef4ee';roundRectPath(ctx,x,y,w,h,24);ctx.fill();
  ctx.fillStyle='#355d4d';ctx.fillText(text,x+18,y+32);
  return w;
}
let latestFeedCard='';
function drawSectionLabel(ctx,text,x,y){
  ctx.fillStyle='#67766f';
  ctx.font='800 16px "Noto Sans JP",sans-serif';
  ctx.fillText(text,x,y);
}
function drawFeatureRow(ctx,features,x,y,maxWidth,story){
  const size=story?27:24;
  ctx.font=`800 ${size}px "M PLUS Rounded 1c","Noto Sans JP",sans-serif`;
  let cx=x,cy=y;
  for(const item of features){
    const w=Math.min(maxWidth,Math.ceil(ctx.measureText(item).width)+34);
    if(cx+w>x+maxWidth){cx=x;cy+=story?58:54;}
    ctx.fillStyle='#f2f4ef';
    roundRectPath(ctx,cx,cy,w,story?44:42,21);ctx.fill();
    ctx.fillStyle='#24483b';
    ctx.fillText(item,cx+17,cy+(story?30:29));
    cx+=w+9;
  }
  return cy+(story?44:42);
}
function buildShareCard(photo,data,story=false){
  const W=1080,H=story?1920:1350;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const ink='#17352e',muted='#63736c',paper='#fffdf8',soft='#f4f1e9',green='#15483b';

  ctx.fillStyle=paper;ctx.fillRect(0,0,W,H);

  const margin=56;
  const photoH=story?800:540;
  drawCover(ctx,photo,margin,margin,W-margin*2,photoH,34);

  // Quiet white label over the photo; the photograph supplies the color.
  ctx.fillStyle='rgba(255,253,248,.94)';
  roundRectPath(ctx,margin+24,margin+24,270,48,24);ctx.fill();
  ctx.fillStyle=green;
  ctx.font='900 19px "M PLUS Rounded 1c","Noto Sans JP",sans-serif';
  ctx.fillText('Re:Bloom 花タイプ診断',margin+44,margin+56);

  const y0=margin+photoH+(story?62:48);
  ctx.fillStyle=muted;
  ctx.font='800 17px "Noto Sans JP",sans-serif';
  ctx.fillText('私の花タイプは',margin,y0);

  const nameText=`${data.name}タイプ`;
  const nameSize=fitText(ctx,nameText,W-margin*2,story?92:76,54);
  ctx.fillStyle=ink;
  ctx.font=`900 ${nameSize}px "M PLUS Rounded 1c","Noto Sans JP",sans-serif`;
  ctx.fillText(nameText,margin,y0+(story?96:82));

  ctx.fillStyle='#4d6258';
  ctx.font=`700 ${story?31:27}px "M PLUS Rounded 1c","Noto Sans JP",sans-serif`;
  const leadY=y0+(story?154:134);
  wrapText(ctx,data.lead,margin,leadY,W-margin*2,story?46:40,2);

  let sectionY=leadY+(story?126:106);
  drawSectionLabel(ctx,'当てはまりやすい特徴',margin,sectionY);
  sectionY=drawFeatureRow(ctx,data.strengths,margin,sectionY+18,W-margin*2,story)+(story?40:32);

  drawSectionLabel(ctx,'回答で強く出た傾向',margin,sectionY);
  sectionY=drawFeatureRow(ctx,data.tendencies,margin,sectionY+18,W-margin*2,story)+(story?48:38);

  const ctaH=story?250:190;
  const ctaY=H-margin-ctaH;
  ctx.fillStyle=soft;roundRectPath(ctx,margin,ctaY,W-margin*2,ctaH,28);ctx.fill();
  ctx.fillStyle=green;
  ctx.font=`900 ${story?34:29}px "M PLUS Rounded 1c","Noto Sans JP",sans-serif`;
  ctx.fillText('あなたは何タイプ？',margin+28,ctaY+(story?58:50));
  ctx.fillStyle=ink;
  ctx.font=`800 ${story?25:22}px "Noto Sans JP",sans-serif`;
  ctx.fillText('32種類の花から診断',margin+28,ctaY+(story?103:88));
  ctx.fillStyle=muted;
  ctx.font=`700 ${story?20:18}px "Noto Sans JP",sans-serif`;
  ctx.fillText('全56問  /  約6〜10分  /  登録不要',margin+28,ctaY+(story?144:122));
  ctx.fillStyle=green;
  ctx.font=`800 ${story?19:17}px "Noto Sans JP",sans-serif`;
  ctx.fillText('noto-rebloom.github.io/noto-rebloom/diagnosis.html',margin+28,ctaY+(story?194:160));

  // Small group label, intentionally monochrome.
  ctx.textAlign='right';
  ctx.fillStyle='#6f7e77';
  ctx.font='800 16px "Noto Sans JP",sans-serif';
  ctx.fillText(data.group,W-margin,ctaY-22);
  ctx.textAlign='left';

  return canvas.toDataURL('image/png',.95);
}
function dataUrlToFile(dataUrl,name){
  const [head,body]=dataUrl.split(',');
  const mime=(head.match(/data:(.*?);/)||[])[1]||'image/png';
  const bin=atob(body);const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return new File([bytes],name,{type:mime});
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
    const strengths=[...document.querySelectorAll('#resultStrengths li')].slice(0,3).map(el=>el.textContent.trim());
    const tendencies=[...document.querySelectorAll('#resultReasonList strong')].slice(0,2).map(el=>el.textContent.trim());
    const data={name,group,lead,strengths,tendencies};
    const feed=buildShareCard(photo,data,false);
    const story=buildShareCard(photo,data,true);
    latestFeedCard=feed;
    const share=document.getElementById('resultShareImage');if(share)share.src=feed;
    const dl=document.getElementById('downloadCard');if(dl){dl.href=feed;dl.download=`${name}タイプ_花タイプ診断.png`;dl.textContent='投稿用カードを保存';}
    const storyDl=document.getElementById('downloadStoryCard');if(storyDl){storyDl.href=story;storyDl.download=`${name}タイプ_花タイプ診断_story.png`;}
  }catch(e){console.warn('share card render failed',e);}
}
function init(){
  ensureFixStyles();rewriteHero();refreshHero();refreshAtlas();setTimeout(refreshAtlas,120);
  const shareBtn=document.getElementById('shareDiagnosisCard');
  shareBtn?.addEventListener('click',async()=>{
    const status=document.getElementById('diagnosisCopyStatus');
    if(!latestFeedCard){if(status)status.textContent='カードを準備しています。';return;}
    const title=document.getElementById('resultTitle')?.textContent||'花タイプ診断';
    try{
      const file=dataUrlToFile(latestFeedCard,'flower-type-result.png');
      if(navigator.share&&navigator.canShare?.({files:[file]})){
        await navigator.share({files:[file],title:'Re:Bloom 花タイプ診断',text:`私は「${title}」でした。あなたは何タイプ？`});
        if(status)status.textContent='共有メニューを開きました。';
      }else{
        if(status)status.textContent='この端末では画像共有に対応していません。カードを保存して共有してください。';
      }
    }catch(e){if(e?.name!=='AbortError'&&status)status.textContent='共有できませんでした。カードを保存して共有してください。';}
  });
  const atlas=document.getElementById('flowerAtlasGrid');if(atlas)new MutationObserver(()=>refreshAtlas()).observe(atlas,{childList:true,subtree:true});
  const dialog=document.getElementById('flowerAtlasDialog');if(dialog)new MutationObserver(()=>refreshDialog()).observe(dialog,{attributes:true,childList:true,subtree:true});
  const title=document.getElementById('resultTitle');if(title)new MutationObserver(()=>setTimeout(refreshResult,120)).observe(title,{childList:true,subtree:true,characterData:true});
  document.addEventListener('click',e=>{if(e.target.closest('.flower-atlas-card'))setTimeout(refreshDialog,40);});
  ['renge','himawari','freesia','ajisai','tsubaki'].forEach(slug=>{const i=new Image();i.src=photoUrl(slug)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();