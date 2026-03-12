$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$indexPath = Join-Path $projectRoot 'index.html'
$lines = Get-Content $indexPath
$lines = $lines[0..2726] + $lines[2920..($lines.Length-1)]
Set-Content -Path $indexPath -Value $lines
Write-Host "Duplicate rows removed."
