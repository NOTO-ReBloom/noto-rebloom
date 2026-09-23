(()=>{
  'use strict';
  if(!document.body.classList.contains('nr-new-partner')) return;

  const article=document.getElementById('sponsor-oteru');
  if(!article) return;

  const url='https://www.instagram.com/yorozuya.oteru26/';
  const logo='assets/partners/yorozuya-oteru.webp';

  article.className='nr-sponsor-wide rb-detail-card nr-sponsor-wide--simple nr-sponsor-wide--oteru-rich';
  article.innerHTML=`
    <span class="nr-sponsor-wide__ornament" aria-hidden="true"></span>
    <div class="nr-sponsor-wide__brand">
      <div class="nr-sponsor-wide__partnerline"><span>SPONSOR PARTNER</span><b>03</b></div>
      <a class="nr-sponsor-wide__logo" href="${url}" target="_blank" rel="sponsored noopener" aria-label="萬屋おてる Instagram">
        <img src="${logo}" alt="萬屋おてる ロゴ" loading="lazy" decoding="async">
      </a>
      <p>萬屋おてる</p>
      <small>NOTO Re:Bloomの活動にご協賛いただいています。ありがとうございます。</small>
      <div class="nr-sponsor-wide__brandlinks">
        <a href="${url}" target="_blank" rel="sponsored noopener">Instagram ↗</a>
      </div>
    </div>
    <div class="nr-sponsor-wide__body">
      <div class="nr-sponsor-wide__titlebar"><span>YOROZUYA OTERU</span><small>ABOUT THE PARTNER</small></div>
      <div class="nr-sponsor-wide__intro">
        <div>
          <h3>食でつなぐ。笑顔でつなぐ。<br>北陸を走る鉄板焼きキッチンカー。</h3>
          <p>石川県小松市を拠点に、石川県・富山県・福井県を中心とした北陸各地のイベントや地域催事へ出店する「萬屋おてる」。鉄板焼きを中心に、できたての美味しさを届けることはもちろん、「食」をきっかけに人と人がつながり、笑顔が生まれる場をつくることを大切に活動されています。</p>
        </div>
        <div class="nr-sponsor-wide__tags" aria-label="萬屋おてるの活動">
          <span>石川県小松市拠点</span><span>北陸三県</span><span>鉄板焼きキッチンカー</span><span>能登での地域活動</span>
        </div>
      </div>
      <div class="nr-sponsor-wide__reasons-title"><span>萬屋おてるの活動</span><small>FOOD × COMMUNITY</small></div>
      <div class="nr-sponsor-wide__reasons nr-oteru-reasons">
        <div><b>01</b><strong>北陸各地へ出店</strong><span>小松市を拠点に、石川・富山・福井を中心としたイベントや地域催事へ。キッチンカーならではの機動力で、地域へ足を運んでいます。</span></div>
        <div><b>02</b><strong>食から生まれるつながり</strong><span>鉄板焼きを中心に、できたての美味しさとともに、人と人が出会い、会話し、笑顔になれる場づくりを大切にしています。</span></div>
        <div><b>03</b><strong>能登での災害支援・地域活動</strong><span>能登半島地震以降、七尾・中能登町・穴水・門前・輪島・能登町・珠洲市など、能登各地での災害支援や地域活動にも参加されています。</span></div>
        <div><b>04</b><strong>地域に「笑売繁盛」を</strong><span>食事の提供だけでなく、現地でのボランティアや地域の皆さんとの交流、仲間とともに催しの企画・運営・協力にも取り組んでいます。</span></div>
      </div>
      <div class="nr-sponsor-wide__company nr-oteru-message"><span>大切にしていること</span><p>「自分たちにできることを、できる場所から。」を大切に、北陸の皆さんとともに、食べて笑顔になる、出会ってつながる場所を一つずつ増やしていく。萬屋おてるは、これからも北陸を走り続けます。</p></div>
      <div class="nr-sponsor-wide__action"><span>@yorozuya.oteru26</span><a href="${url}" target="_blank" rel="sponsored noopener">Instagramで活動を見る<b>↗</b></a></div>
    </div>`;

  const style=document.createElement('style');
  style.id='partner-oteru-rich-profile-styles';
  style.textContent=`
    .nr-new-partner #current-partners #sponsor-oteru{grid-template-columns:minmax(330px,23%) minmax(0,77%)!important;min-height:0!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__brand{padding:28px 30px!important;justify-content:flex-start!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__partnerline{margin-bottom:20px!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__partnerline>b{font-size:38px!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__logo{height:126px!important;margin:0 0 16px!important;padding:12px 18px!important;border-radius:18px!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__logo img{max-height:98px!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__brand>p{font-size:15px!important;line-height:1.45!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__brand>small{display:block!important;margin-top:8px!important;line-height:1.7!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__brandlinks{display:flex!important;margin-top:18px!important;padding-top:14px!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__body{padding:30px 34px!important;display:block!important;min-height:0!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__titlebar{display:flex!important;margin-bottom:20px!important;padding-bottom:13px!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__intro{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:24px!important;align-items:start!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__intro h3{font-size:clamp(27px,2.3vw,39px)!important;line-height:1.2!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__intro p{margin-top:12px!important;font-size:14px!important;line-height:1.9!important;max-width:none!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__tags{display:flex!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__reasons-title{margin-top:28px!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-oteru-reasons{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-oteru-reasons>div{min-height:150px!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-oteru-message{display:grid!important;margin-top:24px!important;padding:18px 20px!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-oteru-message p{line-height:1.85!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__action{justify-content:space-between!important;margin-top:20px!important;gap:16px!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__action>span{font-size:11px!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__action>a{min-height:46px!important;padding:9px 12px 9px 18px!important;font-size:12px!important}
    .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__action>a b{width:26px!important;height:26px!important}
    @media(max-width:980px){
      .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__intro{grid-template-columns:1fr!important}
      .nr-new-partner #current-partners #sponsor-oteru .nr-oteru-reasons{grid-template-columns:1fr!important}
      .nr-new-partner #current-partners #sponsor-oteru .nr-oteru-reasons>div{min-height:0!important}
    }
    @media(max-width:820px){
      .nr-new-partner #current-partners #sponsor-oteru{grid-template-columns:1fr!important}
      .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__brand{padding:22px 20px!important}
      .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__logo{height:104px!important}
      .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__body{padding:22px 20px 24px!important}
      .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__intro h3{font-size:25px!important}
      .nr-new-partner #current-partners #sponsor-oteru .nr-sponsor-wide__action{align-items:flex-start!important;flex-direction:column!important}
    }
  `;
  document.head.appendChild(style);
})();