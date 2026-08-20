export interface PostCodeEntry {
  code: string;
  phase: 'SEC' | 'PEI' | 'DXE' | 'BDS' | 'OS' | 'ERROR';
  description: string;
  troubleshooting: string;
}

export const POST_CODES: Record<string, PostCodeEntry> = {
  '00': {
    code: '00',
    phase: 'ERROR',
    description: 'Not used / CPU Not Initialized / Missing Vcore',
    troubleshooting: 'CPU failed to start execution. Check 8-Pin EPS power, bent socket pins, or dead CPU/VRM.'
  },
  '15': {
    code: '15',
    phase: 'PEI',
    description: 'Pre-memory Northbridge / Memory Training in Progress',
    troubleshooting: 'Normal for first boot after BIOS reset (DDR5 memory training). If stuck for >5 min, reseat RAM in slots A2/B2.'
  },
  '19': {
    code: '19',
    phase: 'PEI',
    description: 'Pre-memory Southbridge Initialization',
    troubleshooting: 'PCH chipset initialization in progress. Check CMOS battery voltage.'
  },
  '2b': {
    code: '2b',
    phase: 'PEI',
    description: 'Memory Initialization Error',
    troubleshooting: 'RAM training failed. Remove all sticks except one in slot A2. Clear CMOS.'
  },
  '55': {
    code: '55',
    phase: 'PEI',
    description: 'Memory Not Installed / DRAM Detection Failure',
    troubleshooting: 'Motherboard cannot communicate with RAM. Reseat RAM, check for bent CPU socket pins (memory controller pins).'
  },
  '62': {
    code: '62',
    phase: 'DXE',
    description: 'Installation of PCH Runtime Services / Southbridge DXE',
    troubleshooting: 'Stuck on 62 often indicates PCIe device conflict or USB overcurrent.'
  },
  '99': {
    code: '99',
    phase: 'DXE',
    description: 'Super I/O Initialization / PCIe Device Detection',
    troubleshooting: 'Stuck on 99 indicates shorted front-panel USB header, bad PCIe riser cable, or dead keyboard/mouse.'
  },
  '9a': {
    code: '9a',
    phase: 'DXE',
    description: 'USB Initialization Started',
    troubleshooting: 'Unplug all external USB hubs, thumb drives, and RGB controllers.'
  },
  'A2': {
    code: 'A2',
    phase: 'BDS',
    description: 'IDE / SATA / NVMe Storage Device Detect',
    troubleshooting: 'Motherboard querying connected drives. If hung, disconnect SATA drives one by one; check for failing SSD/HDD.'
  },
  'A9': {
    code: 'A9',
    phase: 'BDS',
    description: 'Start of Setup / Entering UEFI BIOS Menu',
    troubleshooting: 'System is ready to enter BIOS GUI. Ensure monitor is plugged into dedicated GPU and turned on.'
  },
  'AA': {
    code: 'AA',
    phase: 'OS',
    description: 'System has transitioned to ACPI mode / OS Booting',
    troubleshooting: 'Normal operational code in Windows/Linux. Hardware POST has succeeded!'
  },
  'd6': {
    code: 'd6',
    phase: 'ERROR',
    description: 'No Console Output Devices Found (GPU Error)',
    troubleshooting: 'GPU not detected or monitor not receiving signal. Reseat GPU, connect PCIe power cables, test DisplayPort/HDMI.'
  },
  'FF': {
    code: 'FF',
    phase: 'ERROR',
    description: 'CPU Fault / Microcode Exception',
    troubleshooting: 'CPU execution stopped. Ensure BIOS version supports installed CPU generation (use BIOS Flashback button).'
  }
};
