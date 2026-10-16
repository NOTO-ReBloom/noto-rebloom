# LYRA Population Generation Protocol v1

## Goal
Every resident must exist before the simulation begins as a persistent person with a household, relationships, history, constraints and imperfect beliefs.

The population is not a pool of anonymous "workers" or "consumers". Aggregate statistics must be calculated from citizens, not the reverse.

## Build order

### 1. Physical world first
Settlements, rivers, roads, farms, mines, forests, harbors, distances and seasonal climate are fixed before people are assigned livelihoods.

### 2. Households before personalities
Generate households with plausible age structure:
- couples with and without children
- single adults
- single-parent households
- multigenerational households
- elderly households
- shared worker households
- widowed households

Parent/child ages must be plausible. Siblings share ancestry. Households cannot be random bags of unrelated citizens unless the household type explicitly allows it.

### 3. Livelihoods from geography
Occupation supply is constrained by local resources and actual demand.
Examples:
- fishing communities need fishers, net makers, boatwrights, salt workers, traders and repair workers
- mining settlements need miners, timber workers, haulers, smelters, cooks, healers and tool makers
- river plains need farmers, millers, irrigation workers, boat operators and market traders

No job exists merely for narrative variety.

### 4. Personality from correlated priors
Generate Big Five, values and behavioral tendencies with correlations rather than independent dice rolls.

Examples:
- high conscientiousness modestly raises planning and promise-keeping
- repeated scarcity can raise security value without automatically making someone authoritarian
- successful trading can raise confidence and risk appetite
- caring for dependents can increase short-term security priorities
- grief can temporarily increase withdrawal or risk behavior depending on baseline personality

Country culture shifts distributions slightly but never determines a citizen.

### 5. Personal history
Each adult receives a short pre-simulation history:
- childhood conditions
- one or more formative relationships
- work history
- at least one success or source of pride
- at least one disappointment, fear or unresolved obligation when plausible
- meaningful possessions, skills or debts when relevant

Children receive age-appropriate histories.

### 6. Social graph
Relationships are created from:
- kinship
- household
- neighborhood
- occupation
- age cohort
- prior migration
- shared incidents
- mentorship
- debt/credit
- friendship and rivalry

Trust is directional and unequal.

### 7. Belief graph
Citizens do not know the state file.
Each citizen starts with:
- personally observed facts
- family knowledge
- workplace knowledge
- local rumors
- uncertain beliefs about geography and governance
- different confidence levels

This allows the same event to produce different interpretations.

### 8. Calibration audit
Before turn 0:
- no impossible family ages
- no isolated children without caregivers
- required food/health/repair roles exist
- settlement labor balances are plausible
- wealth and status are not perfectly correlated
- personality distributions are broad
- ideological uniformity is rejected
- network has local clusters, bridges and peripheral citizens
- every citizen has at least one meaningful relationship
- every adult has at least one active goal
- vulnerable households are identifiable from real constraints, not a random "poor" flag

## Simulation rule
Only citizens affected by an event need deep deliberative reasoning in that turn, but every citizen remains persistent and can become relevant later.

For each turn:
1. update material conditions
2. propagate information through the social graph
3. select affected/active citizens
4. run individual decisions
5. aggregate emergent outcomes
6. update relationships, memories and beliefs
7. derive public statistics from the actual population

## Forbidden shortcuts
- "70% of citizens support X" without deriving it from individuals
- creating a citizen retroactively because an article needs a quote
- changing someone's personality to make a plot work
- giving citizens knowledge they could not have obtained
- treating a household as a single mind
- making all citizens of one country share the country's objective function
