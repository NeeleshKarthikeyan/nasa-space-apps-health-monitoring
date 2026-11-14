# Quick check that every API endpoint responds with the expected status code.
# Start uvicorn first, then run: .\api\test_api.ps1   (from the repo root)
#                            or: .\test_api.ps1       (from inside api)
# Optional: test a deployed URL instead, e.g. .\test_api.ps1 https://your-api.onrender.com

param([string]$base = "http://localhost:8000")

$tests = @(
    @("/api/mission", 200),
    @("/api/crew", 200),
    @("/api/crew?day=47", 200),
    @("/api/crew/A/timeseries", 200),
    @("/api/crew/B/timeseries", 200),
    @("/api/crew/C/timeseries", 200),
    @("/api/crew/D/timeseries", 200),
    @("/api/crew/Z/timeseries", 404),
    @("/api/alerts", 200),
    @("/api/alerts?astronaut_id=B", 200)
)

$failed = 0
foreach ($t in $tests) {
    $url = $base + $t[0]
    try { $code = (Invoke-WebRequest -Uri $url -UseBasicParsing).StatusCode }
    catch { $code = [int]$_.Exception.Response.StatusCode }
    if ($code -eq $t[1]) { Write-Host "PASS $code $($t[0])" -ForegroundColor Green }
    else { Write-Host "FAIL $code (expected $($t[1])) $($t[0])" -ForegroundColor Red; $failed++ }
}

if ($failed -eq 0) { Write-Host "`nAll $($tests.Count) passed" -ForegroundColor Green }
else { Write-Host "`n$failed of $($tests.Count) failed" -ForegroundColor Red }