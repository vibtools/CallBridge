[CmdletBinding()]
param([switch]$DryRun)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
try {
  if ([string]::IsNullOrWhiteSpace($PSScriptRoot)) { throw 'Unable to resolve project root.' }
  $Root = (Resolve-Path -LiteralPath $PSScriptRoot).Path
  if (Test-Path -LiteralPath (Join-Path $Root '.git')) { throw 'Existing .git detected. This initializer is only for a fresh source copy.' }
  $Required = @('README.md','AGENTS.md','PROJECT_STRUCTURE.md','vibproject.ygit','docs\docs.manifest.ygit','project\README.md','project\PROJECT_UPDATE_WORKFLOW.md')
  foreach ($File in $Required) { if (-not (Test-Path -LiteralPath (Join-Path $Root $File))) { throw "Required file missing: $File" } }
  $GitIgnore = Join-Path $Root '.gitignore'
  $Rule = '/project/*'
  $Content = if (Test-Path $GitIgnore) { Get-Content -LiteralPath $GitIgnore -Raw } else { '' }
  if (($Content -split "`r?`n") -notcontains $Rule) {
    if ($DryRun) { Write-Host "[DRY-RUN] Add $Rule to .gitignore" }
    else { Add-Content -LiteralPath $GitIgnore -Value "`n# VibProject fresh-project private workspace`n$Rule" -Encoding UTF8 }
  }
  Write-Host 'Setup completed successfully. No Git commands were executed.' -ForegroundColor Green
  exit 0
} catch {
  Write-Host "Setup failed: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host 'No Git commands were executed.' -ForegroundColor Gray
  exit 1
}
