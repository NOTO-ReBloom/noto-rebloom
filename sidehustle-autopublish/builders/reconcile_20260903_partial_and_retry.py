#!/usr/bin/env python3
"""Reconcile verified Sep 3 publications and activate only the nine missing carryover items."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
STAMP = "2026-09-03T17:06:18+09:00"
NONCE = "verified-residual-20260903-v2"
SOURCE_LOG_SHA256 = "cbd9245fdeeb05272584b9b5c08ef9e9739d717d961bd7ade878882e02c9760e"

PAID_VERIFIED = {
    "note_20260903_72_contract_signature_turnaround_control": "https://note.com/royal_lion645/n/n94a96110400c",
    "note_20260903_73_customer_master_duplicate_control": "https://note.com/royal_lion645/n/n9782796e2857",
    "note_20260903_74_postmortem_action_closure_control": "https://note.com/royal_lion645/n/nd0b530562745",
    "note_20260903_75_inventory_cycle_count_variance_control": "https://note.com/royal_lion645/n/n4f1f5e12ef5e",
    "note_20260903_76_expense_receipt_completeness_control": "https://note.com/royal_lion645/n/nfa5ad51667e5",
}

FREE_PENDING = [
    "free_note_20260902_01_invoice_approval_delay_signals",
    "free_note_20260902_02_monthly_close_delay_signals",
    "free_note_20260903_01_contract_signature_delay_signals",
    "free_note_20260903_02_expense_receipt_missing_signals",
]

BOOTH_PENDING = [
    "074_invoice_approval_cycle_os_20260902",
    "075_monthly_close_exception_os_20260902",
    "076_knowledge_base_freshness_os_20260902",
    "077_vendor_access_offboarding_os_20260902",
    "078_refund_aging_os_20260902",
]

BOOTH_VERIFIED = {
    "079_contract_signature_turnaround_os_20260903": ("8801001", "https://booth.pm/ja/items/8801001", "2026-09-03T16:50:56.224+09:00"),
    "080_customer_master_duplicate_control_os_20260903": ("8801006", "https://booth.pm/ja/items/8801006", "2026-09-03T16:51:35.174+09:00"),
    "081_postmortem_action_closure_os_20260903": ("8801009", "https://booth.pm/ja/items/8801009", "2026-09-03T16:52:17.766+09:00"),
    "082_inventory_cycle_count_variance_os_20260903": ("8801015", "https://booth.pm/ja/items/8801015", "2026-09-03T16:53:04.823+09:00"),
    "083_expense_receipt_completeness_os_20260903": ("8801018", "https://booth.pm/ja/items/8801018", "2026-09-03T16:53:55.105+09:00"),
}


def read(rel: str) -> dict:
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


def write(rel: str, value: dict) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def by_id(entries: list[dict], key: str = "id") -> dict[str, dict]:
    return {entry[key]: entry for entry in entries}


paid = read("sidehustle-autopublish/note/queue/index.json")
paid_map = by_id(paid["entries"])
for queue_id, url in PAID_VERIFIED.items():
    entry = paid_map[queue_id]
    entry.update(
        enabled=False,
        forceRetry=False,
        forcePublicationNow=False,
        recoveryMode="completed; preserve canonical public URL and do not republish",
        publicUrlVerified=True,
        publicUrl=url,
        verificationState="reader_visible_verified",
        verifiedAt=STAMP,
    )
    receipt = {
        "id": queue_id,
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
        "verifiedAt": STAMP,
        "verificationMode": "independent-public-browser-audit-20260903",
    }
    write(f"sidehustle-autopublish/note/publication_receipts/{queue_id}.json", receipt)
paid.update(
    updatedAt=STAMP,
    forceAllCurrentDayNow=False,
    outstandingDates=[],
    recoveryBatch={
        "mode": "completed_2026-09-03_paid_note_batch",
        "requiredStrictPublications": 5,
        "completedIds": list(PAID_VERIFIED),
        "remainingIds": [],
        "verifiedAt": STAMP,
        "instruction": "Preserve the five canonical URLs; do not republish.",
    },
)
write("sidehustle-autopublish/note/queue/index.json", paid)

free = read("sidehustle-autopublish/note/free_queue/index.json")
free_map = by_id(free["entries"])
for queue_id in FREE_PENDING:
    entry = free_map[queue_id]
    entry.update(
        enabled=True,
        forceRetry=True,
        forceRetryNonce=NONCE,
        forcePublicationNow=True,
        prePublishReconcileRequired=True,
        recoveryMode="exact-title public absence independently confirmed; retry with duplicate-safe precheck and strict verification",
    )
free.update(
    updatedAt=STAMP,
    retryGeneration=max(int(free.get("retryGeneration", 0)), 27),
    activePublicationDate="2026-09-03",
    forceAllCurrentDayNow=True,
    forceRetryNonce=NONCE,
    activePriorityBatch={
        "mode": "verified_missing_sep2_and_sep3_free_only",
        "dateRange": ["2026-09-02", "2026-09-03"],
        "orderedIds": FREE_PENDING,
        "requiredStrictPublications": 4,
        "carryOverFirst": True,
        "forceRetry": True,
        "forceRetryNonce": NONCE,
        "duplicateRule": "Exact-title API precheck reconciles one public page and blocks ambiguous multiples before editor creation.",
    },
)
write("sidehustle-autopublish/note/free_queue/index.json", free)

booth = read("booth-autopublish/queue/index.json")
booth_map = by_id(booth["entries"])
for queue_id, (_, url, verified_at) in BOOTH_VERIFIED.items():
    booth_map[queue_id].update(
        enabled=False,
        forceRetry=False,
        forcePublicationNow=False,
        recoveryMode="completed; preserve canonical public URL and do not republish",
        publicUrlVerified=True,
        publicUrl=url,
        verificationState="buyer_visible_verified",
        verifiedAt=verified_at,
    )
for queue_id in BOOTH_PENDING:
    booth_map[queue_id].update(
        enabled=True,
        forceRetry=True,
        forceRetryNonce=NONCE,
        forcePublicationNow=True,
        prePublishReconcileRequired=True,
        recoveryMode="buyer-visible exact-title absence independently confirmed; retry once with strict public verification",
    )
booth.update(
    updatedAt=STAMP,
    retryGeneration=max(int(booth.get("retryGeneration", 0)), 62),
    activePublicationDate="2026-09-02",
    forceAllCurrentDayNow=True,
    forceRetryNonce=NONCE,
    outstandingDates=["2026-09-02"],
)
write("booth-autopublish/queue/index.json", booth)

ledger = read("booth-autopublish/monitor/publication_ledger.json")
ledger_by_id = by_id(ledger["entries"], "queueId")
for queue_id, (item_id, url, verified_at) in BOOTH_VERIFIED.items():
    entry = booth_map[queue_id]
    ledger_by_id[queue_id] = {
        "queueId": queue_id,
        "title": entry["title"],
        "boothItemId": item_id,
        "publicUrl": url,
        "publicUrlVerified": True,
        "expectedPriceJPY": entry["expectedPriceJPY"],
        "verifiedAt": verified_at,
        "verificationEvidence": "Windows publisher buyer-browser verification and independent public browser audit confirmed exact title, expected price and purchase path.",
        "publishMode": "sep2-carryover-sep3-now-v1",
        "sourceLogSha256": SOURCE_LOG_SHA256,
    }
ledger["entries"] = list(ledger_by_id.values())
ledger["updatedAt"] = STAMP
write("booth-autopublish/monitor/publication_ledger.json", ledger)

control = read("booth-autopublish/monitor/recovery_control.json")
control.update(updatedAt=STAMP, version=max(int(control.get("version", 0)), 62))
control["activeRecovery"] = {
    "date": "2026-09-03",
    "sourceDates": ["2026-09-02"],
    "mode": "verified_missing_sep2_booth_only",
    "requiredStrictNewPublications": 5,
    "remaining": 5,
    "state": "ready",
}
control["readyPaidRecoveryBatch"] = {
    "generatedAt": STAMP,
    "requiredStrictNewPublications": 5,
    "queueIds": BOOTH_PENDING,
    "completedIds": list(BOOTH_VERIFIED),
    "queueRetryGeneration": booth["retryGeneration"],
    "qaManifests": ["booth-autopublish/monitor/cloud_materialization_20260902_batch01.json"],
    "requiredBuyerChecks": ["buyerVisibleUrl", "exactTitle", "expectedPrice", "downloadableProductState", "purchaseOrCartPath"],
    "carryOverFirst": True,
    "doNotStopAfterFirstSuccess": True,
    "forceRetry": True,
    "forceRetryNonce": NONCE,
}
control["windowsResumeContract"] = {
    "requiredIds": BOOTH_PENDING,
    "firstPassOrder": BOOTH_PENDING,
    "strictSuccessOnly": True,
    "completionPredicate": "all five Sep 2 carryover IDs buyer-visible strict verified",
}
write("booth-autopublish/monitor/recovery_control.json", control)

gate = read("sidehustle-autopublish/completion_gate.json")
gate.update(
    version=max(int(gate.get("version", 0)), 50),
    updatedAt=STAMP,
    status="in_progress_15_of_24",
    materializationState="complete_24_materialized_15_verified_9_pending",
    executionRequestedAt=STAMP,
    executionNonce=NONCE,
    forceNowRequested=True,
    forceNowMode="publish_only_four_verified-missing_free_notes_and_five_verified-missing_sep2_booth_items",
)
gate["carryOver"]["strictVerified"]["BOOTH"] = []
gate["carryOver"]["strictVerified"]["total"] = 5
gate["carryOver"]["remaining"]["total"] = 7
gate["completionCounts"].update(
    todayNotePaid=5,
    todayNoteFree=0,
    todayBOOTH=5,
    todayTotal=10,
    carryOverStrictVerified=5,
    carryOverRemaining=7,
    requiredToday=12,
    strictVerifiedTotal=15,
    totalOutstanding=9,
)
gate["duplicateControl"]["knownCleanup"].update(
    status="completed_verified",
    completedAt="2026-09-03T16:55:00.958+09:00",
    remainingDuplicateTitleGroups=0,
    sourceLogSha256=SOURCE_LOG_SHA256,
)
gate["duplicateControl"]["freePublisherGuardVersion"] = 3
write("sidehustle-autopublish/completion_gate.json", gate)

request = read("sidehustle-autopublish/windows_publication_request.json")
request.update(
    version=max(int(request.get("version", 0)), 2),
    updatedAt=STAMP,
    mode="publish_only_nine_independently_verified_missing_items",
    totalPublicationTarget=9,
    forceRetry=True,
)
request["paidNote"] = {"ids": [], "target": 0, "verifiedSep3Ids": list(PAID_VERIFIED)}
request["freeNote"] = {"ids": FREE_PENDING, "target": 4, "carryOverIds": FREE_PENDING[:2]}
request["BOOTH"] = {"ids": BOOTH_PENDING, "target": 5, "carryOverIds": BOOTH_PENDING, "verifiedSep3Ids": list(BOOTH_VERIFIED)}
request.setdefault("duplicateCleanup", {}).update(status="completed_verified", remainingDuplicateTitleGroups=0)
request["executionNonce"] = NONCE
write("sidehustle-autopublish/windows_publication_request.json", request)

report = {
    "version": 1,
    "auditedAt": STAMP,
    "sourceLogSha256": SOURCE_LOG_SHA256,
    "verified": {
        "paidNote": PAID_VERIFIED,
        "BOOTH": {queue_id: url for queue_id, (_, url, _) in BOOTH_VERIFIED.items()},
        "duplicateTitleGroups": 0,
    },
    "missing": {"freeNote": FREE_PENDING, "BOOTH": BOOTH_PENDING},
    "remainingTotal": 9,
    "scheduledTasksMustRemainDisabled": True,
}
write("sidehustle-autopublish/monitor/publication_reconciliation_20260903_partial.json", report)

print("RECONCILE_20260903_PARTIAL_OK paid=5 booth=5 duplicates=0 remaining_free=4 remaining_booth=5")
