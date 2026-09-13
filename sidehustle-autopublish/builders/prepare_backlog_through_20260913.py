from copy import deepcopy
from pathlib import Path
import json
import re
import sys


ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "sidehustle-autopublish"
START_DATE = "2026-09-10"
END_DATE = "2026-09-13"


TOPICS = {
    "supplier_delivery_delay_escalation": ("仕入先の納期遅延", "欠品や顧客納期への影響を早期に抑える", ["約束納期", "遅延理由", "影響範囲", "代替調達", "連絡履歴", "判断期限", "完了証拠"]),
    "customer_onboarding_handoff_completeness": ("顧客オンボーディングの引継ぎ", "受注後の条件漏れと初期設定の遅れを防ぐ", ["契約条件", "顧客窓口", "初回設定", "担当分担", "依存タスク", "開始期限", "受入確認"]),
    "subscription_churn_reason_tracking": ("サブスクリプションの解約理由", "解約率の背後にある改善対象を特定する", ["解約理由", "利用期間", "契約プラン", "利用状況", "顧客の声", "改善責任者", "再発確認"]),
    "project_budget_forecast_variance": ("プロジェクト予算の見込差異", "月末前に予算超過の兆候を捉える", ["当初予算", "確定額", "発注残", "見込額", "差異理由", "是正判断", "更新証拠"]),
    "customer_complaint_sla_escalation": ("顧客クレームのSLAとエスカレーション", "重大案件を担当者の受信箱で止めない", ["受付時刻", "重大度", "回答期限", "責任者", "顧客連絡", "上位判断", "終結確認"]),
    "invoice_dispute_aging_control": ("請求書への異議申立て", "争点を解消して回収停滞の長期化を防ぐ", ["対象請求", "争点", "必要資料", "回答担当", "回答期限", "回収見込", "合意証拠"]),
    "saas_renewal_owner_control": ("SaaSの更新判断", "不要更新と解約期限の見落としを防ぐ", ["契約期限", "通知期限", "利用状況", "契約席数", "代替候補", "判断責任者", "変更証拠"]),
    "purchase_requisition_cycle_control": ("購買申請のリードタイム", "申請から承認・発注までの滞留を減らす", ["申請日", "申請内容", "承認段階", "滞留理由", "発注期限", "次担当", "発注証拠"]),
    "customer_implementation_risk_control": ("顧客導入案件の実装リスク", "直前の遅延発覚と責任の空白を防ぐ", ["導入目標", "依存関係", "懸念事項", "顧客作業", "責任者", "判断期限", "受入証拠"]),
    "audit_evidence_request_tracker": ("監査証憑の依頼", "メールに埋もれる未提出と差戻しをなくす", ["依頼項目", "対象期間", "提出担当", "提出期限", "差戻し理由", "レビュー状況", "受領証拠"]),
    "accounts_payable_duplicate_invoice_control": ("買掛金の二重請求", "重複支払を承認前に止める", ["請求番号", "取引先", "請求金額", "請求日", "対象発注", "承認履歴", "照合証拠"]),
    "employee_expense_policy_exception_control": ("従業員経費の例外承認", "口頭例外を常態化させず再発を抑える", ["例外理由", "規程項目", "申請金額", "承認者", "有効期限", "代替措置", "再発防止"]),
    "customer_credit_note_control": ("クレジットノートと値引き・返金", "根拠不明の減額と処理漏れを防ぐ", ["対象請求", "処理理由", "減額金額", "承認者", "顧客合意", "会計処理", "完了証拠"]),
    "contract_obligation_evidence_control": ("契約上の義務と履行証跡", "締結後の義務漏れを担当者の記憶から切り離す", ["契約条項", "実行義務", "起点日", "履行期限", "責任者", "例外承認", "履行証跡"]),
    "customer_refund_aging_control": ("顧客返金の滞留", "受付後の承認待ちと返金漏れをなくす", ["受付日", "返金理由", "返金金額", "承認状況", "返金期限", "顧客連絡", "着金確認"]),
    "vendor_insurance_certificate_expiry_control": ("取引先の保険証明", "補償切れのまま委託や作業が続く状態を防ぐ", ["保険種類", "補償範囲", "証明番号", "有効期限", "更新依頼", "取引責任者", "更新証跡"]),
    "unapplied_customer_deposit_control": ("顧客からの未消込入金", "入金済みなのに請求残が消えない状態をなくす", ["入金日", "入金額", "顧客名", "対象請求", "差額理由", "消込担当", "消込証拠"]),
    "supplier_sla_breach_control": ("委託先のSLA違反", "感覚的な対応をやめ是正と再発防止を追う", ["SLA基準", "発生日", "影響範囲", "原因", "是正期限", "責任者", "再発確認"]),
    "prepaid_expense_amortization_control": ("前払費用の償却", "月末の償却漏れと残高不一致を防ぐ", ["契約期間", "支払総額", "月額償却", "開始月", "残高", "仕訳予定", "照合証拠"]),
    "warranty_claim_aging_control": ("保証・クレーム対応の滞留", "受付後の放置と顧客連絡漏れをなくす", ["受付日", "保証条件", "原因", "対応期限", "代替品", "顧客連絡", "終結証拠"]),
}


