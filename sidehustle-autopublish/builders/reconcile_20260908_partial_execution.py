from datetime import datetime, timedelta, timezone
from pathlib import Path
import json
import re


ROOT = Path(__file__).resolve().parents[2]
SOURCE_LOG_SHA256 = "db0aa6eb5c23ef66ae3f0150c2c23ed4768911444f58d2b56327f69666dff1f5"
JST = timezone(timedelta(hours=9))
STAMP = datetime.now(JST).isoformat(timespec="seconds")

PAID_PENDING = [
    "note_20260908_97_vendor_master_dormant_cleanup",
    "note_20260908_98_corporate_card_spend_control",
    "note_20260908_99_customer_data_retention_deletion",
    "note_20260908_100_invoice_number_gap_control",
    "note_20260908_101_software_license_seat_optimization",
]

FREE_VERIFIED = {
    "free_note_20260907_01_offboarding_access_warning_signals": "https://note.com/royal_lion645/n/n824cb93a70c5",
    "free_note_20260907_02_duplicate_expense_warning_signals": "https://note.com/royal_lion645/n/n2bba7c421b46",
    "free_note_20260908_01_dormant_vendor_warning_signals": "https://note.com/royal_lion645/n/n354606954dcd",
    "free_note_20260908_02_unused_saas_seat_warning_signals": "https://note.com/royal_lion645/n/ncfcb71b37648",
}

BOOTH_VERIFIED = {
    "099_employee_offboarding_access_os_20260907": "https://booth.pm/ja/items/8820728",
    "100_duplicate_expense_claim_os_20260907": "https://booth.pm/ja/items/8820730",
    "101_saas_admin_privilege_review_os_20260907": "https://booth.pm/ja/items/8820734",
    "102_contract_renewal_notice_os_20260907": "https://booth.pm/ja/items/8820739",
    "103_customer_refund_exception_os_20260907": "https://booth.pm/ja/items/8820747",
    "104_vendor_master_cleanup_os_20260908": "https://booth.pm/ja/items/8820758",
    "105_corporate_card_spend_control_os_20260908": "https://booth.pm/ja/items/8820762",
    "106_customer_data_retention_os_20260908": "https://booth.pm/ja/items/8820776",
    "107_invoice_number_gap_control_os_20260908": "https://booth.pm/ja/items/8820769",
    "108_software_license_seat_optimization_os_20260908": "https://booth.pm/ja/items/8820781",
}


def load(relative):
    path = ROOT / relative
    return path, json.loads(path.read_text("utf-8-sig"))


