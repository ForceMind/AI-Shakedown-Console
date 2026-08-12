$ErrorActionPreference = "Stop"

$BridgeUrl = "__BRIDGE_URL__"
$ReturnUrl = "__RETURN_URL__"
$BridgeToken = "__BRIDGE_TOKEN__"
$BridgePort = "__BRIDGE_PORT__"
$LocalProvider = "__LOCAL_PROVIDER__"
$CliCommand = "__CLI_COMMAND__"
$CliLabel = "__CLI_LABEL__"

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

    $LocalCliCommand = Get-Command "$CliCommand.cmd" -ErrorAction SilentlyContinue
    if (-not $LocalCliCommand) { $LocalCliCommand = Get-Command "$CliCommand.exe" -ErrorAction SilentlyContinue }
    if (-not $LocalCliCommand) { $LocalCliCommand = Get-Command $CliCommand -ErrorAction SilentlyContinue }
    if (-not $LocalCliCommand) { Stop-WithMessage "没有找到 $CliLabel，请先安装并完成登录。" }
    $LocalCliBin = $LocalCliCommand.Source
    if ($LocalProvider -eq "codex") {
        & $LocalCliBin login status *> $null
        if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Codex 尚未登录，请先运行 codex login。" }
    } else {
        & $LocalCliBin --version *> $null
        if ($LASTEXITCODE -ne 0) { Stop-WithMessage "$CliLabel 无法运行，请先单独启动它并完成登录。" }
    }

    $BridgeFile = Join-Path ([IO.Path]::GetTempPath()) ("ai-shakedown-local-ai-bridge-" + [guid]::NewGuid().ToString("N") + ".mjs")
    Invoke-WebRequest -UseBasicParsing -Uri $BridgeUrl -OutFile $BridgeFile
    $Origin = ([Uri]$ReturnUrl).GetLeftPart([System.UriPartial]::Authority)

    $env:AI_SHAKEDOWN_BRIDGE_TOKEN = $BridgeToken
    $env:AI_SHAKEDOWN_BRIDGE_PORT = $BridgePort
    $env:AI_SHAKEDOWN_ALLOWED_ORIGIN = $Origin
    $env:AI_SHAKEDOWN_RETURN_URL = $ReturnUrl
    $env:AI_SHAKEDOWN_LOCAL_PROVIDER = $LocalProvider
    $env:AI_SHAKEDOWN_LOCAL_CLI_BIN = $LocalCliBin

    Write-Host "正在启动 AI Shakedown Console 本地 $CliLabel 连接……"
    & $NodeCommand.Source $BridgeFile
} catch {
    Stop-WithMessage $_.Exception.Message
} finally {
    if ($BridgeFile -and (Test-Path $BridgeFile)) { Remove-Item $BridgeFile -Force }
}
