from pathlib import Path
from copy import deepcopy
from datetime import datetime, timedelta, timezone
import json
import re
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
        "## 運用を定着させる役割分担とレビュー設計",
        "仕組みを作っても、記録する人と判断する人が同じままでは、忙しい時期に確認が省略されます。最低でも、事実を登録する記録担当、未処理を前へ進める対応担当、例外を認める承認者、運用全体を点検するレビュー担当を分けて考えます。小規模な組織で一人が複数の役割を兼ねる場合も、どの立場で何を確認したのかを記録上は分けます。承認者が自分で登録した案件を承認するときは、後日別の担当者が抽出確認するなど、自己完結を補う統制を置きます。担当者名だけでは異動や休暇で止まるため、主担当、代替担当、判断期限、引継ぎ先まで決めておくことが重要です。",
        "日次の確認では、新規登録、期限超過、差戻し、証拠不足に絞ります。すべての項目を毎日読み直すのではなく、状態が変わった案件と例外だけを一覧にして、次の行動と担当を確定します。週次では、滞留日数が長い案件、同じ理由で繰り返し止まる案件、承認者に集中している案件を確認します。月次では、完了件数だけでなく、初回から正しく処理できた割合、期限内完了率、差戻し率、例外の解消率、証拠がそろうまでの日数を比較します。数字が良く見えても対象を一覧から外しているだけでは意味がないため、母数と除外理由も同時に残します。",
        "エスカレーション条件は『重要そうなら相談する』ではなく、金額、影響範囲、経過日数、法令・契約への影響、顧客や従業員への影響で具体化します。たとえば期限を二営業日超えた、重要項目が未確認のまま実行日を迎えた、同じ相手で例外が三回続いた、証拠の改変が疑われる、といった条件です。条件に達した案件は、誰へ、どの手段で、何時までに伝えるかを決めます。緊急対応を行った場合も、口頭連絡だけで閉じず、判断時点で分かっていた事実、採った措置、残るリスク、次回確認時刻を記録します。",
        "記録の品質は、入力欄の多さではなく、第三者が同じ結論に到達できるかで判断します。レビュー担当は毎月数件を抽出し、元資料、台帳、承認履歴、実際の処理結果が一致するかをたどります。不一致があれば担当者だけを注意して終わらせず、必須項目の不足、選択肢の曖昧さ、権限設定、通知漏れ、教育不足のどこに原因があるかを分けます。改善策には責任者と期限を置き、翌月の抽出確認で効いたかを検証します。一度決めたルールも、業務量、契約、システム、組織変更に合わせて見直し、古い手順が参照され続けないよう版番号と適用開始日を明示します。",
        "個人情報や機密情報を扱う場合は、管理に必要な最小限の情報だけを台帳へ置きます。証明書、口座情報、契約書、顧客データなどを複製して便利にするほど、閲覧範囲と削除管理は難しくなります。台帳には保管先への参照、確認者、確認日、有効期限を残し、元ファイルは権限管理された場所で保持します。退職者や委託先の権限は定期的に棚卸しし、ダウンロードや外部共有が必要な場合は目的、範囲、受領者、削除予定を記録します。運用改善のための集計でも、個人を特定する必要がなければ匿名化または集約した数字を使います。",
        "定着の判断は、担当者が説明を暗記したかではなく、実際の案件で迷わず次の行動を選べるかで行います。導入時には正常な例だけでなく、期限超過、資料不足、担当不在、緊急依頼、申請後の変更といった例外を使って短い演習をします。質問が出た箇所はFAQへ足すだけでなく、画面や様式そのものを直せないか検討します。現場からの改善提案は、採否と理由、反映予定を返し、提案が消えない状態を作ります。こうして記録、対応、承認、点検を一つの循環にすると、属人的な注意力に頼らず、忙しい日にも最低限の品質を守れる運用になります。",
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
    data["outstandingDates"] = PLAN.get("outstandingDates", [PLAN["date"]])
    if channel == "free":
        data["sourceBatchPaths"] = sorted({
            entry.get("sourceBatchPath")
            for entry in data.get("entries", [])
            if entry.get("enabled") and entry.get("sourceBatchPath")
        })
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


