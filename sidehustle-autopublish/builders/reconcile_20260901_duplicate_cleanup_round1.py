#!/usr/bin/env python3
"""Record round-one duplicate cleanup and queue the final exact-ID cleanup."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
UPDATED_AT = "2026-09-01T21:31:51+09:00"
ROUND1_STARTED_AT = "2026-09-01T21:26:40.600+09:00"
ROUND1_TARGETS_COMPLETED_AT = "2026-09-01T21:27:54.318+09:00"
ROUND1_ENDED_AT = "2026-09-01T21:28:27.720+09:00"

ROUND1_DELETED = [
    "nbff6024f5dc2",
    "nfa368246e504",
    "ne2ff39f733ad",
    "nb01f3f59f4a1",
]

REMAINING_GROUPS = [
    {
        "title": "黒字でも危ない？｜13週間の資金繰りで先に見る3つのサイン",
        "queueId": "free_note_20260829_02_cashflow_warning_signals",
        "keep": {
            "key": "n75a3f3ef371c",
            "publicUrl": "https://note.com/royal_lion645/n/n75a3f3ef371c",
        },
        "delete": [
            {
                "key": "nb4dba9eb630f",
                "publicUrl": "https://note.com/royal_lion645/n/nb4dba9eb630f",
            }
        ],
    },
    {
        "title": "自動更新で損する前に見る4項目｜契約満了より先に確認する日付",
        "queueId": "free_note_20260829_01_contract_renewal_signals",
        "keep": {
            "key": "n671b603a4d57",
            "publicUrl": "https://note.com/royal_lion645/n/n671b603a4d57",
        },
        "delete": [
            {
                "key": "n0d1af95c1e8b",
                "publicUrl": "https://note.com/royal_lion645/n/n0d1af95c1e8b",
            }
        ],
    },
    {
        "title": "AI導入が『効率化止まり』になる3つのサイン｜効果検証で最初に決める数字",
        "queueId": "free_note_20260828_02_ai_efficiency_measurement_signals",
        "keep": {
            "key": "n4afba968fb75",
            "publicUrl": "https://note.com/royal_lion645/n/n4afba968fb75",
        },
        "delete": [
            {
                "key": "nd2fcda5d27f6",
                "publicUrl": "https://note.com/royal_lion645/n/nd2fcda5d27f6",
            }
        ],
    },
]

ROUND1 = {
    "status": "target_deletions_completed_additional_groups_discovered",
    "launcherVersion": "2026-09-01-CLEANUP-DUPLICATES-AND-RESUME-V1",
    "plan": "sidehustle-autopublish/note/windows/note_duplicate_cleanup_plan_20260901.json",
    "startedAt": ROUND1_STARTED_AT,
    "targetDeletionsCompletedAt": ROUND1_TARGETS_COMPLETED_AT,
    "endedAt": ROUND1_ENDED_AT,
    "targetGroups": 3,
    "targetPages": 4,
    "deletedVerified": 4,
    "alreadyRemoved": 0,
    "failed": 0,
    "deletedOnlyKeys": ROUND1_DELETED,
    "remainingDuplicateGroupsDiscovered": 3,
    "remainingDuplicatePagesDiscovered": 3,
    "scheduledTasksState": "disabled_until_final_duplicate_audit_zero",
}

REMAINING = {
    "status": "pending_guarded_exact_id_deletion",
    "plan": "sidehustle-autopublish/note/windows/note_duplicate_cleanup_remaining_20260901.json",
    "duplicateTitleGroups": 3,
    "extraPagesToDelete": 3,
    "preserveKeeperUrls": [group["keep"]["publicUrl"] for group in REMAINING_GROUPS],
    "deleteOnlyUrls": [
        target["publicUrl"]
        for group in REMAINING_GROUPS
        for target in group["delete"]
    ],
    "auditedAt": UPDATED_AT,
    "auditEvidence": "The launcher final audit discovered all three groups; a fresh public-browser audit confirmed every keeper and target has the exact title and a dedicated cover, and repository ledgers identify the canonical keeper URLs.",
}

CLEANUP_STATE = {
    "status": "round1_complete_round2_pending",
    "round1": ROUND1,
    "remaining": REMAINING,
}


def load(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def save(path: str, data: dict) -> None:
    (ROOT / path).write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def update_initial_plan() -> None:
    path = "sidehustle-autopublish/note/windows/note_duplicate_cleanup_plan_20260901.json"
    plan = load(path)
    plan["status"] = "target_deletions_completed_additional_groups_discovered"
    plan["execution"] = ROUND1
    plan["remainingCleanupPlan"] = REMAINING["plan"]
    save(path, plan)


def create_remaining_plan() -> None:
    plan = {
        "version": 1,
        "account": "royal_lion645",
        "auditedAt": UPDATED_AT,
        "status": "pending_guarded_exact_id_deletion",
        "duplicateTitleGroups": 3,
        "duplicatePagesToDelete": 3,
        "selectionPolicy": [
            "Keep the canonical URL already recorded by the successful controlled publication ledger.",
            "Delete only the explicitly listed extra URL after exact account, title, keeper and target checks.",
            "Enable scheduled publishers only after the final all-title duplicate audit returns zero groups.",
        ],
        "sourceEvidence": {
            "round1FinalAuditAt": "2026-09-01T21:28:17.575+09:00",
            "freshPublicBrowserAuditAt": UPDATED_AT,
            "round1DeletedVerified": 4,
            "round1Failed": 0,
        },
        "groups": REMAINING_GROUPS,
    }
    save(
        "sidehustle-autopublish/note/windows/note_duplicate_cleanup_remaining_20260901.json",
        plan,
    )


def update_control_files() -> None:
    gate_path = "sidehustle-autopublish/completion_gate.json"
    gate = load(gate_path)
    gate["version"] = max(int(gate.get("version", 0)), 39)
    gate["updatedAt"] = UPDATED_AT
    gate["completionEvidence"]["duplicateCleanup"] = CLEANUP_STATE
    save(gate_path, gate)

    quota_path = "sidehustle-autopublish/publication_quota.json"
    quota = load(quota_path)
    quota["version"] = max(int(quota.get("version", 0)), 68)
    quota["updatedAt"] = UPDATED_AT
    quota["channels"]["note"]["freeAcquisitionExperiment"]["duplicateCleanup"] = CLEANUP_STATE
    save(quota_path, quota)

    metrics_path = "sidehustle-autopublish/metrics/current.json"
    metrics = load(metrics_path)
    metrics["version"] = max(int(metrics.get("version", 0)), 45)
    metrics["updatedAt"] = UPDATED_AT
    metrics["objective"] = "Preserve the strictly verified Sep 1 batch, finish the three remaining guarded duplicate deletions, then resume both empty-queue scheduled publishers."
    metrics["evidence"]["duplicateCleanup"] = CLEANUP_STATE
    metrics["monitor"]["checkedAt"] = UPDATED_AT
    metrics["monitor"]["nextWindowsAction"] = "Run the final guarded exact-ID cleanup for three extra URLs; re-enable both scheduled tasks only after the global duplicate audit returns zero groups."
    save(metrics_path, metrics)

    request_path = "sidehustle-autopublish/windows_publication_request.json"
    request = load(request_path)
    request["version"] = max(int(request.get("version", 0)), 6)
    request["updatedAt"] = UPDATED_AT
    request["mode"] = "completed_sep1_all12_final_duplicate_cleanup_requested"
    request["triggerNonce"] = "sep1-final-duplicate-cleanup-20260901T213151+0900"
    request["duplicateCleanup"] = {
        "requested": True,
        "round": 2,
        "mode": "guarded_exact_id_delete_only_then_resume_scheduled_tasks",
        "plan": REMAINING["plan"],
        "account": "royal_lion645",
        "round1DeletedVerifiedKeys": ROUND1_DELETED,
        "deleteOnlyKeys": [
            target["key"]
            for group in REMAINING_GROUPS
            for target in group["delete"]
        ],
        "preserveKeeperKeys": [group["keep"]["key"] for group in REMAINING_GROUPS],
        "remainingDuplicateGroups": 3,
        "remainingDuplicatePages": 3,
        "preconditions": [
            "verify exact account",
            "verify exact title",
            "verify keeper is still public",
            "verify delete target is public and is not keeper",
            "delete only explicit target key",
            "verify target becomes non-public after deletion",
            "verify global duplicate-title audit returns zero groups",
            "never republish during cleanup",
        ],
        "requestedAt": UPDATED_AT,
    }
    save(request_path, request)

    strategy_path = "sidehustle-autopublish/strategy/current.json"
    strategy = load(strategy_path)
    strategy["version"] = max(int(strategy.get("version", 0)), 43)
    strategy["updatedAt"] = UPDATED_AT
    strategy["allocationDecision"]["rank2"] = "Finish the three remaining guarded exact-ID duplicate deletions while preserving the three ledger-canonical pages."
    strategy["duplicateCleanup"] = CLEANUP_STATE
    strategy["windowsPublisher"]["currentRisk"] = "No publication debt. Four planned duplicate pages were deleted and verified; three newly discovered extra pages remain. Both scheduled tasks stay disabled until the final global duplicate audit returns zero."
    save(strategy_path, strategy)


def update_free_ledger() -> None:
    path = "sidehustle-autopublish/note/free_publication_ledger.json"
    ledger = load(path)
    ledger["version"] = max(int(ledger.get("version", 0)), 2)
    ledger["updatedAt"] = UPDATED_AT
    completed_ids = {
        "free_note_20260831_01_invoice_difference_signals",
        "free_note_20260831_02_backup_restore_warning_signals",
        "free_note_20260901_02_support_escalation_signals",
    }
    remaining_ids = {group["queueId"] for group in REMAINING_GROUPS}
    for entry in ledger["entries"]:
        if entry.get("id") in completed_ids:
            entry["duplicateCleanup"] = ROUND1
        if entry.get("id") in remaining_ids:
            entry["duplicateCleanup"] = REMAINING
    save(path, ledger)


def main() -> None:
    assert len(REMAINING_GROUPS) == 3
    assert sum(len(group["delete"]) for group in REMAINING_GROUPS) == 3
    assert len({group["keep"]["key"] for group in REMAINING_GROUPS}) == 3
    assert len(
        {
            target["key"]
            for group in REMAINING_GROUPS
            for target in group["delete"]
        }
    ) == 3
    update_initial_plan()
    create_remaining_plan()
    update_control_files()
    update_free_ledger()
    print(
        json.dumps(
            {
                "round1DeletedVerified": 4,
                "round1Failed": 0,
                "remainingDuplicateGroups": 3,
                "remainingDuplicatePages": 3,
                "scheduledTasks": "disabled_until_final_audit_zero",
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
