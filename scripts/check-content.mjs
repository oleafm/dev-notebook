import { readFileSync } from 'node:fs';

const notes = JSON.parse(readFileSync(new URL('../src/data/entries.json', import.meta.url), 'utf8'));
const required = ['id', 'kind', 'title', 'summary', 'createdAt', 'updatedAt'];
const seen = new Set();
const problems = [];

if (!Array.isArray(notes)) problems.push('Root value must be an array');
else notes.forEach((entry, index) => {
  for (const field of required) if (typeof entry[field] !== 'string' || !entry[field].trim()) problems.push(`#${index} missing ${field}`);
  if (seen.has(entry.id)) problems.push(`Duplicate id: ${entry.id}`);
  seen.add(entry.id);
  if (entry.kind === 'knowledge') {
    if (typeof entry.category !== 'string') problems.push(`#${index} missing category`);
    if (!Array.isArray(entry.checkQuestions)) problems.push(`#${index} checkQuestions must be an array`);
  } else if (entry.kind === 'journal') {
    if (typeof entry.date !== 'string') problems.push(`#${index} missing date`);
    if (!Array.isArray(entry.reflections)) problems.push(`#${index} reflections must be an array`);
  } else problems.push(`#${index} unknown entry kind: ${entry.kind}`);
});

if (problems.length) { console.error('Content check failed:\n' + problems.join('\n')); process.exitCode = 1; }
else console.log(`Content check passed: ${notes.length} valid entries with unique IDs.`);
