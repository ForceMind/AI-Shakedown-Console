import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const launcherPath = path.join(root, 'assets', 'launch-codex-windows.cmd');
const powershellPath = path.join(root, 'assets', 'launch-codex-windows.ps1');
const frontendPath = path.join(root, 'script.js');
const launcher = fs.readFileSync(launcherPath, 'utf8');
const powershellTemplate = fs.readFileSync(powershellPath, 'utf8');
const frontend = fs.readFileSync(frontendPath, 'utf8');
const marker = 'AI_SHAKEDOWN_POWERSHELL_PAYLOAD_BEGIN';
const placeholder = '__POWERSHELL_PAYLOAD__';

const check = (condition, message) => assert.ok(condition, message);
check(launcher.startsWith('@echo off\n') || launcher.startsWith('@echo off\r\n'), 'CMD must begin with @echo off');
check(launcher.includes('setlocal EnableExtensions DisableDelayedExpansion'), 'CMD must isolate environment changes');
check(launcher.includes('AI_SHAKEDOWN_WRAPPED=1'), 'CMD must identify the wrapped invocation');
check(launcher.includes('set "AI_SHAKEDOWN_LAUNCHER_SELF=%~f0"'), 'CMD must resolve its own absolute path');
check(launcher.includes('powershell.exe -NoProfile -ExecutionPolicy Bypass -Command'), 'CMD must use the required PowerShell flags');
check(launcher.includes(marker), 'CMD must contain the payload marker');
check(launcher.includes('\n' + placeholder + '\n'), 'CMD must contain the replaceable placeholder');
check(launcher.includes('[IO.Path]::GetTempPath()'), 'PowerShell must use the OS temp directory');
check(launcher.includes('[Guid]::NewGuid()'), 'PowerShell must use a unique temp name');
check(launcher.includes('.ps1'), 'PowerShell must create a .ps1 file');
check(launcher.includes('[Text.Encoding]::UTF8.GetPreamble()'), 'PowerShell must add a UTF-8 BOM');
check(launcher.includes('Remove-Item -LiteralPath $temp'), 'PowerShell must clean up the temp file');
check(launcher.includes('Write-Error') && launcher.includes('pause'), 'failures must remain readable and pause once');

const markerEnd = launcher.indexOf('\n', launcher.indexOf(marker));
check(markerEnd >= 0, 'marker must be followed by payload');
check(launcher.slice(markerEnd + 1).split(/\r?\n/)[0] === placeholder, 'placeholder must directly follow marker');
const executionSection = launcher.slice(0, launcher.indexOf(marker));
check([...executionSection].every((character) => character.charCodeAt(0) < 128), 'CMD execution section must stay ASCII');
const commandLine = launcher.split(/\r?\n/).find((line) => line.startsWith('powershell.exe '));
check(commandLine.length < 8191, 'CMD PowerShell extraction command must remain below the Windows line limit');
const samplePayload = '$OutputEncoding = [Console]::OutputEncoding; Write-Output "round-trip 中文 ✓"';
const instantiated = launcher.replace(placeholder, samplePayload);
check(!instantiated.includes(placeholder), 'instantiated launcher must not retain placeholder');
const preMarker = instantiated.slice(0, instantiated.indexOf(marker));
check(!preMarker.includes(placeholder), 'execution section must not leak placeholder');
const instantiatedMarkerEnd = instantiated.indexOf('\n', instantiated.indexOf(marker));
const extracted = instantiated.slice(instantiatedMarkerEnd + 1).replace(/\r?\n$/, '');
const expected = Buffer.from(samplePayload, 'utf8');
const generated = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(extracted, 'utf8')]);
assert.deepEqual(generated.subarray(3), expected, 'plain payload extraction must round trip');
check(generated.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])), 'generated .ps1 must have UTF-8 BOM');

const values = {
    BRIDGE_URL: 'https://example.test/assets/local-codex-bridge.mjs?v=30',
    RETURN_URL: 'https://example.test/app/$channel/?source=launcher',
    APP_VERSION: 'v31',
    BRIDGE_TOKEN: 'test-token-abcdefghijklmnopqrstuvwxyz-123456',
    BRIDGE_PORT: '4519',
    LOCAL_PROVIDER: 'codex',
    CLI_COMMAND: 'codex',
    CLI_LABEL: 'Codex `$ "CLI"'
};
const escapePowerShellDoubleQuotedValue = (value) => String(value)
    .replaceAll('`', '``').replaceAll('$', '`$').replaceAll('"', '`"');
const powershell = Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`__${name}__`, () => escapePowerShellDoubleQuotedValue(value)),
    powershellTemplate
);
check(!/__[A-Z][A-Z0-9_]+__/.test(powershell), 'rendered PowerShell must not retain placeholders');
check(powershell.includes('app/`$channel/'), 'PowerShell interpolation characters must be escaped');
check(powershell.includes('Codex ```$ `"CLI`"'), 'PowerShell quotes and backticks must be escaped');
const renderedLauncher = launcher.replace(placeholder, powershell).replace(/\r?\n/g, '\r\n');
check(!renderedLauncher.includes(placeholder), 'rendered CMD must not retain the payload placeholder');
const renderedMarker = renderedLauncher.indexOf(marker);
const renderedPayloadStart = renderedLauncher.indexOf('\n', renderedMarker) + 1;
const renderedPayload = renderedLauncher.slice(renderedPayloadStart).replace(/^\r?\n/, '').trimEnd();
assert.equal(renderedPayload, powershell.replace(/\r?\n/g, '\r\n').trimEnd(), 'rendered CMD payload must match the injected PowerShell');

check(frontend.includes("wrapper: 'assets/launch-codex-windows.cmd'"), 'frontend must fetch the CMD wrapper');
check(frontend.includes('windows.cmd`'), 'frontend must download a .cmd file on Windows');
check(frontend.includes("localCodexCopyCommand.hidden = state.localCodex.platform === 'windows'"), 'frontend must not offer a path-dependent Windows copy command');
check(frontend.includes('spec.wrapper ? escapePowerShellDoubleQuotedValue : String'), 'frontend must escape Windows PowerShell values');
check(powershellTemplate.includes('AI_SHAKEDOWN_WRAPPED'), 'PowerShell must cooperate with the CMD error pause');
check(powershellTemplate.includes('[Net.SecurityProtocolType]::Tls12'), 'Windows PowerShell 5.1 must enable TLS 1.2');
check(powershellTemplate.includes('[Environment]::ExpandEnvironmentVariables($_)'), 'registered PATH values must be expanded');
check(!powershellTemplate.includes("Name = 'node.exe'"), 'launcher must not scan and stop unregistered Node processes');

console.log('Windows launcher validation passed: ' + path.relative(root, launcherPath));
