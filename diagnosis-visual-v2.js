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
function bindVisibleFlowerPhoto(img){
  if(!(img instanceof HTMLImageElement))return;
  const sync=()=>{
    if(img.complete&&img.naturalWidth>0)img.classList.add('fd-photo-ready');
    else if(img.complete)img.closest('.flower-atlas-card')?.classList.add('is-photo-missing');
  };
  img.addEventListener('load',()=>{img.classList.add('fd-photo-ready');img.closest('.flower-atlas-card')?.classList.remove('is-photo-missing');},{once:true});
  img.addEventListener('error',()=>img.closest('.flower-atlas-card')?.classList.add('is-photo-missing'),{once:true});
  sync();
}
function bindAllVisibleFlowerPhotos(root=document){
  root.querySelectorAll?.('img[src*="flower-photo-"]').forEach(bindVisibleFlowerPhoto);
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
  const ink='#183a31',muted='#6d7a74',paper='#f5f1e9',white='#fffdf9';
  const accent=cardAccent(data.group);
  ctx.fillStyle=paper;ctx.fillRect(0,0,W,H);

  // Quiet editorial frame.
  const frame=story?48:44;
  ctx.fillStyle=white;
  roundRectPath(ctx,frame,frame,W-frame*2,H-frame*2,story?42:36);ctx.fill();

  // Large flower photograph.
  const photoX=story?72:68;
  const photoY=story?72:68;
  const photoW=W-photoX*2;
  const photoH=story?930:560;
  drawCover(ctx,photo,photoX,photoY,photoW,photoH,story?34:30);

  // Fine accent rule and group tag.
  const ruleY=photoY+photoH+(story?42:34);
  ctx.fillStyle=accent;ctx.fillRect(photoX,ruleY,story?120:96,5);
  ctx.fillStyle=muted;
  ctx.font=`700 ${story?18:16}px "Noto Sans JP","Hiragino Kaku Gothic ProN",sans-serif`;
  ctx.fillText('RE:BLOOM FLOWER TYPE  /  32',photoX,ruleY+(story?42:36));
  ctx.textAlign='right';
  ctx.fillText(data.group,W-photoX,ruleY+(story?42:36));
  ctx.textAlign='left';

  // Main name in a calmer editorial face.
  const contentY=ruleY+(story?92:80);
  ctx.fillStyle=ink;
  const nameText=`${data.name}タイプ`;
  const nameSize=fitText(ctx,nameText,W-photoX*2,story?102:80,story?66:54,'800');
  ctx.font=`800 ${nameSize}px "Yu Mincho","Hiragino Mincho ProN","Noto Serif JP",serif`;
  ctx.fillText(nameText,photoX,contentY);

  // Tagline.
  ctx.fillStyle='#425b51';
  ctx.font=`700 ${story?32:27}px "Noto Sans JP","Hiragino Kaku Gothic ProN",sans-serif`;
  const leadY=contentY+(story?74:62);
  wrapText(ctx,data.lead,photoX,leadY,W-photoX*2,story?48:40,2);

  // Keywords: minimal bordered chips.
  let chipY=leadY+(story?126:102);
  ctx.font=`700 ${story?23:20}px "Noto Sans JP","Hiragino Kaku Gothic ProN",sans-serif`;
  let cx=photoX;
  for(const item of (data.keywords||[]).slice(0,3)){
    const pad=story?24:20;
    const h=story?48:42;
    const w=Math.ceil(ctx.measureText(item).width)+pad*2;
    ctx.strokeStyle='rgba(24,58,49,.18)';ctx.lineWidth=2;
    roundRectPath(ctx,cx,chipY,w,h,h/2);ctx.stroke();
    ctx.fillStyle=ink;ctx.fillText(item,cx+pad,chipY+(story?32:29));
    cx+=w+(story?12:10);
  }

  // Short note from the result, not a wall of text.
  const noteY=chipY+(story?110:84);
  ctx.fillStyle='#67756f';
  ctx.font=`700 ${story?20:17}px "Noto Sans JP","Hiragino Kaku Gothic ProN",sans-serif`;
  ctx.fillText('今のあなたへ',photoX,noteY);
  ctx.fillStyle=ink;
  ctx.font=`700 ${story?28:23}px "Noto Sans JP","Hiragino Kaku Gothic ProN",sans-serif`;
  wrapText(ctx,data.message||'',photoX,noteY+(story?48:40),W-photoX*2,story?44:36,story?3:2);

  // Footer: restrained, useful, shareable.
  const footerY=H-frame-(story?150:118);
  ctx.strokeStyle='rgba(24,58,49,.13)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(photoX,footerY);ctx.lineTo(W-photoX,footerY);ctx.stroke();

  ctx.fillStyle=ink;
  ctx.font=`800 ${story?22:18}px "Noto Sans JP","Hiragino Kaku Gothic ProN",sans-serif`;
  ctx.fillText('花から、わたしを再発見。',photoX,footerY+(story?48:40));
  ctx.fillStyle=muted;
  ctx.font=`600 ${story?17:14}px "Noto Sans JP","Hiragino Kaku Gothic ProN",sans-serif`;
  ctx.fillText('40問 / 約4〜6分 / 登録不要',photoX,footerY+(story?82:69));
  ctx.textAlign='right';
  ctx.fillText('noto-rebloom.github.io/noto-rebloom/diagnosis.html',W-photoX,footerY+(story?82:69));
  ctx.textAlign='left';

  // CC BY attribution must travel with the Renge image.
  if(data.slug==='renge'){
    ctx.fillStyle='rgba(255,253,249,.90)';
    const creditY=photoY+photoH-(story?34:28);
    roundRectPath(ctx,photoX+14,creditY-(story?27:23),photoW-28,story?31:27,10);ctx.fill();
    ctx.fillStyle='#5d6863';
    ctx.font=`600 ${story?13:11}px "Noto Sans JP",sans-serif`;
    ctx.fillText('Photo: houroumono / CC BY 2.0 / crop + WebP',photoX+26,creditY-(story?7:5));
  }
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
    const keywords=[...document.querySelectorAll('#resultKeywords span')].slice(0,3).map(el=>el.textContent.trim());
    const message=document.getElementById('resultMessage')?.textContent||'';
    const data={name,slug,group,lead,strengths,tendencies,keywords,message};
    const feed=buildShareCard(photo,data,false);
    const story=buildShareCard(photo,data,true);
    latestFeedCard=feed;
    const share=document.getElementById('resultShareImage');if(share)share.src=feed;
    const dl=document.getElementById('downloadCard');if(dl){dl.href=feed;dl.download=`${name}タイプ_花タイプ診断.png`;dl.textContent='4:5カードを保存';}
    const storyDl=document.getElementById('downloadStoryCard');if(storyDl){storyDl.href=story;storyDl.download=`${name}タイプ_花タイプ診断_story.png`;}
  }catch(e){console.warn('share card render failed',e);}
}
function init(){
  ensureFixStyles();
  bindAllVisibleFlowerPhotos();
  new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='attributes'&&record.target instanceof HTMLImageElement){
        if((record.target.getAttribute('src')||'').includes('flower-photo-'))bindVisibleFlowerPhoto(record.target);
        continue;
      }
      for(const node of record.addedNodes){
        if(node.nodeType!==1)continue;
        if(node.matches?.('img[src*="flower-photo-"]'))bindVisibleFlowerPhoto(node);
        bindAllVisibleFlowerPhotos(node);
      }
    }
  }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
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
  const title=document.getElementById('resultTitle');
  if(title)new MutationObserver(()=>setTimeout(refreshResult,80)).observe(title,{childList:true,subtree:true,characterData:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();