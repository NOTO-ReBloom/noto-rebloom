from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATE = "2026-08-27"
RECONCILED_AT = "2026-08-27T14:29:21+09:00"

PAID = [
    {
        "id": "note_20260827_37_budget_variance_control",
        "title": "学生団体の予算が途中で崩れる前に｜予算差異を月1回15分で確認する実務ルール",
        "price": 1280,
        "url": "https://note.com/royal_lion645/n/nfd93b3630a10",
        "publishedAt": "2026-08-27T13:35:31+09:00",
    },
    {
        "id": "note_20260827_38_near_miss_reporting",
        "title": "イベント事故を未然に防ぐ｜ヒヤリハットを責任追及なしで集める運営テンプレート",
        "price": 1280,
        "url": "https://note.com/royal_lion645/n/n54f5d36205fe",
        "publishedAt": "2026-08-27T13:36:29+09:00",
    },
    {
        "id": "note_20260827_39_sponsor_post_event_report",
        "title": "協賛はイベント後が勝負｜次回提案につなげるスポンサー報告書の作り方",
        "price": 1480,
        "url": "https://note.com/royal_lion645/n/n77d259d4279e",
        "publishedAt": "2026-08-27T13:37:27+09:00",
    },
    {
        "id": "note_20260827_40_interview_anonymization",
        "title": "卒論インタビューの匿名化で迷わない｜録音・文字起こし・引用を分けて管理する方法",
        "price": 1280,
        "url": "https://note.com/royal_lion645/n/n35025967ba79",
        "publishedAt": "2026-08-27T13:38:24+09:00",
    },
    {
        "id": "note_20260827_41_digital_refund_support_policy",
        "title": "デジタル商品の返金・サポートで消耗しない｜販売前に決める対応範囲の線引き",
        "price": 1280,
        "url": "https://note.com/royal_lion645/n/n261d406ce918",
        "publishedAt": "2026-08-27T13:39:21+09:00",
    },
]

FREE = [
    {
        "id": "free_note_20260827_01_budget_warning_signs",
        "title": "予算オーバーの前に出る4つのサイン｜学生団体の会計で月1回見る場所",
        "url": "https://note.com/royal_lion645/n/nad81402c1c0c",
        "verifiedAt": "2026-08-27T14:07:13+09:00",
        "duplicateCandidateUrls": [],
    },
    {
        "id": "free_note_20260827_02_near_miss_questions",
        "title": "事故が起きる前に聞きたい5つの質問｜イベント運営のヒヤリハット簡易チェック",
        "url": "https://note.com/royal_lion645/n/nc29774521b20",
        "verifiedAt": "2026-08-27T14:08:59+09:00",
        "duplicateCandidateUrls": [
            "https://note.com/royal_lion645/n/na061ab23d0a3",
            "https://note.com/royal_lion645/n/n503d65677851",
        ],
    },
]

BOOTH = [
    {
        "id": "044_budget_variance_control_os_20260827",
        "title": "学生団体向け 予算差異チェック＆意思決定ログ実務キット",
        "price": 1280,
        "itemId": "8768914",
        "url": "https://booth.pm/ja/items/8768914",
        "verifiedAt": "2026-08-27T14:09:50+09:00",
    },
    {
        "id": "045_near_miss_reporting_os_20260827",
        "title": "イベント運営 ヒヤリハット報告・再発防止テンプレートセット",
        "price": 1280,
        "itemId": "8768917",
        "url": "https://booth.pm/ja/items/8768917",
        "verifiedAt": "2026-08-27T14:10:28+09:00",
    },
    {
        "id": "046_sponsor_post_event_report_os_20260827",
        "title": "協賛企業向け イベント実施報告書・継続提案テンプレート",
        "price": 1480,
        "itemId": "8768920",
        "url": "https://booth.pm/ja/items/8768920",
        "verifiedAt": "2026-08-27T14:11:10+09:00",
    },
    {
        "id": "047_interview_anonymization_os_20260827",
        "title": "卒論インタビュー 匿名化・引用管理シート実務セット",
        "price": 1280,
        "itemId": "8768922",
        "url": "https://booth.pm/ja/items/8768922",
        "verifiedAt": "2026-08-27T14:11:55+09:00",
    },
    {
        "id": "048_digital_refund_support_policy_os_20260827",
        "title": "デジタル商品 返金・サポート方針設計テンプレート",
        "price": 1280,
        "itemId": "8768930",
        "url": "https://booth.pm/ja/items/8768930",
        "verifiedAt": "2026-08-27T14:12:47+09:00",
    },
]


