#!/usr/bin/env python3
"""Record the strictly verified Aug 30-31 Windows publication run."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
COMPLETED_AT = "2026-08-31T01:15:56.670+09:00"
RECONCILED_AT = "2026-08-31T02:10:00+09:00"
LOG_SHA256 = "9a6bfa63a5d0420c8a6460fef98772d3042f15199879f86a2b4f4ca7b32f28c4"

PAID = {
    "note_20260830_52_receivables_collection_control": "https://note.com/royal_lion645/n/n74d989bfc644",
    "note_20260830_53_access_rights_review": "https://note.com/royal_lion645/n/n91b6b264a63a",
    "note_20260830_54_vendor_price_revision_impact": "https://note.com/royal_lion645/n/n62b770bb628d",
    "note_20260830_55_meeting_decision_followthrough": "https://note.com/royal_lion645/n/nc76d4a8ab403",
    "note_20260830_56_equipment_inspection_exception": "https://note.com/royal_lion645/n/n8121f71fa3ab",
    "note_20260831_57_purchase_invoice_match_control": "https://note.com/royal_lion645/n/ne518356755d9",
    "note_20260831_58_inventory_expiry_lot_rotation": "https://note.com/royal_lion645/n/na6e110f78c9e",
    "note_20260831_59_project_scope_change_control": "https://note.com/royal_lion645/n/ncfabc6c38ac9",
    "note_20260831_60_backup_restore_verification": "https://note.com/royal_lion645/n/n1c9e43a8df93",
    "note_20260831_61_procedure_revision_acknowledgement": "https://note.com/royal_lion645/n/n792e7e41042e",
}

FREE = {
    "free_note_20260830_01_receivables_warning_signals": ("https://note.com/royal_lion645/n/n9c8d6a504dae", RECONCILED_AT),
    "free_note_20260830_02_access_rights_warning_signals": ("https://note.com/royal_lion645/n/n2c79247f68ba", "2026-08-31T01:00:14.847+09:00"),
    "free_note_20260831_01_invoice_difference_signals": ("https://note.com/royal_lion645/n/nf02c3017b370", "2026-08-31T01:02:40.928+09:00"),
    "free_note_20260831_02_backup_restore_warning_signals": ("https://note.com/royal_lion645/n/ne89377550c62", "2026-08-31T01:04:19.320+09:00"),
}

DUPLICATES = {
    "free_note_20260831_01_invoice_difference_signals": ["https://note.com/royal_lion645/n/nbff6024f5dc2"],
    "free_note_20260831_02_backup_restore_warning_signals": ["https://note.com/royal_lion645/n/nfa368246e504"],
}

BOOTH = {
    "059_receivables_collection_control_os_20260830": ("https://booth.pm/ja/items/8786112", "2026-08-31T01:07:28.168+09:00"),
    "060_access_rights_review_os_20260830": ("https://booth.pm/ja/items/8786116", "2026-08-31T01:08:10.297+09:00"),
    "061_vendor_price_revision_impact_os_20260830": ("https://booth.pm/ja/items/8786120", "2026-08-31T01:09:00.184+09:00"),
    "062_meeting_decision_followthrough_os_20260830": ("https://booth.pm/ja/items/8786123", "2026-08-31T01:09:52.274+09:00"),
    "063_equipment_inspection_exception_os_20260830": ("https://booth.pm/ja/items/8786124", "2026-08-31T01:10:48.555+09:00"),
    "064_purchase_invoice_match_control_os_20260831": ("https://booth.pm/ja/items/8786131", "2026-08-31T01:12:15.278+09:00"),
    "065_inventory_expiry_lot_rotation_os_20260831": ("https://booth.pm/ja/items/8786133", "2026-08-31T01:12:57.779+09:00"),
    "066_project_scope_change_control_os_20260831": ("https://booth.pm/ja/items/8786136", "2026-08-31T01:13:43.303+09:00"),
    "067_backup_restore_verification_os_20260831": ("https://booth.pm/ja/items/8786137", "2026-08-31T01:14:33.987+09:00"),
    "068_procedure_revision_acknowledgement_os_20260831": ("https://booth.pm/ja/items/8786140", "2026-08-31T01:15:29.728+09:00"),
}


def load(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def save(path: str, data: dict) -> None:
    (ROOT / path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def index_entries(data: dict) -> dict[str, dict]:
    return {entry["id"]: entry for entry in data["entries"]}


def upsert(entries: list[dict], key: str, value: str, item: dict) -> None:
    for index, current in enumerate(entries):
        if current.get(key) == value:
            entries[index] = item
            return
    entries.append(item)


def reconcile_queues_and_ledgers() -> None:
    note_path = "sidehustle-autopublish/note/queue/index.json"
    free_path = "sidehustle-autopublish/note/free_queue/index.json"
    booth_path = "booth-autopublish/queue/index.json"
    note = load(note_path)
    free = load(free_path)
    booth = load(booth_path)
    note_entries = index_entries(note)
    free_entries = index_entries(free)
    booth_entries = index_entries(booth)

    for item_id, public_url in PAID.items():
        item = note_entries[item_id]
        item.update({
            "enabled": False,
            "forceRetry": False,
            "forcePublicationNow": False,
            "recoveryMode": "completed; preserve canonical public URL and do not republish",
            "publicUrlVerified": True,
            "publicUrl": public_url,
            "verificationState": "reader_visible_verified",
            "verificationEvidence": "Independent public-browser audit confirmed exact title, expected price, paid boundary, purchase path and dedicated cover after the Windows launcher found no remaining remote item.",
            "verifiedAt": RECONCILED_AT,
        })
        receipt = {
            "id": item_id,
            "title": item["title"],
            "publicUrl": public_url,
            "publicUrlVerified": True,
            "expectedPriceJPY": item["expectedPriceJPY"],
            "paidBoundaryVerified": True,
            "dedicatedCoverVerified": True,
            "anonymousReaderVerified": True,
            "verifiedAt": RECONCILED_AT,
            "verificationEvidence": "A fresh public-browser audit opened the canonical reader URL and confirmed exact title, expected price, paid boundary, purchase path and dedicated cover.",
            "verificationMode": "independent-public-browser-audit-20260831",
            "sourceLogSha256": LOG_SHA256,
        }
        save(f"sidehustle-autopublish/note/publication_receipts/{item_id}.json", receipt)

    note["updatedAt"] = COMPLETED_AT
    note["forceAllCurrentDayNow"] = False
    note["outstandingDates"] = []
    note["recoveryBatch"].update({
        "mode": "completed_aug30_aug31_paid_note",
        "completedStrictPublications": 10,
        "completedIds": list(PAID),
        "remaining": 0,
        "status": "complete",
        "completedAt": COMPLETED_AT,
    })

    free_ledger_path = "sidehustle-autopublish/note/free_publication_ledger.json"
    free_ledger = load(free_ledger_path)
    for item_id, (public_url, verified_at) in FREE.items():
        item = free_entries[item_id]
        item.update({
            "enabled": False,
            "forceRetry": False,
            "forcePublicationNow": False,
            "recoveryMode": "completed reader-visible strict verification",
            "publicUrlVerified": True,
            "publicUrl": public_url,
            "verificationState": "reader_visible_free_verified",
            "verifiedAt": verified_at,
        })
        log_verified = item_id != "free_note_20260830_01_receivables_warning_signals"
        ledger_entry = {
            "id": item_id,
            "title": item["title"],
            "publicUrl": public_url,
            "publicUrlVerified": True,
            "freeStateVerified": True,
            "coverImageVerified": True,
            "verifiedAt": verified_at,
            "verification": {
                "ok": True,
                "url": public_url,
                "status": 200,
                "titleOk": True,
                "freeState": True,
                "largeImageCount": 1,
                "evidence": (
                    "Windows V1 FREE_PUBLISH_SUCCESS_VERIFIED and a fresh public-browser audit confirmed the canonical reader URL, exact title, free state and dedicated cover."
                    if log_verified else
                    "A fresh public-browser audit confirmed the canonical reader URL, exact title, free state and dedicated cover after the launcher could not rediscover the URL."
                ),
            },
            "sourceLogSha256": LOG_SHA256,
        }
        if item_id in DUPLICATES:
            ledger_entry["duplicateCleanup"] = {
                "status": "pending_guarded_exact_id_deletion",
                "keepPublicUrl": public_url,
                "deleteOnlyPublicUrls": DUPLICATES[item_id],
                "detectedAt": RECONCILED_AT,
            }
        upsert(free_ledger["entries"], "id", item_id, ledger_entry)

    free["updatedAt"] = COMPLETED_AT
    free["forceAllCurrentDayNow"] = False
    free["activePriorityBatch"].update({
        "completedIds": list(FREE),
        "completedStrictPublications": 4,
        "remaining": 0,
        "status": "complete",
        "completedAt": COMPLETED_AT,
    })
    free_ledger["updatedAt"] = COMPLETED_AT

    booth_ledger_path = "booth-autopublish/monitor/publication_ledger.json"
    booth_ledger = load(booth_ledger_path)
    for item_id, (public_url, verified_at) in BOOTH.items():
        item = booth_entries[item_id]
        item.update({
            "enabled": False,
            "forceRetry": False,
            "forcePublicationNow": False,
            "recoveryMode": "completed; preserve canonical public URL and do not republish",
            "publicUrlVerified": True,
            "publicUrl": public_url,
            "verificationState": "buyer_visible_verified",
            "verifiedAt": verified_at,
        })
        ledger_entry = {
            "queueId": item_id,
            "title": item["title"],
            "boothItemId": public_url.rsplit("/", 1)[-1],
            "publicUrl": public_url,
            "publicUrlVerified": True,
            "expectedPriceJPY": item["expectedPriceJPY"],
            "verifiedAt": verified_at,
            "verificationEvidence": "Windows V1 buyer-browser verification confirmed HTTP 200 and exact title; PUBLIC_RECOVERY_SUCCESS reconfirmed the canonical URL.",
            "publishMode": "aug30-aug31-all24-v1",
            "sourceLogSha256": LOG_SHA256,
        }
        upsert(booth_ledger["entries"], "queueId", item_id, ledger_entry)

    booth["updatedAt"] = COMPLETED_AT
    booth["forceAllCurrentDayNow"] = False
    booth["forceRetryNonce"] = "completed-20260830-20260831-20260831T011556+0900"
    booth["outstandingDates"] = []
    booth_ledger["updatedAt"] = COMPLETED_AT

    save(note_path, note)
    save(free_path, free)
    save(free_ledger_path, free_ledger)
    save(booth_path, booth)
    save(booth_ledger_path, booth_ledger)


def reconcile_control_files() -> None:
    gate_path = "sidehustle-autopublish/completion_gate.json"
    gate = load(gate_path)
    gate["version"] += 1
    gate["updatedAt"] = COMPLETED_AT
    gate["status"] = "complete_24_of_24"
    gate["carryOver"]["remaining"] = {"notePaid": [], "noteFree": [], "BOOTH": [], "total": 0}
    gate["completionCounts"] = {
        "todayNotePaid": 5,
        "todayNoteFree": 2,
        "todayBOOTH": 5,
        "todayTotal": 12,
        "carryOverStrictVerified": 12,
        "carryOverRemaining": 0,
        "requiredToday": 12,
        "strictVerifiedTotal": 24,
        "totalOutstanding": 0,
    }
    gate["completedAt"] = COMPLETED_AT
    gate["forceNowRequested"] = False
    gate["forceNowMode"] = "completed_preserve_canonical_urls_do_not_republish"
    gate["completionEvidence"] = {
        "launcherVersion": "2026-08-31-AUG30-AUG31-ALL24-V1",
        "executionWindow": {"startedAt": "2026-08-31T00:57:58.690+09:00", "endedAt": COMPLETED_AT},
        "strictVerified": {"paidNote": 10, "freeNote": 4, "BOOTH": 10, "total": 24},
        "paidNoteUrls": PAID,
        "freeNoteUrls": {key: value[0] for key, value in FREE.items()},
        "boothUrls": {key: value[0] for key, value in BOOTH.items()},
        "duplicateCleanup": {
            "status": "pending_guarded_exact_id_deletion",
            "canonicalPagesKept": 2,
            "extraPagesToDelete": 2,
            "deleteOnlyUrls": [url for urls in DUPLICATES.values() for url in urls],
        },
        "sourceLogSha256": LOG_SHA256,
    }
    gate["planningManifest"] = "sidehustle-autopublish/planning/2026-08-31_batch01.json"
    gate["materializationState"] = "complete_and_strict_publication_verified"
    save(gate_path, gate)

    quota_path = "sidehustle-autopublish/publication_quota.json"
    quota = load(quota_path)
    quota["version"] += 1
    quota["updatedAt"] = COMPLETED_AT
    note_state = quota["channels"]["note"]["operationalState"]
    note_state.update({
        "previousDayStrictVerifiedPublicationsCount": 5,
        "carriedPublicationDebt": 0,
        "carriedRequiredIds": [],
        "todayStrictVerifiedPublicationsCount": 5,
        "todayRemainingToTarget": 0,
        "strictPublicationState": "2026-08-30 and 2026-08-31 complete: 10/10 paid NOTE strict verified",
    })
    free_state = quota["channels"]["note"]["freeAcquisitionExperiment"]
    free_state.update({
        "carriedPreviousDayRequiredIds": [],
        "carriedPreviousDayStrictVerifiedCount": 2,
        "currentRequiredBatchStrictVerifiedCount": 2,
        "currentMaterializationState": "complete_and_strict_verified",
    })
    booth_state = quota["channels"]["BOOTH"]["operationalState"]
    booth_state.update({
        "previousDayStrictVerifiedPublicationsCount": 5,
        "carriedPublicationDebt": 0,
        "carriedRequiredIds": [],
        "todayStrictVerifiedPublicationsCount": 5,
        "todayRemainingToTarget": 0,
        "strictPublicationState": "2026-08-30 and 2026-08-31 complete: 10/10 BOOTH strict verified",
    })
    current = quota["currentDay"]
    current.update({
        "strictVerifiedAfterRollover": 24,
        "carryOverRemaining": 0,
        "priority": "complete; preserve strict receipts and do not republish",
        "currentDayStrictVerified": 12,
        "completionState": "complete_24_of_24",
    })
    save(quota_path, quota)

    metrics_path = "sidehustle-autopublish/metrics/current.json"
    metrics = load(metrics_path)
    metrics["version"] += 1
    metrics["updatedAt"] = COMPLETED_AT
    metrics["objective"] = "Preserve the strictly verified Aug 30-31 batch: paid NOTE 10, free NOTE 4 and BOOTH 10; remove only two extra free-note duplicates."
    metrics["authoritativeSources"].update({
        "noteMaterialization": [
            "sidehustle-autopublish/note/staging/materialization_20260830_batch01.json",
            "sidehustle-autopublish/note/staging/materialization_20260831_batch01.json",
        ],
        "boothMaterialization": [
            "booth-autopublish/monitor/cloud_materialization_20260830_batch01.json",
            "booth-autopublish/monitor/cloud_materialization_20260831_batch01.json",
        ],
    })
    metrics["currentRecovery"] = {
        "date": "2026-08-31",
        "observedAt": COMPLETED_AT,
        "previousDate": "2026-08-30",
        "previousDayPaidNoteStrictVerified": "5/5",
        "previousDayBoothStrictVerified": "5/5",
        "previousDayFreeNoteStrictVerified": "2/2",
        "carriedTotalDebt": 0,
    }
    for channel, target in (("paidNote", 10), ("BOOTH", 10), ("freeNote", 4)):
        metrics["currentDayTargets"][channel].update({"target": target, "strictVerified": target, "remaining": 0, "remainingIds": []})
    metrics["currentDayTargets"]["allDesignatedStrictVerified"] = True
    metrics["evidence"] = {
        "paidNote": "10 canonical public URLs independently audited for exact title, price, paid boundary, purchase path and cover",
        "BOOTH": "10 buyer-visible HTTP 200 exact-title URLs with PUBLIC_RECOVERY_SUCCESS",
        "freeNote": "4 canonical reader-visible URLs independently audited for exact title, free state and cover; two later duplicate pages are isolated for guarded deletion",
        "sourceLogSha256": LOG_SHA256,
        "humanOnlyBlocker": None,
    }
    metrics["monitor"].update({
        "checkedAt": COMPLETED_AT,
        "windowsAuthenticatedPublisherRequiredForPublicPosting": False,
        "nextWindowsAction": "Run the guarded exact-ID cleanup for the two extra free-note pages; all 24 canonical publications are strict verified and disabled.",
    })
    save(metrics_path, metrics)

    request_path = "sidehustle-autopublish/windows_publication_request.json"
    request = load(request_path)
    request["version"] += 1
    request.update({
        "updatedAt": COMPLETED_AT,
        "mode": "completed_aug30_aug31_all24_duplicate_cleanup_pending",
        "completionState": "24_of_24",
        "completedAt": COMPLETED_AT,
        "completionEvidence": {"paidNote": 10, "freeNote": 4, "BOOTH": 10, "total": 24, "duplicateExtraPagesPendingDeletion": 2, "sourceLogSha256": LOG_SHA256},
    })
    save(request_path, request)

    recovery_path = "booth-autopublish/monitor/recovery_control.json"
    recovery = load(recovery_path)
    recovery["version"] += 1
    recovery["updatedAt"] = COMPLETED_AT
    recovery["activeRecovery"].update({"remaining": 0, "state": "completed", "completedAt": COMPLETED_AT})
    recovery["readyPaidRecoveryBatch"].update({
        "completedIds": list(BOOTH),
        "remaining": 0,
        "status": "complete",
        "completedAt": COMPLETED_AT,
    })
    recovery["cloudPreflight"].update({
        "checkedAt": COMPLETED_AT,
        "carryOverBOOTH": "2026-08-30 5/5 strict verified",
        "aug31NewBOOTH": "2026-08-31 5/5 strict verified",
        "nextAction": "No BOOTH republish. Preserve the ten canonical ledger URLs.",
    })
    save(recovery_path, recovery)

    for date in ("2026-08-30", "2026-08-31"):
        plan_path = f"sidehustle-autopublish/planning/{date}_batch01.json"
        plan = load(plan_path)
        plan["status"] = "complete_strict_publication_verified"
        plan["completedAt"] = COMPLETED_AT
        plan["strictVerified"] = {"paid": 5, "free": 2, "booth": 5, "total": 12}
        save(plan_path, plan)

    for date_id in ("20260830", "20260831"):
        materialization_path = f"sidehustle-autopublish/note/staging/materialization_{date_id}_batch01.json"
        materialization = load(materialization_path)
        materialization["qa"]["queueEnabled"] = False
        materialization["qa"]["publicationStatus"] = "complete_reader_visible_strict_verified_5_of_5"
        materialization["publishedAt"] = COMPLETED_AT
        save(materialization_path, materialization)


def main() -> None:
    assert len(PAID) == 10 and len(FREE) == 4 and len(BOOTH) == 10
    assert len(set(PAID.values())) == 10
    assert len({value[0] for value in FREE.values()}) == 4
    assert len({value[0] for value in BOOTH.values()}) == 10
    reconcile_queues_and_ledgers()
    reconcile_control_files()
    print(json.dumps({"paidNote": 10, "freeNote": 4, "BOOTH": 10, "total": 24, "status": "strict_verified"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
