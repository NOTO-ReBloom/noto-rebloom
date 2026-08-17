from pathlib import Path
import re

description='全国の高校・中学・大学の”部活”が検索できるサイトです。偏差値だけじゃない、部活動でも学校探しができる、部活動に特化した新しいメディアです。'

home_section=f'''<section class="nr-sponsor-feature nr-sponsor-feature--spotlight"><div class="nr-section-head"><p class="nr-kicker">SPONSOR PARTNER</p><h2>部活から、学校選びを考える。<br>「部活ナビ」</h2><p>NOTO Re:Bloomを支援してくださっている株式会社アーネストテクノロジーズのサービスをご紹介します。</p></div><article class="nr-main-sponsor nr-main-sponsor--navi"><div class="nr-sponsor-identity"><span class="nr-badge">協賛企業</span><a class="nr-sponsor-logo" href="https://bukatsunavi.com/" target="_blank" rel="sponsored noopener" aria-label="部活ナビ公式サイト"><img src="bukatsu-navi-logo.svg" alt="部活ナビ"></a><p>株式会社アーネストテクノロジーズ</p><small>READYFORを通じてNOTO Re:Bloomをご支援いただきました。</small></div><div class="nr-sponsor-story"><p class="nr-sponsor-thanks">ご支援ありがとうございます</p><h3>「好きな部活」を入口に、進学先を探せる。</h3><p>{description}</p><div class="nr-navi-features" aria-label="部活ナビでできること"><span>部活を検索</span><span>見学・体験会を検索</span><span>イベントを検索</span></div><p class="nr-sponsor-note">学校選びを考えている方には、偏差値や場所だけでなく「続けたい部活」から進学先を探す方法もあります。ぜひ部活ナビをのぞいてみてください。</p><div class="nr-actions"><a class="nr-btn nr-btn--purple nr-sponsor-primary" href="https://bukatsunavi.com/" target="_blank" rel="sponsored noopener">部活ナビを見てみる ↗</a><a class="nr-link" href="partner.html">協賛・協力について →</a></div></div></article></section>'''

partner_section=f'''<section class="nr-sponsor-feature nr-sponsor-feature--spotlight" id="current-partners"><div class="nr-section-head"><p class="nr-kicker">SPONSOR PARTNER</p><h2>協賛パートナーとして、<br>活動を支えていただいています。</h2><p>ご支援への感謝を込めて、株式会社アーネストテクノロジーズの「部活ナビ」をご紹介します。</p></div><article class="nr-main-sponsor nr-main-sponsor--navi"><div class="nr-sponsor-identity"><span class="nr-badge">協賛企業</span><a class="nr-sponsor-logo" href="https://bukatsunavi.com/" target="_blank" rel="sponsored noopener" aria-label="部活ナビ公式サイト"><img src="bukatsu-navi-logo.svg" alt="部活ナビ"></a><p>株式会社アーネストテクノロジーズ</p><small>READYFORを通じてNOTO Re:Bloomをご支援いただきました。</small></div><div class="nr-sponsor-story"><p class="nr-sponsor-thanks">SUPPORTED BY EARNEST TECHNOLOGIES</p><h3>部活で学校を選ぶ、という新しい選択肢。</h3><p>{description}</p><div class="nr-navi-guide"><article><b>01</b><strong>部活から探す</strong><span>部活やエリア、学校タイプなどから探せます。</span></article><article><b>02</b><strong>見学・体験会</strong><span>気になる部活の見学・体験会を探せます。</span></article><article><b>03</b><strong>イベント</strong><span>部活動に関するイベント情報も探せます。</span></article></div><p class="nr-sponsor-note">学校選びの基準に「どんな部活があるか」を加えたい方へ。気になる部活から、次の学校を探してみてください。</p><div class="nr-actions"><a class="nr-btn nr-btn--purple nr-sponsor-primary" href="https://bukatsunavi.com/" target="_blank" rel="sponsored noopener">部活ナビで部活を探す ↗</a></div></div></article></section>'''

p=Path('index.html'); t=p.read_text(encoding='utf-8')
t,n=re.subn(r'<section class="nr-sponsor-feature(?: nr-sponsor-feature--spotlight)?">.*?</section>',home_section,t,count=1,flags=re.S)
assert n==1,('home sponsor',n)
p.write_text(t,encoding='utf-8')

p=Path('partner.html'); t=p.read_text(encoding='utf-8')
t,n=re.subn(r'<section class="nr-sponsor-feature(?: nr-sponsor-feature--spotlight)?" id="current-partners">.*?</section>',partner_section,t,count=1,flags=re.S)
assert n==1,('partner sponsor',n)
m_value=re.search(r'<section class="nr-value-prop">.*?</section>',t,re.S)
m_sponsor=re.search(r'<section class="nr-sponsor-feature nr-sponsor-feature--spotlight" id="current-partners">.*?</section>',t,re.S)
assert m_value and m_sponsor
if m_value.start() < m_sponsor.start():
    value=m_value.group(0)
    t=t[:m_value.start()]+t[m_value.end():]
    m_sponsor=re.search(r'<section class="nr-sponsor-feature nr-sponsor-feature--spotlight" id="current-partners">.*?</section>',t,re.S)
    t=t[:m_sponsor.end()]+value+t[m_sponsor.end():]
