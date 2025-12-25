# Extensions to include
$includeExtensions = @(".go", ".py", ".js", ".ts", ".tsx", ".jsx", ".html", ".css", ".scss", ".sql", ".yml", ".yaml", ".json", ".md")

# Directories to exclude
$excludeDirs = @("node_modules", ".git", "dist", "build", "coverage", "__pycache__", ".vscode", ".idea", ".gemini", "bin", "obj", ".next")


# Function to check if path contains excluded directory
function Is-Excluded($path) {
    foreach ($dir in $excludeDirs) {
        if ($path -match "\\$dir\\") { return $true }
        if ($path -match "^$dir\\") { return $true }
    }
    return $false
}

$totalLines = 0
$fileCount = 0
$byExtension = @{}

# Get all files recursively
Get-ChildItem -Path . -Recurse -File | ForEach-Object {
    $relPath = $_.FullName.Substring($PWD.Path.Length + 1)
    
    if (-not (Is-Excluded $relPath)) {
        if ($includeExtensions -contains $_.Extension -or $_.Name -eq "Dockerfile") {
            try {
                $lines = (Get-Content -LiteralPath $_.FullName | Measure-Object -Line).Lines
                $totalLines += $lines
                $fileCount++
                
                $ext = $_.Extension
                if ($_.Name -eq "Dockerfile") { $ext = "Dockerfile" }
                if ([string]::IsNullOrEmpty($ext)) { $ext = "No Extension" }
                
                if (-not $byExtension.ContainsKey($ext)) {
                    $byExtension[$ext] = @{ Lines = 0; Files = 0 }
                }
                $byExtension[$ext].Lines += $lines
                $byExtension[$ext].Files++
            }
            catch {
                Write-Host "Could not read file: $relPath" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "`nProject Line Count Statistics" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "Total Files: $fileCount"
Write-Host "Total Lines: $totalLines"
Write-Host "`nBreakdown by Language/Extension:" -ForegroundColor Cyan
Write-Host "--------------------------------"

$byExtension.GetEnumerator() | Sort-Object -Property @{Expression={$_.Value.Lines}} -Descending | ForEach-Object {
    Write-Host "$($_.Key): $($_.Value.Lines) lines ($($_.Value.Files) files)"
}
