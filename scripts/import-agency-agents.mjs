import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const sourceRoot = path.resolve(process.argv[2] || 'agency-agents-zh');
const outputRoot = path.resolve(process.argv[3] || 'agents');
const sourceRepository = 'https://github.com/jnMetaCode/agency-agents-zh';
const departmentNames = {
    academic: '学术部',
    design: '设计部',
    engineering: '工程部',
    finance: '金融部',
    'game-development': '游戏开发部',
    gis: 'GIS 部',
    hr: '人力资源部',
    legal: '法务部',
    marketing: '营销部',
    'paid-media': '付费媒体部',
    product: '产品部',
    'project-management': '项目管理部',
    sales: '销售部',
    security: '安全部',
    'spatial-computing': '空间计算部',
    specialized: '专业服务部',
    'supply-chain': '供应链部',
    support: '支持部',
    testing: '测试部'
};

async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        const absolutePath = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...await walk(absolutePath));
        else if (entry.isFile() && entry.name.endsWith('.md')) files.push(absolutePath);
    }
    return files;
}

function parseAgent(markdown, relativePath) {
    const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!frontmatter) return null;

    const metadata = {};
    for (const line of frontmatter[1].split(/\r?\n/)) {
        const match = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
        if (match) metadata[match[1]] = match[2].trim().replace(/^(["'])(.*)\1$/, '$2');
    }
    if (!metadata.name || !metadata.description) return null;

    const department = relativePath.split('/')[0];
    if (!departmentNames[department]) return null;
    return {
        metadata,
        body: markdown.slice(frontmatter[0].length).trim(),
        department
    };
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(path.join(outputRoot, 'content'), { recursive: true });

const agents = [];
for (const absolutePath of await walk(sourceRoot)) {
    const relativePath = path.relative(sourceRoot, absolutePath).split(path.sep).join('/');
    const parsed = parseAgent(await readFile(absolutePath, 'utf8'), relativePath);
    if (!parsed) continue;

    const contentPath = `agents/content/${relativePath}`;
    const outputPath = path.join(outputRoot, 'content', relativePath);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${parsed.body}\n`, 'utf8');
    agents.push({
        id: relativePath.replace(/\.md$/, ''),
        name: parsed.metadata.name,
        description: parsed.metadata.description,
        emoji: parsed.metadata.emoji || '',
        color: parsed.metadata.color || '',
        department: parsed.department,
        departmentName: departmentNames[parsed.department],
        path: relativePath,
        contentPath,
        sourceUrl: `${sourceRepository}/blob/main/${relativePath}`
    });
}

agents.sort((left, right) => (
    left.departmentName.localeCompare(right.departmentName, 'zh-CN')
    || left.name.localeCompare(right.name, 'zh-CN')
));

const sourcePackage = JSON.parse(await readFile(path.join(sourceRoot, 'package.json'), 'utf8'));
const sourceRevision = process.env.AGENCY_AGENTS_REVISION || '';
await writeFile(path.join(outputRoot, 'index.json'), `${JSON.stringify({
    source: sourceRepository,
    version: sourcePackage.version,
    revision: sourceRevision,
    license: sourcePackage.license,
    count: agents.length,
    departments: Object.entries(departmentNames).map(([id, name]) => ({ id, name })),
    agents
})}\n`, 'utf8');
await cp(path.join(sourceRoot, 'LICENSE'), path.join(outputRoot, 'LICENSE.agency-agents-zh'));

console.log(`Imported ${agents.length} agents from agency-agents-zh ${sourcePackage.version}.`);
