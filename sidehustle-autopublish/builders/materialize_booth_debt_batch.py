from pathlib import Path
import base64, hashlib, io, json, os, zipfile
from datetime import datetime, timezone, timedelta
from PIL import Image, ImageDraw, ImageFont
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT = Path(__file__).resolve().parents[2]
Q = ROOT / 'booth-autopublish' / 'queue'
MON = ROOT / 'booth-autopublish' / 'monitor'
Q.mkdir(parents=True, exist_ok=True)
MON.mkdir(parents=True, exist_ok=True)
JST = timezone(timedelta(hours=9))
now = datetime.now(JST).replace(microsecond=0)
stamp = now.isoformat()
nonce_stamp = now.strftime('%Y%m%dT%H%M%S+0900')

PRODUCTS = [
    ('010_event_risk_register_os_20260822','イベントリスク登録簿OS｜発生確率×影響度×対策×担当を1画面管理｜オフラインHTML',1280,'risk',['イベント運営','リスク管理','安全管理','学生団体','オフラインHTML']),
    ('011_small_org_role_os_20260822','小規模チーム役割設計OS｜実行・最終判断・相談先・代替担当を整理｜オフラインHTML',1180,'roles',['役割分担','RACI','学生団体','NPO','チーム運営']),
    ('012_sponsor_deliverables_tracker_20260822','協賛対価・履行管理OS｜ロゴ掲載・SNS・報告書・送付物の未実施を防ぐ｜オフラインHTML',1380,'deliverables',['協賛','スポンサー','履行管理','イベント','営業']),
    ('013_research_interview_coding_os_20260822','卒論インタビュー分析OS｜発言・コード・テーマ・根拠引用を整理｜オフラインHTML',1480,'coding',['卒論','インタビュー','質的研究','コーディング','研究']),
    ('014_volunteer_shift_comms_os_20260822','ボランティア配置・連絡OS｜シフト・役割・集合・欠席連絡を一括管理｜オフラインHTML',1180,'volunteer',['ボランティア','シフト','イベント','連絡網','運営']),
    ('015_creator_profit_pricing_os_20260822','デジタル商品 利益・価格設計OS｜手数料・制作時間・CV仮説から価格比較｜オフラインHTML',1280,'pricing',['デジタル商品','価格設定','利益計算','副業','クリエイター']),
    ('016_event_sponsor_bundle_os_20260822','イベント協賛設計OS｜提案価値・社内説明材料・履行・フォローを一括管理｜オフラインHTML',1680,'sponsor',['協賛営業','スポンサー','イベント','提案書','CRM']),
    ('017_jobhunt_interview_bundle_os_20260822','就活面接改善OS｜STAR回答・深掘り・一貫性・振り返りを1画面管理｜オフラインHTML',1480,'interview',['就活','面接','STAR','ES','自己分析']),
    ('018_grant_application_tracker_os_20260822','助成金・補助金申請OS｜締切・必要書類・証憑・報告期限を一括管理｜オフラインHTML',1380,'grant',['助成金','補助金','申請管理','NPO','事業計画']),
    ('019_event_incident_log_os_20260822','イベント事故・ヒヤリハット記録OS｜発生状況・初動・再発防止を標準化｜オフラインHTML',1180,'incident',['イベント安全','ヒヤリハット','事故報告','安全管理','運営']),
    ('020_meeting_decision_action_os_20260822','会議決定・宿題管理OS｜決定事項・保留・担当・期限をその場で整理｜オフラインHTML',980,'meeting',['会議','議事録','タスク管理','学生団体','チーム']),
    ('021_small_npo_donor_crm_os_20260822','小規模NPO 支援者CRM OS｜寄付・協力履歴・お礼・次回接点を管理｜オフラインHTML',1380,'donor',['NPO','寄付','支援者','CRM','関係構築']),
    ('022_research_literature_matrix_os_20260822','先行研究比較マトリクスOS｜目的・方法・対象・結果・限界を横断比較｜オフラインHTML',1280,'literature',['卒論','先行研究','文献レビュー','研究','大学生']),
    ('023_campus_project_budget_os_20260822','学生プロジェクト予算OS｜予算・実績・協賛・補助・予備費を一括管理｜オフラインHTML',1280,'budget',['予算管理','学生団体','イベント','協賛','補助金']),
]

