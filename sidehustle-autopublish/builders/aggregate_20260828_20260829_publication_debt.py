from pathlib import Path
from datetime import datetime, timedelta, timezone
import json

ROOT = Path(__file__).resolve().parents[2]
BASE = Path(__file__).resolve().parent
JST = timezone(timedelta(hours=9))
stamp = datetime.now(JST).replace(microsecond=0).isoformat()
nonce = datetime.now(JST).strftime("%Y%m%dT%H%M%S+0900")


def load(path):
    return json.loads(path.read_text("utf-8-sig"))


def save(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), "utf-8")


aug28 = load(BASE / "daily_plan_20260828.json")
aug29 = load(BASE / "daily_plan_20260829.json")
paid28 = [x["id"] for x in aug28["paid"]]
free28 = [x["id"] for x in aug28["free"]]
booth28 = [x["id"] for x in aug28["booth"]]
paid29 = [x["id"] for x in aug29["paid"]]
free29 = [x["id"] for x in aug29["free"]]
booth29 = [x["id"] for x in aug29["booth"]]
paid_all = paid28 + paid29
free_all = free28 + free29
booth_all = booth28 + booth29

# Paid NOTE remote queue: carried Aug 28 first, then Aug 29.
note_path = ROOT / "sidehustle-autopublish/note/queue/index.json"
note = load(note_path)
for entry in note["entries"]:
    active = entry.get("id") in paid_all
    entry["enabled"] = active
    entry["forceRetry"] = active
note["updatedAt"] = stamp
note["retryGeneration"] = int(note.get("retryGeneration", 0)) + 1
note["recoveryBatch"] = {
    "mode": "publish_aug28_carryover_then_aug29_paid_note_now",
    "requiredStrictPublications": 10,
    "orderedIds": paid_all,
    "instruction": "Publish all ten in order; discover exact-title public pages before retry; switch after brief recoverable failure; count only strict reader verification.",
    "strictChecks": ["readerVisibleUrl", "title", "price", "paidBoundary", "dedicatedCover"],
    "forcedAt": stamp,
    "nonce": f"paid-note-20260828-20260829-{nonce}",
}
note["activePublicationDate"] = "2026-08-29"
note["forceAllCurrentDayNow"] = True
note["outstandingDates"] = ["2026-08-28", "2026-08-29"]
save(note_path, note)

# Free NOTE queue: publish four manuscripts, while keeping every historical item disabled.
free_path = ROOT / "sidehustle-autopublish/note/free_queue/index.json"
fq = load(free_path)
for entry in fq["entries"]:
    active = entry.get("id") in free_all
    entry["enabled"] = active
    entry["forceRetry"] = False
fq["version"] = int(fq.get("version", 1)) + 1
fq["updatedAt"] = stamp
fq["sourceBatchPaths"] = [
    "sidehustle-autopublish/note/free_drafts/2026-08-28_batch01.md",
    "sidehustle-autopublish/note/free_drafts/2026-08-29_batch01.md",
]
fq["activePriorityBatch"] = {
    "dateRange": ["2026-08-28", "2026-08-29"],
    "ids": free_all,
    "requiredStrictPublications": 4,
    "carryOverFirst": True,
}
fq["activePublicationDate"] = "2026-08-29"
fq["forceAllCurrentDayNow"] = True
save(free_path, fq)

# BOOTH queue and recovery controls.
booth_path = ROOT / "booth-autopublish/queue/index.json"
bq = load(booth_path)
price_map = {x["id"]: x["price"] for x in aug28["booth"] + aug29["booth"]}
for entry in bq["entries"]:
    active = entry.get("id") in booth_all
    entry["enabled"] = active
    entry["forceRetry"] = active
bq["updatedAt"] = stamp
bq["retryGeneration"] = int(bq.get("retryGeneration", 0)) + 1
bq["activePublicationDate"] = "2026-08-29"
bq["outstandingDates"] = ["2026-08-28", "2026-08-29"]
save(booth_path, bq)

