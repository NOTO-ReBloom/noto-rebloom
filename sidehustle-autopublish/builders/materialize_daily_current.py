from pathlib import Path
from copy import deepcopy
import json
import sys

NOTE_MIN_BODY_CHARS = 5001


def render_longform(spec):
    """Render a topic-specific long-form manuscript from an auditable section spec."""
    intro = "\n\n".join(spec["intro"])
    rendered = [intro]
    for number, section in enumerate(spec["sections"], 1):
        rendered.extend([
            f"## {number}. {section['title']}",
            section["situation"],
            "実務で最初に行うことは、" + section["action"] + "。この作業は担当者の頭の中だけで完結させず、次に見る人が同じ判断を再現できる粒度まで分けます。一度に完璧な仕組みを作る必要はありませんが、誰が、いつ、何を確認し、どの状態になれば次へ進めるかは曖昧にしません。",
            "記録には、" + section["record"] + "。文章だけの長いメモでは検索と比較が難しくなるため、日付、担当、状態、期限、根拠を別項目にします。元資料に機密情報が含まれる場合は内容を複製せず、権限管理された保管先と管理番号だけをひも付けます。",
            "注意したいのは、" + section["pitfall"] + "。例外が起きたときに通常ルールを無理に当てはめると、数字だけ整って実態が見えなくなります。例外理由、承認者、暫定対応、再確認日を残し、放置と承認済み例外を区別できる状態にします。",
            "確認の場では、" + section["review"] + "。件数の報告だけで終わらせず、止まっている理由、次に動く人、期限を越えた場合の影響まで見ます。同じ原因が続くなら個別の催促を増やすのではなく、入力項目、承認経路、通知時点、完了条件のどこを直すか決めます。",
        ])
    rendered.extend([
        "## 導入時の30日プラン",
        "最初の1週間は対象を広げず、直近の案件を10件だけ登録します。空欄が多い項目、担当者ごとに解釈が違う状態名、確認に時間がかかる証拠を洗い出します。2週目は必須項目と完了条件をそろえ、期限超過と例外だけを短時間で確認します。3週目は一度も使われなかった項目を削り、逆に判断に足りなかった項目を追加します。4週目に件数、滞留日数、手戻り、再発数を比較し、翌月に残す運用を決めます。導入の成果は台帳を埋めた量ではなく、確認漏れと判断待ちが減ったかで評価します。",
        "## 最後に",
        spec["closing"],
    ])
    return "\n\n".join(rendered).strip()


def expand_and_validate_plan(source):
    plan = deepcopy(source)
    failures = []
    for item in plan.get("paid", []):
        if "longform" in item:
            item["paid"] = render_longform(item.pop("longform"))
        length = len(item.get("paid", ""))
        if length < NOTE_MIN_BODY_CHARS:
            failures.append(f"{item.get('id')}:paidBody={length}")
    for item in plan.get("free", []):
        if "longform" in item:
            item["body"] = render_longform(item.pop("longform"))
        length = len(item.get("body", ""))
        if length < NOTE_MIN_BODY_CHARS:
            failures.append(f"{item.get('id')}:freeBody={length}")
    if failures:
        raise ValueError("NOTE_LONGFORM_GATE_FAILED minimum=5001 " + ", ".join(failures))
    return plan

base = Path(__file__).parent
plan_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else base / "daily_plan_current.json"
if not plan_path.exists():
    raise FileNotFoundError(f"missing canonical current plan: {plan_path}")

plan = json.loads(plan_path.read_text("utf-8"))
plan_date = plan.get("date")
if not plan_date:
    raise ValueError("daily_plan_current.json must contain date")
expanded_plan = expand_and_validate_plan(plan)

# Legacy builder parts are retained only as the implementation body. Runtime date and
# plan selection come from daily_plan_current.json; never pin a historical daily plan.
parts = [base / f"_daily_20260825_part{i}.txt" for i in range(1, 5)]
missing = [str(p) for p in parts if not p.exists()]
if missing:
    raise FileNotFoundError(f"missing legacy builder parts: {missing}")
code = "".join(p.read_text("utf-8") for p in parts)
code = code.replace("requiredRe\naderChecks", "requiredReaderChecks")
code = code.replace("ensure_\nascii", "ensure_ascii")
code = code.replace("daily_plan_20260825.json", plan_path.name)
code = code.replace('"previousDate":"2026-08-24"', '"previousDate":PLAN.get("previousDate")')
code = code.replace('DATE=PLAN["date"]', 'PLAN=expand_and_validate_plan(PLAN)\nDATE=PLAN["date"]')
code = code.replace("paidBodiesOver900", "paidBodiesOver5000")
code = code.replace("allPaidBodiesOver900Chars", "allPaidBodiesOver5000Chars")
code = code.replace('>900', '>=NOTE_MIN_BODY_CHARS')
compile(code, str(__file__) + "::assembled-current", "exec")
exec(code, globals(), globals())


def write_current_queue_contract(path, channel):
    data = json.loads(path.read_text("utf-8-sig"))
    data["activePublicationDate"] = PLAN["date"]
    data["forceAllCurrentDayNow"] = True
    data["forceRetryNonce"] = f"materialize-{channel}-{PLAN['dateId']}-{nonce}"
    data["reconcileExistingBeforePublish"] = True
    if "outstandingDates" in data:
        data["outstandingDates"] = [PLAN["date"]]
    if channel == "free":
        data["sourceBatchPaths"] = [data["sourceBatchPath"]]
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), "utf-8")


write_current_queue_contract(ROOT / "sidehustle-autopublish" / "note" / "queue" / "index.json", "paid-note")
write_current_queue_contract(ROOT / "sidehustle-autopublish" / "note" / "free_queue" / "index.json", "free-note")
write_current_queue_contract(ROOT / "booth-autopublish" / "queue" / "index.json", "booth")

length_report = {
    "version": 1,
    "date": PLAN["date"],
    "policy": "Every paidBody and free NOTE body must contain at least 5,001 characters before queue materialization.",
    "minimumBodyChars": NOTE_MIN_BODY_CHARS,
    "paid": [{"id": item["id"], "bodyChars": len(item["paid"]), "passed": len(item["paid"]) >= NOTE_MIN_BODY_CHARS} for item in PLAN["paid"]],
    "free": [{"id": item["id"], "bodyChars": len(item["body"]), "passed": len(item["body"]) >= NOTE_MIN_BODY_CHARS} for item in PLAN["free"]],
}
report_path = ROOT / "sidehustle-autopublish" / "note" / "staging" / f"longform_policy_{PLAN['dateId']}.json"
report_path.write_text(json.dumps(length_report, ensure_ascii=False, indent=2), "utf-8")
print(json.dumps({"noteLongformGate": "passed", "minimumBodyChars": NOTE_MIN_BODY_CHARS, "report": str(report_path.relative_to(ROOT))}, ensure_ascii=False))
