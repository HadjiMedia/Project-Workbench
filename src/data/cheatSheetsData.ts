export interface BiosKeyEntry {
  brand: string;
  category: 'Desktop Motherboard' | 'Laptop / OEM' | 'Server / Workstation' | 'Handheld / Console';
  biosKey: string;
  bootMenuKey: string;
  recoveryKey?: string;
  notes: string;
}

export interface StartupShortcutEntry {
  platform: 'Windows' | 'macOS' | 'Universal / Firmware';
  hotkey: string;
  actionName: string;
  description: string;
  useCase: string;
}

export interface EzDebugLedGuide {
  led: 'CPU' | 'DRAM' | 'VGA' | 'BOOT';
  color: string;
  meaning: string;
  commonCauses: string[];
  diagnosticSteps: string[];
}

export interface DisplayPortSpec {
  standard: string;
  type: 'HDMI' | 'DisplayPort';
  releaseYear: number;
  maxBandwidthGbps: number;
  maxResolution: string;
  max1080pHz: number;
  max1440pHz: number;
  max4kHz: number;
  max8kHz?: string;
  hdrSupport: boolean;
  dscSupport: boolean;
  notes: string;
}

export interface RescueCommand {
  category: 'Windows System Repair' | 'Windows Network & Disk' | 'Linux Storage & SMART' | 'Linux Filesystem & Recovery';
  command: string;
  description: string;
  flagsExplained: string;
  riskLevel: 'Safe' | 'Medium' | 'Destructive / High';
}

export const BIOS_BOOT_KEYS: BiosKeyEntry[] = [
  { brand: 'ASUS (ROG, TUF, Prime)', category: 'Desktop Motherboard', biosKey: 'Del or F2', bootMenuKey: 'F8', recoveryKey: 'Alt + F10', notes: 'Press Del repeatedly during post. Hold Shift on restart from Windows.' },
  { brand: 'MSI (MAG, MPG, PRO)', category: 'Desktop Motherboard', biosKey: 'Del', bootMenuKey: 'F11', recoveryKey: 'F3', notes: 'Del enters Click BIOS / Click BIOS 5. F11 opens BBS popup boot menu.' },
  { brand: 'Gigabyte / AORUS', category: 'Desktop Motherboard', biosKey: 'Del', bootMenuKey: 'F12', recoveryKey: 'End (Q-Flash)', notes: 'F12 for Boot menu. Press End to open Q-Flash directly without entering full BIOS.' },
  { brand: 'ASRock', category: 'Desktop Motherboard', biosKey: 'Del or F2', bootMenuKey: 'F11', recoveryKey: 'Instant Flash (F6)', notes: 'F11 for BBS Boot Popup. F6 launches Instant Flash tool.' },
  { brand: 'Dell / Alienware', category: 'Laptop / OEM', biosKey: 'F2', bootMenuKey: 'F12', recoveryKey: 'SupportAssist (Hold Ctrl+Esc on AC plug-in)', notes: 'F12 opens One-Time Boot Menu and SupportAssist ePSA hardware diagnostics.' },
  { brand: 'HP (Pavilion, Omen, Envy, ProBook)', category: 'Laptop / OEM', biosKey: 'F10 (or Esc -> F10)', bootMenuKey: 'F9 (or Esc -> F9)', recoveryKey: 'F11 (System Recovery)', notes: 'Press Esc rapidly at power-on to pause startup and display the startup menu.' },
  { brand: 'Lenovo (ThinkPad, IdeaPad, Legion)', category: 'Laptop / OEM', biosKey: 'F1 or Enter -> F1 / Fn+F2', bootMenuKey: 'F12 / Enter -> F12', recoveryKey: 'Novo Button (pinhole)', notes: 'Many Lenovo laptops require pressing Enter at splash or using a pin in the Novo hole.' },
  { brand: 'Acer (Predator, Nitro, Aspire)', category: 'Laptop / OEM', biosKey: 'Del or F2', bootMenuKey: 'F12 (May need enabling in BIOS)', recoveryKey: 'Alt + F10', notes: 'F12 boot menu is often disabled by default in Acer BIOS Main menu.' },
  { brand: 'Microsoft Surface', category: 'Laptop / OEM', biosKey: 'Hold Vol Up + Power', bootMenuKey: 'Hold Vol Down + Power', recoveryKey: 'Surface Recovery USB', notes: 'Release Vol Up when Surface logo appears. Hold Vol Down while powering on for USB boot.' },
  { brand: 'Framework Laptop', category: 'Laptop / OEM', biosKey: 'F2', bootMenuKey: 'F12', recoveryKey: 'InsydeH2O Recovery', notes: 'Standard Insyde UEFI BIOS interface.' },
  { brand: 'Intel NUC', category: 'Desktop Motherboard', biosKey: 'F2', bootMenuKey: 'F10', recoveryKey: 'F4 (BIOS Flash) / F7', notes: 'Hold power button for 3 seconds for Intel Power Button Menu.' },
  { brand: 'Apple Mac (Intel Models)', category: 'Laptop / OEM', biosKey: 'Option (Alt) Key', bootMenuKey: 'Option (Alt) Key', recoveryKey: 'Cmd + R (Local) / Cmd+Opt+R (Internet)', notes: 'Hold Option at chime for Startup Manager. Hold D for Apple Hardware Diagnostics.' },
  { brand: 'Apple Mac (Apple Silicon M1/M2/M3)', category: 'Laptop / OEM', biosKey: 'Hold Power (10s)', bootMenuKey: 'Hold Power (Startup Options)', recoveryKey: 'Options gear icon in Startup Manager', notes: 'Press and keep holding Touch ID/Power button until "Loading startup options" appears.' },
  { brand: 'Supermicro / Tyan', category: 'Server / Workstation', biosKey: 'Del or F2', bootMenuKey: 'F11', recoveryKey: 'IPMI Web Interface', notes: 'IPMI / BMC dedicated LAN port allows out-of-band KVM redirect even with no display.' },
  { brand: 'Valve Steam Deck', category: 'Handheld / Console', biosKey: 'Hold Vol Up + Power', bootMenuKey: 'Hold Vol Down + Power', recoveryKey: 'SteamOS Recovery USB', notes: 'Release power button after chime, keep holding Volume until BIOS/Boot menu appears.' },
  { brand: 'ASUS ROG Ally', category: 'Handheld / Console', biosKey: 'Hold Vol Down + Power', bootMenuKey: 'Hold Vol Down + Power', recoveryKey: 'ASUS Cloud Recovery in BIOS', notes: 'Enters EZ Flash / BIOS setup directly.' }
];

