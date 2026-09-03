const REPO_RAW = process.argv[2];

if (!/^https:\/\/raw\.githubusercontent\.com\/NOTO-ReBloom\/noto-rebloom\/[0-9a-f]{40}\/$/.test(REPO_RAW || '')) {
  throw new Error('PINNED_RAW_BASE_REQUIRED');
}

const NONCE = 'verified-residual-20260903-v2';
const PAID_DONE = {
  note_20260903_72_contract_signature_turnaround_control: 'https://note.com/royal_lion645/n/n94a96110400c',
  note_20260903_73_customer_master_duplicate_control: 'https://note.com/royal_lion645/n/n9782796e2857',
  note_20260903_74_postmortem_action_closure_control: 'https://note.com/royal_lion645/n/nd0b530562745',
  note_20260903_75_inventory_cycle_count_variance_control: 'https://note.com/royal_lion645/n/n4f1f5e12ef5e',
  note_20260903_76_expense_receipt_completeness_control: 'https://note.com/royal_lion645/n/nfa5ad51667e5',
};
const FREE_PENDING = [
  'free_note_20260902_01_invoice_approval_delay_signals',
  'free_note_20260902_02_monthly_close_delay_signals',
  'free_note_20260903_01_contract_signature_delay_signals',
  'free_note_20260903_02_expense_receipt_missing_signals',
];
const BOOTH_PENDING = [
  '074_invoice_approval_cycle_os_20260902',
  '075_monthly_close_exception_os_20260902',
  '076_knowledge_base_freshness_os_20260902',
  '077_vendor_access_offboarding_os_20260902',
  '078_refund_aging_os_20260902',
];
const BOOTH_DONE = {
  '079_contract_signature_turnaround_os_20260903': 'https://booth.pm/ja/items/8801001',
  '080_customer_master_duplicate_control_os_20260903': 'https://booth.pm/ja/items/8801006',
  '081_postmortem_action_closure_os_20260903': 'https://booth.pm/ja/items/8801009',
  '082_inventory_cycle_count_variance_os_20260903': 'https://booth.pm/ja/items/8801015',
  '083_expense_receipt_completeness_os_20260903': 'https://booth.pm/ja/items/8801018',
};

async function getJson(path) {
  const response = await fetch(REPO_RAW + path, {
    headers: {'cache-control': 'no-cache', 'user-agent': 'SIDEHUSTLE-RESIDUAL-PUBLISHER/2.0'},
  });
  if (!response.ok) throw new Error(`HTTP_${response.status}_${path}`);
  return response.json();
}

function mapById(entries) {
  return new Map((entries || []).map(entry => [entry.id, entry]));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [paid, free, booth, manifest] = await Promise.all([
  getJson('sidehustle-autopublish/note/queue/index.json'),
  getJson('sidehustle-autopublish/note/free_queue/index.json'),
  getJson('booth-autopublish/queue/index.json'),
  getJson('sidehustle-autopublish/note/free_publisher/manifest.json'),
]);
const paidMap = mapById(paid.entries);
const freeMap = mapById(free.entries);
const boothMap = mapById(booth.entries);

for (const [id, url] of Object.entries(PAID_DONE)) {
  const item = paidMap.get(id);
  assert(item && item.enabled === false && item.publicUrlVerified === true && item.publicUrl === url, `PAID_DONE_CONTRACT_${id}`);
}
for (const id of FREE_PENDING) {
  const item = freeMap.get(id);
  assert(item && item.enabled === true && item.forceRetry === true && item.forceRetryNonce === NONCE, `FREE_PENDING_CONTRACT_${id}`);
}
for (const id of BOOTH_PENDING) {
  const item = boothMap.get(id);
  assert(item && item.enabled === true && item.forceRetry === true && item.forceRetryNonce === NONCE, `BOOTH_PENDING_CONTRACT_${id}`);
}
for (const [id, url] of Object.entries(BOOTH_DONE)) {
  const item = boothMap.get(id);
  assert(item && item.enabled === false && item.publicUrlVerified === true && item.publicUrl === url, `BOOTH_DONE_CONTRACT_${id}`);
}

const activePaid = paid.entries.filter(item => item.enabled === true).map(item => item.id);
const activeFree = free.entries.filter(item => item.enabled === true).map(item => item.id);
const activeBooth = booth.entries.filter(item => item.enabled === true).map(item => item.id);
assert(activePaid.length === 0, `UNEXPECTED_PAID_ACTIVE_${activePaid.join(',')}`);
assert(JSON.stringify(activeFree) === JSON.stringify(FREE_PENDING), `UNEXPECTED_FREE_ACTIVE_${activeFree.join(',')}`);
assert(JSON.stringify(activeBooth) === JSON.stringify(BOOTH_PENDING), `UNEXPECTED_BOOTH_ACTIVE_${activeBooth.join(',')}`);
assert(manifest.runtimeSha256 === '70e03588b399c1c1cdaf09dfad25ac836d1dc15f5298f0e96d33e5bb895bb5d0', 'FREE_RUNTIME_MANIFEST_SHA_MISMATCH');

console.log('REMOTE_RESIDUAL_CONTRACT_OK paid_locked=5 free_pending=4 booth_locked=5 booth_pending=5 duplicates=0 total_pending=9');