recovery_path = ROOT / "booth-autopublish/monitor/recovery_control.json"
recovery = load(recovery_path)
recovery["version"] = int(recovery.get("version", 0)) + 1
recovery["updatedAt"] = stamp
recovery["activeRecovery"] = {
    "date": "2026-08-29",
    "sourceDates": ["2026-08-28", "2026-08-29"],
    "mode": "carryover_then_current_day_paid_floor",
    "requiredStrictNewPublications": 10,
    "remaining": 10,
    "state": "ready",
}
recovery["readyPaidRecoveryBatch"] = {
    "generatedAt": stamp,
    "requiredStrictNewPublications": 10,
    "queueIds": booth_all,
    "completedIds": [],
    "queueRetryGeneration": bq["retryGeneration"],
    "qaManifests": [
        "booth-autopublish/monitor/cloud_materialization_20260828_batch01.json",
        "booth-autopublish/monitor/cloud_materialization_20260829_batch01.json",
    ],
    "requiredBuyerChecks": ["buyerVisibleUrl", "exactTitle", "expectedPrice", "downloadableProductState", "purchaseOrCartPath"],
    "expectedPricesJPY": price_map,
    "doNotStopAfterFirstSuccess": True,
    "forceRetryNonce": f"booth-20260828-20260829-{nonce}",
}
recovery["windowsResumeContract"] = {
    "requiredIds": booth_all,
    "firstPassOrder": booth_all,
    "strictSuccessOnly": True,
    "completionPredicate": "all ten Aug 28-29 IDs buyer-visible strict verified",
}
save(recovery_path, recovery)

# Current completion gate: 12 carried items plus 12 current-day items.
gate_path = ROOT / "sidehustle-autopublish/completion_gate.json"
gate = load(gate_path)
gate["version"] = int(gate.get("version", 0)) + 1
gate["updatedAt"] = stamp
gate["status"] = "in_progress_0_of_24"
gate["date"] = "2026-08-29"
gate["purpose"] = "Complete only after all carried Aug 28 obligations and all designated Aug 29 publications are strict verified."
gate["carryOver"] = {
    "sourceDate": "2026-08-28",
    "requiredBeforeNewDayConsumption": True,
    "remaining": {"notePaid": paid28, "noteFree": free28, "BOOTH": booth28, "total": 12},
}
gate["completionConditions"] = {
    "notePaid": {"date": "2026-08-29", "dailyStrictTarget": 5, "requiredIds": paid29, "strictChecks": ["readerVisibleUrl", "exactTitle", "expectedPrice", "paidBoundary", "dedicatedCover"]},
    "BOOTH": {"date": "2026-08-29", "dailyStrictTarget": 5, "requiredIds": booth29, "strictChecks": ["buyerVisibleUrl", "exactTitle", "expectedPrice", "downloadableProductState", "purchaseOrCartPath"]},
    "noteFree": {"date": "2026-08-29", "dailyStrictTarget": 2, "requiredIds": free29, "strictChecks": ["readerVisibleUrl", "exactTitle", "freeState", "dedicatedCover"], "paidQuotaContribution": 0},
}
gate["completionCounts"] = {"todayNotePaid": 0, "todayNoteFree": 0, "todayBOOTH": 0, "todayTotal": 0, "carryOverRemaining": 12, "requiredToday": 12, "totalOutstanding": 24}
gate["planningManifests"] = ["sidehustle-autopublish/planning/2026-08-28_batch01.json", "sidehustle-autopublish/planning/2026-08-29_batch01.json"]
gate["materializationState"] = "both_days_complete_and_queue_qa_passed"
gate["executionRequestedAt"] = stamp
gate["executionNonce"] = f"publish-aug28-aug29-all24-{nonce}"
gate["completedAt"] = None
gate["completionEvidence"] = None
save(gate_path, gate)