p.write_text(t,encoding='utf-8')

css=Path('rebloom-purpose-complete.css')
t=css.read_text(encoding='utf-8')
marker='/* SPONSOR EFFECT + CROWDFUNDING PROOF FIX / 2026-08-17 */'
if marker not in t:
    t += r'''

/* SPONSOR EFFECT + CROWDFUNDING PROOF FIX / 2026-08-17 */
body.rb-unified .nr-sponsor-feature--spotlight{position:relative;overflow:hidden;background:linear-gradient(135deg,#f5eefb 0%,#fffaf3 52%,#edf6eb 100%)!important;border:1px solid rgba(91,67,126,.10)!important}
body.rb-unified .nr-sponsor-feature--spotlight::before{content:"";position:absolute;width:260px;height:260px;border-radius:50%;right:-110px;top:-120px;background:rgba(244,207,88,.19);pointer-events:none}
body.rb-unified .nr-sponsor-feature--spotlight .nr-section-head{position:relative;z-index:1;max-width:850px}
body.rb-unified .nr-sponsor-feature--spotlight .nr-section-head h2{max-width:18em!important;font-size:clamp(30px,3.4vw,46px)!important;line-height:1.3!important}
body.rb-unified .nr-main-sponsor--navi{position:relative;z-index:1;grid-template-columns:minmax(270px,.76fr) minmax(0,1.24fr)!important;gap:clamp(24px,4vw,48px)!important;padding:clamp(24px,3.2vw,38px)!important;background:rgba(255,255,255,.9)!important;border:1px solid rgba(24,76,63,.12)!important;box-shadow:0 14px 34px rgba(23,58,49,.08)!important}
body.rb-unified .nr-main-sponsor--navi .nr-sponsor-identity{align-self:stretch;display:flex;flex-direction:column;justify-content:center}
body.rb-unified .nr-main-sponsor--navi .nr-sponsor-identity>p{margin:14px 0 0!important;font-weight:900!important;color:#273f36!important}
body.rb-unified .nr-main-sponsor--navi .nr-sponsor-identity>small{display:block;margin-top:6px;font-size:11.5px;line-height:1.7;color:#6b7771}
body.rb-unified .nr-main-sponsor--navi .nr-sponsor-logo{min-height:150px!important;background:#fff!important;box-shadow:inset 0 0 0 1px rgba(24,76,63,.05)}
body.rb-unified .nr-sponsor-thanks{display:inline-flex!important;align-self:flex-start;margin:0 0 10px!important;padding:6px 10px;border-radius:999px;background:#fff1b5;color:#614f15!important;font-size:10.5px!important;line-height:1.2!important;font-weight:900;letter-spacing:.06em}
body.rb-unified .nr-main-sponsor--navi .nr-sponsor-story h3{margin:0 0 13px!important;font-size:clamp(25px,2.8vw,36px)!important;line-height:1.38!important;color:#173a31!important}
body.rb-unified .nr-main-sponsor--navi .nr-sponsor-story>p:not(.nr-sponsor-thanks,.nr-sponsor-note){font-size:15px!important;line-height:1.9!important}
body.rb-unified .nr-navi-features{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0}
body.rb-unified .nr-navi-features span{display:inline-flex;align-items:center;min-height:38px;padding:8px 12px;border:1px solid rgba(103,71,146,.16);border-radius:999px;background:#f6f0fb;color:#604685;font-size:12px;font-weight:900}
body.rb-unified .nr-navi-guide{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:20px 0}
body.rb-unified .nr-navi-guide article{display:grid;grid-template-columns:30px 1fr;column-gap:9px;align-items:start;padding:15px 13px;border:1px solid rgba(24,76,63,.12);border-radius:16px;background:#fffdf8}
body.rb-unified .nr-navi-guide b{grid-row:1/3;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#edf5eb;color:#184c3f;font-size:10px}
body.rb-unified .nr-navi-guide strong{font-size:13px;line-height:1.5;color:#173a31}
body.rb-unified .nr-navi-guide span{margin-top:3px;font-size:11.5px;line-height:1.65;color:#64716c}
body.rb-unified .nr-sponsor-note{margin:17px 0 0!important;padding:13px 15px;border-left:3px solid #7652a8;background:#faf7fc;color:#4e5e57!important;font-size:13px!important;line-height:1.8!important}
body.rb-unified .nr-sponsor-primary{min-height:50px!important;padding-inline:20px!important;font-size:14px!important}
body.rb-unified .nr-new-partner #current-partners{margin-top:clamp(32px,5vw,62px)!important;margin-bottom:clamp(26px,4vw,48px)!important}
body.rb-unified .nr-new-partner #current-partners + .nr-value-prop{margin-top:0!important}

/* Crowdfunding proof: two stacked horizontal cards prevent large figures from clipping. */
body.rb-unified #crowdfunding-result .split-story{grid-template-columns:minmax(0,1.08fr) minmax(330px,.82fr)!important;gap:clamp(30px,4.4vw,58px)!important;align-items:center!important}
body.rb-unified #crowdfunding-result .rb-proof-grid{grid-template-columns:1fr!important;gap:12px!important;align-self:center}
body.rb-unified #crowdfunding-result .rb-proof-card{min-height:0!important;padding:20px 22px!important;display:grid!important;grid-template-columns:54px minmax(0,1fr)!important;grid-template-rows:auto auto auto;column-gap:16px;row-gap:3px;align-items:center!important;justify-content:initial!important}
body.rb-unified #crowdfunding-result .rb-proof-card>span{grid-column:1;grid-row:1/4;margin:0!important;align-self:center}
body.rb-unified #crowdfunding-result .rb-proof-label{grid-column:2;grid-row:1;margin:0!important}
body.rb-unified #crowdfunding-result .rb-proof-card h3{grid-column:2;grid-row:2;margin:1px 0 4px!important;font-size:clamp(34px,3.35vw,48px)!important;line-height:1.08!important;letter-spacing:-.035em!important;white-space:nowrap}
body.rb-unified #crowdfunding-result .rb-proof-card p{grid-column:2;grid-row:3;margin:0!important;font-size:12.5px!important;line-height:1.65!important;max-width:32em}

@media(max-width:880px){
  body.rb-unified .nr-main-sponsor--navi{grid-template-columns:1fr!important}
  body.rb-unified .nr-main-sponsor--navi .nr-sponsor-identity{max-width:520px;width:100%;margin-inline:auto}
  body.rb-unified #crowdfunding-result .split-story{grid-template-columns:1fr!important}
  body.rb-unified #crowdfunding-result .rb-proof-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;width:100%}
  body.rb-unified #crowdfunding-result .rb-proof-card{grid-template-columns:46px minmax(0,1fr)!important;padding:18px!important}
  body.rb-unified #crowdfunding-result .rb-proof-card>span{width:46px!important;height:46px!important}
  body.rb-unified #crowdfunding-result .rb-proof-card h3{font-size:clamp(30px,5vw,42px)!important}
}
@media(max-width:620px){
  body.rb-unified .nr-sponsor-feature--spotlight{padding:22px 16px!important;border-radius:20px!important}
  body.rb-unified .nr-main-sponsor--navi{padding:20px 17px!important}
  body.rb-unified .nr-main-sponsor--navi .nr-sponsor-logo{min-height:112px!important}
  body.rb-unified .nr-navi-guide{grid-template-columns:1fr}
  body.rb-unified .nr-navi-guide article{grid-template-columns:30px 1fr;padding:13px}
  body.rb-unified .nr-navi-features span{flex:1 1 auto;justify-content:center}
  body.rb-unified #crowdfunding-result .rb-proof-grid{grid-template-columns:1fr!important}
  body.rb-unified #crowdfunding-result .rb-proof-card{grid-template-columns:44px minmax(0,1fr)!important;padding:17px 16px!important;column-gap:13px}
  body.rb-unified #crowdfunding-result .rb-proof-card>span{width:44px!important;height:44px!important}
  body.rb-unified #crowdfunding-result .rb-proof-card h3{font-size:clamp(31px,10vw,40px)!important}
  body.rb-unified #crowdfunding-result .rb-proof-card p{font-size:12px!important}
}
'''
css.write_text(t,encoding='utf-8')

