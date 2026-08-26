$ErrorActionPreference = "Stop"

$BridgeUrl = "__BRIDGE_URL__"
$ReturnUrl = "__RETURN_URL__"
$BridgeToken = "__BRIDGE_TOKEN__"
$BridgePort = "__BRIDGE_PORT__"
$LauncherVersion = "__APP_VERSION__"
$LocalProvider = "__LOCAL_PROVIDER__"
$CliCommand = "__CLI_COMMAND__"
$CliLabel = "__CLI_LABEL__"
$StateDirectory = if ($env:AI_SHAKEDOWN_STATE_DIR) { $env:AI_SHAKEDOWN_STATE_DIR } elseif ($env:LOCALAPPDATA) { Join-Path $env:LOCALAPPDATA "AI-Shakedown-Console" } else { Join-Path $HOME ".cache\ai-shakedown-console" }
$PidFile = Join-Path $StateDirectory "$LocalProvider.pid"
$BridgeFile = Join-Path $StateDirectory "ai-shakedown-local-ai-bridge-$LocalProvider.mjs"
$BridgeDownload = Join-Path $StateDirectory "ai-shakedown-local-ai-bridge-$LocalProvider.download"
$LogFile = Join-Path $StateDirectory "$LocalProvider.log"
$ErrorLogFile = Join-Path $StateDirectory "$LocalProvider.error.log"
$BridgeProcess = $null

function Stop-WithMessage([string]$Message) {
    Write-Host ""
    Write-Host "启动失败：$Message" -ForegroundColor Red
    if (-not $env:AI_SHAKEDOWN_WRAPPED) { Read-Host "按回车键关闭窗口" }
    exit 1
}

function Refresh-ProcessPath {
    $PathValues = @(
        [Environment]::GetEnvironmentVariable("Path", "Machine"),
        [Environment]::GetEnvironmentVariable("Path", "User"),
        $env:Path
    ) | Where-Object { $_ } | ForEach-Object { [Environment]::ExpandEnvironmentVariables($_) }
    $env:Path = $PathValues -join ";"
}

function Get-BridgeCommandLine([int]$CandidatePid) {
    try {
        return (Get-CimInstance Win32_Process -Filter "ProcessId = $CandidatePid" -ErrorAction Stop).CommandLine
    } catch {
        return ""
    }
}

function Test-OwnedBridgeProcess([int]$CandidatePid) {
    if ($CandidatePid -le 0 -or -not (Get-Process -Id $CandidatePid -ErrorAction SilentlyContinue)) { return $false }
    $CommandLine = Get-BridgeCommandLine $CandidatePid
    return $CommandLine -match 'ai-shakedown-local-ai-bridge.*\.mjs' -or $CommandLine -match 'AI-Shakedown-Console.*local-codex-bridge\.mjs'
}

function Stop-OwnedBridge([int]$CandidatePid) {
    if (-not (Test-OwnedBridgeProcess $CandidatePid)) { return $true }
    Write-Host "正在停止旧版 AI Shakedown 本地桥接（PID ${CandidatePid}）……"
    Stop-Process -Id $CandidatePid -ErrorAction SilentlyContinue
    for ($Attempt = 0; $Attempt -lt 30; $Attempt++) {
        if (-not (Get-Process -Id $CandidatePid -ErrorAction SilentlyContinue)) { return $true }
        Start-Sleep -Milliseconds 100
    }
    return $false
}

function Stop-PreviousBridges {
    if (Test-Path $PidFile) {
        $OldPid = (Get-Content $PidFile -TotalCount 1 -ErrorAction SilentlyContinue) -as [int]
        if ($OldPid -and -not (Stop-OwnedBridge $OldPid)) {
            Stop-WithMessage "无法停止旧桥接（PID ${OldPid}）。请在网页点击“停止后台连接”后重试。"
        }
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    }
}

function Test-PortAvailable([int]$CandidatePort) {
    $Listener = $null
    try {
        $Listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $CandidatePort)
        $Listener.Start()
        return $true
    } catch {
        return $false
    } finally {
        if ($Listener) { $Listener.Stop() }
    }
}

function Select-AvailablePort([int]$RequestedPort) {
    $CandidatePort = $RequestedPort
    for ($Attempt = 0; $Attempt -lt 100; $Attempt++) {
        if (Test-PortAvailable $CandidatePort) {
            if ($CandidatePort -ne $RequestedPort) {
                Write-Host "端口 ${RequestedPort} 已被其他服务占用，已自动改用 ${CandidatePort}。"
            }
            return $CandidatePort
        }
        $CandidatePort++
        if ($CandidatePort -gt 65535) { $CandidatePort = 4510 }
    }
    Stop-WithMessage "连续检查 100 个端口仍未找到空闲端口。请关闭不需要的本地服务后重试。"
}

