import { KnowledgeArticle, ShortcutItem } from '../types';

export const INITIAL_KB_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'kb-1',
    title: 'Fix Corrupted Windows System Files & WinSxS Component Store',
    category: 'Windows & OS Repair',
    tags: ['dism', 'sfc', 'bluescreen', 'windows11', 'winsxs'],
    content: 'When Windows experiences sudden BSOD crashes, missing DLL errors, or broken Start Menu search, the Windows Component Store (WinSxS) and system files must be verified and repaired against online Microsoft update images.',
    code: ':: Run elevated terminal (Admin)\nDISM /Online /Cleanup-Image /CheckHealth\nDISM /Online /Cleanup-Image /ScanHealth\nDISM /Online /Cleanup-Image /RestoreHealth\nsfc /scannow',
    restricted: false,
    updatedAt: Date.now() - 4000000
  },
  {
    id: 'kb-2',
    title: 'Fix Microsoft PowerPoint Crashing on Startup / Presentation Hang',
    category: 'Application Fixes',
    tags: ['powerpoint', 'office', 'crash', 'hardware-acceleration', 'com-addin'],
    content: 'PowerPoint crashes on launch are almost always caused by corrupted third-party COM add-ins (e.g. Acrobat, Grammarly, EndNote) or faulty GPU hardware graphics acceleration.',
    code: ':: Step 1: Launch PowerPoint in Safe Mode (bypasses all add-ins)\npowerpnt /safe\n\n:: Step 2: In PowerPoint -> File -> Options -> Add-ins -> COM Add-ins -> Go\n:: Uncheck all third-party add-ins.\n\n:: Step 3: Disable Hardware Graphics Acceleration via Registry if crash persists:\nreg add "HKCU\\Software\\Microsoft\\Office\\16.0\\Common\\Graphics" /v DisableHardwareAcceleration /t REG_DWORD /d 1 /f',
    restricted: false,
    updatedAt: Date.now() - 3000000
  },
  {
    id: 'kb-3',
    title: 'Reset Adobe Photoshop Corrupted Preferences & Scratch Disk Locked Error',
    category: 'Graphics & Adobe Suite',
    tags: ['photoshop', 'adobe', 'scratch-disk', 'preferences'],
    content: 'If Photoshop freezes on the splash screen ("Reading Preferences...") or throws "Could not initialize Photoshop because the scratch disks are full", purge the cached settings and reassign the scratch volume.',
    code: ':: Method A: Hard Reset Shortcut\n:: Hold [Ctrl + Alt + Shift] immediately upon launching Photoshop.\n:: Click \'Yes\' to delete the Adobe Photoshop Settings File.\n\n:: Method B: Manual purge of corrupt workspace cache\nrd /s /q "%APPDATA%\\Adobe\\Adobe Photoshop 2024\\Adobe Photoshop 2024 Settings"\n\n:: Method C: Force Scratch Disk selection on launch\n:: Hold [Ctrl + Alt] immediately when double-clicking Photoshop icon.',
    restricted: false,
    updatedAt: Date.now() - 2000000
  },
  {
    id: 'kb-4',
    title: 'Purge & Rebuild Corrupted Windows Update Cache (0x80070002 / 0x800f081f)',
    category: 'Windows & OS Repair',
    tags: ['windows-update', 'softwaredistribution', 'error-fix'],
    content: 'When Windows updates get stuck at 0% or fail with rollback error codes, stop the cryptographic/update services and wipe the downloaded payload cache.',
    code: 'net stop wuauserv\nnet stop cryptSvc\nnet stop bits\nnet stop msiserver\n\nren C:\\Windows\\SoftwareDistribution SoftwareDistribution.old\nren C:\\Windows\\System32\\catroot2 catroot2.old\n\nnet start wuauserv\nnet start cryptSvc\nnet start bits\nnet start msiserver',
    restricted: true,
    updatedAt: Date.now() - 1000000
  },
  {
    id: 'kb-5',
    title: 'Rebuild Corrupted Windows EFI Bootloader & BCD Configuration',
    category: 'Boot & Storage',
    tags: ['bcdedit', 'bootrec', 'uefi', 'no-boot', 'diskpart'],
    content: 'When Windows fails to boot with "0xc0000098" or "Inaccessible Boot Device" following a drive clone or partition resize, rebuild the BCD record from the Windows Recovery USB command prompt.',
    code: 'bootrec /fixmbr\nbootrec /fixboot\nbootrec /scanos\nbootrec /rebuildbcd\n\n:: If EFI system partition needs fresh files:\ndiskpart\nlist volume\nselect volume X  :: (replace X with FAT32 EFI partition)\nassign letter=S\nexit\nbcdboot C:\\Windows /s S: /f UEFI',
    restricted: true,
    updatedAt: Date.now() - 500000
  },
  {
    id: 'kb-6',
    title: 'Flush DNS, Reset Winsock & Rebind TCP/IP Network Stack',
    category: 'Network & DNS',
    tags: ['network', 'dns', 'winsock', 'internet', 'tcpip'],
    content: 'Resolves "No Internet, Secured" bugs, DNS server not responding errors, and browser connection drops caused by corrupt socket LSP layers.',
    code: 'ipconfig /flushdns\nipconfig /registerdns\nipconfig /release\nipconfig /renew\nnetsh winsock reset\nnetsh int ip reset\n:: Restart computer after running',
    restricted: false,
    updatedAt: Date.now() - 200000
  }
];

