$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$required = @(
    'manifest.json',
    'content.js',
    'content.css'
)

foreach ($relativePath in $required) {
    $path = Join-Path $root $relativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        throw "Missing required file: $relativePath"
    }
}

$manifest = Get-Content -LiteralPath (Join-Path $root 'manifest.json') -Raw | ConvertFrom-Json
if ($manifest.manifest_version -ne 3) { throw 'Manifest V3 is required.' }
if (-not ($manifest.permissions -contains 'clipboardWrite')) { throw 'clipboardWrite permission is required.' }
if ($manifest.background.service_worker) { throw 'This redirect extension does not need a background service worker.' }

Write-Host 'Extension files and manifest structure are valid.'
