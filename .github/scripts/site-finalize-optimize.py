import os,re,subprocess

os.makedirs('qa',exist_ok=True)

# 1) Conservative photo recompression.
targets=['field-detail.webp','field-overview.webp','team-reboost.webp','team-presentation.webp']
rows=[]
for f in targets:
    if not os.path.exists(f):
        continue
    before=os.path.getsize(f)
    dims=subprocess.check_output(['identify','-format','%wx%h',f],text=True).strip()
    tmp='/tmp/'+os.path.basename(f)+'.opt.webp'
    subprocess.check_call(['convert',f,'-auto-orient','-strip','-resize','1800x1800>','-quality','84','-define','webp:method=6',tmp])
    after=os.path.getsize(tmp)
    ndims=subprocess.check_output(['identify','-format','%wx%h',tmp],text=True).strip()
    ref='/tmp/'+os.path.basename(f)+'.ref.png'
    subprocess.check_call(['convert',f,'-resize',ndims+'!',ref])
    p=subprocess.run(['compare','-metric','RMSE',ref,tmp,'null:'],stderr=subprocess.PIPE,stdout=subprocess.PIPE,text=True)
    metric=(p.stderr or p.stdout).strip()
    m=re.search(r'\(([^)]+)\)',metric)
    norm=float(m.group(1)) if m else 1.0
    accepted=(after < before*0.92 and norm < 0.065)
    if accepted:
        os.replace(tmp,f)
    else:
        if os.path.exists(tmp):
            os.remove(tmp)
    rows.append((f,before,after,dims,ndims,norm,accepted))
with open('qa/image-optimization.tsv','w',encoding='utf-8') as o:
    o.write('file\tbefore_bytes\tcandidate_bytes\toriginal_dims\tnew_dims\tnormalized_rmse\taccepted\n')
    for r in rows:
        o.write('\t'.join(map(str,r))+'\n')

# 2) Add correct intrinsic dimensions to known raster images, excluding diagnosis.html.
pages=['index.html','thoughts.html','learn.html','event.html','report.html','partner.html','contact.html','photo-credits.html','404.html']
raster={}
for f in [
    'field-detail.webp','field-overview.webp','team-reboost.webp','team-presentation.webp',
    'event-hero-field-20260919-v2.webp','noto-rebloom-logo.png',
    'gyakuten-coaching-official-logo.png','ishikawa-zukan-logo.png',
    'assets/partners/yorozuya-oteru.webp'
]:
    if os.path.exists(f):
        w,h=map(int,subprocess.check_output(['identify','-format','%w %h',f],text=True).split())
        raster[f]=(w,h)

pat=re.compile(r'<img\b([^>]*)>',re.I)
for page in pages:
    s=open(page,encoding='utf-8').read()
    def repl(m):
        attrs=m.group(1)
        sm=re.search(r'\bsrc=["\']([^"\']+)["\']',attrs,re.I)
        if not sm:
            return m.group(0)
        src=sm.group(1).split('?')[0]
        if src not in raster:
            return m.group(0)
        w,h=raster[src]
        if not re.search(r'\bwidth=',attrs,re.I):
            attrs+=f' width="{w}"'
        if not re.search(r'\bheight=',attrs,re.I):
            attrs+=f' height="{h}"'
        return '<img'+attrs+'>'
    s=pat.sub(repl,s)
    open(page,'w',encoding='utf-8').write(s)

with open('qa/raster-dimensions.tsv','w',encoding='utf-8') as o:
    for k,(w,h) in sorted(raster.items()):
        o.write(f'{k}\t{w}\t{h}\n')


# 3) Build responsive derivatives for non-diagnosis pages.
os.makedirs('assets/perf',exist_ok=True)

responsive_sources=[
    'field-detail.webp','field-overview.webp','team-reboost.webp','team-presentation.webp',
    'assets/event-2026/group.webp','assets/event-2026/child.webp','assets/event-2026/field.webp',
    'assets/event-2026/game.webp','assets/event-2026/cup-making.webp','assets/event-2026/cup.webp'
]
responsive={}
for src in responsive_sources:
    if not os.path.exists(src):
        continue
    stem=os.path.splitext(os.path.basename(src))[0]
    out=f'assets/perf/{stem}-800.webp'
    subprocess.check_call(['convert',src,'-auto-orient','-strip','-resize','800x>','-quality','82','-define','webp:method=6',out])
    ow,oh=map(int,subprocess.check_output(['identify','-format','%w %h',src],text=True).split())
    vw,vh=map(int,subprocess.check_output(['identify','-format','%w %h',out],text=True).split())
    responsive[src]=(out,ow,oh,vw,vh)

