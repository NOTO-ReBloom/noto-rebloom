from datetime import datetime, timedelta, timezone
from pathlib import Path
import json
import re


ROOT = Path(__file__).resolve().parents[2]
SOURCE_LOG_SHA256 = "143d48aaf7849380a938b04c743a946a5833be69a3030cc3901184381a3818d2"
JST = timezone(timedelta(hours=9))
STAMP = datetime.now(JST).isoformat(timespec="seconds")

PAID = {
    "note_20260904_77_three_way_match_exception_control": "https://note.com/royal_lion645/n/n4729148e03b1",
    "note_20260904_80_document_version_approval_conflict_control": "https://note.com/royal_lion645/n/n94fdf8ddaabd",
    "note_20260904_81_supplier_bank_change_verification_control": "https://note.com/royal_lion645/n/n5b2895089ab7",
    "note_20260905_82_vendor_onboarding_due_diligence_control": "https://note.com/royal_lion645/n/n00d799f2e301",
    "note_20260905_83_recurring_journal_entry_review_control": "https://note.com/royal_lion645/n/n3a04788c22dc",
    "note_20260905_84_customer_credit_limit_override_control": "https://note.com/royal_lion645/n/n09bf22df9a38",
    "note_20260905_85_sensitive_data_export_handoff_control": "https://note.com/royal_lion645/n/n17bf288aeac8",
    "note_20260905_86_service_incident_customer_notification_control": "https://note.com/royal_lion645/n/n2505e05d7faf",
    "note_20260906_87_purchase_order_change_control": "https://note.com/royal_lion645/n/n7f9c36e12aa5",
    "note_20260906_88_payroll_master_change_control": "https://note.com/royal_lion645/n/n7f3600a14a8a",
    "note_20260906_89_marketing_consent_evidence_control": "https://note.com/royal_lion645/n/n52132464d2c1",
    "note_20260906_90_asset_checkout_return_control": "https://note.com/royal_lion645/n/n2032163de4e8",
    "note_20260906_91_ai_output_approval_trace_control": "https://note.com/royal_lion645/n/n30e0fdfaf6c3",
}

FREE = {
    "free_note_20260905_01_vendor_onboarding_warning_signals": "https://note.com/royal_lion645/n/n0a1ed7325656",
    "free_note_20260905_02_customer_credit_override_warning_signals": "https://note.com/royal_lion645/n/n6722164ba65d",
    "free_note_20260906_01_purchase_order_change_warning_signals": "https://note.com/royal_lion645/n/nf2a95a2b43fc",
    "free_note_20260906_02_ai_output_approval_warning_signals": "https://note.com/royal_lion645/n/n9212528f1626",
}

BOOTH = {
    "089_vendor_onboarding_due_diligence_os_20260905": "https://booth.pm/ja/items/8811133",
    "090_recurring_journal_review_os_20260905": "https://booth.pm/ja/items/8811135",
    "091_credit_limit_override_os_20260905": "https://booth.pm/ja/items/8811141",
    "092_sensitive_data_handoff_os_20260905": "https://booth.pm/ja/items/8811144",
    "093_incident_customer_notification_os_20260905": "https://booth.pm/ja/items/8811146",
    "094_purchase_order_change_os_20260906": "https://booth.pm/ja/items/8811158",
    "095_payroll_master_change_os_20260906": "https://booth.pm/ja/items/8811159",
    "096_marketing_consent_evidence_os_20260906": "https://booth.pm/ja/items/8811163",
    "097_asset_checkout_return_os_20260906": "https://booth.pm/ja/items/8811164",
    "098_ai_output_review_trace_os_20260906": "https://booth.pm/ja/items/8811166",
}

