(()=>{
  'use strict';

  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const COKE_URL='https://www.hokuriku.ccbc.co.jp/';

  const ensureLatestStyles=()=>{
    if(document.getElementById('rb-current-20260917-style')) return;
    const style=document.createElement('style');
    style.id='rb-current-20260917-style';
    style.textContent=`
      .rb-final-guide-note{margin:18px 0 0;padding:16px 18px;border-radius:18px;background:#fff8d8;border:1px solid rgba(201,160,35,.28);color:#43534d;font-size:13px;line-height:1.8}
      .rb-final-guide-note strong{color:#184b3d}
      .rb-support-now__card .rb-support-link{display:inline-flex;margin-top:12px;color:#184b3d;font-weight:900;text-decoration:underline;text-underline-offset:3px}
    `;
    document.head.appendChild(style);
  };

  const updateHome=()=>{
    if(current!=='index.html') return;

    document.querySelectorAll('.visual-join-action span').forEach(el=>{
      if((el.textContent||'').includes('参加者向け飲料を予定')){
        el.textContent='5つの泥競技、レンゲカップ、参加者向け飲料を用意しています。見学だけでも無料です。';
      }
    });

    const guide=document.querySelector('#participant-guide .rb-participant-guide__groups');
    if(guide && !document.querySelector('[data-final-guide-home]')){
      const note=document.createElement('p');
      note.className='rb-final-guide-note';
      note.dataset.finalGuideHome='1';
      note.innerHTML='<strong>9/17 最終案内：</strong> 当日は12:00頃からスタッフが誘導します。着替え一式・タオル・汚れ物用の大きな袋に加え、帰り用の靴、車内用のブルーシートや大きなゴミ袋があると安心です。';
      guide.after(note);
    }
  };

  const updateEvent=()=>{
    if(current!=='event.html') return;

    const updateBand=document.querySelector('.update-band p');
    if(updateBand){
      updateBand.innerHTML='<strong>9/17 更新：</strong> 競技・駐車誘導・更衣・泥落とし・持ち物を最終更新しました。12:00頃から現地スタッフが案内します。';
    }

    const carNote=document.querySelector('#before-you-come .rb-current-note');
    if(carNote){
      carNote.innerHTML='<strong>車でお越しの方へ：</strong> 会場マップは位置確認用です。ナビだけで田んぼへ直接進まず、当日は旧上黒丸小学校付近から配置するスタッフの誘導に従ってください。道路上・近隣住宅・農地への無断駐車はせず、案内された場所へ駐車をお願いします。';
    }

    const infoGrid=document.querySelector('#before-you-come .info-grid');
    if(infoGrid && !document.querySelector('[data-mud-flow-final]')){
      const note=document.createElement('p');
      note.className='rb-final-guide-note';
      note.dataset.mudFlowFinal='1';
      note.innerHTML='<strong>競技後の流れ：</strong> ①田んぼから上がる → ②大きな泥を落とす → ③水で泥を流す → ④タオルで体を拭く → ⑤更衣スペースで着替える、の順を予定しています。会場ではまず車に乗れる程度まで泥を落とします。';
      infoGrid.after(note);
    }

    const bringGrid=document.querySelector('#bring .bring-grid');
    if(bringGrid){
      [...bringGrid.querySelectorAll('.bring-item')].forEach(item=>{
        const title=(item.querySelector('b')?.textContent||'').trim();
        if(title==='十分な飲み物'){
          const p=item.querySelector('p');
          if(p) p.textContent='会場でもアクエリアス・綾鷹を用意していますが、各自でも十分な量の飲み物をお持ちください。';
        }
      });

      if(!bringGrid.querySelector('[data-return-shoes]')){
        const shoes=document.createElement('div');
        shoes.className='bring-item';
        shoes.dataset.returnShoes='1';
        shoes.innerHTML='<b>帰り用の靴・替えの靴下</b><p>履き物まで泥だらけになる可能性があります。帰宅用を別に用意しておくと安心です。</p>';
        bringGrid.appendChild(shoes);
      }

      if(!bringGrid.querySelector('[data-car-protection]')){
        const car=document.createElement('div');
        car.className='bring-item';
        car.dataset.carProtection='1';
        car.innerHTML='<b>車内の泥対策</b><p>車で来られる方は、ブルーシート・大きなゴミ袋・レジャーシート・車内用タオルなどをご用意ください。</p>';
        bringGrid.appendChild(car);
      }
    }
  };

  const updatePartner=()=>{
    if(current!=='partner.html') return;

    const cards=[...document.querySelectorAll('#current-support-20260913 .rb-support-now__card')];
    const coke=cards.find(card=>(card.querySelector('h3')?.textContent||'').includes('北陸コカ・コーラボトリング'));
    if(coke){
      const label=coke.querySelector('small');
      const p=coke.querySelector('p');
      if(label) label.textContent='IN-KIND SUPPORT / RECEIVED 9.16';
      if(p) p.innerHTML='9月16日に、<strong>アクエリアス500ml 48本</strong>、<strong>綾鷹650ml 24本</strong>、<strong>Coke ONチケット約50枚</strong>をご提供いただきました。飲料は参加者・スタッフの水分補給に、Coke ONチケットは当日の企画で大切に活用します。';
      if(!coke.querySelector('.rb-support-link')){
        const a=document.createElement('a');
        a.className='rb-support-link';
        a.href=COKE_URL;
        a.target='_blank';
        a.rel='noopener';
        a.textContent='北陸コカ・コーラボトリング株式会社 公式サイト ↗';
        coke.appendChild(a);
      }
    }
  };

  ensureLatestStyles();
  updateHome();
  updateEvent();
  updatePartner();
})();