FIELDSETS = {
    'risk':[('risk','リスク内容','text'),('category','分類','select:安全|天候|交通|会場|人員|予算|広報|その他'),('prob','発生確率1-5','number'),('impact','影響度1-5','number'),('owner','担当','text'),('mitigation','予防・軽減策','text'),('deadline','対応期限','date'),('status','状態','select:未着手|対応中|監視中|完了')],
    'roles':[('task','業務','text'),('executor','実行者','text'),('decision','最終判断者','text'),('consult','相談先','text'),('backup','代替担当','text'),('frequency','頻度','select:都度|毎週|毎月|毎年|イベント時'),('done','完了条件','text')],
    'deliverables':[('sponsor','協賛先','text'),('deliverable','約束した対価','text'),('due','期限','date'),('owner','担当','text'),('evidence','証跡・確認先','text'),('status','状態','select:未着手|準備中|実施済み|確認待ち'),('note','備考','text')],
    'coding':[('case','対象ID','text'),('quote','発言要約・引用','text'),('code','初期コード','text'),('theme','テーマ','text'),('memo','解釈メモ','text'),('source','出典位置','text'),('confidence','確信度','select:低|中|高')],
    'volunteer':[('name','氏名・呼称','text'),('role','役割','text'),('start','開始','time'),('end','終了','time'),('meeting','集合場所','text'),('contact','連絡確認','select:未送信|送信済み|確認済み'),('attendance','参加状態','select:予定|遅刻連絡|欠席|参加済み')],
    'pricing':[('product','商品名','text'),('price','販売価格','number'),('fee','手数料率%','number'),('cost','1件あたり変動費','number'),('hours','制作時間h','number'),('target','目標販売数','number'),('note','仮説メモ','text')],
    'sponsor':[('company','企業名','text'),('objective','相手の目的','text'),('value','提案価値','text'),('decision','社内説明材料','text'),('next','次アクション','date'),('deliverable','主な対価','text'),('stage','段階','select:候補|接触|面談|提案|検討|合意|履行中|完了')],
    'interview':[('question','質問','text'),('situation','S 状況','text'),('task','T 課題','text'),('action','A 行動','text'),('result','R 結果','text'),('probe','想定深掘り','text'),('consistency','ESとの一貫性','select:要修正|確認済み')],
    'grant':[('program','制度名','text'),('deadline','申請締切','date'),('amount','申請額','number'),('docs','不足書類','text'),('owner','担当','text'),('report','実績報告期限','date'),('status','状態','select:候補|要件確認|準備中|申請済み|採択|不採択|報告済み')],
    'incident':[('date','日時','datetime-local'),('place','場所','text'),('event','事象','text'),('severity','重大度','select:ヒヤリ|軽微|要対応|重大'),('first','初動','text'),('cause','原因仮説','text'),('prevent','再発防止','text')],
    'meeting':[('topic','議題','text'),('type','分類','select:決定|保留|宿題|共有'),('decision','内容','text'),('owner','担当','text'),('due','期限','date'),('condition','完了条件','text'),('status','状態','select:未着手|進行中|完了')],
    'donor':[('name','支援者・団体','text'),('type','関係','select:寄付者|ボランティア|紹介者|協力団体|その他'),('last','最終接点','date'),('support','支援内容','text'),('thanks','お礼','select:未対応|対応済み'),('next','次回接点','date'),('memo','関心・メモ','text')],
    'literature':[('citation','文献','text'),('purpose','研究目的','text'),('method','方法','text'),('sample','対象','text'),('finding','主要結果','text'),('limit','限界','text'),('use','自分の研究での使い方','text')],
    'budget':[('item','費目','text'),('type','区分','select:支出|収入|協賛|補助金'),('budget','予算','number'),('actual','実績','number'),('owner','担当','text'),('due','支払・入金日','date'),('status','状態','select:予定|確定|支払済み|入金済み')],
}

