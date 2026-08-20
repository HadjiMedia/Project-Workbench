export interface CpuPreset {
  name: string;
  tdp: number;
  socket: string;
}

export interface GpuPreset {
  name: string;
  tgp: number;
  vram: string;
  recPsu: number;
}

export const CPU_PRESETS: CpuPreset[] = [
  { name: 'Intel Core i9-14900K / 14900KS', tdp: 253, socket: 'LGA1700' },
  { name: 'Intel Core i7-14700K / 13700K', tdp: 253, socket: 'LGA1700' },
  { name: 'Intel Core i5-14600K / 13600K', tdp: 181, socket: 'LGA1700' },
  { name: 'Intel Core i5-13400 / 14400', tdp: 65, socket: 'LGA1700' },
  { name: 'AMD Ryzen 9 7950X / 7950X3D', tdp: 170, socket: 'AM5' },
  { name: 'AMD Ryzen 9 9950X / 9900X', tdp: 170, socket: 'AM5' },
  { name: 'AMD Ryzen 7 7800X3D / 9800X3D', tdp: 120, socket: 'AM5' },
  { name: 'AMD Ryzen 7 7700X / 9700X', tdp: 105, socket: 'AM5' },
  { name: 'AMD Ryzen 5 7600X / 9600X', tdp: 105, socket: 'AM5' },
  { name: 'AMD Ryzen 5 5600X / 5700X (AM4)', tdp: 65, socket: 'AM4' },
  { name: 'Legacy Intel Core i7-9700K / i9-9900K', tdp: 95, socket: 'LGA1151' },
  { name: 'Custom CPU TDP (User Specified)', tdp: 125, socket: 'Custom' }
];

export const GPU_PRESETS: GpuPreset[] = [
  { name: 'NVIDIA GeForce RTX 4090 (24GB)', tgp: 450, vram: '24GB GDDR6X', recPsu: 850 },
  { name: 'NVIDIA GeForce RTX 4080 / 4080 Super', tgp: 320, vram: '16GB GDDR6X', recPsu: 750 },
  { name: 'NVIDIA GeForce RTX 4070 Ti / Ti Super', tgp: 285, vram: '16GB GDDR6X', recPsu: 700 },
  { name: 'NVIDIA GeForce RTX 4070 / 4070 Super', tgp: 220, vram: '12GB GDDR6X', recPsu: 650 },
  { name: 'NVIDIA GeForce RTX 4060 Ti / 4060', tgp: 160, vram: '8GB/16GB GDDR6', recPsu: 550 },
  { name: 'NVIDIA GeForce RTX 3090 / 3090 Ti', tgp: 400, vram: '24GB GDDR6X', recPsu: 850 },
  { name: 'NVIDIA GeForce RTX 3080 / 3080 Ti', tgp: 350, vram: '10GB/12GB GDDR6X', recPsu: 750 },
  { name: 'AMD Radeon RX 7900 XTX (24GB)', tgp: 355, vram: '24GB GDDR6', recPsu: 850 },
  { name: 'AMD Radeon RX 7900 XT (20GB)', tgp: 315, vram: '20GB GDDR6', recPsu: 750 },
  { name: 'AMD Radeon RX 7800 XT (16GB)', tgp: 263, vram: '16GB GDDR6', recPsu: 700 },
  { name: 'AMD Radeon RX 7700 XT / 7600 XT', tgp: 245, vram: '12GB/16GB GDDR6', recPsu: 600 },
  { name: 'Integrated Graphics (iGPU Only)', tgp: 0, vram: 'Shared', recPsu: 350 },
  { name: 'Custom GPU TGP (User Specified)', tgp: 250, vram: 'Custom', recPsu: 650 }
];

export interface StandardRailSpec {
  rail: '+12V' | '+5V' | '+3.3V' | '+5VSB' | '-12V';
  nominalVoltage: number;
  minAllowed: number;
  maxAllowed: number;
  standardTolerance: string;
  wireColor: string;
  primaryDevices: string;
  multimeterPinLocation: string;
}

export const ATX_VOLTAGE_TOLERANCES: StandardRailSpec[] = [
  {
    rail: '+12V',
    nominalVoltage: 12.00,
    minAllowed: 11.40,
    maxAllowed: 12.60,
    standardTolerance: '±5% (11.40V – 12.60V)',
    wireColor: 'Yellow',
    primaryDevices: 'CPU VRM (EPS 8-pin), GPU PCIe power, Motherboard VRM, Fan motors, AIO Pumps',
    multimeterPinLocation: '24-pin Pins 10, 11; EPS 8-pin Pins 5-8; PCIe Pins 1-3'
  },
  {
    rail: '+5V',
    nominalVoltage: 5.00,
    minAllowed: 4.75,
    maxAllowed: 5.25,
    standardTolerance: '±5% (4.75V – 5.25V)',
    wireColor: 'Red',
    primaryDevices: '2.5" SATA SSDs, 3.5" HDD logic boards, USB 2.0/3.0 port power, Audio codec',
    multimeterPinLocation: '24-pin Pins 4, 6, 19, 20, 21; SATA Power Pins 7-9'
  },
  {
    rail: '+3.3V',
    nominalVoltage: 3.30,
    minAllowed: 3.135,
    maxAllowed: 3.465,
    standardTolerance: '±5% (3.14V – 3.47V)',
    wireColor: 'Orange',
    primaryDevices: 'M.2 NVMe SSDs, DDR4/DDR5 RAM, PCIe slot auxiliary logic, Chipset (PCH)',
    multimeterPinLocation: '24-pin Pins 1, 2, 12, 13; M.2 socket Pin 2/4; PCIe Slot Pins A9/B10'
  },
  {
    rail: '+5VSB',
    nominalVoltage: 5.00,
    minAllowed: 4.75,
    maxAllowed: 5.25,
    standardTolerance: '±5% (4.75V – 5.25V)',
    wireColor: 'Purple',
    primaryDevices: 'Standby power (Super I/O, Wake-on-LAN, USB charging when PC is off, BIOS RTC)',
    multimeterPinLocation: '24-pin Pin 9 (Purple wire - Active even with PC turned off!)'
  },
  {
    rail: '-12V',
    nominalVoltage: -12.00,
    minAllowed: -13.20,
    maxAllowed: -10.80,
    standardTolerance: '±10% (-10.80V – -13.20V)',
    wireColor: 'Blue',
    primaryDevices: 'Legacy RS-232 serial ports, high-end op-amp audio reference rails',
    multimeterPinLocation: '24-pin Pin 14 (Blue wire)'
  }
];
