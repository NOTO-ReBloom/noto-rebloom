(()=>{
'use strict';
const NAME_TO_SLUG={
'ヒマワリ':'himawari','ガーベラ':'gerbera','サルビア':'salvia','ダリア':'dahlia','チューリップ':'tulip','マリーゴールド':'marigold','ポピー':'poppy','ハイビスカス':'hibiscus',
'フリージア':'freesia','コスモス':'cosmos','アネモネ':'anemone','クレマチス':'clematis','アイリス':'iris','ネモフィラ':'nemophila','ルピナス':'lupinus','カスミソウ':'kasumisou',
'シロツメクサ':'shirotsumekusa','レンゲ':'renge','クローバー':'clover','ナデシコ':'nadeshiko','ナノハナ':'nanohana','ミモザ':'mimosa','リンドウ':'rindou','エーデルワイス':'edelweiss',
'アジサイ':'ajisai','ラベンダー':'lavender','スイレン':'suiren','キキョウ':'kikyo','ワスレナグサ':'wasurenagusa','スミレ':'sumire','タンポポ':'tanpopo','カモミール':'chamomile'
};
const VERSION='20260827b';
const photoUrl=slug=>`flower-photo-${slug}.webp?v=${VERSION}`;
const legacyUrl=slug=>`${slug}.png?v=${VERSION}`;
function slugFromTitle(){return NAME_TO_SLUG[(document.getElementById('resultTitle')?.textContent||'').replace(/タイプ$/,'').trim()]||'renge';}
function setPhoto(img,slug,name){
  if(!img)return;
  img.onerror=()=>{img.onerror=null;img.src=legacyUrl(slug)};
  img.src=photoUrl(slug);
  img.alt=`${name||slug}の花の写真`;
  img.classList.add('fd-photo-ready');
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
let cardToken=0;
async function refreshResult(){
  const result=document.getElementById('diagnosisResult');if(!result?.classList.contains('is-active'))return;
  const slug=slugFromTitle(),title=document.getElementById('resultTitle')?.textContent||'花タイプ',name=title.replace(/タイプ$/,'');
  setPhoto(document.getElementById('resultImage'),slug,name);
  const token=++cardToken;
  try{
    const photo=await loadImage(photoUrl(slug));if(token!==cardToken)return;
    const group=document.getElementById('resultGroup')?.textContent||'',lead=document.getElementById('resultLead')?.textContent||'';
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=675;const c=canvas.getContext('2d');
    c.fillStyle='#f8f2e8';c.fillRect(0,0,1200,675);c.fillStyle='#174b3b';c.fillRect(0,0,1200,74);
    const scale=Math.max(520/photo.width,500/photo.height),sw=520/scale,sh=500/scale,sx=(photo.width-sw)/2,sy=(photo.height-sh)/2;
    c.save();c.beginPath();c.roundRect(42,112,520,500,28);c.clip();c.drawImage(photo,sx,sy,sw,sh,42,112,520,500);c.restore();
    c.fillStyle='#fffdf8';c.font='700 24px sans-serif';c.fillText('NOTO Re:Bloom / 花タイプ診断',48,48);
    c.fillStyle='#756d55';c.font='700 20px sans-serif';c.fillText(group,620,170);
    c.fillStyle='#174b3b';c.font='700 76px "Yu Mincho",serif';c.fillText(name,620,265);
    c.fillStyle='#4d665b';c.font='600 27px sans-serif';wrapText(c,lead,620,330,500,42,3);
    c.fillStyle='#174b3b';c.font='700 18px sans-serif';c.fillText('あなたの個性に咲く、一輪。',620,500);
    c.fillStyle='#75857d';c.font='500 16px sans-serif';c.fillText('noto-rebloom.github.io/noto-rebloom/diagnosis.html',620,548);
    const data=canvas.toDataURL('image/png',.92);const share=document.getElementById('resultShareImage');if(share)share.src=data;
    const dl=document.getElementById('downloadCard');if(dl){dl.href=data;dl.download=`${name}タイプ_ReBloom.png`;dl.textContent='写真カードを保存';}
  }catch(e){}
}
function init(){
  rewriteHero();refreshHero();refreshAtlas();setTimeout(refreshAtlas,120);
  const atlas=document.getElementById('flowerAtlasGrid');if(atlas)new MutationObserver(()=>refreshAtlas()).observe(atlas,{childList:true,subtree:true});
  const dialog=document.getElementById('flowerAtlasDialog');if(dialog)new MutationObserver(()=>refreshDialog()).observe(dialog,{attributes:true,childList:true,subtree:true});
  const title=document.getElementById('resultTitle');if(title)new MutationObserver(()=>setTimeout(refreshResult,30)).observe(title,{childList:true,subtree:true,characterData:true});
  document.addEventListener('click',e=>{if(e.target.closest('.flower-atlas-card'))setTimeout(refreshDialog,40);});
  ['renge','himawari','freesia','ajisai'].forEach(slug=>{const i=new Image();i.src=photoUrl(slug)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();