pages=['index.html','learn.html','event.html','partner.html','diagnosis.html','404.html']
for name in pages:
    p=Path(name); x=p.read_text(encoding='utf-8')
    x=re.sub(r'rebloom-purpose-complete\.css\?v=20260817[a-z]','rebloom-purpose-complete.css?v=20260817s',x)
    x=re.sub(r'rebloom-unified\.js\?v=20260817[a-z]','rebloom-unified.js?v=20260817s',x)
    p.write_text(x,encoding='utf-8')

p=Path('rebloom-detail.js'); x=p.read_text(encoding='utf-8')
x=re.sub(r'rebloom-purpose-complete\.css\?v=20260817[a-z]','rebloom-purpose-complete.css?v=20260817s',x)
p.write_text(x,encoding='utf-8')
p=Path('rebloom-unified.js'); x=p.read_text(encoding='utf-8')
x=re.sub(r'rebloom-detail\.js\?v=20260817[a-z]','rebloom-detail.js?v=20260817s',x)
p.write_text(x,encoding='utf-8')

for name in ['index.html','partner.html']:
    x=Path(name).read_text(encoding='utf-8')
    assert description in x
    assert 'Bukatsu Page' not in x
    assert 'bukatsu-navi-logo.svg' in x
pt=Path('partner.html').read_text(encoding='utf-8')
assert pt.index('id="current-partners"') < pt.index('class="nr-value-prop"')
for name in pages:
    x=Path(name).read_text(encoding='utf-8')
    assert 'rebloom-purpose-complete.css?v=20260817s' in x
    assert 'rebloom-unified.js?v=20260817s' in x
