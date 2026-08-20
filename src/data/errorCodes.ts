import { WindowsErrorCode } from '../types';

export const WINDOWS_ERROR_CODES: WindowsErrorCode[] = [
  {
    hex: '0x80070002',
    name: 'ERROR_FILE_NOT_FOUND (The system cannot find the file specified)',
    category: 'Windows Update',
    severity: 'High',
    description: 'A required file or package descriptor in the Windows Update staging cache or WinSxS directory is missing or was deleted during a previous interrupted installation.',
    symptoms: [
      'Windows Update fails at 0% or 100% download/install phase',
      'System File Checker (SFC) reports missing files but fails to repair',
      'Feature update or cumulative patch rollback with error 0x80070002'
    ],
    causes: [
      'Corrupted SoftwareDistribution download directory',
      'Registry keys pointing to nonexistent system or driver files',
      'Antivirus quarantine of temporary staging CAB files'
    ],
    solutionSteps: [
      'Stop Windows Update and BITS background services',
      'Purge and rename the SoftwareDistribution and Catroot2 folders',
      'Restart the services and trigger an immediate update check',
      'Run DISM RestoreHealth with online source'
    ],
    commands: [
      {
        label: 'Purge Windows Update Staging Cache',
        type: 'cmd',
        code: 'net stop wuauserv\nnet stop cryptSvc\nnet stop bits\nnet stop msiserver\nren C:\\Windows\\SoftwareDistribution SoftwareDistribution.old\nren C:\\Windows\\System32\\catroot2 catroot2.old\nnet start wuauserv\nnet start cryptSvc\nnet start bits\nnet start msiserver'
      },
      {
        label: 'Scan and Repair Component Store (Online)',
        type: 'cmd',
        code: 'DISM /Online /Cleanup-Image /RestoreHealth\nsfc /scannow'
      },
      {
        label: 'Force Windows Update Re-sync (PowerShell)',
        type: 'powershell',
        code: '(New-Object -ComObject Microsoft.Update.AutoUpdate).DetectNow()'
      }
    ]
  },
  {
    hex: '0x80070057',
    name: 'E_INVALIDARG (The parameter is incorrect)',
    category: 'Component Store / DISM',
    severity: 'High',
    description: 'An invalid argument or corrupt storage sector was encountered during Windows installation, DISM servicing, partition configuration, or system backup.',
    symptoms: [
      'Windows Setup fails when partitioning or formatting SSD/HDD',
      'Windows Backup (wbadmin) or System Restore fails with invalid parameter',
      'DISM fails with error 87 or 0x80070057'
    ],
    causes: [
      'Corrupted partition table or reserved partition (MSR/EFI misalignment)',
      'Registry decimal symbol configuration mismatch',
      'Failing disk sectors or bad SATA/NVMe cable/slot connection'
    ],
    solutionSteps: [
      'Format partition using Diskpart clean command (if in installer)',
      'Verify Decimal Symbol is set to dot (.) in Windows Regional settings',
      'Run Chkdsk on target volume with /f /r flags'
    ],
    commands: [
      {
        label: 'Disk Surface & File System Repair',
        type: 'cmd',
        code: 'chkdsk C: /f /r /x'
      },
      {
        label: 'Repair Decimal Symbol in Registry',
        type: 'reg',
        code: 'reg add "HKCU\\Control Panel\\International" /v sDecimal /t REG_SZ /d "." /f'
      },
      {
        label: 'Check Storage Health via PowerShell',
        type: 'powershell',
        code: 'Get-PhysicalDisk | Select-Object FriendlyName, MediaType, HealthStatus, OperationalStatus'
      }
    ]
  },
  {
    hex: '0x800F081F',
    name: 'CBS_E_SOURCE_MISSING (DISM Source Files Could Not Be Found)',
    category: 'Component Store / DISM',
    severity: 'Critical',
    description: 'DISM cannot find the required delta packages or payload files in local WinSxS store to restore damaged system components.',
    symptoms: [
      'DISM /RestoreHealth terminates with error 0x800f081f',
      '.NET Framework 3.5 installation fails on Windows 10/11',
      'Cumulative updates fail with CBS servicing errors'
    ],
    causes: [
      'WinSxS payload repository corrupted or trimmed',
      'Windows Update server access blocked by group policy or proxy',
      'Mismatch between installed Windows build and online update catalog'
    ],
    solutionSteps: [
      'Mount a clean Windows ISO of matching build number (e.g. to drive D:)',
      'Extract install.wim index list using DISM /Get-WimInfo',
      'Execute DISM pointing directly to the mounted WIM/ESD source image'
    ],
    commands: [
      {
        label: 'DISM Repair Using Mounted Windows ISO (install.wim)',
        type: 'cmd',
        code: 'DISM /Online /Cleanup-Image /RestoreHealth /Source:WIM:D:\\sources\\install.wim:1 /LimitAccess'
      },
      {
        label: 'DISM Repair Using Mounted Windows ISO (install.esd)',
        type: 'cmd',
        code: 'DISM /Online /Cleanup-Image /RestoreHealth /Source:ESD:D:\\sources\\install.esd:1 /LimitAccess'
      },
      {
        label: 'Enable .NET 3.5 Offline from ISO',
        type: 'cmd',
        code: 'DISM /Online /Enable-Feature /FeatureName:NetFx3 /All /LimitAccess /Source:D:\\sources\\sxs'
      }
    ]
  },
  {
    hex: '0x80070422',
    name: 'ERROR_SERVICE_DISABLED (The service cannot be started)',
    category: 'Windows Update',
    severity: 'Medium',
    description: 'Windows Update or its dependent background services (BITS, AppX, CryptSvc, DCOM) are flagged as Disabled in Services management.',
    symptoms: [
      'Windows Update says "There were some problems installing updates"',
      'Microsoft Store app downloads stuck on pending',
      'Windows Defender definitions cannot update'
    ],
    causes: [
      'Third-party "debloater" scripts or telemetry block tools disabled the service',
      'Malware disabling Windows Defender and update mechanisms',
      'Group Policy enforcing disabled state on wuauserv'
    ],
    solutionSteps: [
      'Set Windows Update service (wuauserv) startup type to Automatic',
      'Set Background Intelligent Transfer Service (BITS) to Manual/Automatic',
      'Start all services and verify dependencies'
    ],
    commands: [
      {
        label: 'Restore and Start Update Services',
        type: 'cmd',
        code: 'sc config wuauserv start= auto\nsc config bits start= auto\nsc config cryptsvc start= auto\nsc config trustedinstaller start= auto\nnet start wuauserv\nnet start bits\nnet start cryptsvc'
      },
      {
        label: 'Reset Windows Update Service DACL Security',
        type: 'cmd',
        code: 'sc.exe sdset wuauserv D:(A;;CCLCSWRPWPDTLOCRRC;;;SY)(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;BA)(A;;CCLCSWLOCRRC;;;AU)(A;;CCLCSWRPWPDTLOCRRC;;;PU)'
      }
    ]
  },
  {
    hex: '0x0000007B',
    name: 'INACCESSIBLE_BOOT_DEVICE',
    category: 'BSOD & Kernel',
    severity: 'Critical',
    description: 'The Windows kernel lost communication with the system boot storage volume during initialization before the full OS driver stack was loaded.',
    symptoms: [
      'Blue Screen on Windows startup logo',
      'Reboot loop after motherboard BIOS update or SATA mode change',
      'Failure after cloning disk from SATA SSD to NVMe M.2'
    ],
    causes: [
      'BIOS SATA Controller Mode switched between RAID / VMD and AHCI',
      'Missing or uninstalled NVMe/Intel RST controller driver',
      'Damaged EFI BCD boot configuration pointing to wrong partition UUID'
    ],
    solutionSteps: [
      'Enter BIOS and toggle SATA Mode (AHCI vs RAID/Intel RST VMD)',
      'Boot to WinRE Command Prompt and rebuild BCD store',
      'Inject standard storahci or stornvme driver via Safe Mode registry'
    ],
    commands: [
      {
        label: 'Rebuild BCD and MBR Bootloader (WinRE)',
        type: 'cmd',
        code: 'bootrec /fixmbr\nbootrec /fixboot\nbootrec /scanos\nbootrec /rebuildbcd'
      },
      {
        label: 'Force Safe Mode on Next Boot via BCD',
        type: 'cmd',
        code: 'bcdedit /set {default} safeboot minimal'
      },
      {
        label: 'Remove Safe Mode Lock after repair',
        type: 'cmd',
        code: 'bcdedit /deletevalue {default} safeboot'
      }
    ]
  },
  {
    hex: '0x0000000A',
    name: 'IRQL_NOT_LESS_OR_EQUAL',
    category: 'BSOD & Kernel',
    severity: 'Critical',
    description: 'A kernel-mode process or device driver attempted to access a pageable memory address at an Interrupt Request Level (IRQL) that was too high.',
    symptoms: [
      'Random Blue Screen during gaming, heavy CPU load, or sleep resume',
      'BugCheck referencing ntoskrnl.exe, nvlddmkm.sys, or wifi/ethernet drivers'
    ],
    causes: [
      'Unstable CPU or RAM overclock (XMP / EXPO timing instability)',
      'Corrupt third-party kernel filter driver (anticheat, VPN, antivirus)',
      'Failing physical RAM module or socket contact issue'
    ],
    solutionSteps: [
      'Disable XMP/EXPO in BIOS or increase DRAM voltage +0.02V',
      'Run Windows Memory Diagnostic (mdsched.exe) or MemTest86',
      'Clean install GPU driver using DDU (Display Driver Uninstaller)',
      'Analyze memory dump using WinDbg or BlueScreenView'
    ],
    commands: [
      {
        label: 'Launch Windows Memory Diagnostic Tool',
        type: 'cmd',
        code: 'mdsched.exe'
      },
      {
        label: 'Enable Windows Driver Verifier',
        type: 'cmd',
        code: 'verifier /standard /all'
      },
      {
        label: 'Reset / Disable Driver Verifier',
        type: 'cmd',
        code: 'verifier /reset'
      }
    ]
  },
  {
    hex: '0x80070005',
    name: 'E_ACCESSDENIED (General Access Denied)',
    category: 'Security & Permissions',
    severity: 'High',
    description: 'The executing process lacks necessary NTFS file permissions, registry DACL privileges, or UAC Administrator elevation token.',
    symptoms: [
      'Installers fail with "Access is denied"',
      'Windows Update fails when writing to C:\\Program Files or System32',
      'Group Policy updates fail'
    ],
    causes: [
      'Corrupted NTFS permissions on system directories',
      'Antivirus blocking file modification',
      'User profile token corruption'
    ],
    solutionSteps: [
      'Run prompt as Elevated Administrator',
      'Reset NTFS security descriptors on Windows Apps / System directories',
      'Use SubInACL or ICACLS to repair ownership'
    ],
    commands: [
      {
        label: 'Take Ownership and Reset NTFS Permissions',
        type: 'cmd',
        code: 'takeown /f "C:\\Windows\\SoftwareDistribution" /r /d y\nicacls "C:\\Windows\\SoftwareDistribution" /grant administrators:F /t'
      },
      {
        label: 'Reset Windows Apps Security Descriptors (PowerShell)',
        type: 'powershell',
        code: 'Get-AppXPackage -AllUsers | Foreach {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\\AppXManifest.xml"}'
      }
    ]
  },
  {
    hex: '0x80070643',
    name: 'ERROR_INSTALL_FAILURE (Windows Recovery / MSI Update Failure)',
    category: 'Windows Update',
    severity: 'High',
    description: 'Fatal error during installation, commonly encountered in KB5034441 when the Windows Recovery Environment (WinRE) partition has insufficient free space.',
    symptoms: [
      'Windows Security / WinRE update repeatedly fails at 100%',
      'MSI installer fails during rollback'
    ],
    causes: [
      'Recovery Partition (WinRE) is smaller than 750MB - 1GB',
      'Corrupted Windows Installer service database'
    ],
    solutionSteps: [
      'Check Recovery partition size using reagentc /info and diskpart',
      'Shrink OS partition by 1GB and extend Recovery partition',
      'Re-enable WinRE staging'
    ],
    commands: [
      {
        label: 'Inspect and Enable WinRE Status',
        type: 'cmd',
        code: 'reagentc /info\nreagentc /disable\nreagentc /enable'
      },
      {
        label: 'Reset Windows Installer Service',
        type: 'cmd',
        code: 'msiexec /unregister\nmsiexec /regserver'
      }
    ]
  },
  {
    hex: '0x0000003B',
    name: 'SYSTEM_SERVICE_EXCEPTION',
    category: 'BSOD & Kernel',
    severity: 'Critical',
    description: 'An exception happened while executing a routine from system service code, commonly triggered by graphic drivers or GUI subsystem (win32kbase.sys).',
    symptoms: [
      'BSOD when starting 3D applications, games, or video rendering',
      'Bugcheck pointing to dxgkrnl.sys, nvlddmkm.sys, or atikmdag.sys'
    ],
    causes: [
      'Corrupt graphics driver files or conflicting display overlays',
      'DirectX subsystem corruption',
      'VRAM instability or PCIe bus clock errors'
    ],
    solutionSteps: [
      'Perform clean display driver reinstall using DDU in Safe Mode',
      'Update Motherboard BIOS to latest AGESA/Microcode',
      'Run SFC scannow to repair system DirectX binaries'
    ],
    commands: [
      {
        label: 'System File Check & DirectX Integrity',
        type: 'cmd',
        code: 'sfc /scannow\nDISM /Online /Cleanup-Image /RestoreHealth'
      },
      {
        label: 'Restart Graphic Driver Stack (Hotkey shortcut)',
        type: 'cmd',
        code: 'echo Press [Win + Ctrl + Shift + B] on your keyboard to instantly restart GPU driver.'
      }
    ]
  },
  {
    hex: '0x80240034',
    name: 'WU_E_DOWNLOAD_FAILED (Windows Update Download Failed)',
    category: 'Windows Update',
    severity: 'Medium',
    description: 'Windows Update was unable to download the update payload due to network drop, proxy blocking, or CDN hash mismatch.',
    symptoms: [
      'Update progress bar resets or stays at 0%',
      'Network timeout errors in WindowsUpdate.log'
    ],
    causes: [
      'ISP or router DNS caching stale Microsoft CDN IP addresses',
      'Corrupted Windows Update cache',
      'VPN or MTU size packet fragmentation'
    ],
    solutionSteps: [
      'Flush local DNS resolver and reset network adapter sockets',
      'Wipe downloaded update cache folder',
      'Restart Delivery Optimization service'
    ],
    commands: [
      {
        label: 'Flush DNS and Reset Sockets',
        type: 'cmd',
        code: 'ipconfig /flushdns\nipconfig /release\nipconfig /renew\nnetsh winsock reset\nnetsh int ip reset'
      },
      {
        label: 'Reset Delivery Optimization Service',
        type: 'cmd',
        code: 'net stop dosvc\nrd /s /q C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Microsoft\\Windows\\DeliveryOptimization\\Cache\nnet start dosvc'
      }
    ]
  },
  {
    hex: '0x80004005',
    name: 'E_FAIL (Unspecified Error / Network Share & Archive Error)',
    category: 'Filesystem & Storage',
    severity: 'Medium',
    description: 'General catastrophic failure code returned by Windows Explorer, VirtualBox/Hyper-V, SMB network sharing, or ZIP extraction.',
    symptoms: [
      'Cannot access local network NAS or shared folder',
      'Virtual Machine fails to start with VT-x error',
      'Cannot extract zip file'
    ],
    causes: [
      'SMB1 protocol disabled or guest network access blocked by policy',
      'Hyper-V conflict with third-party virtualization (VirtualBox/VMware)',
      'Corrupt user profile credentials'
    ],
    solutionSteps: [
      'Enable Insecure Guest Logons in Group Policy if accessing legacy NAS',
      'Reset Windows Credential Manager cached logins',
      'Check Hyper-V and Virtual Machine Platform Windows features'
    ],
    commands: [
      {
        label: 'Allow Insecure Guest Auth for SMB (Registry)',
        type: 'reg',
        code: 'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\LanmanWorkstation\\Parameters" /v AllowInsecureGuestAuth /t REG_DWORD /d 1 /f'
      },
      {
        label: 'Verify Virtualization Features (PowerShell)',
        type: 'powershell',
        code: 'Get-WindowsOptionalFeature -Online | Where-Object {$_.FeatureName -like "*Hyper-V*" -or $_.FeatureName -like "*VirtualMachine*"}'
      }
    ]
  },
  {
    hex: '0xC000021A',
    name: 'STATUS_SYSTEM_PROCESS_TERMINATED',
    category: 'BSOD & Kernel',
    severity: 'Critical',
    description: 'A crucial user-mode subsystem such as winlogon.exe or csrss.exe terminated unexpectedly, forcing the NT kernel to halt the system for security.',
    symptoms: [
      'Blue screen immediately after Windows boot logo',
      'Cannot reach the Windows Login screen'
    ],
    causes: [
      'Corrupted third-party system DLLs injected into Winlogon',
      'Mismatched system files after an aborted Windows upgrade',
      'Driver signature enforcement failure'
    ],
    solutionSteps: [
      'Boot to WinRE Advanced Options -> Startup Settings -> Disable Driver Signature Enforcement',
      'Run offline SFC against Windows directory from WinRE prompt',
      'Roll back recent pending update packages via DISM /remove-package'
    ],
    commands: [
      {
        label: 'Offline System File Checker (WinRE)',
        type: 'cmd',
        code: 'sfc /scannow /offbootdir=C:\\ /offwindir=C:\\Windows'
      },
      {
        label: 'List Pending Servicing Packages (WinRE)',
        type: 'cmd',
        code: 'DISM /Image:C:\\ /Get-Packages'
      }
    ]
  }
];