# Quota and metrics retain the Aug 28 debt while marking both days materialized.
quota_path = ROOT / "sidehustle-autopublish/publication_quota.json"
quota = load(quota_path)
quota["version"] = int(quota.get("version", 0)) + 1
quota["updatedAt"] = stamp
note_state = quota["channels"]["note"]["operationalState"]
note_state.update({
    "date": "2026-08-29", "previousDate": "2026-08-28", "previousDayStrictVerifiedPublicationsCount": 0,
    "carriedPublicationDebt": 5, "carriedRequiredIds": paid28, "todayStrictVerifiedPublicationsCount": 0,
    "dailyPublicTarget": 5, "todayRemainingToTarget": 5, "totalVerifiedPublicationsRequiredBeforeDaySatisfied": 10,
    "paidProductionInventoryComplete": True, "planningManifest": "sidehustle-autopublish/planning/2026-08-29_batch01.json",
    "preparedIds": paid29, "queueMaterializationState": "complete_both_days",
    "materializationManifests": ["sidehustle-autopublish/note/staging/materialization_20260828_batch01.json", "sidehustle-autopublish/note/staging/materialization_20260829_batch01.json"],
    "strictPublicationState": "2026-08-29 0/5 strict verified; Aug 28 debt 5",
    "fallbackPolicy": "Consume enabled Aug 28 paid NOTE IDs first, then Aug 29; reconcile exact-title public pages before every retry.",
})
free_state = quota["channels"]["note"]["freeAcquisitionExperiment"]
free_state.update({
    "carriedPreviousDayRequiredIds": free28, "carriedPreviousDayStrictVerifiedCount": 0,
    "currentRequiredIds": free29, "currentRequiredBatchStrictVerifiedCount": 0,
    "currentMaterializationState": "complete_both_days",
    "currentCompletedDraftBatch": "sidehustle-autopublish/note/free_drafts/2026-08-29_batch01.md",
    "currentCompletedDraftCount": 2,
})
booth_state = quota["channels"]["BOOTH"]["operationalState"]
booth_state.update({
    "date": "2026-08-29", "previousDate": "2026-08-28", "previousDayStrictVerifiedPublicationsCount": 0,
    "carriedPublicationDebt": 5, "carriedRequiredIds": booth28, "todayStrictVerifiedPublicationsCount": 0,
    "dailyPublicTarget": 5, "todayRemainingToTarget": 5, "totalVerifiedPublicationsRequiredBeforeDaySatisfied": 10,
    "paidProductionInventoryComplete": True, "planningManifest": "sidehustle-autopublish/planning/2026-08-29_batch01.json",
    "preparedIds": booth29, "materializationState": "complete_both_days", "queueRetryGeneration": bq["retryGeneration"],
    "materializationManifests": ["booth-autopublish/monitor/cloud_materialization_20260828_batch01.json", "booth-autopublish/monitor/cloud_materialization_20260829_batch01.json"],
    "strictPublicationState": "2026-08-29 0/5 strict verified; Aug 28 debt 5",
    "fallbackPolicy": "Consume enabled Aug 28 BOOTH IDs first, then Aug 29; reconcile exact-title buyer-visible pages before every retry.",
})
quota["currentDay"] = {
    "date": "2026-08-29",
    "standardNewTarget": {"paidNOTE": 5, "freeNOTE": 2, "BOOTH": 5, "total": 12},
    "carryOverFrom20260828": {"paidNOTE": 5, "freeNOTE": 2, "BOOTH": 5, "total": 12},
    "strictVerifiedAtRollover": 0, "strictVerifiedAfterRollover": 0, "carryOverRemaining": 12,
    "totalStrictObligationsBeforeDaySatisfied": 24,
    "priority": "strict-publish Aug 28 carryover first, then Aug 29 targets",
    "currentDayStrictVerified": 0, "completionState": "pending_0_of_24",
}
save(quota_path, quota)