export const SHORTCUTS_DATA: ShortcutItem[] = [
  /* Microsoft PowerPoint */
  { id: 'ppt-1', app: 'powerpoint', category: 'Slideshow', action: 'Start Presentation from Beginning', keys: ['F5'], desc: 'Enters presentation mode from slide 1.' },
  { id: 'ppt-2', app: 'powerpoint', category: 'Slideshow', action: 'Start Presentation from Current Slide', keys: ['Shift', 'F5'], desc: 'Enters slideshow mode from the active selected slide.' },
  { id: 'ppt-3', app: 'powerpoint', category: 'Live Presentation', action: 'Toggle Blank Black Screen', keys: ['B'], desc: 'Blacks out screen during speeches to focus audience on speaker.' },
  { id: 'ppt-4', app: 'powerpoint', category: 'Live Presentation', action: 'Toggle Blank White Screen', keys: ['W'], desc: 'Turns screen white for whiteboard drawing or laser pointer use.' },
  { id: 'ppt-5', app: 'powerpoint', category: 'Live Annotation', action: 'Turn Pointer into Pen Tool', keys: ['Ctrl', 'P'], desc: 'Enables live drawing on top of active slides.' },
  { id: 'ppt-6', app: 'powerpoint', category: 'Live Annotation', action: 'Turn Pointer into Laser Pointer', keys: ['Ctrl', 'L'], desc: 'Changes cursor into a bright laser pointer glow.' },
  { id: 'ppt-7', app: 'powerpoint', category: 'Editing', action: 'Duplicate Selected Object or Slide', keys: ['Ctrl', 'D'], desc: 'Instantly duplicates selected elements.' },

  /* Adobe Photoshop */
  { id: 'ps-1', app: 'photoshop', category: 'Tools & Workspace', action: 'Free Transform Layer', keys: ['Ctrl', 'T'], desc: 'Enables bounding box handles to scale, rotate, and distort layer.' },
  { id: 'ps-2', app: 'photoshop', category: 'Workflow', action: 'Stamp Visible into New Layer', keys: ['Ctrl', 'Alt', 'Shift', 'E'], desc: 'Flattens visible artwork onto a new top layer non-destructively.' },
  { id: 'ps-3', app: 'photoshop', category: 'Selection', action: 'Deselect Active Selection', keys: ['Ctrl', 'D'], desc: 'Clears marching ants selection boundary.' },
  { id: 'ps-4', app: 'photoshop', category: 'Selection', action: 'Invert Active Selection', keys: ['Ctrl', 'Shift', 'I'], desc: 'Flips mask selection to everything else outside current border.' },
  { id: 'ps-5', app: 'photoshop', category: 'Brushes', action: 'Adjust Brush Diameter & Hardness', keys: ['Alt', 'Right-Click + Drag'], desc: 'Drag left/right to resize; drag up/down to adjust edge hardness.' },
  { id: 'ps-6', app: 'photoshop', category: 'Color', action: 'Levels Adjustment Dialog', keys: ['Ctrl', 'L'], desc: 'Opens histogram levels to adjust black point and gamma.' },

  /* Windows OS & Diagnostics / SysAdmin */
  { id: 'win-1', app: 'windows', category: 'Diagnostics', action: 'Direct Task Manager Launch', keys: ['Ctrl', 'Shift', 'Esc'], desc: 'Directly opens Task Manager with high process priority.' },
  { id: 'win-2', app: 'windows', category: 'Diagnostics', action: 'Restart Video Graphic Driver Stack', keys: ['Win', 'Ctrl', 'Shift', 'B'], desc: 'Flushes DWM display buffer and restarts GPU graphics driver to fix black screens.' },
  { id: 'win-3', app: 'windows', category: 'System Tools', action: 'Open Quick Link Admin Menu', keys: ['Win', 'X'], desc: 'Opens instant menu for Device Manager, Terminal (Admin), and Disk Management.' },
  { id: 'win-4', app: 'windows', category: 'System Tools', action: 'Open Run Dialog Box', keys: ['Win', 'R'], desc: 'Quick prompt to launch cmd, regedit, msconfig, or dxdiag.' },
  { id: 'win-5', app: 'windows', category: 'Screen Capture', action: 'Snipping Tool Rectangular Crop', keys: ['Win', 'Shift', 'S'], desc: 'Freezes screen and copies selected crop to clipboard.' },

  /* VS Code & Developer Terminals */
  { id: 'vsc-1', app: 'vscode', category: 'Navigation', action: 'Quick File Search / Open', keys: ['Ctrl', 'P'], desc: 'Instant fuzzy finder to jump to any file in project tree.' },
  { id: 'vsc-2', app: 'vscode', category: 'Command Palette', action: 'Open Universal Command Palette', keys: ['Ctrl', 'Shift', 'P'], desc: 'Search and run any editor action, formatter, or extension tool.' },
  { id: 'vsc-3', app: 'vscode', category: 'Terminal', action: 'Toggle Integrated Terminal', keys: ['Ctrl', '`'], desc: 'Spawns or minimizes built-in PowerShell, Bash, or Command Prompt.' },
  { id: 'vsc-4', app: 'vscode', category: 'Editing', action: 'Add Multi-Cursor to Next Match', keys: ['Ctrl', 'D'], desc: 'Selects next instance of current word for simultaneous multi-cursor editing.' },

  /* Adobe Premiere Pro */
  { id: 'pr-1', app: 'premiere', category: 'Timeline Editing', action: 'Razor Cut at Playhead', keys: ['Ctrl', 'K'], desc: 'Splits all unlocked video/audio tracks under current playhead.' },
  { id: 'pr-2', app: 'premiere', category: 'Timeline Editing', action: 'Ripple Trim Head / Tail', keys: ['Q', '/', 'W'], desc: 'Q trims and deletes head to playhead; W trims tail to playhead with gap closing.' },
  { id: 'pr-3', app: 'premiere', category: 'Playback', action: 'J-K-L Shuttling Navigation', keys: ['J', 'K', 'L'], desc: 'J = Reverse Play (press multiple times for 2x/4x), K = Pause, L = Forward Play.' },

  /* Linux Diagnostics */
  { id: 'lnx-1', app: 'linux', category: 'Diagnostics Terminal', action: 'Real-time Kernel Ring Buffer Monitoring', keys: ['dmesg -wH'], desc: 'Monitors USB drops, PCIe AER error signals, and hardware faults in real-time.' },
  { id: 'lnx-2', app: 'linux', category: 'Diagnostics Terminal', action: 'List PCI Hardware Bus Architecture', keys: ['lspci -tvnn'], desc: 'Displays tree hierarchy of GPU, NVMe controllers, and bridge links.' }
];
