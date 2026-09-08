param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("sep7", "sep8")]
    [string]$Target,

    [Parameter(Mandatory = $true)]
    [string]$BotPath
)

$ErrorActionPreference = "Stop"

$sets = @{
    sep4 = @(
        "084_three_way_match_exception_os_20260904",
        "085_bank_reconciliation_open_items_os_20260904",
        "086_policy_exception_approval_os_20260904",
        "087_document_version_approval_os_20260904",
        "088_supplier_bank_change_verification_os_20260904"
    )
    sep5 = @(
        "089_vendor_onboarding_due_diligence_os_20260905",
        "090_recurring_journal_review_os_20260905",
        "091_credit_limit_override_os_20260905",
        "092_sensitive_data_handoff_os_20260905",
        "093_incident_customer_notification_os_20260905"
    )
    sep6 = @(
        "094_purchase_order_change_os_20260906",
        "095_payroll_master_change_os_20260906",
        "096_marketing_consent_evidence_os_20260906",
        "097_asset_checkout_return_os_20260906",
        "098_ai_output_review_trace_os_20260906"
    )
    sep7 = @(
        "099_employee_offboarding_access_os_20260907",
        "100_duplicate_expense_claim_os_20260907",
        "101_saas_admin_privilege_review_os_20260907",
        "102_contract_renewal_notice_os_20260907",
        "103_customer_refund_exception_os_20260907"
    )
    sep8 = @(
        "104_vendor_master_cleanup_os_20260908",
        "105_corporate_card_spend_control_os_20260908",
        "106_customer_data_retention_os_20260908",
        "107_invoice_number_gap_control_os_20260908",
        "108_software_license_seat_optimization_os_20260908"
    )
}

if (-not (Test-Path -LiteralPath $BotPath -PathType Leaf)) {
    throw "BOOTH_BOT_NOT_FOUND $BotPath"
}

$source = [IO.File]::ReadAllText($BotPath)
$targets = $sets[$Target]
$changed = 0

foreach ($sourceSet in $sets.Values) {
    for ($index = 0; $index -lt 5; $index++) {
        $old = $sourceSet[$index]
        $new = $targets[$index]
        if ($source.Contains($old)) {
            if ($old -ne $new) {
                $source = $source.Replace($old, $new)
                $changed++
            }
        }
    }
}

foreach ($id in $targets) {
    if (-not $source.Contains($id)) {
        throw "BOOTH_TARGET_MISSING_AFTER_PATCH $Target $id"
    }
}

$backup = "$BotPath.before_sep8_catchup.bak"
if ($changed -gt 0 -and -not (Test-Path -LiteralPath $backup)) {
    Copy-Item -LiteralPath $BotPath -Destination $backup
}
if ($changed -gt 0) {
    [IO.File]::WriteAllText($BotPath, $source, [Text.UTF8Encoding]::new($false))
}

Write-Output "BOOTH_TARGET_ALIGNMENT_OK target=$Target changed=$changed verified=5"
