from pathlib import Path
import base64, hashlib, io, json, os, zipfile
from datetime import datetime, timezone, timedelta
from PIL import Image, ImageDraw, ImageFont
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT=Path(__file__).resolve().parents[2]
Q=ROOT/'booth-autopublish'/'queue'; MON=ROOT/'booth-autopublish'/'monitor'
Q.mkdir(parents=True,exist_ok=True); MON.mkdir(parents=True,exist_ok=True)
JST=timezone(timedelta(hours=9)); now=datetime.now(JST).replace(microsecond=0); stamp=now.isoformat(); nonce=now.strftime('%Y%m%dT%H%M%S+0900')

PRODUCTS=[
 {'id':'024_grant_evidence_expense_os_20260823','title':'助成金・補助金 証憑管理OS｜経費・領収書・対象可否・報告期限を一括管理｜オフラインHTML','price':1380,'tags':['助成金','補助金','証憑','経費管理','NPO'],'help':'採択後の経費、領収書、対象可否、証憑ファイル名、報告期限を同じ一覧で追い、実績報告時の抜け漏れを減らします。','fields':[('item','経費・支出内容','text'),('category','費目','text'),('amount','金額','number'),('eligible','対象可否','select:未確認|対象|対象外|要確認'),('receipt','領収書・証憑名','text'),('owner','担当','text'),('reportDue','報告期限','date')]},
 {'id':'025_event_decision_authority_os_20260823','title':'イベント現場判断OS｜中止・救護・苦情・設備トラブルの決裁権限を整理｜オフラインHTML','price':1280,'tags':['イベント運営','安全管理','権限設計','危機対応','学生団体'],'help':'現場で迷いやすい判断テーマごとに、一次判断者、最終決裁者、相談先、代替担当、判断条件を先に決めておけます。','fields':[('scenario','判断テーマ','text'),('first','一次判断者','text'),('final','最終決裁者','text'),('consult','相談先','text'),('backup','代替担当','text'),('criteria','判断条件','textarea'),('status','整備状況','select:未整理|確認中|確定')]},
 {'id':'026_research_claim_evidence_os_20260823','title':'卒論 主張・根拠トレーサビリティOS｜主張・引用・出典・反対解釈を1画面管理｜オフラインHTML','price':1480,'tags':['卒論','研究','引用','根拠','文献レビュー'],'help':'論文で使う主張と、その根拠引用・出典位置・反対解釈・自分の解釈を結び、根拠の弱い記述を見つけやすくします。','fields':[('claim','自分の主張','textarea'),('source','文献・資料','text'),('location','ページ・位置','text'),('evidence','根拠引用・要約','textarea'),('counter','反対解釈','textarea'),('interpretation','自分の解釈','textarea'),('strength','根拠強度','select:弱|中|強')]},
 {'id':'027_sponsor_contact_history_os_20260823','title':'協賛企業 接点履歴OS｜初回連絡・面談・提案・フォロー・次回接点を一括管理｜オフラインHTML','price':1380,'tags':['協賛','スポンサー','営業','CRM','フォローアップ'],'help':'企業ごとの連絡履歴、面談内容、提案状況、次回接点、担当を時系列で残し、フォロー漏れや二重連絡を防ぎます。','fields':[('company','企業名','text'),('date','接点日','date'),('channel','接点','select:メール|電話|面談|紹介|SNS|その他'),('summary','内容要約','textarea'),('stage','段階','select:候補|初回連絡|面談|提案|検討|合意|見送り'),('owner','担当','text'),('next','次回接点','date')]},
 {'id':'028_team_backup_coverage_os_20260823','title':'小規模チーム 代替担当OS｜欠席・離脱でも止まらない業務バックアップ設計｜オフラインHTML','price':1180,'tags':['学生団体','NPO','引継ぎ','属人化','チーム運営'],'help':'重要業務ごとに主担当、代替担当、必要資料、権限、引継ぎ確認日を整理し、担当者不在で止まる業務を減らします。','fields':[('task','重要業務','text'),('primary','主担当','text'),('backup','代替担当','text'),('docs','必要資料・保存先','text'),('access','必要権限','text'),('handover','引継ぎ確認日','date'),('coverage','カバー状況','select:未整備|一部整備|対応可')]},
]

