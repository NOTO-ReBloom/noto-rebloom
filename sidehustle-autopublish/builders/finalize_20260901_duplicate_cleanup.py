#!/usr/bin/env python3
"""Finalize the verified Sep 1 duplicate cleanup and scheduler resume."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
UPDATED_AT = "2026-09-01T21:52:54+09:00"
COMPLETED_AT = "2026-09-01T21:51:28.210+09:00"
RECEIPT_PATH = "sidehustle-autopublish/note/windows/note_duplicate_cleanup_receipt_20260901.json"

GROUPS = [
    {
        "queueId": "free_note_20260831_01_invoice_difference_signals",
        "title": "請求書をそのまま払う前に見る4つの差異｜発注・受領・請求の確認ポイント",
        "keepKey": "nf02c3017b370",
        "deleteKeys": ["nbff6024f5dc2"],
    },
    {
        "queueId": "free_note_20260831_02_backup_restore_warning_signals",
        "title": "バックアップが使えないかもしれない4つのサイン｜復元前に確認したい項目",
        "keepKey": "ne89377550c62",
        "deleteKeys": ["nfa368246e504"],
    },
    {
        "queueId": "free_note_20260901_02_support_escalation_signals",
        "title": "問い合わせ対応が止まりやすい4つのサイン｜担当変更前に決めたい項目",
        "keepKey": "n94c944ee8751",
        "deleteKeys": ["ne2ff39f733ad", "nb01f3f59f4a1"],
    },
    {
        "queueId": "free_note_20260829_02_cashflow_warning_signals",
        "title": "黒字でも危ない？｜13週間の資金繰りで先に見る3つのサイン",
        "keepKey": "n75a3f3ef371c",
        "deleteKeys": ["nb4dba9eb630f"],
    },
    {
        "queueId": "free_note_20260829_01_contract_renewal_signals",
        "title": "自動更新で損する前に見る4項目｜契約満了より先に確認する日付",
        "keepKey": "n671b603a4d57",
        "deleteKeys": ["n0d1af95c1e8b"],
    },
    {
        "queueId": "free_note_20260828_02_ai_efficiency_measurement_signals",
        "title": "AI導入が『効率化止まり』になる3つのサイン｜効果検証で最初に決める数字",
        "keepKey": "n4afba968fb75",
        "deleteKeys": ["nd2fcda5d27f6"],
    },
]

DELETED_KEYS = [key for group in GROUPS for key in group["deleteKeys"]]
KEEPER_KEYS = [group["keepKey"] for group in GROUPS]

FINAL_STATE = {
    "status": "complete_7_deleted_0_remaining",
    "receipt": RECEIPT_PATH,
    "completedAt": COMPLETED_AT,
    "duplicateTitleGroupsResolved": 6,
    "extraPagesDeletedVerified": 7,
    "failedDeletions": 0,
    "remainingDuplicateGroups": 0,
    "remainingDuplicatePages": 0,
    "preservedKeeperUrls": [
        f"https://note.com/royal_lion645/n/{key}" for key in KEEPER_KEYS
    ],
    "deletedUrls": [
        f"https://note.com/royal_lion645/n/{key}" for key in DELETED_KEYS
    ],
    "finalGlobalAudit": {
        "verifiedAt": "2026-09-01T21:51:27.844+09:00",
        "duplicateGroups": 0,
        "groups": [],
    },
    "scheduledTasks": {
        "NOTE_RemoteQueue_30min": {
            "enabled": True,
            "status": "Ready",
            "nextRunAt": "2026-09-01T22:05:00+09:00",
        },
        "BOOTH_RemoteQueue_30min": {
            "enabled": True,
            "status": "Ready",
            "nextRunAt": "2026-09-01T22:20:00+09:00",
        },
    },
}


def load(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def save(path: str, data: dict) -> None:
    (ROOT / path).write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def create_receipt() -> None:
    receipt = {
        "version": 1,
        "account": "royal_lion645",
        **FINAL_STATE,
        "publicationBatch": {
            "date": "2026-09-01",
            "paidNoteStrictVerified": 5,
            "freeNoteStrictVerified": 2,
            "BOOTHStrictVerified": 5,
            "totalStrictVerified": 12,
            "publicationDebt": 0,
        },
        "groups": [
            {
                **group,
                "keepUrl": f"https://note.com/royal_lion645/n/{group['keepKey']}",
                "deleteUrls": [
                    f"https://note.com/royal_lion645/n/{key}"
                    for key in group["deleteKeys"]
                ],
                "keeperPublicExactVerified": True,
                "deleteTargets404Verified": True,
            }
            for group in GROUPS
        ],
        "executionHistory": [
            {
                "launcherVersion": "2026-09-01-CLEANUP-DUPLICATES-AND-RESUME-V1",
                "startedAt": "2026-09-01T21:26:40.600+09:00",
                "endedAt": "2026-09-01T21:28:27.720+09:00",
                "deletedVerified": 4,
                "failed": 0,
                "result": "four planned targets deleted; global audit discovered three additional groups",
            },
            {
                "launcherVersion": "2026-09-01-FINAL-CLEANUP-AND-RESUME-V1",
                "startedAt": "2026-09-01T21:40:28.390+09:00",
                "endedAt": "2026-09-01T21:42:05.860+09:00",
                "deletedVerified": 0,
                "failedSafely": 3,
                "result": "confirmation control not found; no deletion; tasks remained disabled",
            },
            {
                "launcherVersion": "2026-09-01-FINAL-CLEANUP-AND-RESUME-V2",
                "startedAt": "2026-09-01T21:50:27.610+09:00",
                "endedAt": COMPLETED_AT,
                "deletedVerified": 3,
                "failed": 0,
                "result": "all remaining targets deleted, global duplicate audit zero, scheduled tasks enabled",
            },
        ],
    }
    save(RECEIPT_PATH, receipt)


def update_plans() -> None:
    initial_path = "sidehustle-autopublish/note/windows/note_duplicate_cleanup_plan_20260901.json"
    initial = load(initial_path)
    initial["status"] = "completed_verified_as_part_of_overall_cleanup"
    initial["overallCleanup"] = FINAL_STATE
    save(initial_path, initial)

    remaining_path = "sidehustle-autopublish/note/windows/note_duplicate_cleanup_remaining_20260901.json"
    remaining = load(remaining_path)
    remaining["version"] = max(int(remaining.get("version", 0)), 3)
    remaining["updatedAt"] = UPDATED_AT
    remaining["status"] = "completed_verified"
    remaining["execution"] = {
        "launcherVersion": "2026-09-01-FINAL-CLEANUP-AND-RESUME-V2",
        "startedAt": "2026-09-01T21:50:27.610+09:00",
        "targetsCompletedAt": "2026-09-01T21:51:26.406+09:00",
        "endedAt": COMPLETED_AT,
        "deletedVerified": 3,
        "alreadyRemoved": 0,
        "failed": 0,
        "remainingDuplicateGroups": 0,
        "scheduledTasksEnabled": True,
    }
    remaining["overallCleanup"] = FINAL_STATE
    save(remaining_path, remaining)


def update_controls() -> None:
    gate_path = "sidehustle-autopublish/completion_gate.json"
    gate = load(gate_path)
    gate["version"] = max(int(gate.get("version", 0)), 41)
    gate["updatedAt"] = UPDATED_AT
    gate["completionEvidence"]["duplicateCleanup"] = FINAL_STATE
    save(gate_path, gate)

    quota_path = "sidehustle-autopublish/publication_quota.json"
    quota = load(quota_path)
    quota["version"] = max(int(quota.get("version", 0)), 70)
    quota["updatedAt"] = UPDATED_AT
    quota["channels"]["note"]["freeAcquisitionExperiment"]["duplicateCleanup"] = FINAL_STATE
    save(quota_path, quota)

    metrics_path = "sidehustle-autopublish/metrics/current.json"
    metrics = load(metrics_path)
    metrics["version"] = max(int(metrics.get("version", 0)), 47)
    metrics["updatedAt"] = UPDATED_AT
    metrics["objective"] = "Preserve the strictly verified Sep 1 batch and its duplicate-free NOTE catalog while measuring first-party funnel outcomes."
    metrics["evidence"]["duplicateCleanup"] = FINAL_STATE
    metrics["monitor"].update(
        {
            "checkedAt": UPDATED_AT,
            "nextWindowsAction": "No cleanup action remains; both empty-queue scheduled publishers are enabled and Ready.",
            "windowsAuthenticatedPublisherRequiredForPublicPosting": False,
        }
    )
    save(metrics_path, metrics)

    request_path = "sidehustle-autopublish/windows_publication_request.json"
    request = load(request_path)
    request["version"] = max(int(request.get("version", 0)), 8)
    request["updatedAt"] = UPDATED_AT
    request["mode"] = "completed_sep1_all12_duplicate_cleanup_complete_schedulers_resumed"
    request["triggerNonce"] = "sep1-cleanup-complete-20260901T215128+0900"
    request["duplicateCleanup"] = {
        "requested": False,
        **FINAL_STATE,
    }
    save(request_path, request)

    strategy_path = "sidehustle-autopublish/strategy/current.json"
    strategy = load(strategy_path)
    strategy["version"] = max(int(strategy.get("version", 0)), 45)
    strategy["updatedAt"] = UPDATED_AT
    strategy["allocationDecision"]["rank2"] = "Preserve the duplicate-free NOTE catalog; reconcile an existing exact-title public URL before every retry."
    strategy["duplicateCleanup"] = FINAL_STATE
    strategy["windowsPublisher"]["currentRisk"] = "No publication debt and no duplicate-title cleanup debt. Both scheduled publishers are enabled and Ready with current queues disabled for already verified items."
    save(strategy_path, strategy)


def update_free_ledger() -> None:
    path = "sidehustle-autopublish/note/free_publication_ledger.json"
    ledger = load(path)
    ledger["version"] = max(int(ledger.get("version", 0)), 4)
    ledger["updatedAt"] = UPDATED_AT
    by_id = {group["queueId"]: group for group in GROUPS}
    for entry in ledger["entries"]:
        group = by_id.get(entry.get("id"))
        if not group:
            continue
        entry["duplicateCleanup"] = {
            "status": "completed_verified",
            "receipt": RECEIPT_PATH,
            "completedAt": COMPLETED_AT,
            "keeperKey": group["keepKey"],
            "keeperUrl": f"https://note.com/royal_lion645/n/{group['keepKey']}",
            "deletedVerifiedKeys": group["deleteKeys"],
            "deletedVerifiedUrls": [
                f"https://note.com/royal_lion645/n/{key}"
                for key in group["deleteKeys"]
            ],
            "remainingForTitle": 0,
        }
    save(path, ledger)


def main() -> None:
    assert len(GROUPS) == 6
    assert len(DELETED_KEYS) == 7 and len(set(DELETED_KEYS)) == 7
    assert len(KEEPER_KEYS) == 6 and len(set(KEEPER_KEYS)) == 6
    assert set(DELETED_KEYS).isdisjoint(KEEPER_KEYS)
    create_receipt()
    update_plans()
    update_controls()
    update_free_ledger()
    print(
        json.dumps(
            {
                "duplicateTitleGroupsResolved": 6,
                "extraPagesDeletedVerified": 7,
                "remainingDuplicateGroups": 0,
                "scheduledTasks": "enabled_ready",
                "publicationBatch": "complete_12_of_12",
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