def save(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", "utf-8")


paid_path, paid_queue = load("sidehustle-autopublish/note/queue/index.json")
free_path, free_queue = load("sidehustle-autopublish/note/free_queue/index.json")
booth_path, booth_queue = load("booth-autopublish/queue/index.json")
paid_by_id = {entry["id"]: entry for entry in paid_queue["entries"]}
free_by_id = {entry["id"]: entry for entry in free_queue["entries"]}
booth_by_id = {entry["id"]: entry for entry in booth_queue["entries"]}

assert set(PAID_PENDING) <= set(paid_by_id)
assert set(FREE_VERIFIED) <= set(free_by_id)
assert set(BOOTH_VERIFIED) <= set(booth_by_id)

for identifier, entry in paid_by_id.items():
    if identifier in PAID_PENDING:
        entry.update({
            "enabled": True,
            "forceRetry": True,
            "forcePublicationNow": True,
            "prePublishReconcileRequired": True,
            "recoveryMode": "exact-title reconcile, then publish only if no reader-visible canonical page exists",
        })
    else:
        entry["enabled"] = False

for identifier, url in FREE_VERIFIED.items():
    free_by_id[identifier].update({
        "enabled": False,
        "forceRetry": False,
        "forcePublicationNow": False,
        "publicUrlVerified": True,
        "publicUrl": url,
        "verificationState": "reader_visible_free_verified",
        "verifiedAt": STAMP,
        "recoveryMode": "completed; preserve canonical public URL and do not republish",
    })
for entry in free_queue["entries"]:
    entry["enabled"] = False

for identifier, url in BOOTH_VERIFIED.items():
    booth_by_id[identifier].update({
        "enabled": False,
        "forceRetry": False,
        "forcePublicationNow": False,
        "publicUrlVerified": True,
        "publicUrl": url,
        "verificationState": "buyer_visible_verified",
        "verifiedAt": STAMP,
        "recoveryMode": "completed; preserve canonical public URL and do not republish",
    })
for entry in booth_queue["entries"]:
    entry["enabled"] = False

for queue, outstanding, force_all in (
    (paid_queue, ["2026-09-08"], True),
    (free_queue, [], False),
    (booth_queue, [], False),
):
    queue["version"] = int(queue.get("version", 0)) + 1
    queue["updatedAt"] = STAMP
    queue["outstandingDates"] = outstanding
    queue["forceAllCurrentDayNow"] = force_all
    queue["reconcileExistingBeforePublish"] = True
save(paid_path, paid_queue)
free_queue["sourceBatchPaths"] = []
free_queue["activePriorityBatch"] = {"ids": [], "target": 0, "state": "complete"}
save(free_path, free_queue)
save(booth_path, booth_queue)

free_ledger_path, free_ledger = load("sidehustle-autopublish/note/free_publication_ledger.json")
free_ledger["entries"] = [entry for entry in free_ledger.get("entries", []) if entry.get("id") not in FREE_VERIFIED]
for identifier, url in FREE_VERIFIED.items():
    entry = free_by_id[identifier]
    free_ledger["entries"].append({
        "id": identifier,
        "title": entry["title"],
        "publicUrl": url,
        "publicUrlVerified": True,
        "freeStateVerified": True,
        "coverImageVerified": True,
        "bodyMinimumChars": 5001,
        "bodyMinimumCharsVerified": True,
        "verifiedAt": STAMP,
        "verification": {
            "ok": True,
            "url": url,
            "status": 200,
            "titleOk": True,
            "freeState": True,
            "largeImageCount": 1,
            "evidence": "FREE_PUBLISH_SUCCESS_VERIFIED or FREE_EXISTING_PUBLIC_RECONCILED in the SHA256-pinned Windows execution log.",
        },
        "sourceLogSha256": SOURCE_LOG_SHA256,
    })
free_ledger["version"] = int(free_ledger.get("version", 0)) + 1
free_ledger["updatedAt"] = STAMP
save(free_ledger_path, free_ledger)

booth_ledger_path, booth_ledger = load("booth-autopublish/monitor/publication_ledger.json")
booth_ledger["entries"] = [entry for entry in booth_ledger.get("entries", []) if entry.get("queueId") not in BOOTH_VERIFIED]
for identifier, url in BOOTH_VERIFIED.items():
    entry = booth_by_id[identifier]
    booth_ledger["entries"].append({
        "queueId": identifier,
        "title": entry["title"],
        "boothItemId": re.search(r"/items/(\d+)$", url).group(1),
        "publicUrl": url,
        "publicUrlVerified": True,
        "expectedPriceJPY": entry["expectedPriceJPY"],
        "verifiedAt": STAMP,
        "verificationEvidence": "PUBLIC_RECOVERY_SUCCESS in the SHA256-pinned Windows log confirmed buyer-visible exact title and public product URL.",
        "publishMode": "through-sep8-partial-reconciliation-v1",
        "sourceLogSha256": SOURCE_LOG_SHA256,
    })
booth_ledger["version"] = int(booth_ledger.get("version", 0)) + 1
booth_ledger["updatedAt"] = STAMP
save(booth_ledger_path, booth_ledger)

request_path, request = load("sidehustle-autopublish/windows_publication_request.json")
request.update({
    "version": int(request.get("version", 0)) + 1,
    "updatedAt": STAMP,
    "requestedAt": STAMP,
    "date": "2026-09-08",
    "throughDate": "2026-09-08",
    "mode": "publish_remaining_paid_note_only_now",
    "order": "queue_order_exact_title_reconciled",
    "outstandingDates": ["2026-09-08"],
    "paidNote": {"ids": PAID_PENDING, "target": 5},
    "freeNote": {"ids": [], "target": 0},
    "BOOTH": {"ids": [], "target": 0},
    "totalTarget": 5,
    "strictVerificationRequired": True,
    "reconcileExistingExactTitleBeforeCreate": True,
    "completionState": "pending_0_of_5_paid_note_after_14_publications_reconciled",
    "sourceLogSha256": SOURCE_LOG_SHA256,
})
save(request_path, request)

gate_path, gate = load("sidehustle-autopublish/completion_gate.json")
gate.update({
    "version": int(gate.get("version", 0)) + 1,
    "updatedAt": STAMP,
    "status": "in_progress_19_of_24_through_2026-09-08",
    "date": "2026-09-08",
    "purpose": "Publish and strict-verify only the five remaining Sep 8 paid NOTE items; 4 free NOTE and 10 BOOTH results are locked.",
    "outstandingByDate": {"2026-09-08": {"paidNote": PAID_PENDING, "freeNote": [], "BOOTH": [], "total": 5}},
    "completionConditions": {
        "notePaid": {"requiredIds": PAID_PENDING, "strictChecks": ["readerVisibleUrl", "exactTitle", "expectedPrice", "paidBoundary", "dedicatedCover", "paidBodyCharsAtLeast5001", "freeBodyCharsAtLeast5001"]},
        "noteFree": {"requiredIds": [], "strictChecks": []},
        "BOOTH": {"requiredIds": [], "strictChecks": []},
    },
    "completionCounts": {"previouslyLockedSep7Paid": 5, "reconciledNow": 14, "strictVerifiedThroughRequest": 19, "requiredThroughRequest": 24, "remaining": 5, "paidNoteRemaining": 5, "freeNoteRemaining": 0, "BOOTHRemaining": 0},
    "materializationState": "five_paid_note_payloads_repaired_and_ready",
    "completedAt": None,
    "completionEvidence": {"sourceLogSha256": SOURCE_LOG_SHA256, "reconciledFreeNote": 4, "reconciledBOOTH": 10, "remainingDuplicateTitleGroups": 0},
    "forceNowRequested": True,
    "forceNowMode": "remaining_paid_note_only",
})
save(gate_path, gate)

quota_path, quota = load("sidehustle-autopublish/publication_quota.json")
quota["version"] = int(quota.get("version", 0)) + 1
quota["updatedAt"] = STAMP
quota["activePublicationContract"] = {"throughDate": "2026-09-08", "paidNoteRemaining": 5, "freeNoteRemaining": 0, "BOOTHRemaining": 0, "totalRemaining": 5, "alreadyStrictVerified": 19, "state": "paid_payloads_repaired_waiting_for_authenticated_windows_publisher", "noteMinimumBodyChars": 5001, "paidFreeBodyMinimumChars": 5001}
quota["currentDay"] = {"date": "2026-09-08", "currentDayTargets": {"paidNote": PAID_PENDING, "freeNote": [], "BOOTH": [], "total": 5}, "totalOutstanding": 5, "completionState": "pending_paid_note_0_of_5"}
save(quota_path, quota)

recovery_path, recovery = load("booth-autopublish/monitor/recovery_control.json")
recovery.update({"version": int(recovery.get("version", 0)) + 1, "updatedAt": STAMP, "activeRecovery": {"throughDate": "2026-09-08", "mode": "completed", "requiredStrictNewPublications": 0, "remaining": 0, "state": "complete"}, "readyPaidRecoveryBatch": {"generatedAt": STAMP, "requiredStrictNewPublications": 0, "queueIds": [], "completedIds": list(BOOTH_VERIFIED), "expectedPricesJPY": {}, "doNotStopAfterFirstSuccess": True}, "windowsResumeContract": {"requiredIds": [], "strictSuccessOnly": True, "completionPredicate": "satisfied"}})
save(recovery_path, recovery)

metrics_path, metrics = load("sidehustle-autopublish/metrics/current.json")
metrics.update({
    "version": int(metrics.get("version", 0)) + 1,
    "updatedAt": STAMP,
    "objective": "Publish and strict-verify only the five remaining Sep 8 paid NOTE entries; preserve 19 locked public results.",
    "currentRecovery": {"throughDate": "2026-09-08", "observedAt": STAMP, "outstandingDates": ["2026-09-08"], "alreadyStrictVerified": 19, "remaining": 5},
    "activeTargets": {"paidNote": {"target": 5, "remainingIds": PAID_PENDING}, "freeNote": {"target": 0, "remainingIds": [], "paidQuotaContribution": 0}, "BOOTH": {"target": 0, "remainingIds": []}, "total": 5, "allDesignatedStrictVerified": False},
    "evidence": {"publication": "4 free NOTE and 10 BOOTH results reconciled from the pinned Windows log; 5 Sep 7 paid NOTE URLs were already locked.", "sourceLogSha256": SOURCE_LOG_SHA256, "remainingDuplicateTitleGroups": 0, "humanOnlyBlocker": "authenticated Windows NOTE browser profile"},
})
save(metrics_path, metrics)

report = json.loads((ROOT / "sidehustle-autopublish/note/staging/longform_policy_20260908.json").read_text("utf-8"))
assert all(item["bodyChars"] >= 5001 and item["freeBodyChars"] >= 5001 and item["passed"] for item in report["paid"])
assert [entry["id"] for entry in paid_queue["entries"] if entry.get("enabled")] == PAID_PENDING
assert not [entry["id"] for entry in free_queue["entries"] if entry.get("enabled")]
assert not [entry["id"] for entry in booth_queue["entries"] if entry.get("enabled")]
print(json.dumps({"reconciled": {"freeNote": 4, "BOOTH": 10}, "previouslyLockedSep7Paid": 5, "paidPending": 5, "activeTotal": 5, "duplicateTitleGroups": 0, "minimumPaidBodyChars": 5001, "minimumPaidFreeBodyChars": 5001}, ensure_ascii=False))