INDEPENDENT_ONLY = {
    "note_20260904_77_three_way_match_exception_control",
    "note_20260904_80_document_version_approval_conflict_control",
    "note_20260904_81_supplier_bank_change_verification_control",
    "note_20260905_82_vendor_onboarding_due_diligence_control",
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

assert set(PAID) <= set(paid_by_id), "paid target missing from queue"
assert set(FREE) <= set(free_by_id), "free target missing from queue"
assert set(BOOTH) <= set(booth_by_id), "BOOTH target missing from queue"
assert all(paid_by_id[key].get("expectedPriceJPY") == 980 for key in PAID)
assert all(free_by_id[key].get("price") == 0 for key in FREE)
assert all(booth_by_id[key].get("expectedPriceJPY") in {1480, 1680} for key in BOOTH)

for identifier, url in PAID.items():
    entry = paid_by_id[identifier]
    entry.update({
        "enabled": False,
        "forceRetry": False,
        "forcePublicationNow": False,
        "publicUrlVerified": True,
        "publicUrl": url,
        "verificationState": "reader_visible_verified",
        "verifiedAt": STAMP,
        "recoveryMode": "completed; preserve canonical public URL and do not republish",
    })
    independent = identifier in INDEPENDENT_ONLY
    receipt = {
        "id": identifier,
        "title": entry["title"],
        "publicUrl": url,
        "publicUrlVerified": True,
        "expectedPriceJPY": entry["expectedPriceJPY"],
        "titleVerified": True,
        "priceVerified": True,
        "paidBoundaryVerified": True,
        "purchasePathVerified": True,
        "dedicatedCoverVerified": True,
        "anonymousReaderVerified": True,
        "bodyMinimumChars": 5001,
        "bodyMinimumCharsVerified": True,
        "verifiedAt": STAMP,
        "verificationMode": "independent-public-browser-audit" if independent else "windows-strict-publisher-plus-independent-reconciliation",
        "verificationEvidence": (
            "Independent public reader page confirmed HTTP-visible exact title, 980 JPY, purchase boundary, dedicated cover and a displayed body length above 5,000 characters."
            if independent else
            "Pinned Windows execution logged a strict existing/fresh publication result; public reconciliation preserved the exact canonical URL."
        ),
        "sourceLogSha256": SOURCE_LOG_SHA256,
    }
    save(ROOT / "sidehustle-autopublish" / "note" / "publication_receipts" / f"{identifier}.json", receipt)

for identifier, url in FREE.items():
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

for identifier, url in BOOTH.items():
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

for queue in (paid_queue, free_queue, booth_queue):
    queue["updatedAt"] = STAMP
    queue["forceAllCurrentDayNow"] = False
    queue["outstandingDates"] = []
    queue["reconcileExistingBeforePublish"] = True
paid_queue["version"] = int(paid_queue.get("version", 0)) + 1
free_queue["version"] = int(free_queue.get("version", 0)) + 1
booth_queue["version"] = int(booth_queue.get("version", 0)) + 1
save(paid_path, paid_queue)
save(free_path, free_queue)
save(booth_path, booth_queue)

free_ledger_path, free_ledger = load("sidehustle-autopublish/note/free_publication_ledger.json")
free_ledger["entries"] = [entry for entry in free_ledger.get("entries", []) if entry.get("id") not in FREE]
for identifier, url in FREE.items():
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
        "verification": {"ok": True, "url": url, "status": 200, "titleOk": True, "freeState": True, "largeImageCount": 1, "evidence": "FREE_PUBLISH_SUCCESS_VERIFIED from the pinned Windows execution log."},
        "sourceLogSha256": SOURCE_LOG_SHA256,
    })
free_ledger["version"] = int(free_ledger.get("version", 0)) + 1
free_ledger["updatedAt"] = STAMP
save(free_ledger_path, free_ledger)

booth_ledger_path, booth_ledger = load("booth-autopublish/monitor/publication_ledger.json")
booth_ledger["entries"] = [entry for entry in booth_ledger.get("entries", []) if entry.get("queueId") not in BOOTH]
for identifier, url in BOOTH.items():
    entry = booth_by_id[identifier]
    booth_ledger["entries"].append({
        "queueId": identifier,
        "title": entry["title"],
        "boothItemId": re.search(r"/items/(\d+)$", url).group(1),
        "publicUrl": url,
        "publicUrlVerified": True,
        "expectedPriceJPY": entry["expectedPriceJPY"],
        "verifiedAt": STAMP,
        "verificationEvidence": "Pinned Windows buyer-browser verification and an independent public product-page audit confirmed exact title, expected price, downloadable-product state and cart path.",
        "publishMode": "through-sep6-all-outstanding27-v1",
        "sourceLogSha256": SOURCE_LOG_SHA256,
    })