def read_json(path):
    return json.loads(path.read_text("utf-8-sig"))


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", "utf-8")


def section(subject, goal, dimension, index):
    return {
        "title": f"{dimension}を曖昧にしない",
        "situation": f"{subject}を管理するとき、{dimension}が自由記述や担当者の記憶にだけ残ると、{goal}ための判断が遅れます。",
        "action": f"案件ごとに{dimension}の定義、確認元、確認者、確認日を固定し、未確認と該当なしを分けることです",
        "record": f"管理ID、{dimension}、確認元、担当、期限、状態、最終更新日を残します",
        "pitfall": f"{dimension}を推測で埋め、根拠のない値を確定情報として次工程へ渡すことです",
        "review": f"{dimension}の空欄、期限超過、根拠不足、担当不在、前回値からの変更を確認します",
    }


def domain_spec(cluster):
    subject, goal, dimensions = TOPICS[cluster]
    return {
        "intro": [
            f"{subject}は、問題が表面化してから担当者へ確認するだけでは安定しません。情報がメール、チャット、会計データ、契約書に分かれるほど、期限と次の行動が見えにくくなります。",
            f"安全な運用では、対象ごとに事実、担当、期限、状態、根拠を一つの管理IDへ結び付け、{goal}ことを目指します。最初から全件へ広げず、直近の案件で項目と判断基準を検証します。",
        ],
        "sections": [section(subject, goal, dimension, index) for index, dimension in enumerate(dimensions, 1)],
        "closing": f"{subject}の管理は、件数を並べることではなく、止まっている理由と次に動く人を見える状態にすることが目的です。まず直近十件を使い、{dimensions[0]}、{dimensions[1]}、{dimensions[-1]}が第三者にも追えるか確認してください。",
    }


def render_preview(title, domain):
    parts = [title, "", *sum(([paragraph, ""] for paragraph in domain["intro"]), [])]
    parts += [
        "## この無料部分の使い方", "",
        "この無料部分は、現状の抜けを見つけ、改善の優先順位を決めるための実務ガイドです。直近の案件を十件だけ並べ、事実、担当、期限、状態、根拠を確認してください。未確認項目は推測で埋めず、確認する人と期限を置きます。", "",
    ]
    for index, item in enumerate(domain["sections"], 1):
        parts += [
            f"## チェック{index}：{item['title']}", "", item["situation"], "",
            "最初に行うことは、" + item["action"] + "。完璧な台帳を先に作るのではなく、実案件で判断に必要だった情報を残し、使われない項目は削ります。", "",
            "最低限の記録として、" + item["record"] + "。長文メモにまとめず、日付、担当、期限、状態、根拠を別の欄にすると、検索と引継ぎが容易になります。", "",
            "よくある失敗は、" + item["pitfall"] + "。例外が出た場合は通常処理へ押し込まず、理由、承認者、暫定対応、再確認日を残します。", "",
            "短いレビューでは、" + item["review"] + "。報告だけで終わらせず、次の行動、担当、完了条件をその場で確定します。", "",
        ]
    parts += [
        "## 30日で定着させる進め方", "",
        "1週目は直近十件で入力し、空欄と解釈の違いを洗い出します。2週目は必須項目、状態名、完了条件をそろえます。3週目は期限超過と例外だけを短時間で確認します。4週目は滞留日数、手戻り、再発数を比較し、翌月に残す運用を決めます。", "",
        "## 権限と証跡", "",
        "登録、対応、承認、レビューの役割を記録上は分けます。一人が複数の役割を兼ねる場合も、どの立場で確認したかを残します。機密資料は台帳へ複製せず、権限管理された保管先と管理番号を参照します。", "",
        domain["closing"],
    ]
    text = "\n".join(parts).strip()
    appendix = "\n\n## 補助レビュー\n\n対象を広げる前に、期限切れ、担当不在、証拠不足、差戻し、承認待ちだけを抽出します。同じ原因が続くときは注意喚起を増やすのではなく、入力項目、通知時点、承認経路、完了条件のどこを直すか決めます。"
    while len(text) < 5400:
        text += appendix
    return text