try {
    Refresh-ProcessPath
    $NodeCommand = Get-Command node -ErrorAction SilentlyContinue
    if (-not $NodeCommand) {
        $NodeCandidates = @(
            (Join-Path $HOME ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\node.exe"),
            (Join-Path $HOME ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"),
            $(if ($env:ProgramFiles) { Join-Path $env:ProgramFiles "nodejs\node.exe" }),
            $(if (${env:ProgramFiles(x86)}) { Join-Path ${env:ProgramFiles(x86)} "nodejs\node.exe" }),
            $(if ($env:LOCALAPPDATA) { Join-Path $env:LOCALAPPDATA "Programs\nodejs\node.exe" }),
            $(if ($env:LOCALAPPDATA) { Join-Path $env:LOCALAPPDATA "Volta\bin\node.exe" })
        )
        foreach ($BundledNode in $NodeCandidates) {
            if ($BundledNode -and (Test-Path $BundledNode)) {
                $NodeCommand = Get-Command $BundledNode -ErrorAction SilentlyContinue
                if ($NodeCommand) { break }
            }
        }
    }
    if (-not $NodeCommand) { Stop-WithMessage "没有找到 Node.js 18+。已检查系统 PATH 和 Codex 自带运行时；请访问 https://nodejs.org/zh-cn/download 安装后重试。" }
    $NodeMajor = [int](& $NodeCommand.Source -p "Number(process.versions.node.split('.')[0])")
    if ($NodeMajor -lt 18) { Stop-WithMessage "Node.js 版本过低，需要 18 或更高版本。" }

    $LocalCliCommand = Get-Command "$CliCommand.cmd" -ErrorAction SilentlyContinue
    if (-not $LocalCliCommand) { $LocalCliCommand = Get-Command "$CliCommand.exe" -ErrorAction SilentlyContinue }
    if (-not $LocalCliCommand) { $LocalCliCommand = Get-Command $CliCommand -ErrorAction SilentlyContinue }
    if (-not $LocalCliCommand) {
        $LocalCliCandidates = @(
            $(if ($env:APPDATA) { Join-Path $env:APPDATA "npm\$CliCommand.cmd" }),
            $(if ($env:LOCALAPPDATA) { Join-Path $env:LOCALAPPDATA "pnpm\$CliCommand.cmd" }),
            $(if ($env:LOCALAPPDATA) { Join-Path $env:LOCALAPPDATA "Volta\bin\$CliCommand.cmd" }),
            (Join-Path $HOME ".local\bin\$CliCommand.exe"),
            (Join-Path $HOME "scoop\shims\$CliCommand.cmd")
        )
        foreach ($CliCandidate in $LocalCliCandidates) {
            if ($CliCandidate -and (Test-Path $CliCandidate)) {
                $LocalCliCommand = Get-Command $CliCandidate -ErrorAction SilentlyContinue
                if ($LocalCliCommand) { break }
            }
        }
    }
    if (-not $LocalCliCommand -and $LocalProvider -eq "codex") { Stop-WithMessage "没有找到 Codex CLI。安装说明：https://developers.openai.com/codex/cli/；安装后运行 codex 完成登录。" }
    if (-not $LocalCliCommand) { Stop-WithMessage "没有找到 ${CliLabel}，请先按该工具的官方说明安装并完成登录。" }
    $LocalCliBin = $LocalCliCommand.Source
    if ($LocalProvider -eq "codex") {
        & $LocalCliBin login status *> $null
        if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Codex 尚未登录，请先运行 codex login。" }
    } else {
        & $LocalCliBin --version *> $null
        if ($LASTEXITCODE -ne 0) { Stop-WithMessage "$CliLabel 无法运行，请先单独启动它并完成登录。" }
    }

    New-Item -ItemType Directory -Path $StateDirectory -Force | Out-Null
    if ($PSVersionTable.PSEdition -eq "Desktop") {
        [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
    }
    Invoke-WebRequest -UseBasicParsing -Uri $BridgeUrl -OutFile $BridgeDownload -TimeoutSec 30
    $Origin = ([Uri]$ReturnUrl).GetLeftPart([System.UriPartial]::Authority)
    Stop-PreviousBridges
    Move-Item -Path $BridgeDownload -Destination $BridgeFile -Force
    $BridgePort = Select-AvailablePort ([int]$BridgePort)

    $env:AI_SHAKEDOWN_BRIDGE_TOKEN = $BridgeToken
    $env:AI_SHAKEDOWN_BRIDGE_PORT = $BridgePort
    $env:AI_SHAKEDOWN_ALLOWED_ORIGIN = $Origin
    $env:AI_SHAKEDOWN_RETURN_URL = $ReturnUrl
    $env:AI_SHAKEDOWN_LOCAL_PROVIDER = $LocalProvider
    $env:AI_SHAKEDOWN_LOCAL_CLI_BIN = $LocalCliBin

    Write-Host "正在启动 AI Shakedown Console $LauncherVersion 本地 $CliLabel 连接……"
    Remove-Item $LogFile, $ErrorLogFile -Force -ErrorAction SilentlyContinue
    $BridgeProcess = Start-Process -FilePath $NodeCommand.Source -ArgumentList @("`"$BridgeFile`"") -WindowStyle Hidden -RedirectStandardOutput $LogFile -RedirectStandardError $ErrorLogFile -PassThru
    Start-Sleep -Seconds 1
    $BridgeProcess.Refresh()
    if ($BridgeProcess.HasExited) { Stop-WithMessage "后台桥接启动后立即退出。日志位置：$ErrorLogFile" }
    [IO.File]::WriteAllLines($PidFile, @([string]$BridgeProcess.Id, [string]$BridgePort, $LauncherVersion))
    Write-Host ""
    Write-Host "本地 $CliLabel 桥接已在后台启动（PID $($BridgeProcess.Id)，端口 $BridgePort）。" -ForegroundColor Green
    Write-Host "已打开的应用会自动连接且不会重复开窗；如果应用已关闭，桥接会尝试重新打开它。"
    if ($env:AI_SHAKEDOWN_WRAPPED) {
        Write-Host "启动器窗口将自动关闭。停止连接请回到应用设置，点击“停止后台连接”。"
    } else {
        Write-Host "现在可以关闭 PowerShell。停止连接请回到应用设置，点击“停止后台连接”。"
    }
    Write-Host "日志位置：$LogFile"
} catch {
    Remove-Item $BridgeDownload -Force -ErrorAction SilentlyContinue
    Stop-WithMessage $_.Exception.Message
}
