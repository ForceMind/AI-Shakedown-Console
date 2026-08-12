$ErrorActionPreference = "Stop"

$BridgeUrl = "__BRIDGE_URL__"
$ReturnUrl = "__RETURN_URL__"
$BridgeToken = "__BRIDGE_TOKEN__"
$BridgePort = "__BRIDGE_PORT__"

function Stop-WithMessage([string]$Message) {
    Write-Host ""
    Write-Host "启动失败：$Message" -ForegroundColor Red
    Read-Host "按回车键关闭窗口"
    exit 1
}

try {
    $NodeCommand = Get-Command node -ErrorAction Stop
    $NodeMajor = [int](& $NodeCommand.Source -p "Number(process.versions.node.split('.')[0])")
    if ($NodeMajor -lt 18) { Stop-WithMessage "Node.js 版本过低，需要 18 或更高版本。" }

    $CodexCommand = Get-Command codex.cmd -ErrorAction SilentlyContinue
    if (-not $CodexCommand) { $CodexCommand = Get-Command codex.exe -ErrorAction SilentlyContinue }
    if (-not $CodexCommand) { $CodexCommand = Get-Command codex -ErrorAction SilentlyContinue }
    if (-not $CodexCommand) { Stop-WithMessage "没有找到 Codex CLI，请先安装并运行 codex login。" }
    $CodexBin = $CodexCommand.Source
    & $CodexBin login status *> $null
    if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Codex 尚未登录，请先运行 codex login。" }

    $BridgeFile = Join-Path ([IO.Path]::GetTempPath()) ("ai-shakedown-codex-bridge-" + [guid]::NewGuid().ToString("N") + ".mjs")
    Invoke-WebRequest -UseBasicParsing -Uri $BridgeUrl -OutFile $BridgeFile
    $Origin = ([Uri]$ReturnUrl).GetLeftPart([System.UriPartial]::Authority)

    $env:AI_SHAKEDOWN_BRIDGE_TOKEN = $BridgeToken
    $env:AI_SHAKEDOWN_BRIDGE_PORT = $BridgePort
    $env:AI_SHAKEDOWN_ALLOWED_ORIGIN = $Origin
    $env:AI_SHAKEDOWN_RETURN_URL = $ReturnUrl
    $env:AI_SHAKEDOWN_CODEX_BIN = $CodexBin

    Write-Host "正在启动 AI Shakedown Console 本地 Codex 连接……"
    & $NodeCommand.Source $BridgeFile
} catch {
    Stop-WithMessage $_.Exception.Message
} finally {
    if ($BridgeFile -and (Test-Path $BridgeFile)) { Remove-Item $BridgeFile -Force }
}
