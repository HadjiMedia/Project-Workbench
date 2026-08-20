import { MotherboardHotspot } from '../types';

export const MOTHERBOARD_PARTS: MotherboardHotspot[] = [
  {
    id: 'clrtc',
    x: 66,
    y: 86,
    label: 'CLR_CMOS (Clear CMOS Jumper / Button)',
    category: 'jumper',
    brief: '2-pin/3-pin header to flush BIOS RTC NVRAM and clear corrupted settings, failed overclocks, or BIOS passwords.',
    specs: 'Standard 2.54mm pitch header directly tied to Real-Time Clock battery power plane and PCH NVRAM.',
    symptoms: 'System stuck in bootloop, black screen after enabling XMP/EXPO, forgotten BIOS password, no-POST freeze.',
    jumperGuide: [
      'Turn off system, switch PSU power rocker to OFF (0), and unplug the AC power cord.',
      'Locate the 2 pins labeled CLRTC, JBAT1, or CLEAR_CMOS near the bottom edge.',
      'Touch the tip of a clean flathead metal screwdriver across both pins simultaneously for 10–15 seconds.',
      'Release the bridge, plug in AC power, turn PSU on, and press power button.',
      'Press Del or F2 on first boot to enter UEFI and load Optimized Defaults (F5).'
    ]
  },
  {
    id: 'jfpanel',
    x: 84,
    y: 86,
    label: 'F_PANEL / JFP1 (Front Chassis Header)',
    category: 'jumper',
    brief: 'Chassis power switch, reset button, HDD activity LED, and power LED pin cluster.',
    specs: 'Intel standard 9-pin block (Pins 6-8 = Power Switch, Pins 5-7 = Reset Switch, Pins 1-3 = HDD LED, Pins 2-4 = Power LED).',
    symptoms: 'Chassis power button does nothing (no fans, no lights, dead system).',
    jumperGuide: [
      'To verify whether the chassis power switch is defective: touch flathead screwdriver tip across Pin 6 and Pin 8 (PWR_SW & GND) for 0.5 seconds.',
      'If the motherboard turns on instantly, the chassis switch or front-panel wiring harness is broken.',
      'Bridge Pins 5 & 7 (Reset) to force an immediate hard restart.'
    ]
  },
  {
    id: 'flashback',
    x: 6.5,
    y: 13.5,
    label: 'BIOS Flashback Button & Dedicated USB Port',
    category: 'jumper',
    brief: 'Hardware SPI EEPROM microcontroller allowing complete BIOS flashing without CPU, RAM, or GPU installed.',
    specs: 'Dedicated embedded microcontroller linked to Root USB 2.0 port.',
    symptoms: 'Bricked motherboard from interrupted BIOS update; or new CPU architecture unsupported by factory BIOS revision.',
    jumperGuide: [
      'Format a USB drive (32GB or smaller) to FAT32 filesystem with MBR partition table.',
      'Download latest BIOS from motherboard vendor website and rename it (e.g., CREATExx.CAP for ASUS, MSI.ROM for MSI, GIGABYTE.BIN for Gigabyte).',
      'Insert the flash drive into the specific rear I/O USB port outlined in white or labeled BIOS FLASHBACK.',
      'With PSU connected and switched ON (PC in standby/off), hold the Flashback button for 3 seconds until the LED starts blinking.',
      'Wait until the flashing LED ceases and turns off completely (approx. 5 to 8 minutes). Do NOT power down or unplug during this period.'
    ]
  },
  {
    id: 'qled',
    x: 66.5,
    y: 12.5,
    label: 'Q-LED Diagnostic Debug Array',
    category: 'diag',
    brief: '4-stage hardware POST indicator LEDs: CPU (Red), DRAM (Yellow/Orange), VGA (White), BOOT (Green).',
    specs: 'Directly monitored by Super I/O and UEFI boot sequence checkpoints.',
    symptoms: 'Identifies the exact hardware subsystem causing boot freeze without requiring a speaker or code display.',
    jumperGuide: [
      'RED LED (CPU): Check 8-pin EPS 12V cable, inspect CPU socket for bent pins, reseat cooler to ensure even mounting pressure.',
      'YELLOW/ORANGE LED (DRAM): Clear CMOS, test single stick in slot A2 (2nd slot from socket), verify RAM contacts are clean.',
      'WHITE LED (VGA): Reseat GPU in primary PCIe 5.0 slot 1, check 12VHPWR / PCIe 8-pin cables, test display cable.',
      'GREEN LED (BOOT): Missing UEFI bootloader partition, check M.2 NVMe seating, verify boot priority in BIOS.'
    ]
  },
  {
    id: 'cpu_socket',
    x: 35,
    y: 30,
    label: 'CPU Socket (LGA 1700 / AM5)',
    category: 'core',
    brief: 'High-density Land Grid Array socket interfacing CPU cores, PCIe 5.0 lanes, and dual-channel DDR5 controllers.',
    specs: 'LGA1700 / AM5 rated for 250W+ continuous package power.',
    symptoms: 'Instant shutdown upon boot, missing RAM channel B, missing PCIe lanes, Red CPU LED.',
    jumperGuide: [
      'Inspect all pins with a 10x magnifying loupe at a 45-degree angle under bright light for bent or burnt pins.',
      'Uneven cooler mounting pressure can lift corner pins off the CPU pads. Loosen cooler screws half a turn evenly in an X pattern.'
    ]
  },
  {
    id: 'vrm_heatsink',
    x: 16,
    y: 26,
    label: 'VRM Power Delivery (16+1+2 Phases)',
    category: 'power',
    brief: 'Multi-phase synchronous buck converters stepping down 12V EPS input into 1.05V–1.45V CPU Vcore.',
    specs: 'Smart Power Stages (DrMOS) rated at 70A–105A per phase with high-permeability chokes.',
    symptoms: 'Thermal throttling under stock load, sudden shutdowns under all-core Cinebench/Prime95, high VRM temps >100°C.',
    jumperGuide: [
      'Perform Multimeter Diode Check: Measure resistance between 12V EPS positive terminal and Ground. A continuous beep (<5 ohms) indicates a blown high-side MOSFET.'
    ]
  },
  {
    id: 'ddr5_slots',
    x: 56,
    y: 32,
    label: 'DDR5 DIMM Slots (Dual-Channel 4x DIMM)',
    category: 'core',
    brief: 'High-speed memory slots supporting DDR5 4800MHz to 8000MHz+ XMP/EXPO profiles.',
    specs: '288-pin layout with onboard PMIC voltage regulation.',
    symptoms: 'Orange DRAM LED, memory training loops, MEMORY_MANAGEMENT BSODs.',
    jumperGuide: [
      'Always populate Slots A2 and B2 (Slots 2 & 4 from left) first for 2-stick dual-channel setups to ensure proper signal trace termination.'
    ]
  },
  {
    id: 'atx_power',
    x: 66,
    y: 28,
    label: '24-Pin ATX Main Power Connector',
    category: 'power',
    brief: 'Supplies +12V, +5V, +3.3V, +5VSB (Standby), and Power-Good signals to motherboard.',
    specs: 'Molex Mini-Fit Jr. 24-pin rated for ATX12V 2.x/3.0 spec.',
    symptoms: 'Total dead board, zero standby LEDs, no fan spin.',
    jumperGuide: [
      'Paperclip PSU Test: Unplug 24-pin from board. Bridge Pin 16 (Green PS_ON#) and Pin 17 (Black GND) with paperclip to test if PSU fan spins.'
    ]
  },
  {
    id: 'pcie_gpu',
    x: 37,
    y: 60,
    label: 'PCIe 5.0 x16 Primary Slot (SafeSlot)',
    category: 'expansion',
    brief: 'Full-bandwidth Graphics PEG bus directly wired to CPU Gen 5 lanes with reinforced stainless steel shield.',
    specs: 'PCIe Gen 5 x16 (up to 64 GB/s bi-directional throughput).',
    symptoms: 'No display output, White VGA LED, GPU fans spin at 100%.',
    jumperGuide: [
      'If using a vertical PCIe riser cable: Boot into BIOS with CPU iGPU or backup card and manually force PCIe Speed from "Auto" to "Gen 3" or "Gen 4".'
    ]
  },
  {
    id: 'm2_nvme',
    x: 35,
    y: 52,
    label: 'M.2 NVMe PCIe 5.0 / 4.0 x4 Slots',
    category: 'expansion',
    brief: 'Direct-to-CPU high-speed M.2 socket with heavy aluminum heatsink.',
    specs: 'M-Key 2280 / 22110 supporting up to 14,000 MB/s sequential speeds.',
    symptoms: 'NVMe drive not detected in BIOS boot list, drive thermal throttling at 80°C.',
    jumperGuide: [
      'Ensure the blue/clear protective film was peeled off the heatsink thermal pads prior to fastening the M.2 SSD.'
    ]
  },
  {
    id: 'chipset',
    x: 70,
    y: 68,
    label: 'Chipset PCH (Platform Controller Hub)',
    category: 'core',
    brief: 'Manages SATA ports, secondary PCIe slots, onboard audio, Gigabit LAN, and USB 3.2 controllers.',
    specs: 'Connected to CPU via high-speed DMI 4.0 x8 bus.',
    symptoms: 'All SATA drives or USB ports drop out at once; PCH temperature >85°C.',
    jumperGuide: [
      'If USB ports lock up due to overcurrent trip, power off and clear CMOS for 30s to discharge self-resetting polyfuses.'
    ]
  },
  {
    id: 'cr2032',
    x: 57,
    y: 81,
    label: 'CR2032 3V Lithium Coin Cell Battery',
    category: 'power',
    brief: 'Maintains RTC clock, date, and volatile CMOS SRAM settings when AC power is disconnected.',
    specs: '3.0V Lithium manganese dioxide coin battery.',
    symptoms: 'Computer forgets time/date on reboot; "CMOS Battery Low" or "CMOS Checksum Error" prompt.',
    jumperGuide: [
      'Deep CMOS Discharge: Remove coin battery, bridge the positive top clip and negative bottom tab in the socket with a screwdriver for 10s, then insert fresh battery (>3.0V).'
    ]
  }
];
