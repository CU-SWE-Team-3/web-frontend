git ls-tree -r origin/main --name-only > origin_files.txt
$files = Get-Content origin_files.txt
$restored = $false
foreach ($f in $files) {
    if (-Not (Test-Path $f)) {
        Write-Host "Restoring $f"
        git checkout origin/main -- "$f"
        $restored = $true
    }
}
if ($restored) {
    git add .
    git commit -m "chore: safely restored all inadvertently missing files from main"
    git push origin test-sw
} else {
    Write-Host "No missing files detected."
}
