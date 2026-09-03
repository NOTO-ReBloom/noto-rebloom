#!/usr/bin/env python3
"""Reconcile Sep 2 public reality and activate Sep 2 carryover + Sep 3 queues."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
STAMP = "2026-09-03T16:25:00+09:00"
AUDITED_AT = "2026-09-03T16:18:00+09:00"
NONCE = "publish-20260902-carryover-20260903-now-v1"

SEP2_PAID = {
    "note_20260902_67_invoice_approval_cycle_control": "https://note.com/royal_lion645/n/n1a35c8d22d29",
    "note_20260902_68_monthly_close_exception_control": "https://note.com/royal_lion645/n/ne4584b4d6f3c",
    "note_20260902_69_knowledge_base_freshness_control": "https://note.com/royal_lion645/n/nb84aa678e686",
    "note_20260902_70_vendor_access_offboarding_control": "https://note.com/royal_lion645/n/n30bad25262de",
    "note_20260902_71_refund_aging_control": "https://note.com/royal_lion645/n/n6e00309ef43d",
}
SEP2_FREE = [
    "free_note_20260902_01_invoice_approval_delay_signals",
    "free_note_20260902_02_monthly_close_delay_signals",
]
SEP2_BOOTH = [
    "074_invoice_approval_cycle_os_20260902",
    "075_monthly_close_exception_os_20260902",
    "076_knowledge_base_freshness_os_20260902",
    "077_vendor_access_offboarding_os_20260902",
    "078_refund_aging_os_20260902",
]
SEP3_PAID = [
    "note_20260903_72_contract_signature_turnaround_control",
    "note_20260903_73_customer_master_duplicate_control",
    "note_20260903_74_postmortem_action_closure_control",
    "note_20260903_75_inventory_cycle_count_variance_control",
    "note_20260903_76_expense_receipt_completeness_control",
]
SEP3_FREE = [
    "free_note_20260903_01_contract_signature_delay_signals",
    "free_note_20260903_02_expense_receipt_missing_signals",
]
SEP3_BOOTH = [
    "079_contract_signature_turnaround_os_20260903",
    "080_customer_master_duplicate_control_os_20260903",
    "081_postmortem_action_closure_os_20260903",
    "082_inventory_cycle_count_variance_os_20260903",
    "083_expense_receipt_completeness_os_20260903",
]
ALL_FREE = SEP2_FREE + SEP3_FREE
ALL_BOOTH = SEP2_BOOTH + SEP3_BOOTH

DUPLICATE_CLEANUP = {
    "status": "pending_guarded_exact_id_cleanup",
    "plan": "sidehustle-autopublish/note/windows/note_duplicate_cleanup_plan_20260903.json",
    "script": "sidehustle-autopublish/note/windows/delete_duplicate_note_20260903.mjs",
    "duplicateTitleGroups": 3,
    "extraPagesToDelete": 3,
    "keeperUrls": [
        "https://note.com/royal_lion645/n/n1a35c8d22d29",
        "https://note.com/royal_lion645/n/ne4584b4d6f3c",
        "https://note.com/royal_lion645/n/nb84aa678e686",
    ],
    "deleteOnlyUrls": [
        "https://note.com/royal_lion645/n/ndd69a282fbc2",
        "https://note.com/royal_lion645/n/n0e9933e9c39a",
        "https://note.com/royal_lion645/n/n26fb9dba1c21",
    ],
    "safety": "Exact account, title, keeper and delete IDs are checked before each deletion.",
}


def load(path: str):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def save(path: str, value) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def by_id(entries):
    return {entry["id"]: entry for entry in entries}


def main() -> None:
    paid_path = "sidehustle-autopublish/note/queue/index.json"
    paid = load(paid_path)
    paid_entries = by_id(paid["entries"])
    for entry in paid["entries"]:
        entry["enabled"] = False
        entry["forceRetry"] = False
        entry["forcePublicationNow"] = False
    for item_id, url in SEP2_PAID.items():
        entry = paid_entries[item_id]
        entry.update(
            enabled=False,
            forceRetry=False,
            forcePublicationNow=False,
            publicUrlVerified=True,
            publicUrl=url,
            verificationState="reader_visible_verified",
            verificationEvidence=(
                "Independent anonymous public-page audit confirmed exact title, expected price, "
                "paid boundary, purchase path and dedicated cover."
            ),
            verifiedAt=AUDITED_AT,
            verificationMode="independent-public-browser-audit-20260903",
            duplicateCleanupRequired=item_id in set(list(SEP2_PAID)[:3]),
        )
    for item_id in SEP3_PAID:
        paid_entries[item_id].update(
            enabled=True,
            forceRetry=False,
            forcePublicationNow=True,
            forceRetryNonce=NONCE,
            prePublishReconcileRequired=True,
            recoveryMode="reconcile exact-title public pages first; publish only when absent; strict-verify afterward",
        )
    paid.update(
        updatedAt=STAMP,
        retryGeneration=max(int(paid.get("retryGeneration", 0)), 60),
        activePublicationDate="2026-09-03",
        forceAllCurrentDayNow=True,
        forceRetryNonce=NONCE,
        outstandingDates=["2026-09-03"],
        reconcileExistingBeforePublish=True,
        recoveryBatch={
            "mode": "publish_2026-09-03_paid_note_batch_after_sep2_reconciliation",
            "requiredStrictPublications": 5,
            "orderedIds": SEP3_PAID,
            "instruction": "Publish each exact title once; forceRetry stays false; count only strict reader-visible verification.",
            "strictChecks": ["readerVisibleUrl", "title", "price", "paidBoundary", "dedicatedCover"],
            "forcedAt": STAMP,
            "nonce": NONCE,
        },
    )
    save(paid_path, paid)

    for item_id, url in SEP2_PAID.items():
        entry = paid_entries[item_id]
        save(
            f"sidehustle-autopublish/note/publication_receipts/{item_id}.json",
            {
                "id": item_id,
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
                "verifiedAt": AUDITED_AT,
                "verificationMode": "independent-public-browser-audit-20260903",
            },
        )

    free_path = "sidehustle-autopublish/note/free_queue/index.json"
    free = load(free_path)
    free_entries = by_id(free["entries"])
    for entry in free["entries"]:
        entry["enabled"] = False
        entry["forceRetry"] = False
        entry["forcePublicationNow"] = False
    for item_id in ALL_FREE:
        free_entries[item_id].update(
            enabled=True,
            forceRetry=False,
            forcePublicationNow=True,
            forceRetryNonce=NONCE,
            prePublishReconcileRequired=True,
            recoveryMode="reconcile exact-title public pages first; publish only when absent; strict-verify afterward",
        )
    free.update(
        version=max(int(free.get("version", 0)), 25),
        retryGeneration=max(int(free.get("retryGeneration", 0)), 25),
        updatedAt=STAMP,
        activePublicationDate="2026-09-03",
        forceAllCurrentDayNow=True,
        forceRetryNonce=NONCE,
        sourceBatchPath="sidehustle-autopublish/note/free_drafts/2026-09-03_batch01.md",
        sourceBatchPaths=[
            "sidehustle-autopublish/note/free_drafts/2026-09-02_batch01.md",
            "sidehustle-autopublish/note/free_drafts/2026-09-03_batch01.md",
        ],
        reconcileExistingBeforePublish=True,
        activePriorityBatch={
            "mode": "sep2_carryover_then_sep3_current_day",
            "dateRange": ["2026-09-02", "2026-09-03"],
            "orderedIds": ALL_FREE,
            "requiredStrictPublications": 4,
            "carryOverFirst": True,
            "forceRetry": False,
            "duplicateRule": "One exact-title public page is reconciled; multiple exact-title pages stop the publisher.",
        },
    )
    save(free_path, free)

    booth_path = "booth-autopublish/queue/index.json"
    booth = load(booth_path)
    booth_entries = by_id(booth["entries"])
    for entry in booth["entries"]:
        entry["enabled"] = False
        entry["forceRetry"] = False
        entry["forcePublicationNow"] = False
    for item_id in ALL_BOOTH:
        booth_entries[item_id].update(
            enabled=True,
            forceRetry=False,
            forcePublicationNow=True,
            forceRetryNonce=NONCE,
            prePublishReconcileRequired=True,
            recoveryMode="reconcile exact-title public product first; publish only when absent; strict-verify afterward",
        )
    booth.update(
        updatedAt=STAMP,
        retryGeneration=max(int(booth.get("retryGeneration", 0)), 59),
        activePublicationDate="2026-09-03",
        forceAllCurrentDayNow=True,
        forceRetryNonce=NONCE,
        outstandingDates=["2026-09-02", "2026-09-03"],
        reconcileExistingBeforePublish=True,
    )
    save(booth_path, booth)

    recovery_path = "booth-autopublish/monitor/recovery_control.json"
    recovery = load(recovery_path)
    prices = {item_id: booth_entries[item_id]["expectedPriceJPY"] for item_id in ALL_BOOTH}
    recovery.update(
        version=max(int(recovery.get("version", 0)), 59),
        updatedAt=STAMP,
        activeRecovery={
            "date": "2026-09-03",
            "sourceDates": ["2026-09-02", "2026-09-03"],
            "mode": "sep2_carryover_then_current_day_paid_floor",
            "requiredStrictNewPublications": 10,
            "remaining": 10,
            "state": "ready",
        },
        readyPaidRecoveryBatch={
            "generatedAt": STAMP,
            "requiredStrictNewPublications": 10,
            "queueIds": ALL_BOOTH,
            "completedIds": [],
            "queueRetryGeneration": booth["retryGeneration"],
            "qaManifests": [
                "booth-autopublish/monitor/cloud_materialization_20260902_batch01.json",
                "booth-autopublish/monitor/cloud_materialization_20260903_batch01.json",
            ],
            "requiredBuyerChecks": ["buyerVisibleUrl", "exactTitle", "expectedPrice", "downloadableProductState", "purchaseOrCartPath"],
            "expectedPricesJPY": prices,
            "carryOverFirst": True,
            "doNotStopAfterFirstSuccess": True,
            "doNotReturnToLegacy009": True,
            "forceRetry": False,
            "forceRetryNonce": NONCE,
        },
        windowsResumeContract={
            "requiredIds": ALL_BOOTH,
            "firstPassOrder": ALL_BOOTH,
            "strictSuccessOnly": True,
            "completionPredicate": "all ten Sep 2 carryover and Sep 3 current-day IDs buyer-visible strict verified",
        },
    )
    save(recovery_path, recovery)

    gate_path = "sidehustle-autopublish/completion_gate.json"
    gate = load(gate_path)
    gate.update(
        version=max(int(gate.get("version", 0)), 47),
        updatedAt=STAMP,
        status="in_progress_5_of_24",
        date="2026-09-03",
        purpose="Finish Sep 2 carryover and all Sep 3 targets; count only strict public verification.",
        carryOver={
            "sourceDate": "2026-09-02",
            "requiredBeforeNewDayConsumption": True,
            "strictVerified": {"notePaid": list(SEP2_PAID), "noteFree": [], "BOOTH": [], "total": 5},
            "remaining": {"notePaid": [], "noteFree": SEP2_FREE, "BOOTH": SEP2_BOOTH, "total": 7},
        },
        completionConditions={
            "notePaid": {"date": "2026-09-03", "dailyStrictTarget": 5, "requiredIds": SEP3_PAID, "strictChecks": ["readerVisibleUrl", "exactTitle", "expectedPrice", "paidBoundary", "dedicatedCover"]},
            "noteFree": {"dateRange": ["2026-09-02", "2026-09-03"], "strictTarget": 4, "requiredIds": ALL_FREE, "strictChecks": ["readerVisibleUrl", "exactTitle", "freeState", "dedicatedCover"], "paidQuotaContribution": 0},
            "BOOTH": {"dateRange": ["2026-09-02", "2026-09-03"], "strictTarget": 10, "requiredIds": ALL_BOOTH, "strictChecks": ["buyerVisibleUrl", "exactTitle", "expectedPrice", "downloadableProductState", "purchaseOrCartPath"]},
        },
        completionCounts={
            "todayNotePaid": 0, "todayNoteFree": 0, "todayBOOTH": 0, "todayTotal": 0,
            "carryOverStrictVerified": 5, "carryOverRemaining": 7, "requiredToday": 12,
            "strictVerifiedTotal": 5, "totalOutstanding": 19,
        },
        planningManifest=[
            "sidehustle-autopublish/planning/2026-09-02_batch01.json",
            "sidehustle-autopublish/planning/2026-09-03_batch01.json",
        ],
        materializationState="complete_24_materialized_5_verified_19_pending",
        materializationEvidence={
            "paid": ["sidehustle-autopublish/note/staging/materialization_20260902_batch01.json", "sidehustle-autopublish/note/staging/materialization_20260903_batch01.json"],
            "free": ["sidehustle-autopublish/note/free_drafts/2026-09-02_batch01.md", "sidehustle-autopublish/note/free_drafts/2026-09-03_batch01.md"],
            "booth": ["booth-autopublish/monitor/cloud_materialization_20260902_batch01.json", "booth-autopublish/monitor/cloud_materialization_20260903_batch01.json"],
            "windowsRequest": "sidehustle-autopublish/windows_publication_request.json",
            "qaPassed": True,
            "reconciledAt": AUDITED_AT,
        },
        duplicateControl={
            "policy": "Reconcile exact-title public pages before publishing; never retry a verified title; block on ambiguous multiples.",
            "knownCleanup": DUPLICATE_CLEANUP,
            "freePublisherGuardVersion": 2,
        },
        previousDayReceipt={
            "date": "2026-09-02",
            "status": "partial_5_of_12_strict_verified",
            "strictVerified": 5,
            "outstanding": 7,
            "paidCanonicalUrls": SEP2_PAID,
        },
        executionRequestedAt=STAMP,
        executionNonce=NONCE,
        completedAt=None,
        completionEvidence=None,
        forceNowRequested=True,
        forceNowMode="cleanup_known_duplicates_then_carryover_first_then_current_day_with_exact_title_reconciliation",
    )
    gate.setdefault("executionPolicy", {})["newDayQueueSafety"] = "Sep 2 paid is locked as verified; consume only Sep 2 free/BOOTH carryover, then Sep 3 targets."
    save(gate_path, gate)

    quota_path = "sidehustle-autopublish/publication_quota.json"
    quota = load(quota_path)
    quota.update(version=max(int(quota.get("version", 0)), 73), updatedAt=STAMP)
    note_state = quota["channels"]["note"]["operationalState"]
    note_state.update(
        date="2026-09-03", previousDate="2026-09-02", previousDayStrictVerifiedPublicationsCount=5,
        carriedPublicationDebt=0, carriedRequiredIds=[], todayStrictVerifiedPublicationsCount=0,
        dailyPublicTarget=5, todayRemainingToTarget=5,
        planningManifest="sidehustle-autopublish/planning/2026-09-03_batch01.json",
        preparedIds=SEP3_PAID, materializationManifest="sidehustle-autopublish/note/staging/materialization_20260903_batch01.json",
        strictPublicationState="2026-09-03 0/5 strict verified; 2026-09-02 5/5 locked",
        fallbackPolicy="Process only enabled Sep 3 paid IDs; exact-title reconcile before publish; never republish Sep 2 verified items.",
        lastStrictVerificationAt=AUDITED_AT, lastStrictVerifiedIds=list(SEP2_PAID),
    )
    free_state = quota["channels"]["note"]["freeAcquisitionExperiment"]
    free_state.update(
        carriedPreviousDayRequiredIds=SEP2_FREE, carriedPreviousDayStrictVerifiedCount=0,
        currentRequiredIds=SEP3_FREE, currentRequiredBatchStrictVerifiedCount=0,
        currentMaterializationState="sep2_and_sep3_complete_4_pending",
        currentCompletedDraftBatch="sidehustle-autopublish/note/free_drafts/2026-09-03_batch01.md",
        currentCompletedDraftCount=2,
        duplicateCleanup=DUPLICATE_CLEANUP,
    )
    booth_state = quota["channels"]["BOOTH"]["operationalState"]
    booth_state.update(
        date="2026-09-03", previousDate="2026-09-02", previousDayStrictVerifiedPublicationsCount=0,
        carriedPublicationDebt=5, carriedRequiredIds=SEP2_BOOTH, todayStrictVerifiedPublicationsCount=0,
        dailyPublicTarget=5, todayRemainingToTarget=5,
        planningManifest="sidehustle-autopublish/planning/2026-09-03_batch01.json",
        preparedIds=SEP3_BOOTH, materializationManifest="booth-autopublish/monitor/cloud_materialization_20260903_batch01.json",
        queueRetryGeneration=booth["retryGeneration"], strictPublicationState="2026-09-02 0/5 and 2026-09-03 0/5 strict verified",
        fallbackPolicy="Publish Sep 2 carryover first, then Sep 3; exact-title reconcile before every publish.",
        lastStrictVerificationAt=AUDITED_AT, lastStrictVerifiedIds=[],
    )
    quota["currentDay"] = {
        "date": "2026-09-03",
        "standardNewTarget": {"paidNOTE": 5, "freeNOTE": 2, "BOOTH": 5, "total": 12},
        "carryOverFrom20260902": {"paidNOTE": 0, "freeNOTE": 2, "BOOTH": 5, "total": 7},
        "strictVerifiedAtRollover": 5,
        "carryOverRemaining": 7,
        "currentDayStrictVerified": 0,
        "totalOutstanding": 19,
        "priority": "Sep 2 free/BOOTH carryover first, then all Sep 3 targets.",
        "completionState": "in_progress_5_of_24",
    }
    save(quota_path, quota)

    metrics_path = "sidehustle-autopublish/metrics/current.json"
    metrics = load(metrics_path)
    metrics.update(
        version=max(int(metrics.get("version", 0)), 50), updatedAt=STAMP,
        objective="Finish 7 Sep 2 carryover publications and all 12 Sep 3 publications without adding duplicate NOTE titles.",
        currentRecovery={
            "date": "2026-09-03", "observedAt": AUDITED_AT, "previousDate": "2026-09-02",
            "previousDayPaidNoteStrictVerified": "5/5", "previousDayFreeNoteStrictVerified": "0/2",
            "previousDayBoothStrictVerified": "0/5", "carriedPaidDebt": 0, "carriedFreeDebt": 2,
            "carriedBoothDebt": 5, "carriedTotalDebt": 7,
        },
        currentDayTargets={
            "date": "2026-09-03",
            "paidNote": {"target": 5, "strictVerified": 0, "remaining": 5, "materialized": 5, "remainingIds": SEP3_PAID},
            "freeNote": {"targetIncludingCarryover": 4, "strictVerified": 0, "remaining": 4, "remainingIds": ALL_FREE, "paidQuotaContribution": 0},
            "BOOTH": {"targetIncludingCarryover": 10, "strictVerified": 0, "remaining": 10, "materialized": 10, "remainingIds": ALL_BOOTH},
            "allDesignatedStrictVerified": False, "totalOutstanding": 19,
        },
        evidence={
            "paidNote": "Sep 2 5/5 independently verified and locked; Sep 3 five encrypted payloads materialized.",
            "freeNote": "Sep 2 and Sep 3 four manuscripts queued; none yet observed publicly.",
            "BOOTH": "Sep 2 and Sep 3 ten encrypted products queued; none yet observed publicly.",
            "duplicateCleanup": DUPLICATE_CLEANUP,
            "humanOnlyBlocker": None,
        },
    )
    metrics.setdefault("authoritativeSources", {})["noteMaterialization"] = [
        "sidehustle-autopublish/note/staging/materialization_20260902_batch01.json",
        "sidehustle-autopublish/note/staging/materialization_20260903_batch01.json",
    ]
    metrics["authoritativeSources"]["boothMaterialization"] = [
        "booth-autopublish/monitor/cloud_materialization_20260902_batch01.json",
        "booth-autopublish/monitor/cloud_materialization_20260903_batch01.json",
    ]
    save(metrics_path, metrics)

    request = {
        "version": 2, "updatedAt": STAMP, "date": "2026-09-03",
        "sourceDates": ["2026-09-02", "2026-09-03"],
        "mode": "delete_known_duplicates_then_publish_sep2_carryover_and_all_sep3_now",
        "paidNote": {"ids": SEP3_PAID, "target": 5, "alreadyVerifiedSep2Ids": list(SEP2_PAID)},
        "freeNote": {"ids": ALL_FREE, "target": 4, "carryOverIds": SEP2_FREE},
        "BOOTH": {"ids": ALL_BOOTH, "target": 10, "carryOverIds": SEP2_BOOTH},
        "totalPublicationTarget": 19, "carryOverFirst": True,
        "duplicateCleanup": DUPLICATE_CLEANUP,
        "strictVerificationRequired": True, "exactTitleReconciliationRequired": True,
        "forceRetry": False, "doNotStopAfterFirstSuccess": True,
    }
    save("sidehustle-autopublish/windows_publication_request.json", request)

    sep2_plan_path = "sidehustle-autopublish/planning/2026-09-02_batch01.json"
    sep2_plan = load(sep2_plan_path)
    sep2_plan.update(
        status="partial_strict_verified_paid_5_remaining_free2_booth5",
        materialization={"paid": True, "free": True, "booth": True, "queueQA": True},
        strictVerified={"paid": 5, "free": 0, "booth": 0, "total": 5},
        remaining={"paid": [], "free": SEP2_FREE, "booth": SEP2_BOOTH, "total": 7},
        canonicalPaidUrls=SEP2_PAID, reconciledAt=AUDITED_AT,
    )
    save(sep2_plan_path, sep2_plan)

    sep3_plan_path = "sidehustle-autopublish/planning/2026-09-03_batch01.json"
    sep3_plan = load(sep3_plan_path)
    sep3_plan.update(
        state="materialized_queued_pending_strict_verification",
        activationRule="Active after Sep 2 public reconciliation; carryover free/BOOTH is consumed first.",
        materialization={
            "paid": "sidehustle-autopublish/note/staging/materialization_20260903_batch01.json",
            "free": "sidehustle-autopublish/note/free_drafts/2026-09-03_batch01.md",
            "BOOTH": "booth-autopublish/monitor/cloud_materialization_20260903_batch01.json",
            "queueQA": True,
        },
        strictVerified={"paid": 0, "free": 0, "booth": 0, "total": 0},
        remaining={"paid": SEP3_PAID, "free": SEP3_FREE, "BOOTH": SEP3_BOOTH, "total": 12},
        activatedAt=STAMP,
    )
    save(sep3_plan_path, sep3_plan)

    for path in [
        "sidehustle-autopublish/note/staging/materialization_20260903_batch01.json",
        "booth-autopublish/monitor/cloud_materialization_20260903_batch01.json",
    ]:
        manifest = load(path)
        manifest["publicationStatus"] = "active_queued_not_counted_until_strict_public_verification"
        if isinstance(manifest.get("qa"), dict):
            manifest["qa"]["queueEnabled"] = True
            manifest["qa"]["publicationStatus"] = manifest["publicationStatus"]
        save(path, manifest)

    print("ACTIVATION_OK paid_active=5 free_active=4 booth_active=10 sep2_paid_verified=5 outstanding=19")


if __name__ == "__main__":
    main()