metrics_path = ROOT / "sidehustle-autopublish/metrics/current.json"
metrics = load(metrics_path)
metrics["version"] = int(metrics.get("version", 0)) + 1
metrics["updatedAt"] = stamp
metrics["currentRecovery"] = {"date": "2026-08-29", "observedAt": stamp, "previousDate": "2026-08-28", "previousDayPaidNoteStrictVerified": "0/5", "previousDayBoothStrictVerified": "0/5", "previousDayFreeNoteStrictVerified": "0/2", "carriedTotalDebt": 12}
metrics["currentDayTargets"] = {
    "date": "2026-08-29",
    "paidNote": {"target": 10, "strictVerified": 0, "remaining": 10, "materialized": 10, "remainingIds": paid_all},
    "BOOTH": {"target": 10, "strictVerified": 0, "remaining": 10, "materialized": 10, "remainingIds": booth_all},
    "freeNote": {"target": 4, "strictVerified": 0, "remaining": 4, "materialized": 4, "remainingIds": free_all, "paidQuotaContribution": 0},
    "allDesignatedStrictVerified": False,
}
metrics["evidence"] = {"paidNote": "10 encrypted payloads materialized; no public count yet", "BOOTH": "10 encrypted product payloads materialized; no public count yet", "freeNote": "4 manuscripts queued; no public count yet", "humanOnlyBlocker": None}
save(metrics_path, metrics)

request_path = ROOT / "sidehustle-autopublish/windows_publication_request.json"
save(request_path, {
    "version": 2, "updatedAt": stamp, "date": "2026-08-29", "sourceDates": ["2026-08-28", "2026-08-29"],
    "mode": "publish_all_outstanding_now", "paidNote": {"ids": paid_all, "target": 10},
    "freeNote": {"ids": free_all, "target": 4}, "BOOTH": {"ids": booth_all, "target": 10},
    "totalTarget": 24, "strictVerificationRequired": True, "carryOverFirst": True,
    "discoverExactTitleBeforeRetry": True, "doNotStopAfterFirstSuccess": True,
})

# Planning records.
plan28_path = ROOT / "sidehustle-autopublish/planning/2026-08-28_batch01.json"
plan28 = load(plan28_path)
plan28["status"] = "materialized_queued_pending_strict_publication"
plan28["materialization"] = {"paid": True, "free": True, "booth": True, "queueQA": True}
plan28["materializedAt"] = stamp
save(plan28_path, plan28)

plan29_path = ROOT / "sidehustle-autopublish/planning/2026-08-29_batch01.json"
save(plan29_path, {
    "version": 1, "createdAt": stamp, "date": "2026-08-29", "dateId": "20260829",
    "previousDate": "2026-08-28", "status": "materialized_queued_pending_strict_publication",
    "carryOver": {"paidNOTE": 5, "freeNOTE": 2, "BOOTH": 5, "total": 12},
    "paid": [{"id": x["id"], "title": x["title"], "price": x["price"]} for x in aug29["paid"]],
    "free": [{"id": x["id"], "title": x["title"], "pairedPaidId": x["paired"]} for x in aug29["free"]],
    "booth": [{"id": x["id"], "title": x["title"], "price": x["price"]} for x in aug29["booth"]],
    "qualityPolicy": {"noExactPublicTitleDuplicates": True, "paidBodiesOver900Chars": True, "boothReusableEditableAssets": True, "dedicatedCoverRequired": True, "publicStrictVerificationRequired": True},
    "materialization": {"paid": True, "free": True, "booth": True, "queueQA": True},
})

assert sum(1 for x in note["entries"] if x.get("enabled")) == 10
assert sum(1 for x in fq["entries"] if x.get("enabled")) == 4
assert sum(1 for x in bq["entries"] if x.get("enabled")) == 10
print(json.dumps({"updatedAt": stamp, "paidNote": len(paid_all), "freeNote": len(free_all), "BOOTH": len(booth_all), "total": 24}, ensure_ascii=False))
