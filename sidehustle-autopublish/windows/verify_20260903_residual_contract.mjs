const REPO_RAW = process.argv[2];

if (!/^https:\/\/raw\.githubusercontent\.com\/NOTO-ReBloom\/noto-rebloom\/[0-9a-f]{40}\/$/.test(REPO_RAW || '')) {
  throw new Error('PINNED_RAW_BASE_REQUIRED');
}

const PAID_DONE = {
  note_20260903_72_contract_signature_turnaround_control: 'https://note.com/royal_lion645/n/n94a96110400c',
  note_20260903_73_customer_master_duplicate_control: 'https://note.com/royal_lion645/n/n9782796e2857',
  note_20260903_74_postmortem_action_closure_control: 'https://note.com/royal_lion645/n/nd0b530562745',
  note_20260903_75_inventory_cycle_count_variance_control: 'https://note.com/royal_lion645/n/n4f1f5e12ef5e',
  note_20260903_76_expense_receipt_completeness_control: 'https://note.com/royal_lion645/n/nfa5ad51667e5',
};
const FREE_PENDING = [];
const FREE_DONE = {
  free_note_20260902_01_invoice_approval_delay_signals: 'https://note.com/royal_lion645/n/n90f707a012ef',
  free_note_20260902_02_monthly_close_delay_signals: 'https://note.com/royal_lion645/n/n38ad5600146a',
  free_note_20260903_01_contract_signature_delay_signals: 'https://note.com/royal_lion645/n/n67d8fe752122',
  free_note_20260903_02_expense_receipt_missing_signals: 'https://note.com/royal_lion645/n/n311539ed71c8',
};
const BOOTH_DONE = {
  '074_invoice_approval_cycle_os_20260902': 'https://booth.pm/ja/items/8802284',
  '075_monthly_close_exception_os_20260902': 'https://booth.pm/ja/items/8802287',
  '076_knowledge_base_freshness_os_20260902': 'https://booth.pm/ja/items/8802293',
  '077_vendor_access_offboarding_os_20260902': 'https://booth.pm/ja/items/8802296',
  '078_refund_aging_os_20260902': 'https://booth.pm/ja/items/8802298',
  '079_contract_signature_turnaround_os_20260903': 'https://booth.pm/ja/items/8801001',
  '080_customer_master_duplicate_control_os_20260903': 'https://booth.pm/ja/items/8801006',
  '081_postmortem_action_closure_os_20260903': 'https://booth.pm/ja/items/8801009',
  '082_inventory_cycle_count_variance_os_20260903': 'https://booth.pm/ja/items/8801015',
  '083_expense_receipt_completeness_os_20260903': 'https://booth.pm/ja/items/8801018',
};

async function getText(path) {
  const response = await fetch(REPO_RAW + path, {
    headers: {'cache-control': 'no-cache', 'user-agent': 'SIDEHUSTLE-FINAL-FREE-PUBLISHER/1.0'},
  });
  if (!response.ok) throw new Error(`HTTP_${response.status}_${path}`);
  return response.text();
}

async function getJson(path) {
  return JSON.parse(await getText(path));
}

function mapById(entries, key = 'id') {
  return new Map((entries || []).map(entry => [entry[key], entry]));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function articleBody(markdown, title) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const heading = markdown.match(new RegExp(`^##\\s+\\d+\\.\\s+${escaped}\\s*$`, 'm'));
  assert(heading, `SOURCE_SECTION_MISSING_${title}`);
  const tail = markdown.slice((heading.index || 0) + heading[0].length);
  const separator = tail.search(/\n---\s*(?:\n|$)/);
  return (separator >= 0 ? tail.slice(0, separator) : tail).trim();
}

