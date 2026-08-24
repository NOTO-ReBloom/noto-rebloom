import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));

const sources = read('source_registry.json');
const opportunities = read('opportunity_map.json');
const queue = read('next_topic_queue.json');
const archetypes = read('article_archetypes.json');
const keywords = read('keyword_matrix.json');
const seasonality = read('seasonality_calendar.json');
const intents = read('intent_registry.json');
const routes = read('production_seed_routes.json');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const assertUnique = (values, label) => {
  assert(new Set(values).size === values.length, `Duplicate ${label}`);
};

assertUnique(sources.sources.map(({ id }) => id), 'source IDs');
assertUnique(opportunities.opportunities.map(({ id }) => id), 'opportunity IDs');
assertUnique(archetypes.archetypes.map(({ id }) => id), 'archetype IDs');
assertUnique(intents.publishedIntents.map(({ id }) => id), 'published intent IDs');
assertUnique(routes.routes.map(({ opportunityId }) => opportunityId), 'routed opportunity IDs');

assert(sources.sourceCount === sources.sources.length, 'sourceCount does not match sources.length');
assert(opportunities.opportunityCount === opportunities.opportunities.length, 'opportunityCount does not match opportunities.length');
assert(queue.queueCount === queue.queue.length, 'queueCount does not match queue.length');
assert(archetypes.archetypeCount === archetypes.archetypes.length, 'archetypeCount does not match archetypes.length');
assert(intents.publishedIntentCount === intents.publishedIntents.length, 'publishedIntentCount does not match publishedIntents.length');
assert(routes.opportunityCount === routes.routes.length, 'route opportunityCount does not match routes.length');
assert(routes.articleRouteCount === routes.routes.length * 2, 'articleRouteCount must equal two routes per opportunity');
assert(seasonality.months.length === 12, 'seasonality must contain 12 months');

const sourceIds = new Set(sources.sources.map(({ id }) => id));
const opportunityIds = new Set(opportunities.opportunities.map(({ id }) => id));
const archetypeIds = new Set(archetypes.archetypes.map(({ id }) => id));

for (const item of queue.queue) {
  assert(opportunityIds.has(item.opportunityId), `Unknown queue opportunity: ${item.opportunityId}`);
}

for (const route of routes.routes) {
  assert(opportunityIds.has(route.opportunityId), `Unknown routed opportunity: ${route.opportunityId}`);
  assert(archetypeIds.has(route.freeArchetype), `Unknown free archetype: ${route.freeArchetype}`);
  assert(archetypeIds.has(route.paidArchetype), `Unknown paid archetype: ${route.paidArchetype}`);
}

const filesWithSourceIds = [
  'opportunity_map.json',
  'next_topic_queue.json',
  'article_archetypes.json',
  'keyword_matrix.json',
  'seasonality_calendar.json'
];

let sourceReferenceCount = 0;
const inspectSourceIds = (value, filename) => {
  if (Array.isArray(value)) {
    value.forEach((item) => inspectSourceIds(item, filename));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (key === 'sourceIds' && Array.isArray(child)) {
      for (const sourceId of child) {
        sourceReferenceCount += 1;
        assert(sourceIds.has(sourceId), `Unknown source ${sourceId} in ${filename}`);
      }
    } else {
      inspectSourceIds(child, filename);
    }
  }
};

for (const filename of filesWithSourceIds) inspectSourceIds(read(filename), filename);

let rawCombinationCount = 0;
for (const cluster of keywords.clusters) {
  assert(cluster.readers.length === 3, `${cluster.id} must have 3 readers`);
  assert(cluster.moments.length === 4, `${cluster.id} must have 4 moments`);
  assert(cluster.failures.length === 4, `${cluster.id} must have 4 failures`);
  assert(cluster.artifacts.length === 4, `${cluster.id} must have 4 artifacts`);
  rawCombinationCount += cluster.readers.length * cluster.moments.length * cluster.failures.length * cluster.artifacts.length;
}
assert(rawCombinationCount === keywords.rawCombinationCount, 'rawCombinationCount is incorrect');

console.log(JSON.stringify({
  ok: true,
  sources: sources.sources.length,
  opportunities: opportunities.opportunities.length,
  queue: queue.queue.length,
  archetypes: archetypes.archetypes.length,
  rawKeywordCombinations: rawCombinationCount,
  productionRoutes: routes.routes.length,
  articleRoutes: routes.articleRouteCount,
  registeredPublishedIntents: intents.publishedIntents.length,
  sourceReferencesChecked: sourceReferenceCount
}, null, 2));
