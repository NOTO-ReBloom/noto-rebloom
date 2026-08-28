#!/usr/bin/env python3
"""Record the strictly verified Aug 28-29 Windows publication run."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
COMPLETED_AT = "2026-08-29T01:15:04.210+09:00"
LOG_SHA256 = "42f40d86e7fa2a24d30bdcd9fa539f4b387d088da7ecbd4e5a5f60ae56ccc83e"

PAID = {
    "note_20260828_42_attendance_month_end_exception_control": "https://note.com/royal_lion645/n/nef1bc1b603c6",
    "note_20260828_43_estimate_to_order_followup_control": "https://note.com/royal_lion645/n/n84107d7e44dd",
    "note_20260828_44_applicant_response_sla_control": "https://note.com/royal_lion645/n/n78d69894342b",
    "note_20260828_45_ai_efficiency_roi_measurement": "https://note.com/royal_lion645/n/n135f522069dd",
    "note_20260828_46_backoffice_labor_saving_priority_matrix": "https://note.com/royal_lion645/n/n3ebb370af28e",
    "note_20260829_47_contract_renewal_control": "https://note.com/royal_lion645/n/n4cc3d1d90b84",
    "note_20260829_48_complaint_root_cause_control": "https://note.com/royal_lion645/n/n243cf12e4c99",
    "note_20260829_49_onboarding_skill_matrix": "https://note.com/royal_lion645/n/n10f407e00e23",
    "note_20260829_50_cashflow_weekly_forecast": "https://note.com/royal_lion645/n/n63062bd5c187",
    "note_20260829_51_document_retention_disposition": "https://note.com/royal_lion645/n/n9f15e444433d",
}

FREE = {
    "free_note_20260828_01_attendance_month_end_signals": ("https://note.com/royal_lion645/n/n3ea6c0adc377", "2026-08-29T01:01:17.692+09:00"),
    "free_note_20260828_02_ai_efficiency_measurement_signals": ("https://note.com/royal_lion645/n/n4afba968fb75", "2026-08-29T01:03:40.218+09:00"),
    "free_note_20260829_01_contract_renewal_signals": ("https://note.com/royal_lion645/n/n671b603a4d57", "2026-08-29T01:04:16.986+09:00"),
    "free_note_20260829_02_cashflow_warning_signals": ("https://note.com/royal_lion645/n/n75a3f3ef371c", "2026-08-29T01:04:54.659+09:00"),
}

BOOTH = {
    "049_attendance_month_end_exception_control_os_20260828": ("https://booth.pm/ja/items/8777152", "2026-08-29T01:06:15.622+09:00"),
    "050_estimate_to_order_followup_control_os_20260828": ("https://booth.pm/ja/items/8777156", "2026-08-29T01:06:53.225+09:00"),
    "051_applicant_response_sla_control_os_20260828": ("https://booth.pm/ja/items/8777162", "2026-08-29T01:07:35.898+09:00"),
    "052_ai_efficiency_roi_measurement_os_20260828": ("https://booth.pm/ja/items/8777168", "2026-08-29T01:08:23.151+09:00"),
    "053_backoffice_labor_saving_priority_matrix_os_20260828": ("https://booth.pm/ja/items/8777171", "2026-08-29T01:09:17.038+09:00"),
    "054_contract_renewal_control_os_20260829": ("https://booth.pm/ja/items/8777176", "2026-08-29T01:11:03.187+09:00"),
    "055_complaint_root_cause_control_os_20260829": ("https://booth.pm/ja/items/8777179", "2026-08-29T01:11:44.457+09:00"),
    "056_onboarding_skill_matrix_os_20260829": ("https://booth.pm/ja/items/8777181", "2026-08-29T01:12:27.185+09:00"),
    "057_cashflow_weekly_forecast_os_20260829": ("https://booth.pm/ja/items/8777184", "2026-08-29T01:13:14.527+09:00"),
    "058_document_retention_disposition_os_20260829": ("https://booth.pm/ja/items/8777190", "2026-08-29T01:14:06.916+09:00"),
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
            "publicUrlVerified": True,
            "publicUrl": public_url,
            "verificationState": "reader_visible_verified",
            "verificationEvidence": "Windows V2 strict verifier confirmed exact title, expected price, paid boundary, dedicated cover and anonymous reader visibility.",
            "verifiedAt": COMPLETED_AT,
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
            "verifiedAt": COMPLETED_AT,
            "verificationEvidence": "PUBLISH_SUCCESS_VERIFIED and VERIFY_FRESH_ATTEMPT reported titleOk=true, priceOk=true, boundaryOk=true, coverOk=true and anonOk=true.",
            "verificationMode": "windows-aug28-aug29-all24-v2",
            "sourceLogSha256": LOG_SHA256,
        }
        save(f"sidehustle-autopublish/note/publication_receipts/{item_id}.json", receipt)

    note["updatedAt"] = COMPLETED_AT
    note["forceAllCurrentDayNow"] = False
    note["outstandingDates"] = []
    note["recoveryBatch"].update({
        "mode": "completed_aug28_aug29_paid_note",
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
            "recoveryMode": "completed reader-visible strict verification",
            "publicUrlVerified": True,
            "publicUrl": public_url,
            "verificationState": "reader_visible_free_verified",
            "verifiedAt": verified_at,
        })
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
                "evidence": "Windows V2 FREE_PUBLISH_SUCCESS_VERIFIED confirmed the reader-visible URL after exact-title, free-state and dedicated-cover checks.",
            },
            "sourceLogSha256": LOG_SHA256,
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
            "verificationEvidence": "Windows V2 buyer-browser verification confirmed HTTP 200, exact title, expected price, downloadable-product state and purchase/cart path; later PUBLIC_RECOVERY_SUCCESS reconfirmed the canonical URL.",
            "publishMode": "aug28-aug29-all24-v2",
            "sourceLogSha256": LOG_SHA256,
        }
        upsert(booth_ledger["entries"], "queueId", item_id, ledger_entry)

    booth["updatedAt"] = COMPLETED_AT
    booth["forceAllCurrentDayNow"] = False
    booth["forceRetryNonce"] = "completed-20260828-20260829-20260829T011504+0900"
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
    gate["completionEvidence"] = {
        "launcherVersion": "2026-08-29-AUG28-AUG29-ALL24-V2",
        "executionWindow": {"startedAt": "2026-08-29T00:52:26.090+09:00", "endedAt": COMPLETED_AT},
        "strictVerified": {"paidNote": 10, "freeNote": 4, "BOOTH": 10, "total": 24},
        "paidNoteUrls": PAID,
        "freeNoteUrls": {key: value[0] for key, value in FREE.items()},
        "boothUrls": {key: value[0] for key, value in BOOTH.items()},
        "sourceLogSha256": LOG_SHA256,
    }
    gate["planningManifest"] = "sidehustle-autopublish/planning/2026-08-29_batch01.json"
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
        "strictPublicationState": "2026-08-28 and 2026-08-29 complete: 10/10 paid NOTE strict verified",
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
        "strictPublicationState": "2026-08-28 and 2026-08-29 complete: 10/10 BOOTH strict verified",
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
    metrics["objective"] = "Preserve the strictly verified Aug 28-29 batch: paid NOTE 10, free NOTE 4 and BOOTH 10."
    metrics["authoritativeSources"].update({
        "noteMaterialization": [
            "sidehustle-autopublish/note/staging/materialization_20260828_batch01.json",
            "sidehustle-autopublish/note/staging/materialization_20260829_batch01.json",
        ],
        "boothMaterialization": [
            "booth-autopublish/monitor/cloud_materialization_20260828_batch01.json",
            "booth-autopublish/monitor/cloud_materialization_20260829_batch01.json",
        ],
    })
    metrics["currentRecovery"] = {
        "date": "2026-08-29",
        "observedAt": COMPLETED_AT,
        "previousDate": "2026-08-28",
        "previousDayPaidNoteStrictVerified": "5/5",
        "previousDayBoothStrictVerified": "5/5",
        "previousDayFreeNoteStrictVerified": "2/2",
        "carriedTotalDebt": 0,
    }
    for channel, target in (("paidNote", 10), ("BOOTH", 10), ("freeNote", 4)):
        metrics["currentDayTargets"][channel].update({"target": target, "strictVerified": target, "remaining": 0, "remainingIds": []})
    metrics["currentDayTargets"]["allDesignatedStrictVerified"] = True
    metrics["evidence"] = {
        "paidNote": "10 PUBLISH_SUCCESS_VERIFIED receipts with title/price/boundary/cover/anonymous checks true",
        "BOOTH": "10 buyer-visible HTTP 200 exact-title URLs with PUBLIC_RECOVERY_SUCCESS",
        "freeNote": "4 FREE_PUBLISH_SUCCESS_VERIFIED reader-visible URLs",
        "sourceLogSha256": LOG_SHA256,
        "humanOnlyBlocker": None,
    }
    metrics["monitor"].update({
        "checkedAt": COMPLETED_AT,
        "windowsAuthenticatedPublisherRequiredForPublicPosting": False,
        "nextWindowsAction": "None for Aug 28-29. All 24 designated publications are strict verified and disabled.",
    })
    save(metrics_path, metrics)

    request_path = "sidehustle-autopublish/windows_publication_request.json"
    request = load(request_path)
    request.update({
        "updatedAt": COMPLETED_AT,
        "mode": "completed_aug28_aug29_all24",
        "completionState": "24_of_24",
        "completedAt": COMPLETED_AT,
        "completionEvidence": {"paidNote": 10, "freeNote": 4, "BOOTH": 10, "total": 24, "sourceLogSha256": LOG_SHA256},
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
        "carryOverBOOTH": "2026-08-28 5/5 strict verified",
        "aug29NewBOOTH": "2026-08-29 5/5 strict verified",
        "nextAction": "None for Aug 28-29; preserve canonical ledger URLs and do not republish.",
    })
    save(recovery_path, recovery)

    for date in ("2026-08-28", "2026-08-29"):
        plan_path = f"sidehustle-autopublish/planning/{date}_batch01.json"
        plan = load(plan_path)
        plan["status"] = "complete_strict_publication_verified"
        plan["completedAt"] = COMPLETED_AT
        plan["strictVerified"] = {"paid": 5, "free": 2, "booth": 5, "total": 12}
        save(plan_path, plan)

    for date_id in ("20260828", "20260829"):
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
