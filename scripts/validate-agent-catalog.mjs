import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'agents');
const catalogPath = path.join(root, 'index.json');
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const agents = Array.isArray(catalog.agents) ? catalog.agents : [];
const projectAgents = agents.filter((agent) => agent.sourceType === 'project-preset');
const upstreamAgents = agents.filter((agent) => agent.sourceType !== 'project-preset');
const expectedNames = [
    '家庭医生信息助手（非诊断）',
    'Linux 系统专家',
    'macOS 系统专家',
    'Windows 系统专家'
];

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function duplicates(values) {
    const seen = new Set();
    const repeated = new Set();
    for (const value of values) {
        if (seen.has(value)) repeated.add(value);
        seen.add(value);
    }
    return [...repeated];
}

assert(catalog.count === 388, `Expected catalog count 388, received ${catalog.count}.`);
assert(agents.length === 388, `Expected 388 catalog entries, received ${agents.length}.`);
assert(upstreamAgents.length === 268, `Expected 268 upstream agents, received ${upstreamAgents.length}.`);
assert(projectAgents.length === 120, `Expected 120 project presets, received ${projectAgents.length}.`);
assert(duplicates(agents.map((agent) => agent.id)).length === 0, 'Catalog contains duplicate IDs.');
assert(duplicates(projectAgents.map((agent) => agent.name)).length === 0, 'Project presets contain duplicate names.');

const sourceCounts = new Map((catalog.sources || []).map((source) => [source.id, source.count]));
assert(sourceCounts.get('agency-agents-zh') === 268, 'Upstream source count must be 268.');
assert(sourceCounts.get('ai-shakedown-task-presets') === 120, 'Project preset source count must be 120.');
for (const name of expectedNames) assert(projectAgents.some((agent) => agent.name === name), `Missing required preset: ${name}`);

for (const agent of agents) {
    assert(typeof agent.contentPath === 'string' && agent.contentPath.startsWith('agents/content/'), `Invalid content path for ${agent.id}.`);
    const relativePath = agent.contentPath.replace(/^agents\//, '');
    const filePath = path.resolve(root, relativePath);
    assert(filePath.startsWith(`${root}${path.sep}`), `Content path escapes the agent directory: ${agent.id}.`);
    assert((await stat(filePath)).isFile(), `Missing content file for ${agent.id}.`);
    if (agent.sourceType === 'project-preset') {
        assert(agent.presetRevision === catalog.taskPresetRevision, `Preset revision mismatch for ${agent.id}.`);
        assert(/^[a-f0-9]{12}$/.test(agent.contentRevision || ''), `Invalid content revision for ${agent.id}.`);
    }
}

const presetDirectory = path.join(root, 'content', 'task-presets');
const generatedFiles = (await readdir(presetDirectory)).filter((name) => name.endsWith('.md'));
assert(generatedFiles.length === 120, `Expected 120 generated Markdown files, received ${generatedFiles.length}.`);

const healthAgents = projectAgents.filter((agent) => agent.department === 'health-care');
assert(healthAgents.length >= 10, 'Expected at least 10 health and care presets.');
for (const agent of healthAgents) {
    const content = await readFile(path.resolve(root, agent.contentPath.replace(/^agents\//, '')), 'utf8');
    assert(content.includes('不诊断、不替代医生、不自行调整处方'), `Missing medical boundary in ${agent.id}.`);
    assert(content.includes('当地急救服务'), `Missing emergency escalation in ${agent.id}.`);
}

console.log(`Validated ${agents.length} agents: ${upstreamAgents.length} upstream + ${projectAgents.length} project presets.`);