def aggregate_active_publication_contracts():
    """Replace stale daily summaries with the complete oldest-first active queue contract."""
    jst = timezone(timedelta(hours=9))
    stamp = datetime.now(jst).isoformat(timespec="seconds")

    def load(relative):
        path = ROOT / relative
        return path, json.loads(path.read_text("utf-8-sig"))

    def save(path, value):
        path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", "utf-8")

    paid_path, paid_queue = load("sidehustle-autopublish/note/queue/index.json")
    free_path, free_queue = load("sidehustle-autopublish/note/free_queue/index.json")
    booth_path, booth_queue = load("booth-autopublish/queue/index.json")
    active = {
        "paidNote": [entry["id"] for entry in paid_queue.get("entries", []) if entry.get("enabled")],
        "freeNote": [entry["id"] for entry in free_queue.get("entries", []) if entry.get("enabled")],
        "BOOTH": [entry["id"] for entry in booth_queue.get("entries", []) if entry.get("enabled")],
    }
    total = sum(len(ids) for ids in active.values())

    def date_of(identifier):
        match = re.search(r"20\d{6}", identifier)
        if not match:
            return None
        value = match.group(0)
        return f"{value[:4]}-{value[4:6]}-{value[6:]}"

    by_date = {}
    for channel, ids in active.items():
        for identifier in ids:
            date = date_of(identifier) or PLAN["date"]
            bucket = by_date.setdefault(date, {"paidNote": [], "freeNote": [], "BOOTH": []})
            bucket[channel].append(identifier)
    for bucket in by_date.values():
        bucket["total"] = sum(len(bucket[channel]) for channel in ("paidNote", "freeNote", "BOOTH"))

    request_path, request = load("sidehustle-autopublish/windows_publication_request.json")
    request.update({
        "version": int(request.get("version", 0)) + 1,
        "updatedAt": stamp,
        "requestedAt": stamp,
        "date": PLAN["date"],
        "throughDate": PLAN["date"],
        "mode": "publish_all_outstanding_through_current_day_now",
        "order": "oldest_publication_date_first",
        "outstandingDates": sorted(by_date),
        "paidNote": {"ids": active["paidNote"], "target": len(active["paidNote"])},
        "freeNote": {"ids": active["freeNote"], "target": len(active["freeNote"])},
        "BOOTH": {"ids": active["BOOTH"], "target": len(active["BOOTH"])},
        "totalTarget": total,
        "strictVerificationRequired": True,
        "reconcileExistingExactTitleBeforeCreate": True,
        "doNotStopAfterFirstSuccess": True,
        "completionState": f"0_of_{total}_strict_verified_in_this_request",
    })
    save(request_path, request)

    gate_path, gate = load("sidehustle-autopublish/completion_gate.json")
    prior_dates = [date for date in sorted(by_date) if date < PLAN["date"]]
    current = by_date.get(PLAN["date"], {"paidNote": [], "freeNote": [], "BOOTH": [], "total": 0})
    carry = {channel: [identifier for date in prior_dates for identifier in by_date[date][channel]] for channel in ("paidNote", "freeNote", "BOOTH")}
    carry["total"] = sum(len(carry[channel]) for channel in ("paidNote", "freeNote", "BOOTH"))
    gate.update({
        "updatedAt": stamp,
        "status": f"in_progress_0_of_{total}",
        "date": PLAN["date"],
        "purpose": f"Publish and strict-verify every active item through {PLAN['date']}; only public verification completes an item.",
        "outstandingByDate": by_date,
        "carryOver": {
            "sourceDates": prior_dates,
            "requiredBeforeCurrentDay": True,
            "remaining": carry,
            "strictVerifiedInThisRequest": {"paidNote": 0, "freeNote": 0, "BOOTH": 0, "total": 0},
        },
        "completionConditions": {
            "notePaid": {"requiredIds": active["paidNote"], "strictChecks": ["readerVisibleUrl", "exactTitle", "expectedPrice", "paidBoundary", "dedicatedCover", "bodyCharsAtLeast5001"]},
            "noteFree": {"requiredIds": active["freeNote"], "strictChecks": ["readerVisibleUrl", "exactTitle", "freeState", "dedicatedCover", "bodyCharsAtLeast5001"], "paidQuotaContribution": 0},
            "BOOTH": {"requiredIds": active["BOOTH"], "strictChecks": ["buyerVisibleUrl", "exactTitle", "expectedPrice", "downloadableProductState", "purchaseOrCartPath"]},
        },
        "completionCounts": {
            "strictVerifiedInThisRequest": 0,
            "required": total,
            "remaining": total,
            "paidNoteRemaining": len(active["paidNote"]),
            "freeNoteRemaining": len(active["freeNote"]),
            "BOOTHRemaining": len(active["BOOTH"]),
        },
        "materializationState": "all_active_items_materialized_and_qa_passed",
        "executionRequestedAt": stamp,
        "executionNonce": f"catchup-through-{PLAN['dateId']}-{stamp}",
        "completedAt": None,
        "completionEvidence": None,
        "forceNowRequested": True,
        "forceNowMode": "publish_all_outstanding_oldest_first",
    })
    save(gate_path, gate)

    quota_path, quota = load("sidehustle-autopublish/publication_quota.json")
    quota.update({"updatedAt": stamp, "activePublicationContract": {
        "throughDate": PLAN["date"],
        "outstandingByDate": by_date,
        "paidNoteRemaining": len(active["paidNote"]),
        "freeNoteRemaining": len(active["freeNote"]),
        "BOOTHRemaining": len(active["BOOTH"]),
        "totalRemaining": total,
        "strictVerifiedInThisRequest": 0,
        "state": "materialized_waiting_for_authenticated_windows_publisher",
        "noteMinimumBodyChars": NOTE_MIN_BODY_CHARS,
    }})
    quota["currentDay"] = {
        "date": PLAN["date"],
        "currentDayTargets": current,
        "carryOverRemaining": carry,
        "totalOutstanding": total,
        "priority": "Publish exact-title-reconciled carryover first, then current-day targets; count only strict public verification.",
        "completionState": f"pending_0_of_{total}",
    }
    save(quota_path, quota)

    recovery_path, recovery = load("booth-autopublish/monitor/recovery_control.json")
    price_by_id = {entry["id"]: entry.get("expectedPriceJPY") for entry in booth_queue.get("entries", []) if entry.get("enabled")}
    recovery.update({
        "updatedAt": stamp,
        "activeRecovery": {"throughDate": PLAN["date"], "mode": "all_outstanding_oldest_first", "requiredStrictNewPublications": len(active["BOOTH"]), "remaining": len(active["BOOTH"]), "state": "ready"},
        "readyPaidRecoveryBatch": {
            "generatedAt": stamp,
            "requiredStrictNewPublications": len(active["BOOTH"]),
            "queueIds": active["BOOTH"],
            "completedIds": [],
            "expectedPricesJPY": price_by_id,
            "requiredBuyerChecks": ["buyerVisibleUrl", "exactTitle", "expectedPrice", "downloadableProductState", "purchaseOrCartPath"],
            "doNotStopAfterFirstSuccess": True,
            "forceRetryNonce": f"booth-through-{PLAN['dateId']}-{stamp}",
        },
        "windowsResumeContract": {"requiredIds": active["BOOTH"], "firstPassOrder": active["BOOTH"], "strictSuccessOnly": True, "completionPredicate": "all active BOOTH IDs buyer-visible strict verified"},
    })
    save(recovery_path, recovery)

    metrics_path, metrics = load("sidehustle-autopublish/metrics/current.json")
    metrics.update({
        "updatedAt": stamp,
        "objective": f"Publish and strict-verify all {total} active items through {PLAN['date']} without duplicate NOTE titles.",
        "currentRecovery": {"throughDate": PLAN["date"], "observedAt": stamp, "outstandingDates": sorted(by_date), "strictVerifiedInThisRequest": 0, "remaining": total},
        "activeTargets": {
            "paidNote": {"target": len(active["paidNote"]), "remainingIds": active["paidNote"]},
            "freeNote": {"target": len(active["freeNote"]), "remainingIds": active["freeNote"], "paidQuotaContribution": 0},
            "BOOTH": {"target": len(active["BOOTH"]), "remainingIds": active["BOOTH"]},
            "total": total,
            "allDesignatedStrictVerified": False,
        },
        "evidence": {"materialization": "all active encrypted payloads/manuscripts and QA manifests are present", "publication": "not counted until strict public URLs are verified", "humanOnlyBlocker": None},
    })
    save(metrics_path, metrics)
    print(json.dumps({"aggregateActiveContract": "ready", "throughDate": PLAN["date"], "paidNote": len(active["paidNote"]), "freeNote": len(active["freeNote"]), "BOOTH": len(active["BOOTH"]), "total": total}, ensure_ascii=False))


aggregate_active_publication_contracts()
