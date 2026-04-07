// Maps urge contexts to recommended DBT skill IDs
// Each context maps to 3 skills that are most helpful for that situation
export const CONTEXT_SKILL_MAP = {
  'Bored': ['build-mastery', 'distract-accepts', 'opposite-action'],
  'Lonely': ['opposite-action', 'self-soothe-touch', 'dear-man'],
  'Stressed': ['tipp-temperature', 'tipp-paced-breathing', 'stop-skill'],
  'Manic energy': ['tipp-intense-exercise', 'body-scan', 'check-the-facts'],
  'Triggered by something I saw': ['observe-describe', 'body-scan', 'radical-acceptance'],
  "Can't sleep": ['tipp-progressive-relaxation', 'tipp-paced-breathing', 'body-scan'],
  'Fighting with someone': ['stop-skill', 'walking-middle-path', 'dear-man'],
  "Don't know": ['wise-mind', 'observe-describe', 'check-the-facts'],
  'Other': ['wise-mind', 'observe-describe', 'check-the-facts'],
}
