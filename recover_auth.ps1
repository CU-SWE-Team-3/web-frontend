git ls-tree -r "origin/main^" --name-only > prior_main.txt
$files = Get-Content prior_main.txt
$restored = $false
foreach ($f in $files) {
    if (-not (Test-Path $f)) {
        Write-Host "Restoring $f"
        git checkout "origin/main^" -- "$f"
        $restored = $true
    }
}
if ($restored) {
    git add .
    git commit -m "chore: meticulously recovered auth pages and workflows accidentally deleted during merge"
    git push origin test-sw
} else {
    Write-Host "No missing files detected."
}
