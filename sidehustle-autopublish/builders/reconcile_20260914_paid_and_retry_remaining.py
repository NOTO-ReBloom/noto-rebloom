#!/usr/bin/env python3
"""Reconcile 20 public paid notes and re-arm only the remaining 35 items."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
STAMP = "2026-09-14T00:31:00+09:00"
NONCE = "remaining-35-20260914T003100+0900"

PAID_VERIFIED = {
    "note_20260910_107_supplier_delivery_delay_escalation": ("https://note.com/royal_lion645/n/n2f2e7551fadf", 11815),
    "note_20260910_108_customer_onboarding_handoff_control": ("https://note.com/royal_lion645/n/n53baa6e6bf35", 11951),
    "note_20260910_109_subscription_churn_reason_tracking": ("https://note.com/royal_lion645/n/nd67ff20d5c4b", 11947),
    "note_20260910_110_project_budget_forecast_variance": ("https://note.com/royal_lion645/n/n6b5b47e908fe", 11819),
    "note_20260910_111_customer_complaint_sla_escalation": ("https://note.com/royal_lion645/n/n41389d65932c", 11869),
    "note_20260911_112_invoice_dispute_aging_control": ("https://note.com/royal_lion645/n/na02518a9b197", 11823),
    "note_20260911_113_saas_renewal_owner_control": ("https://note.com/royal_lion645/n/n03d840f16be9", 11829),
    "note_20260911_114_purchase_requisition_cycle_control": ("https://note.com/royal_lion645/n/n98e81b00d72a", 11843),
    "note_20260911_115_customer_implementation_risk_control": ("https://note.com/royal_lion645/n/n981f5e3a76d5", 11843),
    "note_20260911_116_audit_evidence_request_tracker": ("https://note.com/royal_lion645/n/n74de5b53774c", 11849),
    "note_20260912_117_ap_duplicate_invoice_control": ("https://note.com/royal_lion645/n/ne9884292eb36", 11795),
    "note_20260912_118_expense_policy_exception_control": ("https://note.com/royal_lion645/n/n49acc8b96bfb", 11823),
    "note_20260912_119_customer_credit_note_control": ("https://note.com/royal_lion645/n/n214208a6d7aa", 11881),
    "note_20260912_120_contract_obligation_evidence_control": ("https://note.com/royal_lion645/n/naac70b6bcb24", 11893),
    "note_20260912_121_refund_aging_control": ("https://note.com/royal_lion645/n/n8e3780034f6c", 11767),
    "note_20260913_122_vendor_insurance_expiry_control": ("https://note.com/royal_lion645/n/n33185b09230d", 11859),
    "note_20260913_123_unapplied_deposit_control": ("https://note.com/royal_lion645/n/n0afcc885286b", 11859),
    "note_20260913_124_supplier_sla_breach_control": ("https://note.com/royal_lion645/n/n829465ff4653", 11813),
    "note_20260913_125_prepaid_expense_amortization_control": ("https://note.com/royal_lion645/n/n8b15ca049ee5", 11831),
    "note_20260913_126_warranty_claim_aging_control": ("https://note.com/royal_lion645/n/n91c249381cdb", 11821),
}

FREE_IDS = [
    "free_note_20260909_01_overdue_receivable_warning_signals",
    "free_note_20260909_02_subscription_cost_creep_signals",
    "free_note_20260910_01_supplier_delay_warning_signals",
    "free_note_20260910_02_onboarding_handoff_warning_signals",
    "free_note_20260911_01_invoice_dispute_warning_signals",
    "free_note_20260911_02_saas_renewal_warning_signals",
    "free_note_20260912_01_duplicate_invoice_warning_signals",
    "free_note_20260912_02_expense_policy_warning_signals",
    "free_note_20260913_01_vendor_insurance_expiry_signals",
    "free_note_20260913_02_unapplied_deposit_signals",
]

BOOTH_IDS = [
    "109_receivables_collection_escalation_os_20260909",
    "110_subscription_price_increase_review_os_20260909",
    "111_support_refund_root_cause_os_20260909",
    "112_slow_moving_inventory_os_20260909",
    "113_vendor_contract_obligation_os_20260909",
    "114_supplier_delivery_delay_escalation_os_20260910",
    "115_customer_onboarding_handoff_os_20260910",
    "116_subscription_churn_reason_os_20260910",
    "117_project_budget_forecast_variance_os_20260910",
    "118_customer_complaint_sla_escalation_os_20260910",
    "119_invoice_dispute_aging_os_20260911",
    "120_saas_renewal_owner_os_20260911",
    "121_purchase_requisition_cycle_os_20260911",
    "122_customer_implementation_risk_os_20260911",
    "123_audit_evidence_request_os_20260911",
    "124_ap_duplicate_invoice_os_20260912",
    "125_expense_policy_exception_os_20260912",
    "126_customer_credit_note_os_20260912",
    "127_contract_obligation_evidence_os_20260912",
    "128_refund_aging_control_os_20260912",
    "129_vendor_insurance_expiry_os_20260913",
    "130_unapplied_customer_deposit_os_20260913",
    "131_supplier_sla_breach_os_20260913",
    "132_prepaid_expense_amortization_os_20260913",
    "133_warranty_claim_aging_os_20260913",
]


def load(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def save(path: str, data: dict) -> None:
    (ROOT / path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    paid_path = "sidehustle-autopublish/note/queue/index.json"
    paid = load(paid_path)
    entries = {x["id"]: x for x in paid["entries"]}
    assert set(PAID_VERIFIED) <= set(entries)
    audit_items = []
    for queue_id, (url, chars) in PAID_VERIFIED.items():
        item = entries[queue_id]
        item.update({
            "enabled": False,
            "forceRetry": False,
            "forcePublicationNow": False,
            "publicUrlVerified": True,
            "publicUrl": url,
            "verificationState": "reader_visible_verified",
            "verificationEvidence": "Independent public-browser verification confirmed exact title, expected price, paid boundary, dedicated cover, and paid-body character count >= 5001.",
            "verifiedAt": STAMP,
            "verifiedPaidBodyChars": chars,
            "recoveryMode": "completed; preserve canonical public URL and do not republish",
        })
        audit_items.append({
            "id": queue_id,
            "title": item["title"],
            "expectedPriceJPY": item["expectedPriceJPY"],
            "publicUrl": url,
            "paidBodyChars": chars,
            "checks": {
                "readerVisibleUrl": True,
                "exactTitle": True,
                "expectedPrice": True,
                "paidBoundary": True,
                "dedicatedCover": True,
                "paidBodyCharsAtLeast5001": True,
            },
        })
    paid.update({
        "version": paid.get("version", 0) + 1,
        "updatedAt": STAMP,
        "retryGeneration": paid.get("retryGeneration", 0) + 1,
        "activePublicationDate": "2026-09-13",
        "forceAllCurrentDayNow": False,
        "forceRetryNonce": NONCE,
        "outstandingDates": [],
        "reconcileExistingBeforePublish": True,
        "recoveryBatch": {
            "mode": "completed_through_2026-09-13",
            "requiredStrictPublications": 0,
            "orderedIds": [],
            "completedIds": list(PAID_VERIFIED),
            "instruction": "Do not republish verified titles; preserve canonical public URLs.",
            "strictChecks": ["readerVisibleUrl", "title", "price", "paidBoundary", "dedicatedCover", "paidBodyCharsAtLeast5001"],
            "verifiedAt": STAMP,
            "nonce": NONCE,
        },
    })
    save(paid_path, paid)

    free_path = "sidehustle-autopublish/note/free_queue/index.json"
    free = load(free_path)
    free_entries = {x["id"]: x for x in free["entries"]}
    assert set(FREE_IDS) <= set(free_entries)
    for queue_id in FREE_IDS:
        free_entries[queue_id].update({
            "enabled": True,
            "forceRetry": False,
            "forcePublicationNow": True,
            "forceRetryNonce": f"{NONCE}-{queue_id}",
        })
    free.update({
        "version": free.get("version", 0) + 1,
        "updatedAt": STAMP,
        "retryGeneration": free.get("retryGeneration", 0) + 1,
        "activePublicationDate": "2026-09-09",
        "forceAllCurrentDayNow": True,
        "forceRetryNonce": NONCE,
        "outstandingDates": ["2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12", "2026-09-13"],
        "reconcileExistingBeforePublish": True,
        "activePriorityBatch": {"date": "2026-09-14", "ids": FREE_IDS, "requiredStrictPublications": 10},
    })
    save(free_path, free)

    booth_path = "booth-autopublish/queue/index.json"
    booth = load(booth_path)
    booth_entries = {x["id"]: x for x in booth["entries"]}
    assert set(BOOTH_IDS) <= set(booth_entries)
    for queue_id in BOOTH_IDS:
        booth_entries[queue_id].update({
            "enabled": True,
            "forceRetry": True,
            "forcePublicationNow": True,
            "forceRetryNonce": f"{NONCE}-{queue_id}",
        })
    booth.update({
        "version": booth.get("version", 0) + 1,
        "updatedAt": STAMP,
        "retryGeneration": booth.get("retryGeneration", 0) + 1,
        "activePublicationDate": "2026-09-09",
        "forceAllCurrentDayNow": True,
        "forceRetryNonce": NONCE,
        "outstandingDates": ["2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12", "2026-09-13"],
        "reconcileExistingBeforePublish": True,
    })
    save(booth_path, booth)

    request_path = "sidehustle-autopublish/windows_publication_request.json"
    request = load(request_path)
    request.update({
        "updatedAt": STAMP,
        "date": "2026-09-14",
        "mode": "publish_remaining_free_note_10_and_booth_25_now",
        "paidNote": {"ids": [], "target": 0},
        "freeNote": {"ids": FREE_IDS, "target": 10},
        "BOOTH": {"ids": BOOTH_IDS, "target": 25},
        "requestedAt": STAMP,
        "requestNonce": NONCE,
        "totalTarget": 35,
        "originalRequestedTotal": 55,
        "strictVerifiedThisRequest": 20,
        "remainingTarget": 35,
        "completionState": "20_of_55_strict_verified;_35_remaining",
        "reconcileExistingExactTitleBeforeCreate": True,
    })
    save(request_path, request)

    gate_path = "sidehustle-autopublish/completion_gate.json"
    gate = load(gate_path)
    gate.update({"version": gate.get("version", 0) + 1, "updatedAt": STAMP, "status": "in_progress_20_of_55"})
    gate["carryOver"]["remaining"]["paidNote"] = []
    gate["carryOver"]["remaining"]["total"] = 28
    gate["carryOver"]["strictVerifiedInThisRequest"].update({"paidNote": 20, "total": 20})
    gate["completionConditions"]["notePaid"]["requiredIds"] = []
    gate["completionConditions"]["notePaid"]["completedIds"] = list(PAID_VERIFIED)
    gate["completionConditions"]["notePaid"]["publicVerificationReport"] = "sidehustle-autopublish/monitor/public_verification_20260914_paid20.json"
    gate["completionCounts"].update({
        "strictVerifiedInThisRequest": 20,
        "required": 55,
        "remaining": 35,
        "paidNoteRemaining": 0,
        "freeNoteRemaining": 10,
        "BOOTHRemaining": 25,
    })
    for date in ("2026-09-10", "2026-09-11", "2026-09-12", "2026-09-13"):
        ids = [x for x in PAID_VERIFIED if x.startswith("note_" + date.replace("-", ""))]
        gate.setdefault("strictVerifiedByDate", {})[date] = {"paidNote": ids, "freeNote": [], "BOOTH": [], "total": len(ids)}
    save(gate_path, gate)

    quota_path = "sidehustle-autopublish/publication_quota.json"
    quota = load(quota_path)
    quota.update({"version": quota.get("version", 0) + 1, "updatedAt": STAMP})
    note_state = quota["channels"]["note"]["operationalState"]
    note_state.update({"todayStrictVerifiedPublicationsCount": 5, "todayRemainingToTarget": 0, "strictPublicationState": "2026-09-13 5/5 strict verified"})
    quota["currentDay"]["carryOverRemaining"]["paidNote"] = []
    quota["currentDay"]["carryOverRemaining"]["total"] = 28
    quota["currentDay"]["totalOutstanding"] = 35
    quota["currentDay"]["completionState"] = "pending_35_after_20_of_55_strict_verified"
    save(quota_path, quota)

    metrics_path = "sidehustle-autopublish/metrics/current.json"
    metrics = load(metrics_path)
    metrics.update({
        "version": metrics.get("version", 0) + 1,
        "updatedAt": STAMP,
        "objective": "Publish and strict-verify the remaining 35 active items through 2026-09-13 without duplicate titles.",
    })
    metrics["currentRecovery"].update({"observedAt": STAMP, "strictVerifiedInThisRequest": 20, "remaining": 35})
    metrics["activeTargets"]["paidNote"] = {"target": 0, "remainingIds": [], "strictVerified": 20}
    metrics["activeTargets"]["freeNote"].update({"target": 10, "remainingIds": FREE_IDS})
    metrics["activeTargets"]["BOOTH"].update({"target": 25, "remainingIds": BOOTH_IDS})
    metrics["monitor"].update({
        "checkedAt": STAMP,
        "nextWindowsAction": "Skip paid NOTE; publish only the 10 free NOTE and 25 BOOTH IDs after exact-title public reconciliation, then write strict evidence atomically.",
        "requestNonce": NONCE,
    })
    metrics["evidence"]["publication"] = "20 paid NOTE items independently strict-verified; 10 free NOTE and 25 BOOTH items remain unverified."
    save(metrics_path, metrics)

    recovery_path = "booth-autopublish/monitor/recovery_control.json"
    recovery = load(recovery_path)
    recovery.update({"version": recovery.get("version", 0) + 1, "updatedAt": STAMP})
    recovery["activeRecovery"].update({"requiredStrictNewPublications": 25, "remaining": 25, "state": "ready"})
    recovery["readyPaidRecoveryBatch"].update({
        "generatedAt": STAMP,
        "requiredStrictNewPublications": 25,
        "queueIds": BOOTH_IDS,
        "completedIds": [],
        "forceRetryNonce": NONCE,
    })
    recovery["windowsResumeContract"].update({"requiredIds": BOOTH_IDS, "firstPassOrder": BOOTH_IDS})
    save(recovery_path, recovery)

    audit = {
        "version": 1,
        "verifiedAt": STAMP,
        "verificationMethod": "independent public browser",
        "profileUrl": "https://note.com/royal_lion645",
        "strictVerifiedCount": 20,
        "allStrictChecksPassed": True,
        "items": audit_items,
        "remaining": {"paidNote": 0, "freeNote": 10, "BOOTH": 25, "total": 35},
    }
    save("sidehustle-autopublish/monitor/public_verification_20260914_paid20.json", audit)


if __name__ == "__main__":
    main()
