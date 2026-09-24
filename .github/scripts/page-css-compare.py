import glob,os,re,subprocess,json,sys

diffs=[]
failures=[]
for before in sorted(glob.glob('qa-page-css-before/*.png')):
    name=os.path.basename(before)
    after='qa-page-css-after/'+name
    if not os.path.exists(after):
        failures.append({'image':name,'reason':'missing after screenshot'})
        continue
    p=subprocess.run(['compare','-metric','RMSE',before,after,'null:'],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    metric=(p.stderr or p.stdout).strip()
    m=re.search(r'\(([^)]+)\)',metric)
    norm=float(m.group(1)) if m else 1.0
    diffs.append({'image':name,'rmse':norm})
    if norm>0.006:
        failures.append({'image':name,'reason':'visual rmse','rmse':norm})

before=json.load(open('qa-page-css-before/layout.json',encoding='utf-8'))
after=json.load(open('qa-page-css-after/layout.json',encoding='utf-8'))
b={(x['file'],x['width']):x for x in before}
for x in after:
    old=b.get((x['file'],x['width']),{})
    if x.get('scrollWidth',0)>x.get('width',0)+2 and old.get('scrollWidth',0)<=old.get('width',0)+2:
        failures.append({'file':x['file'],'width':x['width'],'reason':'new horizontal overflow'})
    if len(x.get('broken',[]))>len(old.get('broken',[])):
        failures.append({'file':x['file'],'width':x['width'],'reason':'new broken image'})
    if len(x.get('errors',[]))>len(old.get('errors',[])):
        failures.append({'file':x['file'],'width':x['width'],'reason':'new console/page error'})
    if x.get('h1')!=old.get('h1'):
        failures.append({'file':x['file'],'width':x['width'],'reason':'h1 count changed'})

os.makedirs('qa-page-css',exist_ok=True)
json.dump({'pixelDiffs':diffs,'failures':failures},open('qa-page-css/compare.json','w',encoding='utf-8'),indent=2)
print('PAGE_CSS_COMPARE='+json.dumps({'maxRMSE':max([x['rmse'] for x in diffs],default=0),'failures':failures}))
if failures:
    sys.exit(1)