export const STARTUP_SHORTCUTS: StartupShortcutEntry[] = [
  // Windows & PC
  { platform: 'Windows', hotkey: 'Shift + Click "Restart"', actionName: 'Windows Advanced Startup (WinRE)', description: 'Immediately boots into Windows Recovery Environment (Safe Mode, Command Prompt, UEFI Firmware Settings).', useCase: 'Quickest way to enter BIOS or Safe Mode from a running Windows 10/11 system.' },
  { platform: 'Windows', hotkey: 'Win + Ctrl + Shift + B', actionName: 'Graphics Subsystem / Driver Reset', description: 'Beeps and forces Windows DWM and GPU video driver to restart and re-enumerate display buffers.', useCase: 'Fixes frozen black screens, sleep wake-up failure, or stuck GPU driver crashes without rebooting.' },
  { platform: 'Windows', hotkey: 'shutdown /r /o /f /t 00', actionName: 'CLI Force Advanced Startup', description: 'PowerShell/CMD command that immediately restarts the machine straight into WinRE.', useCase: 'Technician script or remote desktop prompt to trigger Safe Mode remotely.' },
  { platform: 'Windows', hotkey: 'Power Button (Hold 4s x3)', actionName: 'Automatic Repair Trigger', description: 'Force powering down the machine 3 times during the Windows loading spinner triggers Automatic Repair.', useCase: 'Accessing WinRE when Windows will not reach the login screen and keys are unresponsive.' },
  { platform: 'Windows', hotkey: 'Shift + F10 (in Win Setup)', actionName: 'Admin Command Prompt in Setup', description: 'Opens System Administrator CMD during Windows 10/11 OOBE setup or Clean Install.', useCase: 'Run "oobe\\bypassnro" to skip Microsoft Account requirement or run Diskpart.' },
  { platform: 'Windows', hotkey: 'Ctrl + Shift + Esc', actionName: 'Direct Task Manager Launch', description: 'Bypasses the GINA/Security screen and launches Task Manager directly.', useCase: 'Kill hung full-screen games or unresponsive explorer.exe.' },

  // macOS
  { platform: 'macOS', hotkey: 'Command + R', actionName: 'macOS Recovery (Local)', description: 'Boots from the built-in recovery partition to reinstall macOS, run Disk Utility, or open Terminal.', useCase: 'Fixing corrupted APFS containers, resetting lost passwords, or factory wiping.' },
  { platform: 'macOS', hotkey: 'Option + Command + R', actionName: 'Internet Recovery (Latest Compatible)', description: 'Downloads and boots Apple recovery over Wi-Fi/Ethernet directly from Apple servers.', useCase: 'Recovering a Mac with a blank/replaced SSD or corrupted local recovery partition.' },
  { platform: 'macOS', hotkey: 'D (or Option + D)', actionName: 'Apple Diagnostics / AHT', description: 'Launches onboard hardware self-test routines to check RAM, CPU, Logic Board, and Battery.', useCase: 'Identifies hardware fault error codes (e.g. PPT004 battery issue, VFD001 GPU fault).' },
  { platform: 'macOS', hotkey: 'Option + Command + P + R (20s)', actionName: 'NVRAM / PRAM Reset (Intel)', description: 'Clears parameter RAM (sound volume, display resolution, startup disk selection, time zone).', useCase: 'Resolves boot loops, no-chime issues, display resolution corruption, and kernel panic loops.' },
  { platform: 'macOS', hotkey: 'Hold Shift at Chime', actionName: 'macOS Safe Mode', description: 'Disables third-party kexts/extensions, clears system font caches, and checks startup directory.', useCase: 'Isolating bad kernel extensions or buggy login items causing freezing at login.' },
  { platform: 'macOS', hotkey: 'T (Hold at Chime)', actionName: 'Target Disk Mode (Intel/Thunderbolt)', description: 'Turns the Mac into an external Thunderbolt/USB-C mass storage drive for another Mac.', useCase: 'Fast data extraction from a Mac with a broken screen or failing OS.' }
];