HELPS = {
    'risk':'発生確率と影響度、予防策、担当、期限を同時に持ち、イベント前のリスク対応漏れを減らします。',
    'roles':'実行者だけでなく最終判断・相談・代替担当まで分け、代表者への集中と属人化を減らします。',
    'deliverables':'協賛契約後のロゴ掲載・SNS・報告書・送付物などの履行漏れを防ぎます。',
    'coding':'発言からコード、テーマ、解釈、出典位置までつなぎ、質的研究の分析過程を残します。',
    'volunteer':'シフトと連絡確認を同じ画面で持ち、配置済みなのに本人へ伝わっていない状態を減らします。',
    'pricing':'販売価格・手数料・変動費・制作時間・販売数仮説を並べ、粗利益の見通しを比較します。',
    'sponsor':'企業側の目的、提案価値、社内説明材料、次アクション、履行まで協賛営業を一続きで管理します。',
    'interview':'STAR回答、深掘り質問、ESとの一貫性、振り返りをまとめ、面接ごとの改善を残します。',
    'grant':'助成金・補助金の締切だけでなく必要書類、担当、採択後の実績報告まで追跡します。',
    'incident':'ヒヤリハットを含む事象、初動、原因仮説、再発防止を標準化して次回改善につなげます。',
    'meeting':'決定・保留・宿題を分け、担当・期限・完了条件まで会議中に確定しやすくします。',
    'donor':'寄付者・ボランティア・紹介者などの支援履歴、お礼、次回接点を継続管理します。',
    'literature':'先行研究を目的・方法・対象・結果・限界の同じ列で比較し、研究ギャップを見つけやすくします。',
    'budget':'予算と実績、協賛・補助金、支払・入金状態を同じ画面で追い、資金不足を早めに把握します。',
}


def js_fields(fields):
    out=[]
    for key,label,t in fields:
        if t.startswith('select:'):
            out.append({'key':key,'label':label,'type':'select','options':t.split(':',1)[1].split('|')})
        else:
            out.append({'key':key,'label':label,'type':t})
    return out


