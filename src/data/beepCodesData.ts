import { BeepCodeDefinition } from '../types';

export const BIOS_BEEP_CODES: BeepCodeDefinition[] = [
  {
    id: 'ami_1_short',
    biosType: 'AMI UEFI / BIOS',
    pattern: '1 Short Beep',
    title: 'Normal POST / DRAM Refresh Pass',
    meaning: 'System passed basic POST tests and DRAM refresh circuitry is operating normally.',
    troubleshooting: 'Normal operating status. If display is still dark, check monitor cable, GPU power 8-pin connectors, or monitor input source.',
    tones: [{ freq: 880, durationMs: 150, pauseMs: 100 }]
  },
  {
    id: 'ami_1_long_2_short',
    biosType: 'AMI UEFI / BIOS',
    pattern: '1 Long, 2 Short',
    title: 'Video / Graphics Card Failure (VGA)',
    meaning: 'Base ROM or video adapter initialization failure. Motherboard cannot communicate with PCIe GPU or integrated iGPU.',
    troubleshooting: 'Reseat GPU in PCIe slot. Verify 12VHPWR / 8-pin PCIe auxiliary power cables. Clean PCIe gold fingers with 99% isopropyl alcohol.',
    tones: [
      { freq: 880, durationMs: 600, pauseMs: 150 },
      { freq: 880, durationMs: 150, pauseMs: 100 },
      { freq: 880, durationMs: 150, pauseMs: 100 }
    ]
  },
  {
    id: 'ami_3_short',
    biosType: 'AMI UEFI / BIOS',
    pattern: '3 Short Beeps',
    title: 'Base 64KB Memory Read/Write Error',
    meaning: 'Failure in base RAM memory test. Corrupted memory module or unstable memory timings (XMP/EXPO).',
    troubleshooting: 'Remove all RAM sticks and test each slot individually in Slot A2. Clear CMOS via jumper to reset memory sub-timings.',
    tones: [
      { freq: 880, durationMs: 150, pauseMs: 100 },
      { freq: 880, durationMs: 150, pauseMs: 100 },
      { freq: 880, durationMs: 150, pauseMs: 100 }
    ]
  },
  {
    id: 'ami_5_short',
    biosType: 'AMI UEFI / BIOS',
    pattern: '5 Short Beeps',
    title: 'Process / CPU Initialization Failure',
    meaning: 'Motherboard CPU socket VRM power rail failed to initialize the processor, or bent socket pins detected.',
    troubleshooting: 'Check EPS 8-pin CPU power cable. Inspect LGA socket for bent pins or debris. Verify CPU cooler mounting pressure isn\'t uneven.',
    tones: [
      { freq: 880, durationMs: 150, pauseMs: 80 },
      { freq: 880, durationMs: 150, pauseMs: 80 },
      { freq: 880, durationMs: 150, pauseMs: 80 },
      { freq: 880, durationMs: 150, pauseMs: 80 },
      { freq: 880, durationMs: 150, pauseMs: 80 }
    ]
  },
  {
    id: 'ami_continuous_siren',
    biosType: 'AMI UEFI / BIOS',
    pattern: 'High-Low Alternating Siren',
    title: 'Thermal Overheat / CPU Fan Failure',
    meaning: 'CPU temperature exceeds safety threshold (Tjunction) or CPU_FAN header tachometer reads 0 RPM.',
    troubleshooting: 'Immediately turn off power. Check AIO cooler pump tach, ensure thermal paste plastic protective peel was removed.',
    tones: [
      { freq: 987, durationMs: 250, pauseMs: 50 },
      { freq: 659, durationMs: 250, pauseMs: 50 },
      { freq: 987, durationMs: 250, pauseMs: 50 },
      { freq: 659, durationMs: 250, pauseMs: 50 }
    ]
  },
  {
    id: 'dell_3_3_1',
    biosType: 'Dell / Alienware',
    pattern: '3-3-1 Pattern',
    title: 'NVRAM / CMOS Power Loss',
    meaning: 'CMOS RTC battery voltage is under 2.6V or NVRAM checksum corrupted.',
    troubleshooting: 'Replace motherboard CR2032 coin battery with a fresh 3.0V cell. Hold power button for 30s to discharge capacitors.',
    tones: [
      { freq: 750, durationMs: 180, pauseMs: 80 },
      { freq: 750, durationMs: 180, pauseMs: 80 },
      { freq: 750, durationMs: 180, pauseMs: 300 },
      { freq: 750, durationMs: 180, pauseMs: 80 },
      { freq: 750, durationMs: 180, pauseMs: 80 },
      { freq: 750, durationMs: 180, pauseMs: 300 },
      { freq: 750, durationMs: 500, pauseMs: 100 }
    ]
  },
  {
    id: 'hp_3_long_2_short',
    biosType: 'HP / Compaq',
    pattern: '3 Long, 2 Short',
    title: 'Embedded Controller (EC) Memory Error',
    meaning: 'System board hardware failure in memory controller or chipset DXE phase.',
    troubleshooting: 'Perform HP Sure Start BIOS Recovery (Hold Win + B while powering on). Reseat memory SODIMMs.',
    tones: [
      { freq: 700, durationMs: 600, pauseMs: 150 },
      { freq: 700, durationMs: 600, pauseMs: 150 },
      { freq: 700, durationMs: 600, pauseMs: 300 },
      { freq: 700, durationMs: 180, pauseMs: 100 },
      { freq: 700, durationMs: 180, pauseMs: 100 }
    ]
  }
];