def font(size,bold=False):
    for p in [('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc' if bold else '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'),'/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        if Path(p).exists(): return ImageFont.truetype(p,size)
    return ImageFont.load_default()

def preview(title,helptext):
    im=Image.new('RGB',(1200,675),(247,249,252)); d=ImageDraw.Draw(im); ink=(30,38,55); accent=(37,56,92)
    d.rectangle((0,0,1200,15),fill=accent); d.rounded_rectangle((62,62,1138,613),radius=26,fill='white',outline=(225,229,236),width=2)
    d.text((105,100),'OFFLINE WORKFLOW TOOL',font=font(25,True),fill=accent)
    x,y=105,155; f=font(39,True); line=''
    for ch in title.split('｜')[0]:
        if d.textbbox((0,0),line+ch,font=f)[2] < 900: line+=ch
        else: d.text((x,y),line,font=f,fill=ink); y+=50; line=ch
    if line: d.text((x,y),line,font=f,fill=ink); y+=72
    for b in ['検索・編集・CSV出力・JSONバックアップ','ブラウザ内保存／外部送信なし',helptext]:
        d.ellipse((108,y+8,121,y+21),fill=accent); bf=font(23); cur=''; yy=y
        for ch in b:
            if d.textbbox((0,0),cur+ch,font=bf)[2] < 830: cur+=ch
            else: d.text((140,yy),cur,font=bf,fill=(63,70,84)); yy+=31; cur=ch
        if cur:d.text((140,yy),cur,font=bf,fill=(63,70,84)); yy+=31
        y=yy+11
    o=io.BytesIO(); im.save(o,'JPEG',quality=62,optimize=True,progressive=True); return o.getvalue()

def html_app(p):
    cfg=json.dumps({'id':p['id'],'fields':[{'key':k,'label':l,'type':t} for k,l,t in p['fields']]},ensure_ascii=False)
    title=p['title']; helptext=p['help']
    return f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><style>*{{box-sizing:border-box}}body{{margin:0;background:#f5f7fa;color:#202632;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans JP",sans-serif}}header{{background:white;border-bottom:1px solid #e4e7ec;padding:22px}}.wrap{{max-width:1180px;margin:auto}}h1{{font-size:25px;margin:0 0 8px}}.lead{{color:#667085;line-height:1.7}}main{{padding:22px}}.card{{background:white;border:1px solid #e4e7ec;border-radius:14px;padding:16px;margin-bottom:14px}}.grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}}label{{font-size:13px;font-weight:700}}input,select,textarea{{width:100%;padding:9px;border:1px solid #d0d5dd;border-radius:8px;margin-top:5px;font:inherit}}textarea{{min-height:72px}}button,.file{{padding:9px 12px;border-radius:8px;border:1px solid #d0d5dd;background:white;font-weight:650;cursor:pointer}}button.primary{{background:#25385f;color:white}}.tools{{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}}table{{width:100%;border-collapse:collapse;min-width:900px}}th,td{{padding:9px;border-bottom:1px solid #eaecf0;font-size:13px;text-align:left;vertical-align:top}}.scroll{{overflow:auto}}@media(max-width:800px){{.grid{{grid-template-columns:1fr}}}}</style></head><body><header><div class="wrap"><h1>{title}</h1><div class="lead">{helptext}<br>入力データはこのブラウザ内に保存され、外部サーバーへ送信しません。</div></div></header><main class="wrap"><section class="card"><div id="form" class="grid"></div><div class="tools"><button class="primary" id="save">保存</button><button id="clear">入力クリア</button></div></section><section class="card"><input id="search" placeholder="一覧を検索"><div class="tools"><button id="csv">CSV出力</button><button id="backup">JSONバックアップ</button><label class="file">JSON復元<input id="restore" type="file" accept=".json" hidden></label><button onclick="window.print()">印刷</button></div><div class="scroll"><table><thead><tr id="head"></tr></thead><tbody id="body"></tbody></table></div></section></main><script>const C={cfg},K=C.id;let rows=JSON.parse(localStorage.getItem(K)||'[]'),editing=null;const e=s=>String(s??'').replace(/[&<>"']/g,m=>({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}}[m]));function ctl(f){{if(f.type.startsWith('select:')){{let o='<label>'+e(f.label)+'<select id="f_'+f.key+'"><option value="">選択</option>';for(const x of f.type.split(':')[1].split('|'))o+='<option>'+e(x)+'</option>';return o+'</select></label>'}}if(f.type==='textarea')return '<label>'+e(f.label)+'<textarea id="f_'+f.key+'"></textarea></label>';return '<label>'+e(f.label)+'<input id="f_'+f.key+'" type="'+f.type+'"></label>'}}document.getElementById('form').innerHTML=C.fields.map(ctl).join('');document.getElementById('head').innerHTML=C.fields.map(f=>'<th>'+e(f.label)+'</th>').join('')+'<th>操作</th>';function persist(){{localStorage.setItem(K,JSON.stringify(rows))}}function reset(){{editing=null;for(const f of C.fields)document.getElementById('f_'+f.key).value=''}}function render(){{const q=document.getElementById('search').value.toLowerCase();let list=rows.filter(r=>!q||JSON.stringify(r).toLowerCase().includes(q));document.getElementById('body').innerHTML=list.map(r=>'<tr>'+C.fields.map(f=>'<td>'+e(r[f.key])+'</td>').join('')+'<td><button data-e="'+r.id+'">編集</button> <button data-d="'+r.id+'">削除</button></td></tr>').join('')||'<tr><td colspan="'+(C.fields.length+1)+'">まだ記録がありません</td></tr>'}}document.getElementById('save').onclick=()=>{{let r={{id:editing||crypto.randomUUID(),updatedAt:new Date().toISOString()}};for(const f of C.fields)r[f.key]=document.getElementById('f_'+f.key).value.trim();if(!C.fields.some(f=>r[f.key]))return alert('少なくとも1項目を入力してください');let i=rows.findIndex(x=>x.id===r.id);if(i>=0)rows[i]=r;else rows.unshift(r);persist();reset();render()}};document.getElementById('clear').onclick=reset;document.getElementById('search').oninput=render;document.getElementById('body').onclick=x=>{{let id=x.target.dataset.e;if(id){{let r=rows.find(z=>z.id===id);editing=id;for(const f of C.fields)document.getElementById('f_'+f.key).value=r[f.key]||''}}id=x.target.dataset.d;if(id&&confirm('削除しますか？')){{rows=rows.filter(z=>z.id!==id);persist();render()}}}};function dl(data,name,type){{let u=URL.createObjectURL(new Blob([data],{{type}})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),500)}}document.getElementById('csv').onclick=()=>{{const q=v=>'"'+String(v??'').replaceAll('"','""')+'"';let s=C.fields.map(f=>q(f.label)).join(',')+'\\r\\n'+rows.map(r=>C.fields.map(f=>q(r[f.key])).join(',')).join('\\r\\n');dl('\\ufeff'+s,K+'.csv','text/csv')}};document.getElementById('backup').onclick=()=>dl(JSON.stringify({{app:K,rows}},null,2),K+'_backup.json','application/json');document.getElementById('restore').onchange=async x=>{{try{{let d=JSON.parse(await x.target.files[0].text());if(d.app!==K||!Array.isArray(d.rows))throw Error('このツールのバックアップではありません');rows=d.rows;persist();render()}}catch(err){{alert(err.message)}}x.target.value=''}};render();</script></body></html>'''

def desc(p):
    labels='、'.join(x[1] for x in p['fields'][:6])
    return f'''「{p['title'].split('｜')[0]}」は、{p['help']}\n\n【できること】\n・{labels}などを一覧管理\n・検索、編集、削除\n・CSV書き出し\n・JSONバックアップ／復元\n・ブラウザ内localStorageへ保存\n・印刷\n・外部通信なし／インストール不要\n\n【納品物】\nZIP内にHTML本体、README、クイックスタートを収録。HTMLをChrome / Edgeで開くだけで利用できます。\n\n【注意】\n本ツールは実務整理支援用です。法務・会計・安全・研究倫理等の専門判断は所属組織の規程や専門家確認と併用してください。'''

pub=serialization.load_pem_public_key((ROOT/'booth-autopublish'/'public'/'device_public_key.pem').read_bytes())
index_path=Q/'index.json'; existing=json.loads(index_path.read_text('utf-8')) if index_path.exists() else {'version':2,'entries':[]}
new_ids={p['id'] for p in PRODUCTS}; keep=[x for x in existing.get('entries',[]) if x.get('id') not in new_ids]; built=[]
for p in PRODUCTS:
    app=html_app(p); assert '<!doctype html>' in app.lower() and 'localStorage' in app and 'CSV' in app and p['title'] in app
    inner=io.BytesIO()
    with zipfile.ZipFile(inner,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        z.writestr('index.html',app); z.writestr('README.md',f"# {p['title'].split('｜')[0]}\n\nindex.html をChrome / Edgeで開いて使用します。データはブラウザ内に保存されます。定期的にJSONバックアップしてください。")
        z.writestr('QUICKSTART.md','まず現在進行中の1件だけ登録し、入力ルールを確認してから広げてください。')
    jpg=preview(p['title'],p['help'])
    meta={'schemaVersion':2,'id':p['id'],'title':p['title'],'name':p['title'],'description':desc(p),'price':p['price'],'priceJPY':p['price'],'tags':p['tags'],'category':'ソフトウェア・ハードウェア','digital':True,'productType':'download','productFiles':['product.zip'],'downloadFiles':['product.zip'],'files':['product.zip'],'previewImages':['preview01.jpg'],'coverImage':'preview01.jpg','coverImages':['preview01.jpg']}
    outer=io.BytesIO()
    with zipfile.ZipFile(outer,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        z.writestr('product.json',json.dumps(meta,ensure_ascii=False,separators=(',',':'))); z.writestr('product.zip',inner.getvalue()); z.writestr('preview01.jpg',jpg)
    raw=outer.getvalue()
    with zipfile.ZipFile(io.BytesIO(raw),'r') as z:
        assert {'product.json','product.zip','preview01.jpg'}<=set(z.namelist()); check=json.loads(z.read('product.json')); assert check['title']==p['title'] and check['price']==p['price']
    key=os.urandom(32); iv=os.urandom(12); sealed=AESGCM(key).encrypt(iv,raw,None); ct,tag=sealed[:-16],sealed[-16:]
    wrapped=pub.encrypt(key,asym_padding.OAEP(mgf=asym_padding.MGF1(algorithm=hashes.SHA256()),algorithm=hashes.SHA256(),label=None))
    env=json.dumps({'wrappedKey':base64.b64encode(wrapped).decode(),'iv':base64.b64encode(iv).decode(),'tag':base64.b64encode(tag).decode(),'ciphertext':base64.b64encode(ct).decode()},separators=(',',':'))
    rel=f"booth-autopublish/queue/{p['id']}.part01.txt"; (ROOT/rel).write_text(env,'utf-8'); sha=hashlib.sha256(env.encode()).hexdigest()
    built.append({'id':p['id'],'title':p['title'],'chunks':[rel],'sha256':sha,'createdAt':stamp,'enabled':True,'forceRetry':True,'forceRetryNonce':f"cloud-materialize-{p['id']}-{nonce}",'expectedPriceJPY':p['price'],'requireBuyerVisibleVerification':True,'requiredBuyerChecks':['buyerVisibleUrl','title','price','downloadableProductState','purchasePath'],'invalidateLocalSuccessWithoutVerifiedLedger':True,'payloadFormat':'zip:product.json','cloudQa':{'zipReadable':True,'productJson':True,'downloadFilePresent':True,'previewImagesPresent':True,'htmlCoreFunctions':['localStorage','search','CSV','JSON backup/import','print']}})
new_index={'version':2,'updatedAt':stamp,'retryGeneration':max(int(existing.get('retryGeneration',0))+1,32),'entries':keep+built}; index_path.write_text(json.dumps(new_index,ensure_ascii=False,indent=2),'utf-8')
(MON/'cloud_materialization_20260823_batch01.json').write_text(json.dumps({'version':1,'generatedAt':stamp,'generatedCount':len(built),'queueIds':[x['id'] for x in built],'qa':'all encrypted payload ZIPs reopened before encryption; product.json/product.zip/preview01.jpg present; SHA recorded in queue index','publicationStatus':'queued_not_counted_until_buyer_visible_strict_verification'},ensure_ascii=False,indent=2),'utf-8')
assert len(built)==5
print(json.dumps({'generated':5,'ids':[x['id'] for x in built]},ensure_ascii=False))
