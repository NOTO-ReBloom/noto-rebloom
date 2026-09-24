import glob,os,re,subprocess,json,shutil

os.makedirs('qa',exist_ok=True)
diffs=[]
visual_fail=False
for before in sorted(glob.glob('qa-before/*.png')):
    after='qa-after/'+os.path.basename(before)
    if not os.path.exists(after):
        continue
    p=subprocess.run(['compare','-metric','RMSE',before,after,'null:'],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    metric=(p.stderr or p.stdout).strip()
    m=re.search(r'\(([^)]+)\)',metric)
    norm=float(m.group(1)) if m else 1.0
    diffs.append({'image':os.path.basename(before),'rmse':norm})
    if norm>0.012:
        visual_fail=True

before=json.load(open('qa-before/layout.json',encoding='utf-8'))
after=json.load(open('qa-after/layout.json',encoding='utf-8'))
bmap={(x['file'],x['width']):x for x in before}
regressions=[]
for x in after:
    old=bmap.get((x['file'],x['width']),{})
    if x.get('horizontalOverflow') and not old.get('horizontalOverflow'):
        regressions.append({'file':x['file'],'width':x['width'],'type':'new horizontal overflow'})
    if len(x.get('brokenImages',[]))>len(old.get('brokenImages',[])):
        regressions.append({'file':x['file'],'width':x['width'],'type':'new broken image'})
    if len(x.get('errors',[]))>len(old.get('errors',[])):
        regressions.append({'file':x['file'],'width':x['width'],'type':'new console/page error'})

json.dump({'pixelDiffs':diffs,'layoutRegressions':regressions},open('qa/visual-regression.json','w',encoding='utf-8'),indent=2)

if visual_fail or regressions:
    for f in ['site.css','legacy-base-20260924.css','legacy-core-20260924.css','legacy-tuning-20260924.css']:
        shutil.copy('qa-css-original/'+f,f)
    open('qa/css-restored.txt','w',encoding='utf-8').write('CSS purge was reverted by the visual regression gate.\n')
    print('CSS purge reverted.')
else:
    print('CSS purge accepted.')
