import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { applyTaskPresets, taskPresets } from './task-agent-presets.mjs';

const outputRoot = path.resolve(process.argv[2] || 'agents');
const indexPath = path.join(outputRoot, 'index.json');
const catalog = JSON.parse(await readFile(indexPath, 'utf8'));
const updatedCatalog = await applyTaskPresets(outputRoot, catalog);
await writeFile(indexPath, `${JSON.stringify(updatedCatalog)}\n`, 'utf8');

console.log(`Built ${taskPresets.length} task presets; catalog now contains ${updatedCatalog.count} agents.`);