def read_json(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8-sig"))


def write_json(path: str, value: dict) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


paid_by_id = {item["id"]: item for item in PAID}
free_by_id = {item["id"]: item for item in FREE}
booth_by_id = {item["id"]: item for item in BOOTH}

# Paid NOTE receipts and queue.
for item in PAID:
    write_json(
        f"sidehustle-autopublish/note/publication_receipts/{item['id']}.json",
        {
            "id": item["id"],
            "title": item["title"],
            "publicUrl": item["url"],
            "publicUrlVerified": True,
            "expectedPriceJPY": item["price"],
            "paidBoundaryVerified": True,
            "dedicatedCoverVerified": True,
            "publishedAt": item["publishedAt"],
            "verifiedAt": RECONCILED_AT,
            "verificationEvidence": "Independent public note creator API and logged-out reader verification confirmed published status, exact title, expected price, canRead=false, a non-empty paid separator, and a dedicated eyecatch image.",
            "verificationMode": "public-api-and-reader-page-reconcile",
        },
    )

note_queue = read_json("sidehustle-autopublish/note/queue/index.json")
for entry in note_queue["entries"]:
    item = paid_by_id.get(entry.get("id"))
    if not item:
        continue
    entry.update(
        {
            "enabled": False,
            "forceRetry": False,
            "publicUrlVerified": True,
            "publicUrl": item["url"],
            "verificationState": "reader_visible_verified",
            "verificationEvidence": "Independent public API and logged-out reader verification confirmed exact title, expected price, paid boundary and dedicated cover image.",
            "verifiedAt": RECONCILED_AT,
        }
    )
note_queue["updatedAt"] = RECONCILED_AT
note_queue.update(
    {
        "activePublicationDate": DATE,
        "forceAllCurrentDayNow": False,
        "forceRetryNonce": "completed-20260827-20260827T142921+0900",
    }
)
note_queue["recoveryBatch"].update(
    {
        "mode": "completed_2026-08-27_paid_note_batch",
        "completedIds": [item["id"] for item in PAID],
        "completedAt": RECONCILED_AT,
        "instruction": "All five are strict reader-visible verified. Do not republish.",
    }
)
write_json("sidehustle-autopublish/note/queue/index.json", note_queue)

# Free NOTE canonical ledger and queue. Duplicate candidates are recorded but not deleted.
free_ledger = read_json("sidehustle-autopublish/note/free_publication_ledger.json")
free_ledger["entries"] = [entry for entry in free_ledger["entries"] if entry.get("id") not in free_by_id]
for item in FREE:
    entry = {
        "id": item["id"],
        "title": item["title"],
        "publicUrl": item["url"],
        "publicUrlVerified": True,
        "freeStateVerified": True,
        "coverImageVerified": True,
        "verifiedAt": item["verifiedAt"],
        "verification": {
            "ok": True,
            "url": item["url"],
            "status": 200,
            "titleOk": True,
            "freeState": True,
            "largeImageCount": 1,
            "evidence": "Windows strict reader verifier and independent public note API confirmed exact title, zero price, published state and dedicated cover image.",
        },
    }
    if item["duplicateCandidateUrls"]:
        entry["duplicateCandidateUrls"] = item["duplicateCandidateUrls"]
    free_ledger["entries"].append(entry)
free_ledger["updatedAt"] = RECONCILED_AT
write_json("sidehustle-autopublish/note/free_publication_ledger.json", free_ledger)

free_queue = read_json("sidehustle-autopublish/note/free_queue/index.json")
for entry in free_queue["entries"]:
    item = free_by_id.get(entry.get("id"))
    if not item:
        continue
    entry.update(
        {
            "enabled": False,
            "forceRetry": False,
            "recoveryMode": "completed reader-visible strict verification",
            "publicUrlVerified": True,
            "publicUrl": item["url"],
            "verificationState": "reader_visible_free_verified",
            "verifiedAt": item["verifiedAt"],
        }
    )
    if item["duplicateCandidateUrls"]:
        entry["duplicateCandidateUrls"] = item["duplicateCandidateUrls"]
free_queue["updatedAt"] = RECONCILED_AT
free_queue.update(
    {
        "activePublicationDate": DATE,
        "forceAllCurrentDayNow": False,
        "forceRetryNonce": "completed-20260827-20260827T142921+0900",
    }
)
free_queue["activePriorityBatch"].update(
    {
        "state": "strict_verified",
        "completedIds": [item["id"] for item in FREE],
        "completedAt": RECONCILED_AT,
    }
)
write_json("sidehustle-autopublish/note/free_queue/index.json", free_queue)

# BOOTH canonical ledger and queue.
booth_ledger = read_json("booth-autopublish/monitor/publication_ledger.json")
booth_ledger["entries"] = [entry for entry in booth_ledger["entries"] if entry.get("queueId") not in booth_by_id]
for item in BOOTH:
    booth_ledger["entries"].append(
        {
            "queueId": item["id"],
            "title": item["title"],
            "boothItemId": item["itemId"],
            "publicUrl": item["url"],
            "publicUrlVerified": True,
            "expectedPriceJPY": item["price"],
            "verifiedAt": item["verifiedAt"],
            "verificationEvidence": "Windows buyer-browser and independent public-page verification confirmed HTTP 200, exact title, expected price, downloadable-product state and purchase/cart path.",
            "publishMode": "aug27-current-day-targeted-recovery",
        }
    )
booth_ledger["updatedAt"] = RECONCILED_AT
write_json("booth-autopublish/monitor/publication_ledger.json", booth_ledger)

booth_queue = read_json("booth-autopublish/queue/index.json")
for entry in booth_queue["entries"]:
    item = booth_by_id.get(entry.get("id"))
    if not item:
        continue
    entry.update(
        {
            "enabled": False,
            "forceRetry": False,
            "publicUrlVerified": True,
            "publicUrl": item["url"],
            "verificationState": "buyer_visible_verified",
            "verifiedAt": item["verifiedAt"],
        }
    )
booth_queue["updatedAt"] = RECONCILED_AT
booth_queue.update(
    {
        "activePublicationDate": DATE,
        "forceAllCurrentDayNow": False,
        "forceRetryNonce": "completed-20260827-20260827T142921+0900",
    }
)
write_json("booth-autopublish/queue/index.json", booth_queue)

recovery = read_json("booth-autopublish/monitor/recovery_control.json")
if recovery.get("activeRecovery", {}).get("state") != "completed":
    recovery["version"] = int(recovery.get("version", 0)) + 1
recovery["updatedAt"] = RECONCILED_AT
recovery["activeRecovery"].update({"remaining": 0, "state": "completed", "completedAt": RECONCILED_AT})
recovery["readyPaidRecoveryBatch"].update(
    {"completedIds": [item["id"] for item in BOOTH], "remaining": 0, "state": "strict_verified", "completedAt": RECONCILED_AT}
)
recovery["windowsResumeContract"].update({"state": "satisfied", "completedAt": RECONCILED_AT})
write_json("booth-autopublish/monitor/recovery_control.json", recovery)

# Completion gate, quota, metrics and execution request.
gate = read_json("sidehustle-autopublish/completion_gate.json")
if gate.get("status") != "complete_12_of_12":
    gate["version"] = int(gate.get("version", 0)) + 1
gate["updatedAt"] = RECONCILED_AT
gate["status"] = "complete_12_of_12"
gate["completedAt"] = RECONCILED_AT
gate["completionCounts"].update({"todayNotePaid": 5, "todayNoteFree": 2, "todayBOOTH": 5, "todayTotal": 12})
gate["completionEvidence"] = {
    "strictVerifiedAt": RECONCILED_AT,
    "notePaid": [{"id": item["id"], "url": item["url"], "priceJPY": item["price"]} for item in PAID],
    "noteFree": [{"id": item["id"], "url": item["url"], "duplicateCandidateUrls": item["duplicateCandidateUrls"]} for item in FREE],
    "BOOTH": [{"id": item["id"], "url": item["url"], "priceJPY": item["price"]} for item in BOOTH],
}
write_json("sidehustle-autopublish/completion_gate.json", gate)

quota = read_json("sidehustle-autopublish/publication_quota.json")
if quota.get("currentDay", {}).get("completionState") != "complete_19_of_19_including_carryover":
    quota["version"] = int(quota.get("version", 0)) + 1
quota["updatedAt"] = RECONCILED_AT
note_state = quota["channels"]["note"]["operationalState"]
note_state.update({"todayStrictVerifiedPublicationsCount": 5, "todayRemainingToTarget": 0, "strictPublicationState": f"{DATE} 5/5 strict verified", "fallbackPolicy": "All current-day paid NOTE IDs are strict verified and disabled. Do not republish."})
free_state = quota["channels"]["note"]["freeAcquisitionExperiment"]
free_state.update({"currentRequiredBatchStrictVerifiedCount": 2, "currentMaterializationState": "published_2_of_2_strict_verified", "duplicateCandidateUrls": FREE[1]["duplicateCandidateUrls"]})
booth_state = quota["channels"]["BOOTH"]["operationalState"]
booth_state.update({"todayStrictVerifiedPublicationsCount": 5, "todayRemainingToTarget": 0, "strictPublicationState": f"{DATE} 5/5 strict verified", "fallbackPolicy": "All current-day BOOTH IDs are strict verified and disabled. Do not republish."})
quota["currentDay"].update({"strictVerifiedAfterRollover": 19, "carryOverRemaining": 0, "currentDayStrictVerified": 12, "completionState": "complete_19_of_19_including_carryover"})
write_json("sidehustle-autopublish/publication_quota.json", quota)

metrics = read_json("sidehustle-autopublish/metrics/current.json")
if not metrics.get("currentDayTargets", {}).get("allDesignatedStrictVerified"):
    metrics["version"] = int(metrics.get("version", 0)) + 1
metrics["updatedAt"] = RECONCILED_AT
metrics["objective"] = "maximize total sales while preserving strict public verification for the 2026-08-27 paid NOTE 5, free NOTE 2 and BOOTH 5 batch"
metrics["authoritativeSources"].update({"noteMaterialization": "sidehustle-autopublish/note/staging/materialization_20260827_batch01.json", "boothMaterialization": "booth-autopublish/monitor/cloud_materialization_20260827_batch01.json"})
metrics["currentRecovery"]["observedAt"] = RECONCILED_AT
metrics["currentDayTargets"] = {
    "date": DATE,
    "paidNote": {"target": 5, "strictVerified": 5, "remaining": 0, "materialized": 5, "remainingIds": []},
    "BOOTH": {"target": 5, "strictVerified": 5, "remaining": 0, "materialized": 5, "remainingIds": []},
    "freeNote": {"target": 2, "strictVerified": 2, "remaining": 0, "remainingIds": [], "paidQuotaContribution": 0},
    "allDesignatedStrictVerified": True,
}
metrics["evidence"] = {
    "paidNote": "5/5 exact-title, exact-price, paid-boundary and dedicated-cover public pages verified.",
    "BOOTH": "5/5 exact-title, exact-price, downloadable-product and cart-path buyer pages verified.",
    "freeNote": "2/2 exact-title, zero-price and dedicated-cover public pages verified; two extra same-title URLs are recorded as cleanup candidates and not counted.",
    "humanOnlyBlocker": None,
}
metrics["monitor"].update({"checkedAt": RECONCILED_AT, "nextWindowsAction": "None for 2026-08-27. All 12 designated items are strict verified and disabled."})
metrics["rules"] = [
    "Do not count queue insertion, materialization, commits, local success, editor/admin URLs or historical reverification as current-day publication.",
    "Do not reduce paid publication floors without strict public verification.",
    "Do not republish any of the twelve strict-verified 2026-08-27 designated items.",
    "Keep legacy note_20260820_05 and BOOTH 009 deferred until separately authorized.",
    "Do not invent public URLs, sales, PV, likes, acquisitions or conversions.",
]
write_json("sidehustle-autopublish/metrics/current.json", metrics)

request = read_json("sidehustle-autopublish/windows_publication_request.json")
if request.get("completionState") != "12_of_12":
    request["version"] = int(request.get("version", 0)) + 1
request["updatedAt"] = RECONCILED_AT
request["mode"] = "completed_all_current_day_strict_verified"
request["completedAt"] = RECONCILED_AT
request["completionState"] = "12_of_12"
request["doNotRepublish"] = [item["id"] for item in PAID + FREE + BOOTH]
write_json("sidehustle-autopublish/windows_publication_request.json", request)

planning = read_json("sidehustle-autopublish/planning/2026-08-27_batch01.json")
planning["materializationState"] = "published_12_of_12_strict_verified"
planning["publicationCompletedAt"] = RECONCILED_AT
planning["consumerRule"] = "All designated 2026-08-27 entries are strict verified and disabled. Do not republish."
write_json("sidehustle-autopublish/planning/2026-08-27_batch01.json", planning)

write_json(
    "sidehustle-autopublish/monitor/strict_publication_reconciliation_20260827.json",
    {
        "version": 1,
        "date": DATE,
        "reconciledAt": RECONCILED_AT,
        "status": "strict_verified_12_of_12",
        "counts": {"paidNote": 5, "freeNote": 2, "BOOTH": 5, "total": 12},
        "paidNote": PAID,
        "freeNote": FREE,
        "BOOTH": BOOTH,
        "duplicatePolicy": "The canonical free-note URL is counted once. Duplicate candidates are recorded only; no destructive cleanup was performed.",
    },
)

print(json.dumps({"status": "strict_verified_12_of_12", "reconciledAt": RECONCILED_AT}, ensure_ascii=False))
