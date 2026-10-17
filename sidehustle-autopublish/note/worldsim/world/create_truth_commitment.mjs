import fs from 'node:fs';
import crypto from 'node:crypto';
const p='sidehustle-autopublish/note/worldsim/world/observer_truth_v1.json';
const raw=fs.readFileSync(p);
const truth=JSON.parse(raw.toString('utf8'));
const canonical=JSON.stringify(truth);
const sha=crypto.createHash('sha256').update(canonical).digest('hex');
const out={
  version:1,
  worldId:truth.worldId,
  committedTurn:0,
  algorithm:'SHA-256',
  canonicalJsonSha256:sha,
  statement:'Physical geography, fixed resource nodes, turn-0 deep-history evidence and the list of permanent human civilizations were fixed before simulation began. Changes require a new version and new commitment; old commitments remain in Git history.'
};
fs.writeFileSync('sidehustle-autopublish/note/worldsim/world/world_truth_commitment.json',JSON.stringify(out,null,2)+'\n');
console.log(sha);