def build_html(pid,title,kind):
    short=title.split('｜')[0]
    cfg=json.dumps({'id':pid,'title':short,'kind':kind,'fields':js_fields(FIELDSETS[kind])},ensure_ascii=False)
    helptext=HELPS[kind]
    template='''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>__TITLE__</title><style>:root{--bg:#f6f7f9;--card:#fff;--ink:#202633;--muted:#667085;--line:#e4e7ec;--accent:#243b63}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans JP",sans-serif}header{background:#fff;border-bottom:1px solid var(--line);padding:22px}.wrap{max-width:1180px;margin:auto}h1{font-size:25px;margin:0 0 8px}.lead{color:var(--muted);line-height:1.7;margin:0}main{padding:22px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px}.metric,.card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px}.metric b{display:block;font-size:24px}.metric span{font-size:13px;color:var(--muted)}.card{margin-bottom:14px}.formgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}label{font-size:13px;font-weight:700}input,select,textarea{width:100%;margin-top:5px;border:1px solid #d0d5dd;border-radius:8px;padding:9px;font:inherit;background:#fff}textarea{min-height:68px}button,.filelabel{border:1px solid var(--line);background:#fff;padding:9px 12px;border-radius:9px;cursor:pointer;font-weight:650}button.primary{background:var(--accent);color:#fff;border-color:var(--accent)}.toolbar,.actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}input[type=file]{display:none}.tablewrap{overflow:auto}table{width:100%;border-collapse:collapse;min-width:880px}th,td{padding:9px;border-bottom:1px solid var(--line);text-align:left;font-size:13px;vertical-align:top}th{background:#fafafa}.empty{text-align:center;color:var(--muted);padding:28px}@media(max-width:800px){.grid{grid-template-columns:1fr 1fr}.formgrid{grid-template-columns:1fr}}@media print{.formcard,.toolbar,.actions,.rowactions{display:none!important}body{background:#fff}}</style></head><body><header><div class="wrap"><h1>__TITLE__</h1><p class="lead">__HELP__<br>データはこのブラウザ内だけに保存され、外部へ送信しません。</p></div></header><main class="wrap"><div class="grid"><div class="metric"><b id="count">0</b><span>登録件数</span></div><div class="metric"><b id="today">0</b><span>今日更新</span></div><div class="metric"><b id="backup">未</b><span>バックアップ</span></div></div><section class="card formcard"><h2>記録を追加・編集</h2><div id="form" class="formgrid"></div><div class="actions"><button id="save" class="primary">保存</button><button id="reset">入力クリア</button></div></section><section class="card"><input id="q" placeholder="一覧を検索"><div class="toolbar"><button id="csv">CSVを書き出す</button><button id="json">JSONバックアップ</button><label class="filelabel">JSONを復元<input id="importer" type="file" accept=".json,application/json"></label><button onclick="window.print()">印刷</button></div><div class="tablewrap"><table><thead><tr id="head"></tr></thead><tbody id="body"></tbody></table></div></section></main><script>const APP=__CFG__;let rows=JSON.parse(localStorage.getItem(APP.id)||'[]'),editing=null;const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));function control(f){if(f.type==='select'){let o='<label>'+esc(f.label)+'<select id="f_'+f.key+'"><option value="">選択</option>';for(const x of f.options)o+='<option>'+esc(x)+'</option>';return o+'</select></label>'}const area=['mitigation','memo','quote','decision','action','result','cause','prevent','note','value','finding','limit','use'].includes(f.key);return '<label>'+esc(f.label)+(area?'<textarea id="f_'+f.key+'"></textarea>':'<input id="f_'+f.key+'" type="'+f.type+'">')+'</label>'}document.getElementById('form').innerHTML=APP.fields.map(control).join('');document.getElementById('head').innerHTML=APP.fields.map(f=>'<th>'+esc(f.label)+'</th>').join('')+'<th>操作</th>';function persist(){localStorage.setItem(APP.id,JSON.stringify(rows))}function clearForm(){editing=null;APP.fields.forEach(f=>document.getElementById('f_'+f.key).value='');document.getElementById('save').textContent='保存'}function render(){const q=document.getElementById('q').value.trim().toLowerCase();const list=rows.filter(r=>!q||JSON.stringify(r).toLowerCase().includes(q));let out='';for(const r of list){out+='<tr>';for(const f of APP.fields)out+='<td>'+esc(r[f.key])+'</td>';out+='<td class="rowactions"><button data-edit="'+r.id+'">編集</button> <button data-del="'+r.id+'">削除</button></td></tr>'}document.getElementById('body').innerHTML=out||'<tr><td class="empty" colspan="'+(APP.fields.length+1)+'">まだ記録がありません</td></tr>';document.getElementById('count').textContent=rows.length;const t=new Date().toDateString();document.getElementById('today').textContent=rows.filter(r=>new Date(r.updatedAt).toDateString()===t).length;document.getElementById('backup').textContent=localStorage.getItem(APP.id+'_backup')?'済':'未'}function saveRow(){const r={id:editing||crypto.randomUUID(),updatedAt:new Date().toISOString()};APP.fields.forEach(f=>r[f.key]=document.getElementById('f_'+f.key).value.trim());if(!APP.fields.some(f=>r[f.key]))return alert('少なくとも1項目を入力してください');const i=rows.findIndex(x=>x.id===r.id);if(i>=0)rows[i]=r;else rows.unshift(r);persist();clearForm();render()}function download(data,name,type){const u=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),800)}function exportCsv(){const q=v=>'"'+String(v??'').replaceAll('"','""')+'"';const head=APP.fields.map(f=>q(f.label)).join(',');const body=rows.map(r=>APP.fields.map(f=>q(r[f.key])).join(',')).join('\r\n');download('\ufeff'+head+'\r\n'+body,APP.id+'.csv','text/csv;charset=utf-8')}function backup(){localStorage.setItem(APP.id+'_backup',new Date().toISOString());download(JSON.stringify({app:APP.id,version:1,rows},null,2),APP.id+'_backup.json','application/json');render()}document.getElementById('body').onclick=e=>{const a=e.target.dataset.edit,d=e.target.dataset.del;if(a){const r=rows.find(x=>x.id===a);editing=a;APP.fields.forEach(f=>document.getElementById('f_'+f.key).value=r[f.key]??'');document.getElementById('save').textContent='更新'}if(d&&confirm('削除しますか？')){rows=rows.filter(r=>r.id!==d);persist();render()}};document.getElementById('save').onclick=saveRow;document.getElementById('reset').onclick=clearForm;document.getElementById('csv').onclick=exportCsv;document.getElementById('json').onclick=backup;document.getElementById('q').oninput=render;document.getElementById('importer').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());if(d.app!==APP.id||!Array.isArray(d.rows))throw Error('このツールのバックアップではありません');rows=d.rows;persist();render()}catch(x){alert(x.message)}e.target.value=''};render();</script></body></html>'''
    return template.replace('__TITLE__',title).replace('__HELP__',helptext).replace('__CFG__',cfg)


