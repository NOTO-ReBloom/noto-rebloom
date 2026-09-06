from pathlib import Path
import json


ROOT = Path(__file__).resolve().parents[2]
SOURCE_LOG_SHA256 = "2887947d577d08f2fb5f8e349349eca84b54d00c149725567c5cacf8ea52feb7"
RECONCILED_AT = "2026-09-06T12:00:00+09:00"

PAID = {
    "note_20260904_78_bank_reconciliation_open_items_control": {
        "url": "https://note.com/royal_lion645/n/n913053a54df8",
        "verifiedAt": "2026-09-05T05:18:00+09:00",
    },
    "note_20260904_79_policy_exception_approval_control": {
        "url": "https://note.com/royal_lion645/n/n5f2f681d5e86",
        "verifiedAt": "2026-09-05T05:18:30+09:00",
    },
}

FREE = {
    "free_note_20260904_01_three_way_match_warning_signals": {
        "url": "https://note.com/royal_lion645/n/n13563ab3e2ea",
        "verifiedAt": "2026-09-05T05:19:39.514+09:00",
    },
    "free_note_20260904_02_supplier_bank_change_risk_signals": {
        "url": "https://note.com/royal_lion645/n/n663bf37707d1",
        "verifiedAt": "2026-09-05T05:20:22.786+09:00",
    },
}

BOOTH = {
    "084_three_way_match_exception_os_20260904": {
        "url": "https://booth.pm/ja/items/8806747", "item": "8806747",
        "verifiedAt": "2026-09-05T05:21:45.180+09:00",
    },
    "085_bank_reconciliation_open_items_os_20260904": {
        "url": "https://booth.pm/ja/items/8806749", "item": "8806749",
        "verifiedAt": "2026-09-05T05:22:20.990+09:00",
    },
    "086_policy_exception_approval_os_20260904": {
        "url": "https://booth.pm/ja/items/8806750", "item": "8806750",
        "verifiedAt": "2026-09-05T05:22:58.842+09:00",
    },
    "087_document_version_approval_os_20260904": {
        "url": "https://booth.pm/ja/items/8806751", "item": "8806751",
        "verifiedAt": "2026-09-05T05:23:41.882+09:00",
    },
    "088_supplier_bank_change_verification_os_20260904": {
        "url": "https://booth.pm/ja/items/8806752", "item": "8806752",
        "verifiedAt": "2026-09-05T05:24:32.519+09:00",
    },
}


def load(path):
    return json.loads(path.read_text("utf-8-sig"))


def save(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), "utf-8")


def lock_queue_entry(entry, evidence):
    entry["enabled"] = False
    entry["forceRetry"] = False
    entry["forcePublicationNow"] = False
    entry["recoveryMode"] = "completed; preserve canonical public URL and do not republish"
    entry["publicUrlVerified"] = True
    entry["publicUrl"] = evidence["url"]
    entry["verificationState"] = (
        "buyer_visible_verified" if "booth.pm" in evidence["url"] else "reader_visible_verified"
    )
    entry["verifiedAt"] = evidence["verifiedAt"]


paid_index_path = ROOT / "sidehustle-autopublish/note/queue/index.json"
paid_index = load(paid_index_path)
paid_by_id = {entry["id"]: entry for entry in paid_index["entries"]}
for queue_id, evidence in PAID.items():
    entry = paid_by_id[queue_id]
    lock_queue_entry(entry, evidence)
    receipt = {
        "id": queue_id,
        "title": entry["title"],
        "publicUrl": evidence["url"],
        "publicUrlVerified": True,
        "expectedPriceJPY": entry["expectedPriceJPY"],
        "titleVerified": True,
        "priceVerified": True,
        "paidBoundaryVerified": True,
        "purchasePathVerified": True,
        "dedicatedCoverVerified": True,
        "anonymousReaderVerified": True,
        "verifiedAt": evidence["verifiedAt"],
        "reconciledAt": RECONCILED_AT,
        "verificationMode": "windows-publisher-anonymous-reader-verification",
        "sourceLogSha256": SOURCE_LOG_SHA256,
    }
    save(ROOT / f"sidehustle-autopublish/note/publication_receipts/{queue_id}.json", receipt)