logo_variants={
    'noto-rebloom-logo.png':('assets/perf/noto-rebloom-logo-220.webp','220x220>'),
    'gyakuten-coaching-official-logo.png':('assets/perf/gyakuten-coaching-logo-720.webp','720x720>'),
}
for src,(out,size) in logo_variants.items():
    if os.path.exists(src):
        subprocess.check_call(['convert',src,'-auto-orient','-strip','-resize',size,'-quality','90','-define','webp:method=6','-define','webp:alpha-quality=100',out])

pages=['index.html','thoughts.html','learn.html','event.html','report.html','partner.html','contact.html','photo-credits.html','404.html']
imgpat=re.compile(r'<img\\b([^>]*)>',re.I)
for page in pages:
    s=open(page,encoding='utf-8').read()
    s=s.replace('src="noto-rebloom-logo.png"','src="assets/perf/noto-rebloom-logo-220.webp"')
    s=s.replace('src="gyakuten-coaching-official-logo.png"','src="assets/perf/gyakuten-coaching-logo-720.webp"')
    def add_srcset(m):
        attrs=m.group(1)
        sm=re.search(r'\\bsrc=["\\']([^"\\']+)["\\']',attrs,re.I)
        if not sm or re.search(r'\\bsrcset=',attrs,re.I):
            return m.group(0)
        raw=sm.group(1)
        src=raw.split('?')[0]
        if src not in responsive:
            return m.group(0)
        variant,ow,oh,vw,vh=responsive[src]
        attrs+=f' srcset="{variant} 800w, {raw} {ow}w" sizes="(max-width:700px) calc(100vw - 32px), 50vw"'
        return '<img'+attrs+'>'
    s=imgpat.sub(add_srcset,s)
    open(page,'w',encoding='utf-8').write(s)

# Keep injected partner-strip images lightweight and intrinsically sized.
if os.path.exists('site-core.js'):
    s=open('site-core.js',encoding='utf-8').read()
    s=s.replace('src="noto-rebloom-logo.png" alt="NOTO Re:Bloom" loading="lazy" decoding="async"',
                'src="assets/perf/noto-rebloom-logo-220.webp" alt="NOTO Re:Bloom" loading="lazy" decoding="async" width="499" height="570"')
    s=s.replace('src="bukatsu-navi-logo.svg" alt="部活ナビ" loading="lazy" decoding="async"',
                'src="bukatsu-navi-logo.svg" alt="部活ナビ" loading="lazy" decoding="async" width="1671" height="734"')
    s=s.replace('src="gyakuten-coaching-official-logo.png" alt="逆転コーチング" loading="lazy" decoding="async"',
                'src="assets/perf/gyakuten-coaching-logo-720.webp" alt="逆転コーチング" loading="lazy" decoding="async" width="2400" height="675"')
    s=s.replace('src="ishimo-logo.svg" alt="ishimo" loading="lazy" decoding="async"',
                'src="ishimo-logo.svg" alt="ishimo" loading="lazy" decoding="async" width="1210" height="461"')
    s=s.replace('src="hamonz-logo.svg" alt="HAMONZ" loading="lazy" decoding="async"',
                'src="hamonz-logo.svg" alt="HAMONZ" loading="lazy" decoding="async" width="237" height="71"')
    s=s.replace('src="ishikawa-zukan-logo.png" alt="イシカワズカン" loading="lazy" decoding="async"',
                'src="ishikawa-zukan-logo.png" alt="イシカワズカン" loading="lazy" decoding="async" width="250" height="250"')
    open('site-core.js','w',encoding='utf-8').write(s)

with open('qa/responsive-derivatives.tsv','w',encoding='utf-8') as o:
    o.write('source\\tvariant\\toriginal_dims\\tvariant_dims\\n')
    for src,(out,ow,oh,vw,vh) in responsive.items():
        o.write(f'{src}\\t{out}\\t{ow}x{oh}\\t{vw}x{vh}\\n')