def find_font(size,bold=False):
    candidates=[
        '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc' if bold else '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ]
    for p in candidates:
        if Path(p).exists(): return ImageFont.truetype(p,size)
    return ImageFont.load_default()


def draw_wrapped(draw,text,font,x,y,maxw,step,fill):
    cur=''; lines=[]
    for ch in text:
        if draw.textbbox((0,0),cur+ch,font=font)[2] <= maxw: cur += ch
        else:
            if cur: lines.append(cur)
            cur=ch
    if cur: lines.append(cur)
    for line in lines:
        draw.text((x,y),line,font=font,fill=fill); y += step
    return y


def preview(title,helptext):
    im=Image.new('RGB',(1200,675),(248,249,252)); d=ImageDraw.Draw(im); accent=(42,56,86)
    d.rectangle((0,0,1200,16),fill=accent); d.rounded_rectangle((70,70,1130,605),radius=28,fill=(255,255,255),outline=(225,228,234),width=2)
    fs=find_font(28,True); ft=find_font(44,True); fb=find_font(25,False)
    d.text((110,110),'OFFLINE HTML TOOL',font=fs,fill=accent)
    y=draw_wrapped(d,title.split('｜')[0],ft,110,165,900,56,(28,33,44)); y=max(y+24,330)
    for bullet in ['ブラウザだけで完結・外部送信なし','検索 / CSV出力 / JSONバックアップ',helptext]:
        d.ellipse((112,y+9,126,y+23),fill=accent); y=draw_wrapped(d,bullet,fb,145,y,850,34,(58,63,76))+8
    out=io.BytesIO(); im.save(out,'JPEG',quality=58,optimize=True,progressive=True); return out.getvalue()


def description(title,kind):
    labels='、'.join(x[1] for x in FIELDSETS[kind][:6])
    return f'''「{title.split('｜')[0]}」は、{HELPS[kind]}\n\n【できること】\n・{labels}などを一覧管理\n・検索、編集、削除\n・CSV書き出し\n・JSONバックアップ／復元\n・ブラウザ内localStorageへ自動保存\n・印刷\n・外部通信なし／インストール不要\n\n【納品物】\nZIP内にHTML本体、README、クイックスタートを収録。HTMLをダブルクリックするだけで利用できます。\n\n【注意】\n本ツールは実務整理支援用です。法務・会計・安全・研究倫理等の専門判断は所属組織の規程や専門家確認と併用してください。'''


pub=serialization.load_pem_public_key((ROOT/'booth-autopublish'/'public'/'device_public_key.pem').read_bytes())
index_path=Q/'index.json'
existing=json.loads(index_path.read_text('utf-8')) if index_path.exists() else {'version':2,'entries':[]}
new_ids={p[0] for p in PRODUCTS}
existing_entries=[e for e in existing.get('entries',[]) if e.get('id') not in new_ids]
built=[]
for pid,title,price,kind,tags in PRODUCTS:
    app=build_html(pid,title,kind)
    assert '<!doctype html>' in app.lower() and 'localStorage' in app and 'CSV' in app and title in app
    pzip=io.BytesIO()
    with zipfile.ZipFile(pzip,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        z.writestr('index.html',app)
        z.writestr('README.md',f'# {title.split("｜")[0]}\n\nindex.html をChrome / Edgeで開いて使用します。データはブラウザ内に保存されます。定期的にJSONバックアップを保存してください。')
        z.writestr('QUICKSTART.md','最初は現在進行中の1件だけを登録し、チーム内で入力ルールを確認してから広げてください。')
    jpg=preview(title,HELPS[kind])
    meta={
        'schemaVersion':2,'id':pid,'title':title,'name':title,'description':description(title,kind),
        'price':price,'priceJPY':price,'tags':tags,'category':'ソフトウェア・ハードウェア','digital':True,'productType':'download',
        'productFiles':['product.zip'],'downloadFiles':['product.zip'],'files':['product.zip'],
        'previewImages':['preview01.jpg'],'coverImage':'preview01.jpg','coverImages':['preview01.jpg']
    }
    payload=io.BytesIO()
    with zipfile.ZipFile(payload,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        z.writestr('product.json',json.dumps(meta,ensure_ascii=False,separators=(',',':')))
        z.writestr('product.zip',pzip.getvalue())
        z.writestr('preview01.jpg',jpg)
    raw=payload.getvalue()
    with zipfile.ZipFile(io.BytesIO(raw),'r') as z:
        names=set(z.namelist()); assert {'product.json','product.zip','preview01.jpg'} <= names
        check=json.loads(z.read('product.json')); assert check['title']==title and check['price']==price and check['previewImages']
    key=os.urandom(32); iv=os.urandom(12); sealed=AESGCM(key).encrypt(iv,raw,None); ct,tag=sealed[:-16],sealed[-16:]
    wrapped=pub.encrypt(key,asym_padding.OAEP(mgf=asym_padding.MGF1(algorithm=hashes.SHA256()),algorithm=hashes.SHA256(),label=None))
    envelope=json.dumps({'wrappedKey':base64.b64encode(wrapped).decode(),'iv':base64.b64encode(iv).decode(),'tag':base64.b64encode(tag).decode(),'ciphertext':base64.b64encode(ct).decode()},separators=(',',':'))
    qrel=f'booth-autopublish/queue/{pid}.part01.txt'; (ROOT/qrel).write_text(envelope,'utf-8'); sha=hashlib.sha256(envelope.encode()).hexdigest()
    built.append({
        'id':pid,'title':title,'chunks':[qrel],'sha256':sha,'createdAt':stamp,'enabled':True,'forceRetry':True,
        'forceRetryNonce':f'cloud-materialize-{pid}-{nonce_stamp}','expectedPriceJPY':price,'requireBuyerVisibleVerification':True,
        'requiredBuyerChecks':['buyerVisibleUrl','title','price','downloadableProductState','purchasePath'],
        'invalidateLocalSuccessWithoutVerifiedLedger':True,'payloadFormat':'zip:product.json',
        'cloudQa':{'zipReadable':True,'productJson':True,'downloadFilePresent':True,'previewImagesPresent':True,'htmlCoreFunctions':['localStorage','search','CSV','JSON backup/import','print']}
    })

new_index={'version':2,'updatedAt':stamp,'retryGeneration':max(int(existing.get('retryGeneration',0))+1,29),'entries':existing_entries+built}
index_path.write_text(json.dumps(new_index,ensure_ascii=False,indent=2),'utf-8')
(MON/'cloud_materialization_20260822.json').write_text(json.dumps({
    'version':1,'generatedAt':stamp,'generatedCount':len(built),'queueIds':[x['id'] for x in built],
    'qa':'all encrypted payload ZIPs reopened before encryption; product.json/product.zip/preview01.jpg present; SHA recorded in queue index',
    'publicationStatus':'queued_not_counted_until_buyer_visible_strict_verification'
},ensure_ascii=False,indent=2),'utf-8')
assert len(built)==14
print(json.dumps({'generated':len(built),'index':str(index_path),'first':built[0]['id'],'last':built[-1]['id']},ensure_ascii=False))