const [paid, free, booth, manifest, freeLedger, boothLedger] = await Promise.all([
  getJson('sidehustle-autopublish/note/queue/index.json'),
  getJson('sidehustle-autopublish/note/free_queue/index.json'),
  getJson('booth-autopublish/queue/index.json'),
  getJson('sidehustle-autopublish/note/free_publisher/manifest.json'),
  getJson('sidehustle-autopublish/note/free_publication_ledger.json'),
  getJson('booth-autopublish/monitor/publication_ledger.json'),
]);
const paidMap = mapById(paid.entries);
const freeMap = mapById(free.entries);
const boothMap = mapById(booth.entries);
const freeLedgerMap = mapById(freeLedger.entries);
const boothLedgerMap = mapById(boothLedger.entries, 'queueId');

for (const [id, url] of Object.entries(PAID_DONE)) {
  const item = paidMap.get(id);
  assert(item && item.enabled === false && item.publicUrlVerified === true && item.publicUrl === url, `PAID_DONE_CONTRACT_${id}`);
}
for (const id of FREE_PENDING) {
  const item = freeMap.get(id);
  assert(item && item.enabled === true && item.forceRetry === true, `FREE_PENDING_CONTRACT_${id}`);
  assert(item.kind === 'free' && Number(item.price) === 0 && item.sourceBatchPath, `FREE_PENDING_IDENTITY_${id}`);
  const markdown = await getText(item.sourceBatchPath);
  const body = articleBody(markdown, item.title);
  assert(body.length >= 500, `FREE_PENDING_BODY_TOO_SHORT_${id}_${body.length}`);
}
for (const [id, url] of Object.entries(FREE_DONE)) {
  const item = freeMap.get(id);
  const ledger = freeLedgerMap.get(id);
  assert(item && item.enabled === false && item.publicUrlVerified === true && item.publicUrl === url, `FREE_DONE_CONTRACT_${id}`);
  assert(ledger && ledger.publicUrlVerified === true && ledger.freeStateVerified === true && ledger.coverImageVerified === true && ledger.publicUrl === url, `FREE_LEDGER_CONTRACT_${id}`);
}
for (const [id, url] of Object.entries(BOOTH_DONE)) {
  const item = boothMap.get(id);
  const ledger = boothLedgerMap.get(id);
  assert(item && item.enabled === false && item.publicUrlVerified === true && item.publicUrl === url, `BOOTH_DONE_CONTRACT_${id}`);
  assert(ledger && ledger.publicUrlVerified === true && ledger.publicUrl === url, `BOOTH_LEDGER_CONTRACT_${id}`);
}

const activePaid = paid.entries.filter(item => item.enabled === true).map(item => item.id);
const activeFree = free.entries.filter(item => item.enabled === true).map(item => item.id);
const activeBooth = booth.entries.filter(item => item.enabled === true).map(item => item.id);
assert(activePaid.length === 0, `UNEXPECTED_PAID_ACTIVE_${activePaid.join(',')}`);
assert(JSON.stringify(activeFree) === JSON.stringify(FREE_PENDING), `UNEXPECTED_FREE_ACTIVE_${activeFree.join(',')}`);
assert(activeBooth.length === 0, `UNEXPECTED_BOOTH_ACTIVE_${activeBooth.join(',')}`);
assert(free.activePriorityBatch?.requiredStrictPublications === 0, 'FREE_ACTIVE_BATCH_COUNT');
assert(JSON.stringify(free.activePriorityBatch?.orderedIds) === JSON.stringify(FREE_PENDING), 'FREE_ACTIVE_BATCH_ORDER');
assert(Array.isArray(booth.outstandingDates) && booth.outstandingDates.length === 0, 'BOOTH_OUTSTANDING_DATES_NOT_EMPTY');
assert(manifest.runtimeSha256 === 'fe5dae2086f0cd02db91535f8ae412c7d534a941fe655be879868a975f2381ae', 'FREE_RUNTIME_MANIFEST_SHA_MISMATCH');

console.log('REMOTE_SEP2_SEP3_COMPLETE_CONTRACT_OK paid_locked=5 free_locked=4 booth_locked=10 total_pending=0');
