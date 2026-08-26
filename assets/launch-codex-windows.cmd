@echo off
setlocal EnableExtensions DisableDelayedExpansion
set "AI_SHAKEDOWN_WRAPPED=1"
set "AI_SHAKEDOWN_LAUNCHER_SELF=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; $temp = $null; try { $self = $env:AI_SHAKEDOWN_LAUNCHER_SELF; if ([string]::IsNullOrWhiteSpace($self) -or -not (Test-Path -LiteralPath $self -PathType Leaf)) { throw 'Unable to locate the launcher file.' }; $source = [IO.File]::ReadAllText($self, [Text.Encoding]::UTF8); $marker = 'AI_SHAKEDOWN_' + 'POWERSHELL_PAYLOAD_BEGIN'; $markerIndex = $source.IndexOf($marker, [StringComparison]::Ordinal); if ($markerIndex -lt 0) { throw 'PowerShell payload marker is missing.' }; $lineEnd = $source.IndexOf([char]10, $markerIndex); if ($lineEnd -lt 0) { throw 'PowerShell payload is missing.' }; $payload = $source.Substring($lineEnd + 1).TrimStart([char]10, [char]13); $placeholder = '__POWERSHELL_' + 'PAYLOAD__'; if ([string]::IsNullOrWhiteSpace($payload) -or $payload -eq $placeholder) { throw 'PowerShell payload is empty or was not generated.' }; $temp = Join-Path ([IO.Path]::GetTempPath()) ('ai-shakedown-' + [Guid]::NewGuid().ToString('N') + '.ps1'); $bom = [Text.Encoding]::UTF8.GetPreamble(); $payloadBytes = [Text.Encoding]::UTF8.GetBytes($payload); $bytes = New-Object byte[] ($bom.Length + $payloadBytes.Length); [Array]::Copy($bom, 0, $bytes, 0, $bom.Length); [Array]::Copy($payloadBytes, 0, $bytes, $bom.Length, $payloadBytes.Length); [IO.File]::WriteAllBytes($temp, $bytes); & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $temp; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } } catch { Write-Error $_.Exception.Message; exit 1 } finally { if ($temp -and (Test-Path -LiteralPath $temp)) { Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue } }"
set "AI_SHAKEDOWN_EXIT=%ERRORLEVEL%"
if not "%AI_SHAKEDOWN_EXIT%"=="0" (
    echo.
    echo Launcher failed with exit code %AI_SHAKEDOWN_EXIT%. Review the PowerShell error above.
    pause
)
endlocal & exit /b %AI_SHAKEDOWN_EXIT%
rem AI_SHAKEDOWN_POWERSHELL_PAYLOAD_BEGIN
__POWERSHELL_PAYLOAD__
