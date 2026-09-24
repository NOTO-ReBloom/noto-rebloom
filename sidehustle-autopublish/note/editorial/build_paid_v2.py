"""Draft topic-specific paid workbooks; never publish without editorial review."""
from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path
from paid_v2_seeds import SEEDS

HERE=Path(__file__).parent
spec=importlib.util.spec_from_file_location('legacy_topics',HERE/'build_24.py')
legacy=importlib.util.module_from_spec(spec)
spec.loader.exec_module(legacy)

def free_preview(topic, tips, seed):
    slug,title,subject,problem,outcome,fields_str=topic
    fields=fields_str.split(',')
    scene=seed['scene'];values=seed['values'];decision=seed['decision'];metric=seed['measure']
    paragraphs=[
      f'{scene}\n\nこの記事のテーマは「{title}」。{problem}という状態を、担当者一人の注意不足として終えず、どの段階で情報や判断が止まったかを追う。以下は実在の団体を描いたものではなく、現場の確認方法を説明するための架空のケースである。金額、期限、権限は自分の業務に合わせ、法令や契約など個別の条件がある場合は必ずそれを優先してほしい。',
      f'## この案件でまず決めること\n\n{decision} そのために、口頭の印象から結論を作る前に、七つの観点を同じ案件に結びつける。例の記録では「{values[0]}」という入口があり、最後は「{values[-1]}」という次の接点まで見ている。入口の数だけ数えて終わると、途中で止まった案件を成功として扱いやすい。',
    ]
    modes=[
      'まず何を一件として数えるかを揃える。似た連絡が二回届いた場合、二件の依頼なのか同一案件の追記なのかを決める。重複の有無が不明なら元の記録へ戻り、確定したときに理由を記す。',
      '数字を比較するときは分母と時点を合わせる。集計日が違えば同じ項目名でも意味が変わる。少ない件数の割合だけで良し悪しを断言せず、対象を一件ずつ確認する。',
      '証拠が見つからないときは、空欄を「該当なし」に変えて見かけを整えない。何が未確認なのか、誰のどの資料で確認できるのかを先に特定する。',
      '例外が起きた場合は、元の予定、変わった理由、新しい条件を並べる。例外だけが別の連絡経路に残ると、引き継ぐ人が古い前提で行動してしまう。',
      '実際に伝えた内容と、相手が承認した内容は分ける。返信を受け取っただけで同意が得られたと読まず、何に答えてもらったのかを確認する。',
      '担当と判断者が違うなら、手を動かす人の名前だけでは足りない。判断者が不在のときに何を止めるかと、誰へ戻すかを決める。',
      '最後の欄が埋まっていても、その結果が関係者に届かなければ完了とはいえない。次の連絡と確認の証拠までを一つの案件に残す。',
    ]
    for n,(field,tip,value) in enumerate(zip(fields,tips,values)):
        previous=fields[n-1] if n else '案件の発端'
        following=fields[(n+1)%7]
        paragraphs.append(
          f'## {n+1}. {field}を手がかりにする\n\n'
          f'この欄の例は「{value}」。実際の一覧に書くときは、記録した日と確認できた事実を一緒に置く。特に「{tip}」という観点を外すと、担当が変わったときに同じ言葉を別の意味で使いかねない。{field}を確認した資料が見つからない場合、確定値のように広めず、確認先と予定日を残す。\n\n'
          f'{modes[n]} この例では「{previous}」と「{field}」を比べ、前の段階で約束したことが現在も成り立つかを問う。別の案件から値だけコピーすれば楽に見えるが、今回の相手と期限に合うかは改めて確かめる必要がある。\n\n'
          f'ここで見るべき問いは、{field}が変わると「{following}」へどんな影響が出るかである。影響がなければ確認した理由を短く記す。影響があれば、次に動く担当、伝える相手、いつまでに判断するかを決める。例では{value}と記録しているが、その一文だけで決められないことが残れば未確定の欄を作る。'
        )
    paragraphs.extend([
      '## 架空の記録を一枚にする\n\n'+'\n'.join(['| 確認項目 | 現時点の記録 | 次に見るところ |','| --- | --- | --- |']+[f'| {f} | {v} | {t} |' for f,v,t in zip(fields,values,tips)]),
      f'## 確認した結果をどう読むか\n\nこの表で七欄すべてに文章があっても、実際の判断が前へ進むとは限らない。{decision} まず、確認済みの事実と本人・相手への確認待ちを色や状態名で分ける。見込みを確定事項と同じ列で足す場合には、誰がどの段階で確認した値なのかが消えてしまう。\n\n{metric}。結果が変わったら、対象期間や受入条件も一緒に見て、特定の担当者の努力だけへ理由を求めない。件数が少ないときは一件の違いが割合を大きく動かす。そこで数字を意思決定の入口に使い、実際に止まった案件へ戻る。',
      f'## 今日試せる点検\n\n直近の一件を選び、入口の「{fields[0]}」から終点の「{fields[-1]}」まで順に資料を探す。途中で止まれば、止まった欄の責任者と確認日を決める。別の担当にこの一件を渡し、口頭の補足なしで同じ次の行動を選べるか試す。もし「{tips[3]}」のような注意点が会話だけに残っているなら、短い一行を一覧に戻す。完了の判定を早めることより、未確定を見つけられる状態にすることが先だ。'
    ])
    text='\n\n'.join(paragraphs)
    return text

