$ErrorActionPreference = "Stop"

$ProjectRoot = $PSScriptRoot
$CodexPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$PythonCandidates = @(
    (Join-Path $ProjectRoot ".venv\Scripts\python.exe"),
    $CodexPython,
    "python.exe"
)

$Python = $null
foreach ($Candidate in $PythonCandidates) {
    try {
        & $Candidate --version *> $null
        if ($LASTEXITCODE -eq 0) {
            $Python = $Candidate
            break
        }
    } catch { }
}

if (-not $Python) {
    throw "Python 3.12 is required. Install it and run this script again."
}

$SitePackages = Join-Path $ProjectRoot ".venv\Lib\site-packages"
if (Test-Path $SitePackages) {
    $env:PYTHONPATH = $SitePackages
}

$Next = Join-Path $ProjectRoot "node_modules\.bin\next.cmd"
if (-not (Test-Path $Next)) {
    throw "Frontend dependencies are missing. Run: pnpm install"
}

function Test-Port([int]$Port) {
    return $null -ne (Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue)
}

if (-not (Test-Port 8000)) {
    Start-Process -FilePath $Python `
        -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000" `
        -WorkingDirectory (Join-Path $ProjectRoot "backend") `
        -WindowStyle Hidden
}

if (-not (Test-Port 3000)) {
    Start-Process -FilePath $Next `
        -ArgumentList "dev", "--hostname", "0.0.0.0" `
        -WorkingDirectory $ProjectRoot `
        -WindowStyle Hidden
}

$Deadline = (Get-Date).AddSeconds(45)
do {
    Start-Sleep -Milliseconds 500
    $FrontendReady = Test-Port 3000
    $BackendReady = Test-Port 8000
} until (($FrontendReady -and $BackendReady) -or (Get-Date) -ge $Deadline)

if (-not ($FrontendReady -and $BackendReady)) {
    throw "Qadam Media did not start in 45 seconds. Check ports 3000 and 8000."
}

Write-Host "Qadam Media is running:" -ForegroundColor Green
Write-Host "  Website: http://localhost:3000"
Write-Host "  API:     http://localhost:8000/docs"
Start-Process "http://localhost:3000"
