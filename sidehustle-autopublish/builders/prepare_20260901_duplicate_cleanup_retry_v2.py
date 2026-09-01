#!/usr/bin/env python3
"""Record the safe confirmation-UI failure and prepare the v2 cleanup retry."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
UPDATED_AT = "2026-09-01T21:43:45+09:00"
SCRIPT = "sidehustle-autopublish/note/windows/delete_duplicate_note_20260901.mjs"
PLAN = "sidehustle-autopublish/note/windows/note_duplicate_cleanup_remaining_20260901.json"
REMAINING_QUEUE_IDS = {
    "free_note_20260829_02_cashflow_warning_signals",
    "free_note_20260829_01_contract_renewal_signals",
    "free_note_20260828_02_ai_efficiency_measurement_signals",
}

FAILED_ATTEMPT = {
    "launcherVersion": "2026-09-01-FINAL-CLEANUP-AND-RESUME-V1",
    "startedAt": "2026-09-01T21:40:28.390+09:00",
    "endedAt": "2026-09-01T21:42:05.860+09:00",
    "deleted": 0,
    "alreadyRemoved": 0,
    "failed": 3,
    "failure": "DELETE_CONFIRM_BUTTON_NOT_FOUND",
    "prechecksPassed": 3,
    "targetsStillPublic": 3,
    "keepersStillPublic": 3,
    "remainingDuplicateGroups": 3,
    "scheduledTasksState": "disabled",
    "safetyOutcome": "No target or keeper was deleted; scheduled publishers remained disabled.",
}


def load(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def save(path: str, data: dict) -> None:
    (ROOT / path).write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def patch_cleanup_state(state: dict) -> None:
    state["status"] = "round1_complete_final_cleanup_retry_v2_ready"
    state["lastAttempt"] = FAILED_ATTEMPT
    remaining = state["remaining"]
    remaining.update(
        {
            "status": "retry_ready_confirmation_ui_v2",
            "executionScript": SCRIPT,
            "retryReason": "The three exact target and keeper prechecks passed, but note rendered the confirmation control outside the previously assumed dialog scope or after a longer delay.",
            "retryPreparedAt": UPDATED_AT,
        }
    )


def update_plan() -> None:
    plan = load(PLAN)
    plan["version"] = max(int(plan.get("version", 0)), 2)
    plan["updatedAt"] = UPDATED_AT
    plan["status"] = "retry_ready_confirmation_ui_v2"
    plan["executionScript"] = SCRIPT
    plan["lastAttempt"] = FAILED_ATTEMPT
    plan["retrySafety"] = [
        "Keep and delete key sets are unchanged from the independently audited plan.",
        "The v2 script accepts a native browser confirmation or a visible enabled delete-confirm control in either the dialog or page portal.",
        "The v2 script records confirmation controls and page state before failing again.",
        "Scheduled publishers remain disabled unless all three targets become non-public and the global duplicate audit returns zero groups.",
    ]
    save(PLAN, plan)


def update_control_files() -> None:
    gate_path = "sidehustle-autopublish/completion_gate.json"
    gate = load(gate_path)
    gate["version"] = max(int(gate.get("version", 0)), 40)
    gate["updatedAt"] = UPDATED_AT
    patch_cleanup_state(gate["completionEvidence"]["duplicateCleanup"])
    save(gate_path, gate)

    quota_path = "sidehustle-autopublish/publication_quota.json"
    quota = load(quota_path)
    quota["version"] = max(int(quota.get("version", 0)), 69)
    quota["updatedAt"] = UPDATED_AT
    patch_cleanup_state(quota["channels"]["note"]["freeAcquisitionExperiment"]["duplicateCleanup"])
    save(quota_path, quota)

    metrics_path = "sidehustle-autopublish/metrics/current.json"
    metrics = load(metrics_path)
    metrics["version"] = max(int(metrics.get("version", 0)), 46)
    metrics["updatedAt"] = UPDATED_AT
    patch_cleanup_state(metrics["evidence"]["duplicateCleanup"])
    metrics["monitor"]["checkedAt"] = UPDATED_AT
    metrics["monitor"]["nextWindowsAction"] = "Run the v2 guarded cleanup with portal/native-dialog confirmation handling; keep both tasks disabled unless the final global audit returns zero duplicate groups."
    save(metrics_path, metrics)

    strategy_path = "sidehustle-autopublish/strategy/current.json"
    strategy = load(strategy_path)
    strategy["version"] = max(int(strategy.get("version", 0)), 44)
    strategy["updatedAt"] = UPDATED_AT
    patch_cleanup_state(strategy["duplicateCleanup"])
    strategy["windowsPublisher"]["currentRisk"] = "No publication debt and no unintended deletion. The three remaining targets passed identity prechecks but their confirmation controls were not found; v2 handles page portals, native confirmation dialogs and longer render delays. Tasks remain disabled until audit zero."
    save(strategy_path, strategy)

    request_path = "sidehustle-autopublish/windows_publication_request.json"
    request = load(request_path)
    request["version"] = max(int(request.get("version", 0)), 7)
    request["updatedAt"] = UPDATED_AT
    request["mode"] = "completed_sep1_all12_final_duplicate_cleanup_retry_v2"
    request["triggerNonce"] = "sep1-final-duplicate-cleanup-v2-20260901T214345+0900"
    cleanup = request["duplicateCleanup"]
    cleanup.update(
        {
            "requested": True,
            "round": 3,
            "status": "retry_ready_confirmation_ui_v2",
            "executionScript": SCRIPT,
            "lastAttempt": FAILED_ATTEMPT,
            "retryReason": "DELETE_CONFIRM_BUTTON_NOT_FOUND for all three targets after successful exact keeper/target prechecks; no deletion occurred.",
            "requestedAt": UPDATED_AT,
        }
    )
    save(request_path, request)


def update_free_ledger() -> None:
    path = "sidehustle-autopublish/note/free_publication_ledger.json"
    ledger = load(path)
    ledger["version"] = max(int(ledger.get("version", 0)), 3)
    ledger["updatedAt"] = UPDATED_AT
    for entry in ledger["entries"]:
        if entry.get("id") not in REMAINING_QUEUE_IDS:
            continue
        cleanup = entry["duplicateCleanup"]
        cleanup.update(
            {
                "status": "retry_ready_confirmation_ui_v2",
                "executionScript": SCRIPT,
                "lastAttempt": FAILED_ATTEMPT,
                "retryPreparedAt": UPDATED_AT,
            }
        )
    save(path, ledger)


def main() -> None:
    update_plan()
    update_control_files()
    update_free_ledger()
    print(
        json.dumps(
            {
                "failedSafely": 3,
                "deleted": 0,
                "remaining": 3,
                "script": "confirmation_ui_v2_ready",
                "scheduledTasks": "disabled",
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