def paid_workbook(topic,tips,seed):
    slug,title,subject,problem,outcome,fields_str=topic
    fields=fields_str.split(',');values=seed['values'];scene=seed['scene'];decision=seed['decision'];metric=seed['measure'];reply=seed['reply']
    p=[
      f'{subject}で使う実務台帳と、架空の一件を追う記入例をまとめた。{scene}\n\nここからは読んで終わる説明ではなく、受け付けた日から完了の確認までを同じ番号で追うための道具である。実例ではないので、人名、金額、期日、手続の権限は必ず自分の環境へ置き換える。特に契約、助成、会計、現場安全など外部の条件に従う事項は、この記事だけで判断しない。',
      f'## 台帳の作り方\n\n新しい表の一行目に「案件ID／受付日／{ "／".join(fields) }／主担当／判断担当／次の行動／次の確認日／状態／根拠の場所」を置く。全件を一度に移さず、最近の三件だけを試す。案件IDは担当者の名前ではなく、後から検索できる番号にする。状態名は「受付」「確認待ち」「作業中」「判断待ち」「完了」を区別し、保留には必ず次の確認日を付ける。',
      '## 記入済みの一行\n\n'+'\n'.join(['| 欄 | 架空の記入値 | 証拠または確認先 |','| --- | --- | --- |']+[f'| {f} | {v} | {t} |' for f,v,t in zip(fields,values,tips)])+'\n\nこの表の値は発行済みの書類や実在の取引を意味しない。自分の案件で一つでも確認できない場合は推測で埋めず、担当と確認期限を別の欄へ置く。',
    ]
    operations=[
      '入口を作る段階では、同じ内容の連絡が別経路から来ていないかを見て、重複なら元の案件に追記する。あとで受付数を比べるときに二重計上しないためだ。',
      'ここでは日付と対象範囲を確かめる。前回の数字をコピーすると短時間で埋まるが、今回の実測値と異なれば後続の判断が誤る。',
      '根拠の取り違えを避ける。資料のタイトルだけでなく版と確認した場所を控え、元の記録へ戻れるようにする。',
      '条件が変わる場面では、元の約束を消して上書きしない。変更前、変更後、判断した人をひとまとめに残す。',
      '他の人へ知らせる段階では、共有したことと相手が了承したことを別に記す。返信がなければ見込みのままにする。',
      '権限を確かめる段階では、作業者が自分で決めてよい事項と、判断担当へ戻す事項を分ける。代替者を立てるなら権限も確かめる。',
      '最後に作業結果を依頼元が確かめられる形にする。ファイルを送っただけの状態と、確認を受けた状態を区別して閉じる。',
    ]
    for n,(field,value,tip) in enumerate(zip(fields,values,tips)):
        next_field=fields[n+1] if n<6 else '完了通知'
        p.append(
          f'## 手順{n+1}：{field}\n\n'
          f'入力例は「{value}」。この値は担当者が最初に見た資料から転記し、再確認した人と時刻を別に残す。数字なら単位、期間、対象の範囲を、文章なら誰の意向かを曖昧にしない。とくに「{tip}」を満たしているかを検査する。満たしていないものは、無理に空欄を消さず、確認待ちに移す。\n\n'
          f'{operations[n]} 例えばこの案件で{field}が予定と変わったら、何が新しい情報で、元の記録とどの点が違うかを一文で書く。影響を受ける「{next_field}」を確認する人へ渡し、いつまでに結果を返してもらうかを決める。確認元が返事をしないときは、連絡済みと確定済みを同じ状態名にしない。\n\n'
          f'レビュー時の質問は「{field}の値を別の担当が同じ資料で確かめられるか」である。「{value}」といった記入例そのものを覚えるのではなく、値に至る手順を残す。判断を急ぐ場合でも、根拠がないことが結果へどう響くかを説明した上で、責任者へ選択肢を渡す。担当が替わった後に一から聞き直す部分があれば、表の参照先を直す。'
        )
    p.extend([
      f'## 例外を通す前の分岐\n\n{decision} 具体的には、①予定どおり進められる範囲、②確認を待つ必要のある範囲、③判断者の承認が必要な範囲へ分ける。三つを混ぜて「進行中」と書くと、催促先も停止条件も分からない。確認事項ごとに窓口と期限を置き、相手の返事が来たら記録を更新する。\n\n仮の値を使うなら、その仮定を見える位置に書き、確定前に公開や支払など戻しにくい行動をしない。元の値も消さず、変更の理由を残す。変更したときに他の依頼や後工程が遅れるなら、影響を受ける人へ早めに共有する。',
      f'## コピーして使う確認文\n\n「{reply}」\n\nこの文をそのまま全案件へ送らず、実際の日時、返信先、約束できる範囲に合わせる。相手へ判断を依頼する場合は、何を、いつまでに、どの資料を見て答えてほしいかを加える。複数人が返答できる案件なら、誰の回答で確定となるかも聞く。答えが来ないときに次の連絡をする日を台帳へ残す。',
      f'## 一週間後の検証\n\n{metric}。改善した数だけで成功とせず、対象から漏れた案件や後から差戻された件数も見る。一件を選んで、{fields[0]}から{fields[-1]}まで第三者が記録を追えるか試す。迷った欄を具体的に直し、使われない列は減らす。台帳は項目を増やすためのものではなく、次の行動を迷わず決めるためのものだ。'
    ])
    return '\n\n'.join(p)

def main():
    target=HERE/'v2_review'
    target.mkdir(exist_ok=True)
    report=[]
    for i,(topic,tips,seed) in enumerate(zip(legacy.TOPICS,legacy.GUIDANCE,SEEDS),127):
        free=free_preview(topic,tips,seed)
        paid=paid_workbook(topic,tips,seed)
        path=target/f'{i}_{topic[0]}.json'
        path.write_text(json.dumps({'title':topic[1],'freeBody':free,'paidBody':paid,'priceJPY':300,'tags':['業務改善','仕事の仕組み','実務テンプレート']},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        report.append({'id':i,'title':topic[1],'freeChars':len(free),'paidChars':len(paid),'file':path.name})
    (target/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'count':len(report),'minFree':min(x['freeChars'] for x in report),'minPaid':min(x['paidChars'] for x in report),'short':[x for x in report if min(x['freeChars'],x['paidChars'])<5001]},ensure_ascii=False))

if __name__=='__main__':main()