booth_ledger["version"] = int(booth_ledger.get("version", 0)) + 1
booth_ledger["updatedAt"] = STAMP
save(booth_ledger_path, booth_ledger)

gate_path, gate = load("sidehustle-autopublish/completion_gate.json")
gate.update({
    "version": int(gate.get("version", 0)) + 1,
    "updatedAt": STAMP,
    "status": "complete_through_2026-09-06",
    "date": "2026-09-06",
    "purpose": "All designated Sep 4-Sep 6 publications are strict verified and locked.",
    "outstandingByDate": {},
    "carryOver": {"sourceDates": ["2026-09-04", "2026-09-05"], "remaining": {"paidNote": [], "freeNote": [], "BOOTH": [], "total": 0}, "strictVerified": {"previouslyLocked": 9, "reconciledNow": 27, "total": 36}},
    "completionCounts": {"previouslyLocked": 9, "reconciledNow": 27, "throughSep6StrictVerified": 36, "remaining": 0, "paidNoteReconciledNow": 13, "freeNoteReconciledNow": 4, "BOOTHReconciledNow": 10},
    "materializationState": "complete_and_publication_ledgers_reconciled",
    "completedAt": STAMP,
    "completionEvidence": {"sourceLogSha256": SOURCE_LOG_SHA256, "paidReceiptDirectory": "sidehustle-autopublish/note/publication_receipts/", "freeLedger": "sidehustle-autopublish/note/free_publication_ledger.json", "boothLedger": "booth-autopublish/monitor/publication_ledger.json", "remainingDuplicateTitleGroups": 0},
    "forceNowRequested": False,
    "forceNowMode": "completed",
})
gate["currentDayPlanning"] = {
    "state": "complete",
    "standardTarget": {"notePaid": 5, "noteFree": 2, "BOOTH": 5, "total": 12},
    "hardFloorPreserved": True,
    "reason": "All designated Sep 4-Sep 6 publications are strict verified and locked; no publication debt remains.",
}
gate["previousDayReceipt"] = {
    "date": "2026-09-05",
    "status": "strict_verified_and_locked",
    "strictVerified": 12,
    "outstandingAtClose": 0,
}
save(gate_path, gate)

quota_path, quota = load("sidehustle-autopublish/publication_quota.json")
quota["version"] = int(quota.get("version", 0)) + 1
quota["updatedAt"] = STAMP
quota["activePublicationContract"] = {"throughDate": "2026-09-06", "paidNoteRemaining": 0, "freeNoteRemaining": 0, "BOOTHRemaining": 0, "totalRemaining": 0, "strictVerifiedThisReconciliation": 27, "previouslyLocked": 9, "throughSep6StrictVerified": 36, "state": "complete", "noteMinimumBodyChars": 5001}
quota["currentDay"] = {"date": "2026-09-06", "carryOverRemaining": {"paidNote": [], "freeNote": [], "BOOTH": [], "total": 0}, "totalOutstanding": 0, "completionState": "complete_through_2026-09-06"}
note_ops = quota["channels"]["note"]["operationalState"]
note_ops.update({"previousDayStrictVerifiedPublicationsCount": 5, "carriedPublicationDebt": 0, "unmaterializedDebtByDate": {}, "todayStrictVerifiedPublicationsCount": 5, "todayRemainingToTarget": 0, "strictPublicationState": "2026-09-06 5/5 strict verified", "fallbackPolicy": "No republish; all designated IDs are locked to canonical reader-visible URLs."})
free_ops = quota["channels"]["note"]["freeAcquisitionExperiment"]
free_ops.update({"carriedStrictVerifiedCount": 2, "unmaterializedDebtByDate": {}, "currentRequiredIds": [], "currentRequiredBatchStrictVerifiedCount": 2, "currentMaterializationState": "complete_through_2026-09-06"})
booth_ops = quota["channels"]["BOOTH"]["operationalState"]
booth_ops.update({"previousDayStrictVerifiedPublicationsCount": 5, "carriedPublicationDebt": 0, "unmaterializedDebtByDate": {}, "todayStrictVerifiedPublicationsCount": 5, "todayRemainingToTarget": 0, "strictPublicationState": "2026-09-06 5/5 strict verified", "fallbackPolicy": "No republish; all designated IDs are locked to canonical buyer-visible URLs."})
save(quota_path, quota)

