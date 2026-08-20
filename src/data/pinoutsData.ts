import { PinoutDefinition } from '../types';

export const PINOUT_DEFINITIONS: PinoutDefinition[] = [
  {
    id: 'atx24',
    title: 'ATX 24-Pin Main Motherboard Power',
    subtitle: 'Molex Mini-Fit Jr. 4.2mm Pitch standard 24-pin power connector',
    category: 'Power',
    voltageSummary: '+3.3V, +5V, +12V, -12V, +5VSB, PWR_OK, PS_ON#',
    probingSafety: 'To jumpstart PSU without motherboard: bridge Pin 16 (PS_ON# Green) to any GND (Black pin). Pin 9 (+5VSB Purple) is live even when system is off.',
    description: 'Provides all core supply rails to motherboard logic, PCIe slots (+3.3V/12V), chipset, and peripheral IO.',
    pins: [
      { pinNumber: 1, pinName: '+3.3V', color: '#f97316', voltage: '+3.3V DC', type: '3.3V', description: '+3.3V Power Rail', expectedDmm: '3.14V to 3.47V' },
      { pinNumber: 2, pinName: '+3.3V', color: '#f97316', voltage: '+3.3V DC', type: '3.3V', description: '+3.3V Power Rail', expectedDmm: '3.14V to 3.47V' },
      { pinNumber: 3, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'System Common Ground', expectedDmm: '0.00V (Continuity to chassis)' },
      { pinNumber: 4, pinName: '+5V', color: '#ef4444', voltage: '+5.0V DC', type: '5V', description: '+5V Power Rail', expectedDmm: '4.75V to 5.25V' },
      { pinNumber: 5, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'System Common Ground', expectedDmm: '0.00V' },
      { pinNumber: 6, pinName: '+5V', color: '#ef4444', voltage: '+5.0V DC', type: '5V', description: '+5V Power Rail', expectedDmm: '4.75V to 5.25V' },
      { pinNumber: 7, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'System Common Ground', expectedDmm: '0.00V' },
      { pinNumber: 8, pinName: 'PWR_OK', color: '#94a3b8', voltage: '+5.0V (High)', type: 'Signal', description: 'Power Good signal from PSU to CPU once rails stabilize (100-500ms delay)', expectedDmm: '+5.0V when PSU is running ok' },
      { pinNumber: 9, pinName: '+5VSB', color: '#a855f7', voltage: '+5.0V Standby', type: '5VSB', description: 'Standby 5V power (Always ON while AC plugged in)', expectedDmm: '4.75V to 5.25V (Check first if board is dead!)' },
      { pinNumber: 10, pinName: '+12V', color: '#eab308', voltage: '+12.0V DC', type: '12V', description: '+12V1 Power Rail', expectedDmm: '11.40V to 12.60V' },
      { pinNumber: 11, pinName: '+12V', color: '#eab308', voltage: '+12.0V DC', type: '12V', description: '+12V1 Power Rail', expectedDmm: '11.40V to 12.60V' },
      { pinNumber: 12, pinName: '+3.3V', color: '#f97316', voltage: '+3.3V DC', type: '3.3V', description: '+3.3V Power Rail / +3.3V Sense', expectedDmm: '3.14V to 3.47V' },
      // Row 2
      { pinNumber: 13, pinName: '+3.3V', color: '#f97316', voltage: '+3.3V DC', type: '3.3V', description: '+3.3V Power Rail (with Sense wire)', expectedDmm: '3.14V to 3.47V' },
      { pinNumber: 14, pinName: '-12V', color: '#3b82f6', voltage: '-12.0V DC', type: '-12V', description: '-12V Negative bias rail for audio and RS232', expectedDmm: '-10.80V to -13.20V' },
      { pinNumber: 15, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'System Common Ground', expectedDmm: '0.00V' },
      { pinNumber: 16, pinName: 'PS_ON#', color: '#10b981', voltage: '+3.3V/5V (Pull-up)', type: 'Signal', description: 'Power Supply Turn-On signal. Pulled to GND to turn PSU on.', expectedDmm: 'High in standby (~3.3V-5V), drops to 0.0V when running' },
      { pinNumber: 17, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'System Common Ground', expectedDmm: '0.00V' },
      { pinNumber: 18, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'System Common Ground', expectedDmm: '0.00V' },
      { pinNumber: 19, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'System Common Ground', expectedDmm: '0.00V' },
      { pinNumber: 20, pinName: 'NC / -5V', color: '#64748b', voltage: 'Reserved / NC', type: 'NC', description: 'No Connection (formerly -5V in legacy ATX 1.x)', expectedDmm: '0.00V / Open' },
      { pinNumber: 21, pinName: '+5V', color: '#ef4444', voltage: '+5.0V DC', type: '5V', description: '+5V Power Rail', expectedDmm: '4.75V to 5.25V' },
      { pinNumber: 22, pinName: '+5V', color: '#ef4444', voltage: '+5.0V DC', type: '5V', description: '+5V Power Rail', expectedDmm: '4.75V to 5.25V' },
      { pinNumber: 23, pinName: '+5V', color: '#ef4444', voltage: '+5.0V DC', type: '5V', description: '+5V Power Rail', expectedDmm: '4.75V to 5.25V' },
      { pinNumber: 24, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'System Common Ground', expectedDmm: '0.00V' }
    ]
  },
  {
    id: 'eps8',
    title: 'EPS12V 8-Pin / 4+4 Pin CPU Power Header',
    subtitle: 'Dedicated high-current 12V supply for CPU VRM power stages',
    category: 'Power',
    voltageSummary: '+12V DC (Pins 5-8), Ground (Pins 1-4)',
    probingSafety: 'Do NOT confuse with PCIe 8-pin GPU connector! Keying and polarity are reversed. EPS8 bottom row is all Ground, top row is all +12V.',
    description: 'Provides up to 336W per 8-pin connector directly to CPU multi-phase voltage regulator module.',
    pins: [
      { pinNumber: 1, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Ground Return Pin 1', expectedDmm: '0.00V' },
      { pinNumber: 2, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Ground Return Pin 2', expectedDmm: '0.00V' },
      { pinNumber: 3, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Ground Return Pin 3', expectedDmm: '0.00V' },
      { pinNumber: 4, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Ground Return Pin 4', expectedDmm: '0.00V' },
      { pinNumber: 5, pinName: '+12V', color: '#eab308', voltage: '+12.0V DC', type: '12V', description: '+12V CPU Feed Pin 5', expectedDmm: '11.40V to 12.60V' },
      { pinNumber: 6, pinName: '+12V', color: '#eab308', voltage: '+12.0V DC', type: '12V', description: '+12V CPU Feed Pin 6', expectedDmm: '11.40V to 12.60V' },
      { pinNumber: 7, pinName: '+12V', color: '#eab308', voltage: '+12.0V DC', type: '12V', description: '+12V CPU Feed Pin 7', expectedDmm: '11.40V to 12.60V' },
      { pinNumber: 8, pinName: '+12V', color: '#eab308', voltage: '+12.0V DC', type: '12V', description: '+12V CPU Feed Pin 8', expectedDmm: '11.40V to 12.60V' }
    ]
  },
  {
    id: 'jfp1',
    title: 'Front Panel Header (JFP1 / F_PANEL)',
    subtitle: 'Standard Intel/AMD 9-Pin front chassis switch & LED block',
    category: 'Front Panel',
    voltageSummary: 'Power Switch, Reset Switch, HDD Activity LED (+/-), Power LED (+/-)',
    probingSafety: 'To jumpstart motherboard on workbench: momentarily bridge Pin 6 and Pin 8 with screwdriver tip.',
    description: 'Connects the physical chassis power switch, reset button, and status indicator LEDs.',
    pins: [
      { pinNumber: 1, pinName: 'HD_LED+', color: '#ef4444', voltage: '+5.0V (Pulsed)', type: '5V', description: 'Hard Drive Activity LED Anode (+)', expectedDmm: '~2V-5V pulse during drive I/O' },
      { pinNumber: 2, pinName: 'PWR_LED+', color: '#10b981', voltage: '+5.0V (VCC)', type: '5V', description: 'Power Status LED Anode (+)', expectedDmm: '+5.0V / +3.3V constant' },
      { pinNumber: 3, pinName: 'HD_LED-', color: '#1e293b', voltage: 'Pulsed GND', type: 'GND', description: 'Hard Drive Activity LED Cathode (-)', expectedDmm: 'Switched to GND by Super I/O' },
      { pinNumber: 4, pinName: 'PWR_LED-', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Power Status LED Cathode (-)', expectedDmm: '0.00V Ground' },
      { pinNumber: 5, pinName: 'RESET_SW-', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Reset Switch Ground Return', expectedDmm: '0.00V' },
      { pinNumber: 6, pinName: 'PWR_SW+', color: '#38bdf8', voltage: '+3.3V Pull-up', type: 'Signal', description: 'Power Button Signal (Short to Pin 8 to turn on PC)', expectedDmm: '+3.3V in standby' },
      { pinNumber: 7, pinName: 'RESET_SW+', color: '#f59e0b', voltage: '+3.3V Pull-up', type: 'Signal', description: 'Reset Button Signal (Short to Pin 5 to reboot)', expectedDmm: '+3.3V normal' },
      { pinNumber: 8, pinName: 'PWR_SW-', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Power Button Ground Return', expectedDmm: '0.00V' },
      { pinNumber: 9, pinName: 'KEY / NC', color: '#64748b', voltage: 'Blocked Pin', type: 'NC', description: 'Missing Pin for connector orientation alignment', expectedDmm: 'Empty key slot' }
    ]
  },
  {
    id: 'usb3_19pin',
    title: 'Internal USB 3.0 / 3.2 Gen 1 (19-Pin) Header',
    subtitle: 'Dual-port SuperSpeed 5Gbps internal motherboard header',
    category: 'Data / USB',
    voltageSummary: '+5.0V VBUS (Pins 1 & 19), High-speed differential pairs (SSRX/SSTX/D+/D-)',
    probingSafety: 'Pins are delicate and bend easily. Ensure VBUS Pin 1 and Pin 19 have steady +5.0V.',
    description: 'Drives dual front-panel USB 3.0 Type-A or Type-C ports at 5 Gbps SuperSpeed bandwidth.',
    pins: [
      { pinNumber: 1, pinName: 'VBUS (Port 1)', color: '#ef4444', voltage: '+5.0V DC', type: '5V', description: 'Port 1 5V Power (900mA rated)', expectedDmm: '4.75V to 5.25V' },
      { pinNumber: 2, pinName: 'SSRX1-', color: '#38bdf8', voltage: 'Differential', type: 'Signal', description: 'SuperSpeed Receiver 1 Negative', expectedDmm: 'AC coupled signal' },
      { pinNumber: 3, pinName: 'SSRX1+', color: '#38bdf8', voltage: 'Differential', type: 'Signal', description: 'SuperSpeed Receiver 1 Positive', expectedDmm: 'AC coupled signal' },
      { pinNumber: 4, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Ground Return', expectedDmm: '0.00V' },
      { pinNumber: 5, pinName: 'SSTX1-', color: '#a855f7', voltage: 'Differential', type: 'Signal', description: 'SuperSpeed Transmitter 1 Negative', expectedDmm: 'AC coupled signal' },
      { pinNumber: 6, pinName: 'SSTX1+', color: '#a855f7', voltage: 'Differential', type: 'Signal', description: 'SuperSpeed Transmitter 1 Positive', expectedDmm: 'AC coupled signal' },
      { pinNumber: 7, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Ground Return', expectedDmm: '0.00V' },
      { pinNumber: 8, pinName: 'D1-', color: '#f59e0b', voltage: 'USB 2.0 D-', type: 'Signal', description: 'High-Speed USB 2.0 Data Negative', expectedDmm: '0V to 3.3V' },
      { pinNumber: 9, pinName: 'D1+', color: '#10b981', voltage: 'USB 2.0 D+', type: 'Signal', description: 'High-Speed USB 2.0 Data Positive', expectedDmm: '0V to 3.3V' },
      { pinNumber: 10, pinName: 'ID / NC', color: '#64748b', voltage: 'NC', type: 'NC', description: 'Over-current or No Connection', expectedDmm: '0.00V' },
      { pinNumber: 11, pinName: 'D2+', color: '#10b981', voltage: 'USB 2.0 D+', type: 'Signal', description: 'Port 2 High-Speed USB 2.0 Data Positive', expectedDmm: '0V to 3.3V' },
      { pinNumber: 12, pinName: 'D2-', color: '#f59e0b', voltage: 'USB 2.0 D-', type: 'Signal', description: 'Port 2 High-Speed USB 2.0 Data Negative', expectedDmm: '0V to 3.3V' },
      { pinNumber: 13, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Ground Return', expectedDmm: '0.00V' },
      { pinNumber: 14, pinName: 'SSTX2+', color: '#a855f7', voltage: 'Differential', type: 'Signal', description: 'Port 2 SuperSpeed Transmitter Positive', expectedDmm: 'AC coupled signal' },
      { pinNumber: 15, pinName: 'SSTX2-', color: '#a855f7', voltage: 'Differential', type: 'Signal', description: 'Port 2 SuperSpeed Transmitter Negative', expectedDmm: 'AC coupled signal' },
      { pinNumber: 16, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Ground Return', expectedDmm: '0.00V' },
      { pinNumber: 17, pinName: 'SSRX2+', color: '#38bdf8', voltage: 'Differential', type: 'Signal', description: 'Port 2 SuperSpeed Receiver Positive', expectedDmm: 'AC coupled signal' },
      { pinNumber: 18, pinName: 'SSRX2-', color: '#38bdf8', voltage: 'Differential', type: 'Signal', description: 'Port 2 SuperSpeed Receiver Negative', expectedDmm: 'AC coupled signal' },
      { pinNumber: 19, pinName: 'VBUS (Port 2)', color: '#ef4444', voltage: '+5.0V DC', type: '5V', description: 'Port 2 5V Power (900mA rated)', expectedDmm: '4.75V to 5.25V' }
    ]
  },
  {
    id: 'pcie8',
    title: 'PCIe 8-Pin GPU Power Connector',
    subtitle: 'Standard 150W graphics card auxiliary power connector',
    category: 'Power',
    voltageSummary: '+12V DC (Pins 1-3), Ground (Pins 4-8), Sense0/Sense1 pins',
    probingSafety: 'Pins 4, 6, 8 are Sense/Ground. Note: Pin 4 & 6 tell the GPU that an 8-pin cable is plugged in (unlocking 150W instead of 75W).',
    description: 'Powers dedicated graphics cards. Top row is 3x +12V pins; bottom row is 5x Ground/Sense pins.',
    pins: [
      { pinNumber: 1, pinName: '+12V', color: '#eab308', voltage: '+12.0V DC', type: '12V', description: '+12V High Current Line 1', expectedDmm: '11.40V to 12.60V' },
      { pinNumber: 2, pinName: '+12V', color: '#eab308', voltage: '+12.0V DC', type: '12V', description: '+12V High Current Line 2', expectedDmm: '11.40V to 12.60V' },
      { pinNumber: 3, pinName: '+12V', color: '#eab308', voltage: '+12.0V DC', type: '12V', description: '+12V High Current Line 3', expectedDmm: '11.40V to 12.60V' },
      { pinNumber: 4, pinName: 'Sense1 (GND)', color: '#1e293b', voltage: '0.0V', type: 'Sense', description: 'Sense Pin 1 (Tied to GND)', expectedDmm: '0.00V' },
      { pinNumber: 5, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Ground Return Line 1', expectedDmm: '0.00V' },
      { pinNumber: 6, pinName: 'Sense0 (GND)', color: '#1e293b', voltage: '0.0V', type: 'Sense', description: 'Sense Pin 0 (Detects 8-pin connection)', expectedDmm: '0.00V' },
      { pinNumber: 7, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Ground Return Line 2', expectedDmm: '0.00V' },
      { pinNumber: 8, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Ground Return Line 3', expectedDmm: '0.00V' }
    ]
  },
  {
    id: 'pwm_fan',
    title: '4-Pin PWM Chassis & CPU Fan Header',
    subtitle: 'Intel standard 4-pin pulse-width modulation fan header',
    category: 'Cooling',
    voltageSummary: 'Pin 1 GND, Pin 2 +12V, Pin 3 Tachometer (RPM), Pin 4 PWM Speed Target (25kHz)',
    probingSafety: 'Shorting Pin 2 (+12V) to Pin 3/4 can destroy the motherboard Super I/O chip fan controller IC.',
    description: 'Provides constant 12V power while adjusting motor duty cycle via 25 kHz PWM control signal on Pin 4.',
    pins: [
      { pinNumber: 1, pinName: 'GND', color: '#1e293b', voltage: '0.0V', type: 'GND', description: 'Fan Motor Ground', expectedDmm: '0.00V' },
      { pinNumber: 2, pinName: '+12V', color: '#eab308', voltage: '+12.0V DC', type: '12V', description: 'Constant +12V Fan Power (1A-2A max rating)', expectedDmm: '11.40V to 12.60V' },
      { pinNumber: 3, pinName: 'TACH (Sense)', color: '#10b981', voltage: 'Pulsed 5V', type: 'Signal', description: 'Tachometer RPM Speed Feedback (2 pulses per revolution)', expectedDmm: '2.5V-5V pulse' },
      { pinNumber: 4, pinName: 'PWM Control', color: '#38bdf8', voltage: '0-5V PWM', type: 'Signal', description: '25 kHz PWM Speed Target Signal (0% = min speed, 100% = max)', expectedDmm: '0V to 5.0V square wave' }
    ]
  }
];
