# PowerShell script to update job-select fields
# Change default value from SHAD to "-- Select --"

$filePath = "index.html"
$content = Get-Content $filePath -Raw

# Define replacement pattern
$oldPattern = '<select class="job-select">\s*<option value="SHAD">SHAD</option>'
$newPattern = '<select class="job-select">\s*<option value="">-- Select --</option>\s*<option value="SHAD">SHAD</option>'

# Execute replacement
$updatedContent = $content -replace $oldPattern, $newPattern

# Write back to file
Set-Content $filePath $updatedContent -Encoding UTF8

Write-Host "Job-select fields updated successfully!"
Write-Host "Changed default value from SHAD to '-- Select --' for all job-select fields"
