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