save(paid_index_path, paid_index)


free_index_path = ROOT / "sidehustle-autopublish/note/free_queue/index.json"
free_index = load(free_index_path)
free_by_id = {entry["id"]: entry for entry in free_index["entries"]}
free_ledger_path = ROOT / "sidehustle-autopublish/note/free_publication_ledger.json"
free_ledger = load(free_ledger_path)
free_ledger_by_id = {entry["id"]: entry for entry in free_ledger["entries"]}
for queue_id, evidence in FREE.items():
    entry = free_by_id[queue_id]
    lock_queue_entry(entry, evidence)
    entry["verificationState"] = "reader_visible_free_verified"
    ledger_entry = {
        "id": queue_id,
        "title": entry["title"],
        "publicUrl": evidence["url"],
        "publicUrlVerified": True,
        "freeStateVerified": True,
        "coverImageVerified": True,
        "verifiedAt": evidence["verifiedAt"],
        "reconciledAt": RECONCILED_AT,
        "verification": {
            "ok": True,
            "url": evidence["url"],
            "status": 200,
            "titleOk": True,
            "freeState": True,
            "largeImageCount": 1,
            "evidence": "FREE_PUBLISH_SUCCESS_VERIFIED from the pinned Sep 4 Windows execution log.",
        },
        "sourceLogSha256": SOURCE_LOG_SHA256,
    }
    if queue_id in free_ledger_by_id:
        free_ledger_by_id[queue_id].update(ledger_entry)
    else:
        free_ledger["entries"].append(ledger_entry)
free_ledger["version"] = int(free_ledger.get("version", 0)) + 1
free_ledger["updatedAt"] = RECONCILED_AT
save(free_index_path, free_index)
save(free_ledger_path, free_ledger)


booth_index_path = ROOT / "booth-autopublish/queue/index.json"
booth_index = load(booth_index_path)
booth_by_id = {entry["id"]: entry for entry in booth_index["entries"]}
booth_ledger_path = ROOT / "booth-autopublish/monitor/publication_ledger.json"
booth_ledger = load(booth_ledger_path)
booth_ledger_by_id = {entry["queueId"]: entry for entry in booth_ledger["entries"]}
for queue_id, evidence in BOOTH.items():
    entry = booth_by_id[queue_id]
    lock_queue_entry(entry, evidence)
    ledger_entry = {
        "queueId": queue_id,
        "title": entry["title"],
        "boothItemId": evidence["item"],
        "publicUrl": evidence["url"],
        "publicUrlVerified": True,
        "expectedPriceJPY": entry["expectedPriceJPY"],
        "verifiedAt": evidence["verifiedAt"],
        "reconciledAt": RECONCILED_AT,
        "verificationEvidence": "Windows buyer-browser verification returned HTTP 200 with exact title, expected price and public BOOTH page; repeated PUBLIC_RECOVERY_SUCCESS confirmed the canonical URL.",
        "publishMode": "sep4-all12-now-v1",
        "sourceLogSha256": SOURCE_LOG_SHA256,
    }
    if queue_id in booth_ledger_by_id:
        booth_ledger_by_id[queue_id].update(ledger_entry)
    else:
        booth_ledger["entries"].append(ledger_entry)
booth_ledger["version"] = int(booth_ledger.get("version", 0)) + 1
booth_ledger["updatedAt"] = RECONCILED_AT
save(booth_index_path, booth_index)
save(booth_ledger_path, booth_ledger)

print(json.dumps({
    "reconciled": {"paid": len(PAID), "free": len(FREE), "booth": len(BOOTH), "total": len(PAID) + len(FREE) + len(BOOTH)},
    "remainingSep4Paid": [queue_id for queue_id in [
        "note_20260904_77_three_way_match_exception_control",
        "note_20260904_80_document_version_approval_conflict_control",
        "note_20260904_81_supplier_bank_change_verification_control",
    ] if paid_by_id[queue_id]["enabled"]],
    "sourceLogSha256": SOURCE_LOG_SHA256,
}, ensure_ascii=False))
