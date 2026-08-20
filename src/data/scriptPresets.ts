import { ScriptOption } from '../types';

export const SCRIPT_PRESETS: ScriptOption[] = [
  {
    id: 'sfc_dism',
    category: 'System Integrity',
    title: 'SFC & DISM Component Store Repair',
    description: 'Scans and repairs corrupted Windows system binaries and repairs WinSxS store against online Microsoft images.',
    cmdCode: `echo [1/3] Checking Component Store Health...
DISM /Online /Cleanup-Image /CheckHealth
echo [2/3] Restoring Component Store Health...
DISM /Online /Cleanup-Image /RestoreHealth
echo [3/3] Running System File Checker...
sfc /scannow`,
    psCode: `Write-Host "[1/3] Restoring Windows Component Store..." -ForegroundColor Cyan
Repair-WindowsImage -Online -RestoreHealth
Write-Host "[2/3] Running System File Checker..." -ForegroundColor Cyan
sfc /scannow`,
    enabled: true
  },
  {
    id: 'dns_network_flush',
    category: 'Network & DNS',
    title: 'Flush DNS, Reset Winsock & Rebind TCP/IP Stack',
    description: 'Flushes DNS resolver cache, releases and renews DHCP IP, resets Winsock catalog and IP stack.',
    cmdCode: `echo Resetting DNS and Network IP Stack...
ipconfig /flushdns
ipconfig /registerdns
ipconfig /release
ipconfig /renew
netsh winsock reset
netsh int ip reset`,
    psCode: `Write-Host "Flushing DNS & Resetting Network Adapters..." -ForegroundColor Cyan
Clear-DnsClientCache
netsh winsock reset
netsh int ip reset
Restart-NetAdapter -Name * -Confirm:$false`,
    enabled: true,
    requiresReboot: true
  },
  {
    id: 'temp_purge',
    category: 'Cache & Temp',
    title: 'Purge Temp Files, Prefetch & User Cache',
    description: 'Deletes temporary files in %TEMP%, C:\\Windows\\Temp, Prefetch, and cleans Windows Error Reporting dumps.',
    cmdCode: `echo Cleaning Temporary Files and System Cache...
del /s /f /q "%temp%\\*.*" 2>nul
for /d %%p in ("%temp%\\*") do rmdir "%%p" /s /q 2>nul
del /s /f /q "C:\\Windows\\Temp\\*.*" 2>nul
for /d %%p in ("C:\\Windows\\Temp\\*") do rmdir "%%p" /s /q 2>nul
del /s /f /q "C:\\Windows\\Prefetch\\*.*" 2>nul`,
    psCode: `Write-Host "Purging Temp Files and Prefetch Cache..." -ForegroundColor Cyan
Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\\Windows\\Prefetch\\*" -Recurse -Force -ErrorAction SilentlyContinue`,
    enabled: true
  },
  {
    id: 'wuauserv_reset',
    category: 'Windows Update',
    title: 'Windows Update Service & SoftwareDistribution Reset',
    description: 'Stops update services, purges download cache, re-registers update DLLs, and restarts update engine.',
    cmdCode: `echo Stopping Windows Update and Cryptographic Services...
net stop wuauserv
net stop cryptSvc
net stop bits
net stop msiserver
echo Renaming Corrupt Software Distribution Cache...
if exist "C:\\Windows\\SoftwareDistribution.old" rd /s /q "C:\\Windows\\SoftwareDistribution.old"
ren C:\\Windows\\SoftwareDistribution SoftwareDistribution.old
if exist "C:\\Windows\\System32\\catroot2.old" rd /s /q "C:\\Windows\\System32\\catroot2.old"
ren C:\\Windows\\System32\\catroot2 catroot2.old
echo Restarting Update Services...
net start wuauserv
net start cryptSvc
net start bits
net start msiserver`,
    psCode: `Write-Host "Resetting Windows Update Engine..." -ForegroundColor Cyan
Stop-Service -Name wuauserv, cryptSvc, bits, msiserver -Force -ErrorAction SilentlyContinue
Rename-Item -Path "C:\\Windows\\SoftwareDistribution" -NewName "SoftwareDistribution.old" -ErrorAction SilentlyContinue
Rename-Item -Path "C:\\Windows\\System32\\catroot2" -NewName "catroot2.old" -ErrorAction SilentlyContinue
Start-Service -Name wuauserv, cryptSvc, bits, msiserver`,
    enabled: true
  },
  {
    id: 'power_plan_unlock',
    category: 'Performance & Storage',
    title: 'Unlock Ultimate Performance Power Plan & Disable Hibernation',
    description: 'Unlocks the hidden Windows Ultimate Performance power profile and frees SSD space by disabling hiberfil.sys.',
    cmdCode: `echo Unlocking Ultimate Performance Profile...
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
echo Disabling Fast Startup Hibernation File...
powercfg -h off`,
    psCode: `Write-Host "Unlocking Ultimate Performance Power Profile..." -ForegroundColor Cyan
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
powercfg -h off`,
    enabled: false
  },
  {
    id: 'print_spooler_reset',
    category: 'Performance & Storage',
    title: 'Reset Print Spooler & Clear Stuck Print Queue',
    description: 'Stops print spooler, deletes stuck print jobs in PRINTERS folder, and restarts spooler service.',
    cmdCode: `echo Clearing Stuck Print Queue...
net stop spooler
del /q /f /s "%systemroot%\\System32\\Spool\\Printers\\*.*"
net start spooler`,
    psCode: `Write-Host "Clearing Stuck Print Spooler Queue..." -ForegroundColor Cyan
Stop-Service -Name Spooler -Force
Remove-Item "$env:windir\\System32\\spool\\PRINTERS\\*" -Force -Recurse -ErrorAction SilentlyContinue
Start-Service -Name Spooler`,
    enabled: false
  },
  {
    id: 'search_index_rebuild',
    category: 'Performance & Storage',
    title: 'Reset & Rebuild Windows Search Index',
    description: 'Resets the Windows search index database to fix broken Start menu search and Outlook indexing.',
    cmdCode: `echo Resetting Windows Search Indexer...
net stop wsearch
del /f /q /s "%ProgramData%\\Microsoft\\Search\\Data\\Applications\\Windows\\*.*" 2>nul
net start wsearch`,
    psCode: `Write-Host "Rebuilding Windows Search Index..." -ForegroundColor Cyan
Stop-Service -Name WSearch -Force
Remove-Item "$env:ProgramData\\Microsoft\\Search\\Data\\Applications\\Windows\\*" -Recurse -Force -ErrorAction SilentlyContinue
Start-Service -Name WSearch`,
    enabled: false
  },
  {
    id: 'defender_sig_update',
    category: 'System Integrity',
    title: 'Force Windows Defender Offline Signature Update & Quick Scan',
    description: 'Purges old anti-malware signatures, downloads latest definitions directly from Microsoft, and triggers quick scan.',
    cmdCode: `echo Updating Windows Defender Definitions...
"%ProgramFiles%\\Windows Defender\\MpCmdRun.exe" -SignatureUpdate
echo Running Quick Malware Scan...
"%ProgramFiles%\\Windows Defender\\MpCmdRun.exe" -Scan -ScanType 1`,
    psCode: `Write-Host "Updating Defender Antivirus Signatures..." -ForegroundColor Cyan
Update-MpSignature
Write-Host "Executing Quick System Scan..." -ForegroundColor Cyan
Start-MpScan -ScanType QuickScan`,
    enabled: false
  },
  {
    id: 'event_logs_export',
    category: 'Diagnostics & Logs',
    title: 'Export Critical System Crash Events (EventLog)',
    description: 'Extracts the last 50 Critical and Error events from System and Application logs to a desktop text file.',
    cmdCode: `echo Exporting Critical System Error Logs...
wevtutil qe System "/q:*[System[(Level=1 or Level=2)]]" /f:text /c:30 > "%USERPROFILE%\\Desktop\\SystemErrors.log"
wevtutil qe Application "/q:*[System[(Level=1 or Level=2)]]" /f:text /c:30 > "%USERPROFILE%\\Desktop\\AppErrors.log"`,
    psCode: `Write-Host "Exporting System and Application Error Events to Desktop..." -ForegroundColor Cyan
Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2} -MaxEvents 30 | Format-List TimeCreated, ProviderName, Message | Out-File "$env:USERPROFILE\\Desktop\\SystemErrors.txt"
Get-WinEvent -FilterHashtable @{LogName='Application'; Level=1,2} -MaxEvents 30 | Format-List TimeCreated, ProviderName, Message | Out-File "$env:USERPROFILE\\Desktop\\AppErrors.txt"`,
    enabled: false
  },
  {
    id: 'time_sync_reset',
    category: 'Network & DNS',
    title: 'Resynchronize Windows Time (W32Time NTP)',
    description: 'Resets Windows Time service and forces resynchronization with time.windows.com (fixes SSL/TLS certificate errors).',
    cmdCode: `echo Resyncing System Time with NTP Server...
net stop w32time
w32tm /unregister
w32tm /register
net start w32time
w32tm /resync /force`,
    psCode: `Write-Host "Resyncing Windows Time via NTP..." -ForegroundColor Cyan
Restart-Service w32time
w32tm /resync /force`,
    enabled: false
  }
];
