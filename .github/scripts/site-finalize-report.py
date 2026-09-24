import json,os

lines=['# NOTO Re:Bloom final site audit — 2026-09-24','']

if os.path.exists('qa/image-optimization.tsv'):
    lines+=['## Image optimization',open('qa/image-optimization.tsv',encoding='utf-8').read().rstrip(),'']

if os.path.exists('qa/css-purge.json'):
    rows=json.load(open('qa/css-purge.json',encoding='utf-8'))
    lines+=['## CSS purge']
    for r in rows:
        lines.append(f"- {r['css']}: {r['before']:,} -> {r['after']:,} chars ({r['reduction']*100:.1f}% reduction)")
    if os.path.exists('qa/css-restored.txt'):
        lines.append('- CSS purge was automatically rolled back by the visual regression gate.')
    lines.append('')

if os.path.exists('qa-final/layout.json'):
    final=json.load(open('qa-final/layout.json',encoding='utf-8'))
    overflow=[x for x in final if x.get('horizontalOverflow')]
    broken=[x for x in final if x.get('brokenImages')]
    errors=[x for x in final if x.get('errors')]
    lines+=['## Browser QA',f'- Viewport/page combinations tested: {len(final)}',f'- Horizontal overflow cases: {len(overflow)}',f'- Broken-image cases: {len(broken)}',f'- Console/page-error cases: {len(errors)}','']
    if overflow:
        lines+=['### Horizontal overflow']
        for x in overflow:
            lines.append(f"- {x['file']} @ {x['width']}px: {x.get('offenders',[])[:3]}")
        lines.append('')
    tiny=sum(len(x.get('tinyTargets',[])) for x in final)
    lines.append(f'- Small interactive-target findings (<36px in either dimension): {tiny}')
    lines.append('')

if os.path.exists('qa/lighthouse-summary.json'):
    scores=json.load(open('qa/lighthouse-summary.json',encoding='utf-8'))
    lines+=['## Lighthouse']
    for s in scores:
        lines.append(f"- {s['file']}: performance {s['performance']}, accessibility {s['accessibility']}, best-practices {s['bestPractices']}, SEO {s['seo']}, LCP {s['lcp']}, CLS {s['cls']}, TBT {s['tbt']}")
    lines.append('')

if os.path.exists('qa/visual-regression.json'):
    vr=json.load(open('qa/visual-regression.json',encoding='utf-8'))
    diffs=vr.get('pixelDiffs',[])
    maxdiff=max([x.get('rmse',0) for x in diffs],default=0)
    lines+=['## Visual regression gate',f'- Screenshot pairs compared: {len(diffs)}',f'- Maximum normalized RMSE: {maxdiff:.6f}',f"- Layout regressions: {len(vr.get('layoutRegressions',[]))}",'']

open('SITE_AUDIT_2026-09-24.md','w',encoding='utf-8').write('\n'.join(lines)+'\n')