export const EZ_DEBUG_LEDS: EzDebugLedGuide[] = [
  {
    led: 'CPU',
    color: 'Red (Solid)',
    meaning: 'Processor initialization failure or CPU not detected by motherboard VRM/BIOS.',
    commonCauses: [
      'Bent or misaligned LGA socket pins (Intel / AMD AM5)',
      'Missing or loose 8-pin EPS / CPU_PWR auxiliary cable',
      'Outdated BIOS version that does not support installed CPU generation (e.g. Ryzen 5000 on B450 or 14th Gen Intel on Z690)',
      'Uneven cooler mounting pressure bending motherboard traces',
      'Defective CPU or blown VRM power stage MOSFET'
    ],
    diagnosticSteps: [
      '1. Verify EPS 8-pin 12V cable is firmly clicked into the top-left motherboard header.',
      '2. Use BIOS Flashback (USB + button) to flash the latest BIOS without needing a working CPU.',
      '3. Loosen cooler screws slightly by 1/2 turn to relieve PCB warp.',
      '4. Remove CPU and inspect socket under 10x magnification for bent/bridged pins or thermal paste in socket.'
    ]
  },
  {
    led: 'DRAM',
    color: 'Orange / Yellow (Solid)',
    meaning: 'Memory initialization failure or memory training failure (XMP / EXPO timing fault).',
    commonCauses: [
      'RAM sticks installed in suboptimal slots (Must use Slots A2 & B2 for dual-channel daisy-chain)',
      'Unstable XMP / EXPO memory profile on modern high-speed DDR5 (>6000MHz)',
      'Dust or oxidation on RAM gold edge connector pins',
      'Unseated RAM stick (modern single-latch slots require a firm click on both ends)',
      'Faulty RAM stick or broken memory channel trace from CPU socket'
    ],
    diagnosticSteps: [
      '1. Clear CMOS (bridge CLR_CMOS jumper for 10s with power unplugged) to wipe unstable XMP/EXPO timings.',
      '2. Test with a SINGLE RAM stick in Slot A2 (2nd slot from CPU).',
      '3. Clean RAM gold contacts with 99% isopropyl alcohol and an eraser.',
      '4. Allow DDR5 initial boot up to 3–5 minutes for first-time memory training (DO NOT power off prematurely).'
    ]
  },
  {
    led: 'VGA',
    color: 'White (Solid)',
    meaning: 'Graphics card or integrated GPU display adapter initialization failure.',
    commonCauses: [
      'Monitor cable plugged into motherboard HDMI/DP instead of dedicated GPU port',
      'Loose 12VHPWR 16-pin or PCIe 6+2 pin power cables to the graphics card',
      'PCIe riser cable compatibility mismatch (PCIe 4.0 card on PCIe 3.0 riser cable)',
      'Monitor turned on AFTER PC (UEFI GOP handshake timeout with certain DisplayPort monitors)',
      'GPU not fully seated in PCIe x16 slot or sagging causing pin disconnection'
    ],
    diagnosticSteps: [
      '1. Ensure video cable is plugged directly into the dedicated GPU output ports.',
      '2. Reseat GPU into primary PCIe x16 slot and ensure auxiliary power latches click firmly.',
      '3. Test with HDMI cable instead of DisplayPort (bypasses DisplayPort 1.4 GOP firmware bugs).',
      '4. If using a vertical riser cable, plug GPU directly into motherboard or force PCIe Gen 3 in BIOS.'
    ]
  },
  {
    led: 'BOOT',
    color: 'Green (Solid)',
    meaning: 'No bootable operating system device detected, or UEFI boot partition corrupted.',
    commonCauses: [
      'No bootable SSD/HDD detected or NVMe SSD installed in unpopulated/disabled M.2 slot',
      'CSM (Compatibility Support Module) disabled for old MBR legacy Windows installations',
      'Corrupted Windows BCD (Boot Configuration Data) or missing EFI system partition',
      'SATA controller set to RAID instead of AHCI in BIOS',
      'Dead or unformatted SSD drive'
    ],
    diagnosticSteps: [
      '1. Enter BIOS (Del/F2) and verify SSD is visible under Storage / NVMe Device List.',
      '2. If old drive uses MBR, enable CSM / Legacy Boot in BIOS.',
      '3. Rebuild EFI bootloader via Windows USB: "bootrec /fixboot" and "bcdboot C:\\Windows /s S: /f UEFI".',
      '4. Reseat M.2 NVMe SSD and verify standoff screw isn\'t causing grounding shorts.'
    ]
  }
];

