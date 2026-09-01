#!/usr/bin/env python3
"""Record the strictly verified 2026-09-01 publication run."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
COMPLETED_AT = "2026-09-01T17:53:06.420+09:00"
AUDITED_AT = "2026-09-01T17:57:14+09:00"
LOG_SHA256 = "5a2ae32b388bbd73ed307d1d03529417647ee203fa38191f87fcb6f974af6584"

PAID = {
    "note_20260901_62_subscription_renewal_cost_control": "https://note.com/royal_lion645/n/nd62ae2cc0482",
    "note_20260901_63_support_escalation_sla_control": "https://note.com/royal_lion645/n/ned7ee56a19ac",
    "note_20260901_64_campaign_attribution_control": "https://note.com/royal_lion645/n/n23d8731c9047",
    "note_20260901_65_training_expiry_control": "https://note.com/royal_lion645/n/n529ab0c0606a",
    "note_20260901_66_migration_rehearsal_control": "https://note.com/royal_lion645/n/n975d61a0441c",
}

FREE = {
    "free_note_20260901_01_subscription_waste_signals": (
        "https://note.com/royal_lion645/n/nf564d915f16e",
        "2026-09-01T17:45:14.196+09:00",
    ),
    "free_note_20260901_02_support_escalation_signals": (
        "https://note.com/royal_lion645/n/n94c944ee8751",
        "2026-09-01T17:47:09.585+09:00",
    ),
}

BOOTH = {
    "069_subscription_renewal_cost_control_os_20260901": (
        "https://booth.pm/ja/items/8793703",
        "2026-09-01T17:48:33.127+09:00",
    ),
    "070_support_escalation_sla_control_os_20260901": (
        "https://booth.pm/ja/items/8793709",
        "2026-09-01T17:49:11.883+09:00",
    ),
    "071_campaign_attribution_control_os_20260901": (
        "https://booth.pm/ja/items/8793714",
        "2026-09-01T17:49:54.042+09:00",
    ),
    "072_training_expiry_control_os_20260901": (
        "https://booth.pm/ja/items/8793721",
        "2026-09-01T17:50:42.183+09:00",
    ),
    "073_migration_rehearsal_control_os_20260901": (
        "https://booth.pm/ja/items/8793726",
        "2026-09-01T17:51:35.444+09:00",
    ),
}

DUPLICATE_CLEANUP = {
    "status": "pending_guarded_exact_id_deletion",
    "plan": "sidehustle-autopublish/note/windows/note_duplicate_cleanup_plan_20260901.json",
    "duplicateTitleGroups": 3,
    "extraPagesToDelete": 4,
    "deleteOnlyUrls": [
        "https://note.com/royal_lion645/n/nbff6024f5dc2",
        "https://note.com/royal_lion645/n/nfa368246e504",
        "https://note.com/royal_lion645/n/ne2ff39f733ad",
        "https://note.com/royal_lion645/n/nb01f3f59f4a1",
    ],
    "auditedAt": AUDITED_AT,
}


def load(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def save(path: str, data: dict) -> None:
    (ROOT / path).write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def entries_by_id(data: dict) -> dict[str, dict]:
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
    note_entries = entries_by_id(note)
    free_entries = entries_by_id(free)
    booth_entries = entries_by_id(booth)

    for item_id, public_url in PAID.items():
        item = note_entries[item_id]
        item.update(
            {
                "enabled": False,
                "forceRetry": False,
                "forcePublicationNow": False,
                "recoveryMode": "completed; preserve canonical public URL and do not republish",
                "publicUrlVerified": True,
                "publicUrl": public_url,
                "verificationState": "reader_visible_verified",
                "verificationEvidence": "Fresh public-browser audit confirmed exact title, expected price, paid boundary, purchase path and dedicated cover.",
                "verifiedAt": AUDITED_AT,
            }
        )
        receipt = {
            "id": item_id,
            "title": item["title"],
            "publicUrl": public_url,
            "publicUrlVerified": True,
            "expectedPriceJPY": item["expectedPriceJPY"],
            "titleVerified": True,
            "priceVerified": True,
            "paidBoundaryVerified": True,
            "purchasePathVerified": True,
            "dedicatedCoverVerified": True,
            "anonymousReaderVerified": True,
            "verifiedAt": AUDITED_AT,
            "verificationMode": "independent-public-browser-audit-20260901",
            "sourceLogSha256": LOG_SHA256,
        }
        save(f"sidehustle-autopublish/note/publication_receipts/{item_id}.json", receipt)

    note["updatedAt"] = AUDITED_AT
    note["forceAllCurrentDayNow"] = False
    note["outstandingDates"] = []
    if isinstance(note.get("recoveryBatch"), dict):
        note["recoveryBatch"].update(
            {
                "mode": "completed_20260901_paid_note",
                "completedStrictPublications": 5,
                "completedIds": list(PAID),
                "remaining": 0,
                "status": "complete",
                "completedAt": COMPLETED_AT,
            }
        )

    free_ledger_path = "sidehustle-autopublish/note/free_publication_ledger.json"
    free_ledger = load(free_ledger_path)
    for item_id, (public_url, verified_at) in FREE.items():
        item = free_entries[item_id]
        item.update(
            {
                "enabled": False,
                "forceRetry": False,
                "forcePublicationNow": False,
                "recoveryMode": "completed reader-visible strict verification",
                "publicUrlVerified": True,
                "publicUrl": public_url,
                "verificationState": "reader_visible_free_verified",
                "verifiedAt": verified_at,
            }
        )
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
                "evidence": "Windows FREE_PUBLISH_SUCCESS_VERIFIED plus fresh public-browser exact-title, free-state and dedicated-cover audit.",
            },
            "sourceLogSha256": LOG_SHA256,
        }
        if item_id == "free_note_20260901_02_support_escalation_signals":
            ledger_entry["duplicateCleanup"] = DUPLICATE_CLEANUP
        upsert(free_ledger["entries"], "id", item_id, ledger_entry)

    for old_id in (
        "free_note_20260831_01_invoice_difference_signals",
        "free_note_20260831_02_backup_restore_warning_signals",
    ):
        for ledger_entry in free_ledger["entries"]:
            if ledger_entry.get("id") == old_id:
                ledger_entry["duplicateCleanup"] = DUPLICATE_CLEANUP

    free["updatedAt"] = AUDITED_AT
    free["forceAllCurrentDayNow"] = False
    if isinstance(free.get("activePriorityBatch"), dict):
        free["activePriorityBatch"].update(
            {
                "completedIds": list(FREE),
                "completedStrictPublications": 2,
                "remaining": 0,
                "status": "complete",
                "completedAt": COMPLETED_AT,
            }
        )
    free_ledger["updatedAt"] = AUDITED_AT

    booth_ledger_path = "booth-autopublish/monitor/publication_ledger.json"
    booth_ledger = load(booth_ledger_path)
    for item_id, (public_url, verified_at) in BOOTH.items():
        item = booth_entries[item_id]
        item.update(
            {
                "enabled": False,
                "forceRetry": False,
                "forcePublicationNow": False,
                "recoveryMode": "completed; preserve canonical public URL and do not republish",
                "publicUrlVerified": True,
                "publicUrl": public_url,
                "verificationState": "buyer_visible_verified",
                "verifiedAt": verified_at,
            }
        )
        ledger_entry = {
            "queueId": item_id,
            "title": item["title"],
            "boothItemId": public_url.rsplit("/", 1)[-1],
            "publicUrl": public_url,
            "publicUrlVerified": True,
            "expectedPriceJPY": item["expectedPriceJPY"],
            "verifiedAt": verified_at,
            "verificationEvidence": "Windows buyer-browser verification confirmed HTTP 200 and exact title after price, downloadable ZIP and public-shop checks; PUBLIC_RECOVERY_SUCCESS reconfirmed the canonical URL.",
            "publishMode": "sep1-all12-now-v2",
            "sourceLogSha256": LOG_SHA256,
        }
        upsert(booth_ledger["entries"], "queueId", item_id, ledger_entry)

    booth["updatedAt"] = AUDITED_AT
    booth["forceAllCurrentDayNow"] = False
    booth["outstandingDates"] = []
    booth["forceRetryNonce"] = "completed-20260901-20260901T175306+0900"
    booth_ledger["updatedAt"] = AUDITED_AT

    save(note_path, note)
    save(free_path, free)
    save(free_ledger_path, free_ledger)
    save(booth_path, booth)
    save(booth_ledger_path, booth_ledger)


def reconcile_control_files() -> None:
    gate_path = "sidehustle-autopublish/completion_gate.json"
    gate = load(gate_path)
    gate["version"] = max(int(gate.get("version", 0)), 38)
    gate["updatedAt"] = AUDITED_AT
    gate["status"] = "complete_12_of_12"
    gate["completionCounts"] = {
        "todayNotePaid": 5,
        "todayNoteFree": 2,
        "todayBOOTH": 5,
        "todayTotal": 12,
        "carryOverStrictVerified": 0,
        "carryOverRemaining": 0,
        "requiredToday": 12,
        "strictVerifiedTotal": 12,
        "totalOutstanding": 0,
    }
    gate["completedAt"] = COMPLETED_AT
    gate["completionEvidence"] = {
        "launcherVersion": "2026-09-01-ALL12-NOW-V2",
        "executionWindow": {
            "startedAt": "2026-09-01T17:44:08.320+09:00",
            "endedAt": COMPLETED_AT,
        },
        "strictVerified": {"paidNote": 5, "freeNote": 2, "BOOTH": 5, "total": 12},
        "paidNoteUrls": PAID,
        "freeNoteUrls": {key: value[0] for key, value in FREE.items()},
        "boothUrls": {key: value[0] for key, value in BOOTH.items()},
        "duplicateCleanup": DUPLICATE_CLEANUP,
        "sourceLogSha256": LOG_SHA256,
    }
    gate["forceNowRequested"] = False
    gate["forceNowMode"] = "completed_preserve_canonical_urls_do_not_republish"
    gate["materializationState"] = "complete_and_strict_publication_verified"
    save(gate_path, gate)

    quota_path = "sidehustle-autopublish/publication_quota.json"
    quota = load(quota_path)
    quota["version"] = max(int(quota.get("version", 0)), 67)
    quota["updatedAt"] = AUDITED_AT
    note_state = quota["channels"]["note"]["operationalState"]
    note_state.update(
        {
            "carriedPublicationDebt": 0,
            "carriedRequiredIds": [],
            "todayStrictVerifiedPublicationsCount": 5,
            "todayRemainingToTarget": 0,
            "strictPublicationState": "2026-09-01 complete: 5/5 paid NOTE strict verified",
            "lastStrictVerificationAt": AUDITED_AT,
            "lastStrictVerifiedIds": list(PAID),
        }
    )
    free_state = quota["channels"]["note"]["freeAcquisitionExperiment"]
    free_state.update(
        {
            "currentRequiredBatchStrictVerifiedCount": 2,
            "currentMaterializationState": "complete_and_strict_verified",
            "duplicateCleanup": DUPLICATE_CLEANUP,
        }
    )
    booth_state = quota["channels"]["BOOTH"]["operationalState"]
    booth_state.update(
        {
            "carriedPublicationDebt": 0,
            "carriedRequiredIds": [],
            "todayStrictVerifiedPublicationsCount": 5,
            "todayRemainingToTarget": 0,
            "strictPublicationState": "2026-09-01 complete: 5/5 BOOTH strict verified",
            "lastStrictVerificationAt": AUDITED_AT,
            "lastStrictVerifiedIds": list(BOOTH),
        }
    )
    quota["currentDay"].update(
        {
            "strictVerifiedAfterRollover": 12,
            "carryOverRemaining": 0,
            "priority": "complete; preserve canonical receipts and do not republish",
            "currentDayStrictVerified": 12,
            "completionState": "complete_12_of_12",
        }
    )
    save(quota_path, quota)

    metrics_path = "sidehustle-autopublish/metrics/current.json"
    metrics = load(metrics_path)
    metrics["version"] = max(int(metrics.get("version", 0)), 44)
    metrics["updatedAt"] = AUDITED_AT
    metrics["objective"] = "Preserve the strictly verified Sep 1 batch: paid NOTE 5, free NOTE 2 and BOOTH 5; remove four explicitly isolated duplicate free-note pages."
    metrics["authoritativeSources"].update(
        {
            "noteMaterialization": [
                "sidehustle-autopublish/note/staging/materialization_20260901_batch01.json"
            ],
            "boothMaterialization": [
                "booth-autopublish/monitor/cloud_materialization_20260901_batch01.json"
            ],
        }
    )
    metrics["currentRecovery"] = {
        "date": "2026-09-01",
        "observedAt": AUDITED_AT,
        "previousDate": "2026-08-31",
        "previousDayPaidNoteStrictVerified": "5/5",
        "previousDayBoothStrictVerified": "5/5",
        "previousDayFreeNoteStrictVerified": "2/2",
        "carriedTotalDebt": 0,
    }
    for channel, target in (("paidNote", 5), ("BOOTH", 5), ("freeNote", 2)):
        metrics["currentDayTargets"][channel].update(
            {"target": target, "strictVerified": target, "remaining": 0, "remainingIds": []}
        )
    metrics["currentDayTargets"]["allDesignatedStrictVerified"] = True
    metrics["evidence"] = {
        "paidNote": "5 canonical public URLs independently audited for exact title, price, paid boundary, purchase path and cover",
        "BOOTH": "5 buyer-visible HTTP 200 exact-title URLs with price setup, downloadable ZIP and PUBLIC_RECOVERY_SUCCESS",
        "freeNote": "2 canonical public URLs independently audited for exact title, free state and cover",
        "duplicateCleanup": DUPLICATE_CLEANUP,
        "sourceLogSha256": LOG_SHA256,
        "humanOnlyBlocker": None,
    }
    metrics["monitor"].update(
        {
            "checkedAt": AUDITED_AT,
            "windowsAuthenticatedPublisherRequiredForPublicPosting": False,
            "nextWindowsAction": "Run guarded duplicate cleanup for four exact extra URLs, then re-enable the two remote-queue tasks.",
        }
    )
    save(metrics_path, metrics)

    request_path = "sidehustle-autopublish/windows_publication_request.json"
    request = load(request_path)
    request["version"] = max(int(request.get("version", 0)), 4)
    request.update(
        {
            "updatedAt": AUDITED_AT,
            "mode": "completed_sep1_all12_duplicate_cleanup_pending",
            "forceNowRequested": False,
            "completionState": "12_of_12",
            "completedAt": COMPLETED_AT,
            "completionEvidence": {
                "paidNote": 5,
                "freeNote": 2,
                "BOOTH": 5,
                "total": 12,
                "duplicateExtraPagesPendingDeletion": 4,
                "sourceLogSha256": LOG_SHA256,
            },
        }
    )
    save(request_path, request)

    recovery_path = "booth-autopublish/monitor/recovery_control.json"
    recovery = load(recovery_path)
    recovery["version"] = max(int(recovery.get("version", 0)), 54)
    recovery["updatedAt"] = AUDITED_AT
    recovery["activeRecovery"].update(
        {"remaining": 0, "state": "completed", "completedAt": COMPLETED_AT}
    )
    recovery["readyPaidRecoveryBatch"].update(
        {
            "completedIds": list(BOOTH),
            "remaining": 0,
            "status": "complete",
            "completedAt": COMPLETED_AT,
        }
    )
    recovery["cloudPreflight"].update(
        {
            "checkedAt": AUDITED_AT,
            "sep1NewBOOTH": "2026-09-01 5/5 strict verified",
            "nextAction": "No BOOTH republish; preserve the five canonical Sep 1 ledger URLs.",
        }
    )
    save(recovery_path, recovery)

    plan_path = "sidehustle-autopublish/planning/2026-09-01_batch01.json"
    plan = load(plan_path)
    plan["status"] = "complete_strict_publication_verified"
    plan["completedAt"] = COMPLETED_AT
    plan["strictVerified"] = {"paid": 5, "free": 2, "booth": 5, "total": 12}
    save(plan_path, plan)

    note_materialization_path = (
        "sidehustle-autopublish/note/staging/materialization_20260901_batch01.json"
    )
    note_materialization = load(note_materialization_path)
    note_materialization["qa"]["queueEnabled"] = False
    note_materialization["qa"]["publicationStatus"] = (
        "complete_reader_visible_strict_verified_5_of_5"
    )
    note_materialization["publishedAt"] = COMPLETED_AT
    save(note_materialization_path, note_materialization)

    booth_materialization_path = (
        "booth-autopublish/monitor/cloud_materialization_20260901_batch01.json"
    )
    booth_materialization = load(booth_materialization_path)
    booth_materialization["publicationStatus"] = (
        "complete_buyer_visible_strict_verified_5_of_5"
    )
    booth_materialization["publishedAt"] = COMPLETED_AT
    save(booth_materialization_path, booth_materialization)


def main() -> None:
    assert len(PAID) == 5 and len(FREE) == 2 and len(BOOTH) == 5
    assert len(set(PAID.values())) == 5
    assert len({value[0] for value in FREE.values()}) == 2
    assert len({value[0] for value in BOOTH.values()}) == 5
    assert DUPLICATE_CLEANUP["extraPagesToDelete"] == 4
    reconcile_queues_and_ledgers()
    reconcile_control_files()
    print(
        json.dumps(
            {
                "paidNote": 5,
                "freeNote": 2,
                "BOOTH": 5,
                "total": 12,
                "duplicatePagesPendingDeletion": 4,
                "status": "strict_verified",
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