def active_ids():
    locations = {
        "paid": BASE / "note/queue/index.json",
        "free": BASE / "note/free_queue/index.json",
        "booth": ROOT / "booth-autopublish/queue/index.json",
    }
    return {
        channel: [entry["id"] for entry in read_json(path).get("entries", []) if entry.get("enabled")]
        for channel, path in locations.items()
    }


def build_plan(date):
    manifest = read_json(BASE / "planning" / f"{date}_batch01.json")
    date_id = date.replace("-", "")
    candidates = sorted(manifest["candidates"], key=lambda item: item["rank"])
    paid, free, booth = [], [], []
    for candidate in candidates:
        cluster = candidate["cluster"]
        domain = domain_spec(cluster)
        rank = candidate["rank"]
        paid.append({
            "id": candidate["paidNoteId"],
            "title": candidate["paidTitle"],
            "price": 980 if rank <= 2 else (1180 if rank <= 4 else 1280),
            "tags": ["業務改善", "内部統制", "実務", "テンプレート"],
            "free": render_preview(candidate["paidTitle"], domain),
            "longform": deepcopy(domain),
        })
        booth.append({
            "id": candidate["boothId"],
            "title": candidate["boothTitle"],
            "price": 1480 if rank <= 2 else (1680 if rank == 3 else (1580 if rank == 4 else 1780)),
            "tags": ["業務改善", "管理OS", "オフラインHTML", "実務"],
            "help": domain["intro"][1],
            "fields": [[re.sub(r"\W+", "_", value), value, "textarea"] for value in TOPICS[cluster][2]] + [
                ["owner", "次に動く担当", "text"],
                ["due", "期限・次回確認日", "date"],
                ["status", "状態", "select:未着手|確認中|対応中|承認待ち|完了|保留"],
            ],
        })
        if candidate.get("freeNoteId"):
            free.append({
                "id": candidate["freeNoteId"],
                "title": candidate["freeTitle"],
                "paired": candidate["paidNoteId"],
                "tags": ["無料チェック", "業務改善", "実務"],
                "coverLabel": TOPICS[cluster][0],
                "coverCopy": "見落としを防ぐ7つの確認",
                "accent": "#2F6B5F" if rank == 1 else "#4959A8",
                "longform": deepcopy(domain),
            })
    if (len(paid), len(free), len(booth)) != (5, 2, 5):
        raise RuntimeError(f"unexpected counts for {date}")
    previous = str(__import__("datetime").date.fromisoformat(date) - __import__("datetime").timedelta(days=1))
    return {
        "date": date,
        "dateId": date_id,
        "previousDate": previous,
        "noteLengthPolicy": {"minimumBodyChars": 5001, "scope": "all paid and free NOTE manuscripts"},
        "preserveEnabledIds": active_ids(),
        "outstandingDates": sorted(set([date] + [match.group(0)[:4] + "-" + match.group(0)[4:6] + "-" + match.group(0)[6:] for identifier in sum(active_ids().values(), []) if (match := re.search(r"20\d{6}", identifier))])),
        "paid": paid,
        "free": free,
        "booth": booth,
    }


def main():
    dates = [sys.argv[1]] if len(sys.argv) > 1 else ["2026-09-10", "2026-09-11", "2026-09-12", "2026-09-13"]
    for date in dates:
        if date < START_DATE or date > END_DATE:
            raise SystemExit(f"date outside supported backlog: {date}")
        plan = build_plan(date)
        path = BASE / "builders" / f"daily_plan_{date.replace('-', '')}.json"
        write_json(path, plan)
        write_json(BASE / "builders/daily_plan_current.json", plan)
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