export const DISPLAY_SPECS: DisplayPortSpec[] = [
  {
    standard: 'HDMI 1.4',
    type: 'HDMI',
    releaseYear: 2009,
    maxBandwidthGbps: 10.2,
    maxResolution: '4K @ 30Hz / 1080p @ 144Hz',
    max1080pHz: 144,
    max1440pHz: 75,
    max4kHz: 30,
    hdrSupport: false,
    dscSupport: false,
    notes: 'Legacy standard. Limited to 4K 30Hz or 1080p 144Hz. No HDR.'
  },
  {
    standard: 'HDMI 2.0 / 2.0b',
    type: 'HDMI',
    releaseYear: 2013,
    maxBandwidthGbps: 18.0,
    maxResolution: '4K @ 60Hz / 1440p @ 144Hz',
    max1080pHz: 240,
    max1440pHz: 144,
    max4kHz: 60,
    hdrSupport: true,
    dscSupport: false,
    notes: 'Standard on most 4K TVs and mid-range monitors. Supports static HDR10 at 4K 60Hz.'
  },
  {
    standard: 'HDMI 2.1 / 2.1a',
    type: 'HDMI',
    releaseYear: 2017,
    maxBandwidthGbps: 48.0,
    maxResolution: '4K @ 144Hz / 8K @ 60Hz',
    max1080pHz: 360,
    max1440pHz: 240,
    max4kHz: 144,
    max8kHz: '8K @ 60Hz (with DSC)',
    hdrSupport: true,
    dscSupport: true,
    notes: 'Ultra High Speed HDMI. Supports 4K 144Hz, 8K 60Hz, Dynamic HDR, VRR (Variable Refresh Rate), eARC, and ALLM.'
  },
  {
    standard: 'DisplayPort 1.2',
    type: 'DisplayPort',
    releaseYear: 2010,
    maxBandwidthGbps: 21.6,
    maxResolution: '4K @ 60Hz / 1440p @ 165Hz',
    max1080pHz: 240,
    max1440pHz: 165,
    max4kHz: 60,
    hdrSupport: false,
    dscSupport: false,
    notes: 'HBR2 transmission rate. Introduced MST (Multi-Stream Transport) daisy-chaining.'
  },
  {
    standard: 'DisplayPort 1.4 / 1.4a',
    type: 'DisplayPort',
    releaseYear: 2016,
    maxBandwidthGbps: 32.4,
    maxResolution: '4K @ 144Hz / 8K @ 60Hz',
    max1080pHz: 360,
    max1440pHz: 240,
    max4kHz: 144,
    max8kHz: '8K @ 60Hz (with DSC)',
    hdrSupport: true,
    dscSupport: true,
    notes: 'HBR3 transmission rate. Added DSC (Display Stream Compression 1.2) allowing 4K 240Hz & 8K 60Hz.'
  },
  {
    standard: 'DisplayPort 2.1 (UHBR20)',
    type: 'DisplayPort',
    releaseYear: 2022,
    maxBandwidthGbps: 80.0,
    maxResolution: '4K @ 480Hz / 8K @ 165Hz / 16K @ 60Hz',
    max1080pHz: 540,
    max1440pHz: 480,
    max4kHz: 240,
    max8kHz: '8K @ 165Hz (with DSC)',
    hdrSupport: true,
    dscSupport: true,
    notes: 'Massive 80 Gbps bandwidth. Supports uncompressed 4K 240Hz HDR and dual 8K 120Hz displays over USB4/Thunderbolt.'
  }
];