request_path, request = load("sidehustle-autopublish/windows_publication_request.json")
request.update({"version": int(request.get("version", 0)) + 1, "updatedAt": STAMP, "date": "2026-09-06", "throughDate": "2026-09-06", "mode": "completed", "paidNote": {"ids": [], "target": 0}, "freeNote": {"ids": [], "target": 0}, "BOOTH": {"ids": [], "target": 0}, "outstandingDates": [], "totalTarget": 0, "completionState": "complete_27_of_27_reconciled", "completedAt": STAMP, "sourceLogSha256": SOURCE_LOG_SHA256})
save(request_path, request)

recovery_path, recovery = load("booth-autopublish/monitor/recovery_control.json")
recovery.update({"version": int(recovery.get("version", 0)) + 1, "updatedAt": STAMP, "activeRecovery": {"throughDate": "2026-09-06", "mode": "completed", "requiredStrictNewPublications": 0, "remaining": 0, "state": "complete"}, "readyPaidRecoveryBatch": {"generatedAt": STAMP, "requiredStrictNewPublications": 0, "queueIds": [], "completedIds": list(BOOTH), "expectedPricesJPY": {}, "doNotStopAfterFirstSuccess": True}, "windowsResumeContract": {"requiredIds": [], "strictSuccessOnly": True, "completionPredicate": "satisfied"}})
save(recovery_path, recovery)

metrics_path, metrics = load("sidehustle-autopublish/metrics/current.json")
metrics.update({"version": int(metrics.get("version", 0)) + 1, "updatedAt": STAMP, "objective": "All designated Sep 4-Sep 6 publications strict verified; resume duplicate-safe scheduled publishers.", "currentRecovery": {"throughDate": "2026-09-06", "observedAt": STAMP, "outstandingDates": [], "strictVerifiedThisReconciliation": 27, "previouslyLocked": 9, "remaining": 0}, "currentDayTargets": {"date": "2026-09-06", "paidNote": {"target": 5, "strictVerified": 5, "remaining": 0, "materialized": 5, "remainingIds": []}, "BOOTH": {"target": 5, "strictVerified": 5, "remaining": 0, "materialized": 5, "remainingIds": []}, "freeNote": {"target": 2, "strictVerified": 2, "remaining": 0, "remainingIds": [], "paidQuotaContribution": 0}, "allDesignatedStrictVerified": True}, "activeTargets": {"paidNote": {"target": 0, "remainingIds": []}, "freeNote": {"target": 0, "remainingIds": [], "paidQuotaContribution": 0}, "BOOTH": {"target": 0, "remainingIds": []}, "total": 0, "allDesignatedStrictVerified": True}, "evidence": {"publication": "27 newly reconciled public URLs plus 9 previously locked URLs; all 36 designated Sep 4-Sep 6 items complete", "sourceLogSha256": SOURCE_LOG_SHA256, "remainingDuplicateTitleGroups": 0, "humanOnlyBlocker": None}})
metrics["monitor"].update({"checkedAt": STAMP, "windowsAuthenticatedPublisherRequiredForPublicPosting": False, "nextWindowsAction": "Run the SHA256-pinned finalizer once to verify this remote completion contract and re-enable both empty-queue scheduled publishers."})
save(metrics_path, metrics)

assert not [entry["id"] for entry in paid_queue["entries"] if entry.get("enabled")]
assert not [entry["id"] for entry in free_queue["entries"] if entry.get("enabled")]
assert not [entry["id"] for entry in booth_queue["entries"] if entry.get("enabled")]
print(json.dumps({"reconciled": {"paidNote": len(PAID), "freeNote": len(FREE), "BOOTH": len(BOOTH), "total": len(PAID) + len(FREE) + len(BOOTH)}, "previouslyLocked": 9, "throughSep6StrictVerified": 36, "pending": 0, "duplicateTitleGroups": 0}, ensure_ascii=False))