export const FRONT_PANEL_JFP1_PINS = [
  { pin: 1, label: 'HD_LED+', color: '#ef4444', desc: 'Hard Drive Activity LED (Positive Anode +)' },
  { pin: 2, label: 'PWR_LED+', color: '#22c55e', desc: 'Power Indicator LED (Positive Anode +)' },
  { pin: 3, label: 'HD_LED-', color: '#991b1b', desc: 'Hard Drive Activity LED (Negative Cathode -)' },
  { pin: 4, label: 'PWR_LED-', color: '#166534', desc: 'Power Indicator LED (Negative Cathode -)' },
  { pin: 5, label: 'RESET_SW (GND)', color: '#3b82f6', desc: 'Reset Switch Ground (Polarity does not matter)' },
  { pin: 6, label: 'PWR_SW (Signal)', color: '#f59e0b', desc: 'Power Switch Signal +3.3VSB (Short to Pin 8 to turn on)' },
  { pin: 7, label: 'RESET_SW (Signal)', color: '#1d4ed8', desc: 'Reset Switch Active Low (Short to Pin 5 to reboot)' },
  { pin: 8, label: 'PWR_SW (GND)', color: '#d97706', desc: 'Power Switch Ground (Short with Pin 6 using screwdriver to test POST)' },
  { pin: 9, label: 'NC (Key / Blank)', color: '#475569', desc: 'No Connection / Empty Pin (Prevents reverse installation)' }
];

export const RESCUE_COMMANDS: RescueCommand[] = [
  // Windows System Repair
  {
    category: 'Windows System Repair',
    command: 'sfc /scannow',
    description: 'System File Checker: Scans integrity of all protected system files and replaces corrupted files with cached copies from WinSxS.',
    flagsExplained: '/scannow: Scans all protected system files immediately.',
    riskLevel: 'Safe'
  },
  {
    category: 'Windows System Repair',
    command: 'dism /online /cleanup-image /restorehealth',
    description: 'Deployment Image Servicing and Management: Repairs the corrupted local Windows Component Store using Windows Update payload.',
    flagsExplained: '/online: Targets current live running OS. /restorehealth: Scans and repairs store corruption.',
    riskLevel: 'Safe'
  },
  {
    category: 'Windows System Repair',
    command: 'dism /online /cleanup-image /startcomponentcleanup /resetbase',
    description: 'Deep cleans superseded Windows Update service pack files and reclaims 5GB–20GB of disk space from WinSxS.',
    flagsExplained: '/resetbase: Discards previous rollback versions (cannot uninstall current updates).',
    riskLevel: 'Safe'
  },
  {
    category: 'Windows System Repair',
    command: 'bcdboot C:\\Windows /s S: /f UEFI',
    description: 'Rebuilds missing or corrupted EFI bootloader partitions on drive S: for clean UEFI booting.',
    flagsExplained: '/s S:: Target EFI system volume. /f UEFI: Generates UEFI x64 BCD files.',
    riskLevel: 'Medium'
  },

  // Windows Network & Disk
  {
    category: 'Windows Network & Disk',
    command: 'chkdsk C: /f /r /x',
    description: 'Checks volume file system metadata, fixes bad sectors, and recovers readable info on next reboot.',
    flagsExplained: '/f: Fixes errors. /r: Locates bad sectors & recovers info. /x: Forces volume dismount.',
    riskLevel: 'Medium'
  },
  {
    category: 'Windows Network & Disk',
    command: 'netsh winsock reset && netsh int ip reset && ipconfig /flushdns',
    description: 'Completely purges and rebuilds the Windows TCP/IP networking stack and clears DNS resolver cache.',
    flagsExplained: 'Solves adapter disconnects, VPN leaks, proxy hijacking, and IP assignment loops.',
    riskLevel: 'Safe'
  },
  {
    category: 'Windows Network & Disk',
    command: 'powercfg /batteryreport /output "C:\\battery-report.html"',
    description: 'Generates detailed HTML hardware diagnostics of laptop battery health, cycle count, and capacity degradation.',
    flagsExplained: 'Outputs report directly to C: root directory.',
    riskLevel: 'Safe'
  },

  // Linux Storage & SMART
  {
    category: 'Linux Storage & SMART',
    command: 'lsblk -o NAME,FSTYPE,SIZE,MOUNTPOINT,LABEL,UUID',
    description: 'Lists all connected NVMe, SATA, and USB block storage devices, partitions, and filesystems.',
    flagsExplained: '-o: Formats clean table of names, filesystems, sizes, and UUIDs.',
    riskLevel: 'Safe'
  },
  {
    category: 'Linux Storage & SMART',
    command: 'smartctl -a /dev/nvme0n1',
    description: 'Queries NVMe or SATA SMART controller to check reallocated sectors, power cycles, and temperature.',
    flagsExplained: '-a: Prints all SMART attributes, error log, and self-test execution log.',
    riskLevel: 'Safe'
  },
  {
    category: 'Linux Storage & SMART',
    command: 'ddrescue -d -r 3 /dev/sda /dev/sdb /root/rescue.log',
    description: 'Professional sector-by-sector disk data recovery tool that rescues readable data from failing drives with bad sectors.',
    flagsExplained: '-d: Direct raw disk access. -r 3: Retries bad sectors 3 times before skipping.',
    riskLevel: 'Medium'
  },

  // Linux Filesystem & Recovery
  {
    category: 'Linux Filesystem & Recovery',
    command: 'fsck -y /dev/sda1',
    description: 'Checks and repairs Linux ext4/ext3/ext2 filesystem corruptions and orphaned inodes.',
    flagsExplained: '-y: Automatically answers yes to all repair prompts.',
    riskLevel: 'Medium'
  },
  {
    category: 'Linux Filesystem & Recovery',
    command: 'mount /dev/sda2 /mnt && mount --bind /dev /mnt/dev && mount --bind /proc /mnt/proc && mount --bind /sys /mnt/sys && chroot /mnt',
    description: 'Emergency Chroot rescue sequence: Mounts a broken Linux install into live USB environment for GRUB / kernel rebuilding.',
    flagsExplained: 'Allows running commands as if booted natively into the broken installation.',
    riskLevel: 'Medium'
  }
];
