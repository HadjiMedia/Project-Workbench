export interface GuideChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  category: 'Safety & Basics' | 'Component Repair' | 'Upgrades' | 'Reference & Glossary' | 'How-To Tutorials' | 'Troubleshooting' | 'Custom Builds' | 'Laptops' | 'Servers & Networks' | 'Data Backup' | 'Hardware Reviews' | 'Software Reviews' | 'Forum Q&A';
  iconName: string;
  summary: string;
  sections: {
    id: string;
    title: string;
    description: string;
    content: string[];
    tips?: string[];
    warnings?: string[];
    codeSnippets?: { title: string; language: string; code: string }[];
    checklist?: string[];
    table?: { headers: string[]; rows: string[][] };
  }[];
}

export interface TroubleshootingTree {
  id: string;
  title: string;
  category: string;
  description: string;
  initialQuestion: string;
  steps: {
    id: string;
    prompt: string;
    detail?: string;
    yesNextId?: string;
    noNextId?: string;
    yesOutcome?: string;
    noOutcome?: string;
    action?: string;
  }[];
}

export interface GlossaryTerm {
  term: string;
  category: string;
  definition: string;
  contextNote?: string;
}

export interface ForumQAItem {
  id: string;
  question: string;
  tags: string[];
  systemSpecs?: string;
  symptomSummary: string;
  answer: string;
  diagnosticSteps: string[];
  preventativeTip?: string;
}

export const DIY_REPAIR_GLOSSARY: GlossaryTerm[] = [
  { term: 'Algorithm', category: 'Programming / Logic', definition: 'A step-by-step programming technique for gaining a desired computational result by manipulating data.' },
  { term: 'AGP (Accelerated Graphics Port)', category: 'Video / Expansion', definition: 'High-speed dedicated bus channel for 3D graphics cards that reads textures directly from system memory instead of being processed through the general system CPU.' },
  { term: 'BIG (Built In Garage)', category: 'Industry Lore', definition: 'Historical industry term for custom clone PC assemblers and sole-proprietor computer builders founded in residential garages during the PC revolution.' },
  { term: 'BIOS (Basic Input Output System)', category: 'Firmware', definition: 'The non-volatile firmware that initializes and tests system hardware components during boot, provides runtime services for operating systems, and manages low-level hardware configuration.' },
  { term: 'Binary', category: 'Computing Architecture', definition: 'Base-2 numbering system consisting of 0 and 1 (off/on, false/true) used by all digital logic gates to process information.' },
  { term: 'Bit', category: 'Data Unit', definition: 'The smallest fundamental building block of digital computation; a single binary digit holding either a 0 or a 1.' },
  { term: 'Boot', category: 'System Startup', definition: 'The sequential process of energizing the motherboard, executing POST in BIOS, loading MBR/bootloader, and bootstrapping the OS kernel into system RAM.' },
  { term: 'Byte', category: 'Data Unit', definition: 'A group of 8 binary bits. Fundamental unit of measurement for memory and storage (KiloBYTE = 1,024 Bytes, MegaBYTE = 1,048,576 Bytes, GigaBYTE = 1,073,741,824 Bytes).' },
  { term: 'Cable Select (CS)', category: 'Storage / IDE', definition: 'Drive jumper setting where Master/Slave designation is determined by the specific connector position on the 80-conductor ribbon cable (end connector = Master, middle = Slave).' },
  { term: 'CD-ROM / DVD-ROM', category: 'Optical Storage', definition: 'Compact Disc / Digital Versatile Disc Read-Only Memory optical media with spiral tracks read by laser diodes (CD ~700-800MB, single-layer DVD 4.7GB, dual-layer DVD 8.5GB).' },
  { term: 'CGA (Color Graphics Adapter)', category: 'Legacy Video', definition: 'Early IBM graphics display adapter capable of displaying 16 colors in text mode and 4/16 colors in graphic modes (superseded by EGA, VGA, SVGA).' },
  { term: 'Defragmentation', category: 'Storage Management', definition: 'The file system maintenance process of rearranging fragmented file clusters so that all parts of a file reside in contiguous sectors on the hard drive platter, minimizing seeker head latency.' },
  { term: 'DIMM (Dual In-line Memory Module)', category: 'Memory', definition: 'A printed circuit board with separate electrical contacts on each side of the module (168-pin for SDRAM, 184-pin for DDR, 240-pin for DDR2/DDR3).' },
  { term: 'DDR / DDR2 (Double Data Rate)', category: 'Memory', definition: 'High-speed synchronous dynamic RAM that transfers data on both the rising and falling edges of the clock signal, doubling the memory bandwidth.' },
  { term: 'EEPROM (Electrically Erasable PROM)', category: 'Firmware Storage', definition: 'Non-volatile flashable memory chip used to store system BIOS and firmware that can be rewritten electronically through software flashing tools.' },
  { term: 'EIDE (Enhanced Integrated Drive Electronics)', category: 'Storage / Interface', definition: 'Enhanced parallel ATA standard supporting larger capacities (>528MB and beyond 137GB via 48-bit LBA) and DMA data transfer modes using 80-conductor ribbon cables with blue connectors.' },
  { term: 'ESD (Electrostatic Discharge)', category: 'Bench Safety', definition: 'The sudden flow of static electricity between two objects caused by contact or static buildup. Can instantly destroy MOSFETs, IC silicon dies, and VRM stages without physical spark.' },
  { term: 'FDISK', category: 'Disk Management', definition: 'Standard command-line DOS/Windows utility used to create, inspect, format, and activate Master Boot Record (MBR) primary and extended disk partitions.' },
  { term: 'FSB (Front Side Bus)', category: 'Motherboard Architecture', definition: 'The bidirectional physical data bus that carries electrical signals between the central processing unit (CPU) and the northbridge system controller / memory hub.' },
  { term: 'Ghost (.GHO)', category: 'Imaging & Backup', definition: 'Symantec/Norton proprietary disk and partition image format that creates byte-accurate snapshot archives for bare-metal disaster recovery and enterprise deployment.' },
  { term: 'HIMEM.SYS', category: 'DOS Memory Management', definition: 'DOS device driver that provides access to the High Memory Area (HMA) and Extended Memory (XMS), allowing drivers and TSRs to load into upper memory blocks.' },
  { term: 'IDE / ATA (Integrated Drive Electronics)', category: 'Storage Interface', definition: 'Storage interface standard where the disk drive controller circuitry is integrated directly on the drive logic board rather than on a separate expansion card.' },
  { term: 'LGA 775 (Land Grid Array)', category: 'CPU Socket', definition: 'Intel socket standard where conductive contact pins are located on the motherboard socket itself rather than on the CPU package, eliminating bent CPU pin failures.' },
  { term: 'LVDS (Low-Voltage Differential Signaling)', category: 'High-Speed Signaling', definition: 'High-speed serial physical layer technology utilized in SATA and LCD panels using low-voltage differential pairs to achieve multi-gigabit throughput with low EMI and power draw.' },
  { term: 'MSCDEX.EXE', category: 'DOS Drivers', definition: 'Microsoft CD-ROM Extensions driver that assigns a standard drive letter to CD/DVD-ROM drives under DOS using the `/D:driver_signature /L:drive_letter` syntax.' },
  { term: 'POST (Power-On Self-Test)', category: 'Diagnostic Firmware', definition: 'Diagnostic routine executed by the BIOS immediately after powering up to initialize, verify, and validate system hardware (RAM, CPU, Video, Timers, Interrupt controllers).' },
  { term: 'RAID 0 / 1 / 5', category: 'Storage Arrays', definition: 'Redundant Array of Independent Disks (RAID 0 = Striping for speed without redundancy; RAID 1 = Mirroring for 1:1 drive backup; RAID 5 = Block-level striping with distributed parity requiring 3+ drives).' },
  { term: 'SATA (Serial ATA)', category: 'Storage Interface', definition: 'High-speed point-to-point serial storage interface utilizing 7-pin data cables and 15-pin power connectors with 8B/10B encoding reaching 1.5 Gbps (SATA I), 3.0 Gbps (SATA II), and 6.0 Gbps (SATA III).' },
  { term: 'Thermistor', category: 'Thermal Protection', definition: 'Temperature-sensitive resistor embedded in the CPU socket and motherboard VRM that triggers hardware shutdown if critical thermal thresholds (135°F-165°F / 57°C-74°C) are breached.' },
  { term: 'Winchester Drive', category: 'Historical Hardware', definition: 'IBM internal code name for the first sealed multi-platter hard disk drive with lubricated magnetic media (originally the IBM 3340), which became the precursor to modern hard disk drives.' }
];

export const DIY_REPAIR_CHAPTERS: GuideChapter[] = [
  {
    id: 'ch1',
    chapterNumber: 1,
    title: 'Introduction & Workbench Foundation',
    subtitle: 'Philosophy, Safety Cautions, and Core Diagnostic Tenets',
    category: 'Safety & Basics',
    iconName: 'ShieldAlert',
    summary: 'The fundamental guide to DIY computer repair: why fixing your own hardware saves hundreds of dollars, essential tools required, and non-negotiable safety rules.',
    sections: [
      {
        id: 'ch1-sec1',
        title: 'Safety First: The Electrical Hazard Rules',
        description: 'Preventing personal injury and lethal capacitor discharge on the bench.',
        content: [
          'First and foremost: Always unplug the main AC power cord completely from the wall or power supply. Never assume that turning off a surge protector or power strip switch disconnects live neutral or ground pathways.',
          'Remove ALL JEWELRY (rings, metal watch bands, bracelets, necklaces) before putting hands inside a chassis. A metal ring completing a circuit across 12V high-amperage rail pins or capacitor leads can cause severe contact burns and instantaneously weld to live contacts.',
          'Never remove or seat circuit boards, RAM, or expansion cards while the power supply is connected to AC power. The +5VSB (Standby) rail remains energized on modern ATX motherboards whenever plugged in.',
          'Power supplies contain high-capacity electrolytic filter capacitors that retain lethal DC voltage (hundreds of volts) even days after being disconnected. DO NOT open sealed power supply metal casings!'
        ],
        warnings: [
          'Do not assume if the power strip is off that the computer is isolated. Physically unplug the power cable!',
          'Capacitors in switched-mode power supplies can discharge high current capable of severe injury.'
        ],
        checklist: [
          'Power cord physically disconnected from chassis backplate',
          'All rings, watches, and metallic accessories removed',
          'ESD anti-static ground strap clipped to unpainted chassis metal',
          'Work area clean, well-lit, non-carpeted, and free of conductive debris'
        ]
      },
      {
        id: 'ch1-sec2',
        title: 'Electrostatic Discharge (ESD) Mitigation',
        description: 'Understanding how invisible static charges destroy micro-electronics and how to properly ground yourself.',
        content: [
          'Static electricity (ESD) builds up naturally as you walk across carpet, slide on a chair, or move plastic materials. Walking across a room can generate over 10,000 to 25,000 volts of static potential.',
          'Modern micro-circuitry, CMOS transistors, and SMD silicon wafer gates can be permanently ruptured by as little as 10 to 100 volts—far below the threshold of human sensation.',
          'To ground yourself: Wear an ESD wrist strap with a 1-Megaohm safety resistor and attach the alligator clip to bare metal on the computer chassis or a verified earth ground.',
          'Keep all replacement components (processors, RAM, motherboards, expansion cards) inside their protective anti-static metallized shielding bags until the exact moment of installation.'
        ],
        tips: [
          'Place new components on top of their anti-static bag on your bench while prepping mounting brackets.',
          'Touch an unpainted metal chassis surface before touching sensitive silicon pins if an ESD strap is temporarily unavailable.'
        ]
      }
    ]
  },
  {
    id: 'ch2',
    chapterNumber: 2,
    title: 'Hardware Component Diagnostics & Repair',
    subtitle: 'CD/DVD, Hard Drives, Keyboards, Motherboards, NICs, PSUs, USB & Video',
    category: 'Component Repair',
    iconName: 'Wrench',
    summary: 'In-depth diagnostic procedures and component replacement methods for all internal and external computer subsystems.',
    sections: [
      {
        id: 'ch2-sec1',
        title: 'Optical Drives: CD-ROM & DVD-ROM Repair or Replacement',
        description: 'IDE jumpering, ribbon cable orientation, audio latches, and laser head cleaning.',
        content: [
          'Dead optical drives are rarely worth component-level board rework due to low replacement costs, but mechanical jams and misconfigured jumpers can be repaired in minutes.',
          'Before removing the drive: Disconnect the 4-pin Molex power cable, 40/80-pin IDE ribbon cable, and 4-pin analog audio cable. Use pliers gently to wiggle tight Molex power plugs without cracking the plastic casing.',
          'IDE Cable Orientation: The red stripe running down one edge of the ribbon cable ALWAYS designates Pin #1. Verify connector keying notches to prevent reverse polarity.',
          'Jumper Configuration: Check the rear jumper pins between the power connector and IDE socket. Configure as Master (primary device on IDE channel), Slave (secondary device), or Cable Select (CS).'
        ],
        tips: [
          'If the laser lens is dirty, clean it strictly with 99% Isopropyl Alcohol and a lint-free cotton swab. Never use abrasive cleaners or paper towels.',
          'If the tray will not eject, insert a straightened paper clip into the emergency manual release pinhole located beneath the drive tray door.'
        ]
      },
      {
        id: 'ch2-sec2',
        title: 'Hard Drive Repair & Replacement: IDE (PATA) vs. SATA',
        description: 'Identifying drive interfaces, master/slave jumpers, and BIOS detection routines.',
        content: [
          'Hard drive replacement is straightforward: Identify whether your drive is Parallel ATA (IDE 40-pin ribbon) or Serial ATA (SATA 7-pin data).',
          'IDE Jumpering Rules: If the drive is the only device on the IDE ribbon, configure jumpers to Cable Select (CS) or Single/Master. If sharing with an optical drive, designate the boot drive as Master and the optical unit as Slave.',
          'SATA Drives: SATA does away with physical master/slave jumpers; each drive has a dedicated point-to-point data lane and is configured directly in BIOS boot priority tables.',
          'Post-Installation Steps: Power up the system and press Del/F2 to enter BIOS setup. Confirm that the drive model and full capacity are detected under the IDE/SATA channel listing before formatting.'
        ],
        table: {
          headers: ['Feature', 'IDE / PATA (Legacy)', 'SATA (Modern)'],
          rows: [
            ['Cable Pin Count', '40-pin / 80-conductor wide ribbon', '7-pin narrow data cable'],
            ['Power Connector', '4-pin Molex (5V & 12V)', '15-pin SATA flat power blade (3.3V, 5V, 12V)'],
            ['Data Transfer Rate', 'Up to 133 MB/s (Ultra DMA 6)', '1.5 Gbps (SATA I) / 3.0 Gbps (SATA II) / 6.0 Gbps (SATA III)'],
            ['Drive Selection', 'Physical Jumpers (Master/Slave/CS)', 'Automatic (Point-to-point topology)']
          ]
        }
      },
      {
        id: 'ch2-sec3',
        title: 'Power Supply (PSU) Diagnostics & Rail Verification',
        description: 'Understanding ATX rail voltages (+12V, +5V, +3.3V, -12V, +5VSB) and no-power checklists.',
        content: [
          'The Power Supply Unit (PSU) converts household AC line current (110V/220V) into regulated DC voltages: +12V (motors, cooling fans, CPU VRM, PCIe), +5V (logic ICs, USB, drives), +3.3V (system memory, chipset), and -12V (legacy serial/audio).',
          'PSU failure is typically catastrophic (zero power, fans twitch and stop, or sudden shutdown under load).',
          'No-Power Bench Checklist: 1) Verify wall receptacle with a known lamp or meter; 2) Check rear I/O rocker switch on the PSU; 3) Verify 24-pin ATX and 4/8-pin CPU 12V EPS plugs are seated firmly; 4) Check for short-to-ground on motherboard standoffs.'
        ],
        warnings: [
          'NEVER open a power supply case. Capacitors remain charged with lethal DC voltage even when unplugged.'
        ]
      },
      {
        id: 'ch2-sec4',
        title: 'Network Card (NIC) & Connectivity Troubleshooting',
        description: 'Diagnosing link lights, Device Manager Code 28 errors, and IP configuration.',
        content: [
          'Network cards are binary go/no-go components: they either function or experience driver/configuration faults.',
          'Diagnostic Sequence: Open Command Prompt and run `ipconfig /all`. Check if an IP address, Subnet Mask (255.255.255.0), and Default Gateway (e.g. 192.168.1.1) are returned.',
          'If no IP or 169.254.x.x (APIPA) appears: Check Device Manager under Network Adapters. If a yellow exclamation mark or "Code 28 (Drivers not installed)" is present, reinstall manufacturer chipset drivers.',
          'Hardware Loopback & Ping: Run `ping 127.0.0.1` to test TCP/IP stack integrity. Run `ping <Gateway_IP>` to test physical router link. Run `ping www.google.com` to test DNS name resolution.'
        ],
        codeSnippets: [
          {
            title: 'Diagnostic Command Prompt Sequence',
            language: 'cmd',
            code: 'ipconfig /all\nping 127.0.0.1\nping 192.168.1.1\nping 8.8.8.8\nping www.google.com'
          }
        ]
      },
      {
        id: 'ch2-sec5',
        title: 'USB (Universal Serial Bus) Diagnostics & Distance Limits',
        description: 'USB 1.1 vs 2.0 standards, power budget constraints, and active vs passive hubs.',
        content: [
          'USB 1.1 provides 12 Mbps (Full Speed), while USB 2.0 provides 480 Mbps (High Speed). Connecting high-speed peripherals to USB 1.1 generates the warning: "This device can perform faster if connected to a Hi-Speed USB 2.0 port".',
          'Power Constraints: Standard USB root hubs supply 500mA @ 5V per port. High-draw devices (portable external hard drives, scanners, multi-function printers) require an external AC-powered USB hub to prevent voltage sag and dropped connections.',
          'Distance Limitations: Passive USB cables cannot exceed 5 meters (approx. 16 feet) without severe packet loss. For distances greater than 8 feet with high-draw equipment, use powered repeating hubs.'
        ]
      },
      {
        id: 'ch2-sec6',
        title: 'Video Cards & Display Troubleshooting',
        description: 'Isolating monitor defects vs video card GPU failures, refresh rates, and artifacts.',
        content: [
          'Video output relies on both the display adapter and the monitor: If output is fuzzy, off-center, or distorted, isolate whether the monitor or GPU is at fault by connecting a known good spare monitor.',
          'If display is fuzzy on multiple monitors: The video adapter RAMDAC, GPU solder balls, or video cable has failed. If fuzzy only on one monitor: The monitor CRT flyback or LCD scaler board is defective.',
          'Off-Center Displays: Adjust built-in monitor OSD controls (H-Phase, V-Position, Clock). If problem persists, update display drivers or recalibrate refresh rates (60Hz / 75Hz).'
        ]
      }
    ]
  },
  {
    id: 'ch3',
    chapterNumber: 3,
    title: 'Upgrading Computer Components',
    subtitle: 'Strategic Upgrades: RAM, Storage, CPU, Motherboards, Audio, and Custom Case Refinishing',
    category: 'Upgrades',
    iconName: 'Zap',
    summary: 'How to maximize performance per dollar through targeted component upgrades, socket compatibility research, and chassis customization.',
    sections: [
      {
        id: 'ch3-sec1',
        title: 'Memory (RAM): The Most Cost-Effective Speed Boost',
        description: 'Matching DDR/DDR2 forms, bus speeds, and dual-channel configurations.',
        content: [
          'Upgrading memory is the single cheapest way to achieve a noticeable system performance leap, especially when running multiple concurrent applications.',
          'How RAM Prevents Bottlenecks: When physical RAM is exhausted, the operating system swaps memory pages to the hard drive pagefile (`pagefile.sys`), causing severe thrashing and disk latency.',
          'Checking Compatibility: Identify the motherboard chipset specifications (supported speeds such as DDR2-533/667/800, max DIMM size per slot, and dual-channel channel pairings).'
        ],
        tips: [
          'Always install RAM in matching pairs for dual-channel memory interleaving bandwidth.',
          'Listen for the mechanical click from both end locking tabs to ensure total pin seating.'
        ]
      },
      {
        id: 'ch3-sec2',
        title: 'Processor (CPU) & Front Side Bus (FSB) Matching',
        description: 'Understanding socket types (Slot 1, Socket 478, LGA 775) and thermal budget limits.',
        content: [
          'Upgrading a processor increases instruction throughput, but the new CPU must match the motherboard socket, VRM power delivery, and supported Front Side Bus (FSB) frequency.',
          'Generational Constraints: You cannot jump socket architectures (e.g. Socket 478 to LGA 775) without replacing the motherboard.',
          'Thermal Compound Application: Always remove old thermal grease with 99% Isopropyl Alcohol before mounting heat sinks. Apply a pea-sized dot of high-conductivity thermal paste in the center of the CPU integrated heat spreader (IHS).'
        ]
      },
      {
        id: 'ch3-sec3',
        title: 'Case Customization: HotCoat Powder Coating Refinishing',
        description: 'Refinishing aged beige computer chassis into durable custom colors at 400°F.',
        content: [
          'Aged OEM beige cases can be transformed into high-durability custom finishes using an electrostatic powder coating gun.',
          'Step 1 (Prep): Completely strip all metal panels of plastic bezels, rubber feet, and wiring. Sand down to bare metal and clean thoroughly with pre-painting degreaser aerosol.',
          'Step 2 (Application): Apply the dry polymer powder electrostatically across the grounded metal panels in under 10 minutes.',
          'Step 3 (Cure): Bake the metal panel in a dedicated electric oven at 400°F (204°C) for the specified cure duration until the powder flows and polymerizes into a rock-hard enamel finish.'
        ],
        warnings: [
          'Never place plastic or rubber parts in the 400°F oven; only pure sheet metal chassis panels can be powder coated.'
        ]
      }
    ]
  },
  {
    id: 'ch5',
    chapterNumber: 5,
    title: 'Bench Technician How-To Guides & Tutorials',
    subtitle: 'Boot Disks, Ghost Imaging, OS Installation, Pagefile Tweaks, and Network Crossovers',
    category: 'How-To Tutorials',
    iconName: 'FileCode2',
    summary: 'Step-by-step master tutorials for technician work: creating bootable recovery media, sector-accurate Ghost disk cloning, Windows XP performance tuning, and DOS configuration scripts.',
    sections: [
      {
        id: 'ch5-sec1',
        title: 'Autoexec.bat & Config.sys Boot Files for DOS Recovery',
        description: 'Configuring HIMEM.SYS, optical device drivers, and MSCDEX extensions.',
        content: [
          'Boot disks provide bare-metal system access without loading the installed operating system, allowing low-level diagnostics, disk imaging, and BIOS flashing.',
          'Create `CONFIG.SYS` with `HIMEM.SYS` to load DOS into upper memory blocks, followed by the CD-ROM driver `DEVICEHIGH=A:\\OAKCDROM.SYS /D:IDECD001`.',
          'Create `AUTOEXEC.BAT` with `MSCDEX.EXE /D:IDECD001 /L:E` to mount the optical drive with drive letter E:.'
        ],
        codeSnippets: [
          {
            title: 'CONFIG.SYS Template',
            language: 'dos',
            code: `DEVICE=A:\\HIMEM.SYS\nDOS=HIGH,UMB\nDEVICEHIGH=A:\\OAKCDROM.SYS /D:IDECD001\nfiles=30\nbuffers=30`
          },
          {
            title: 'AUTOEXEC.BAT Template',
            language: 'dos',
            code: `@echo off\ncls\nMSCDEX.EXE /D:IDECD001 /L:E\nprompt $p$g`
          }
        ]
      },
      {
        id: 'ch5-sec2',
        title: 'Safe File Operations: Why You Must COPY + PASTE, NEVER MOVE',
        description: 'Preventing permanent file destruction caused by clipboard memory crashes during Move operations.',
        content: [
          'Golden Rule for Techs: NEVER use the "Move" command or drag-and-drop "Move Here" on client data files!',
          'How Move Destroys Data: When moving files between volumes, the OS reads the file into memory/clipboard, immediately marks the source sector for deletion, and then writes to the destination. If the system crashes, hangs, or encounters a bad sector midway, the source file is deleted and the destination remains incomplete—permanently lost without appearing in the Recycle Bin!',
          'The Safe Procedure: Always right-click -> Copy -> Paste to destination. After verifying folder properties (matching file count and exact byte size), manually delete the source original.'
        ],
        warnings: [
          'A failed Move command between distinct drives does NOT send files to the Recycle Bin. Data is unrecoverable without raw forensic recovery tools.'
        ]
      },
      {
        id: 'ch5-sec3',
        title: 'Drive Imaging & Bare-Metal Recovery with Symantec Ghost',
        description: 'Creating .GHO partition images, compression modes, and verifying image integrity.',
        content: [
          'Hard drive imaging creates a sector-by-sector clone of your operating system and software installations, allowing a complete recovery in under 20 minutes in the event of ransomware, drive failure, or corrupt updates.',
          'Using Ghost32.exe (32-bit WinPE) or Ghost.exe (16-bit DOS): Select `Local -> Partition -> To Image`.',
          'Select the source drive (Drive 1) and source partition (C: System Partition). Select destination storage (external drive or secondary partition) and name the file with `.GHO` extension.',
          'Select Compression: Choose "High" for space savings or "Fast" for rapid transfer.',
          'CRITICAL POST-IMAGE STEP: Always run `Local -> Check -> Image File` immediately to verify the checksum integrity of the `.GHO` archive before relying on it.'
        ],
        checklist: [
          'Boot into WinPE (BartPE / ERD Commander) or DOS boot disk',
          'Launch Ghost / Ghost32 executable',
          'Navigate to Local -> Partition -> To Image',
          'Save image file with explicit .GHO extension',
          'Execute image file integrity verification check'
        ]
      },
      {
        id: 'ch5-sec4',
        title: 'Operating System Performance Optimization & Pagefile Tuning',
        description: 'Optimizing Virtual Memory swap files, temp folders, visual styles, and background services.',
        content: [
          'Virtual Memory / Swap File Calculation: Set the swap file initial size to 1.0x physical RAM and maximum size to 1.5x physical RAM (cap at 2048MB per partition).',
          'Partition Placement: Move the pagefile off the system partition (C:) onto a fast secondary partition (D:) to eliminate disk I/O contention between system files and swap activity.',
          'System Temp Folder Redirect: Create `D:\\Temp` and update User & System Environment Variables (`TEMP` and `TMP`) to point to `D:\\Temp` to prevent C: drive fragmentation.',
          'Visual Effects Overhead: Disabling Windows themes and setting "Adjust for best performance" frees up to 40% of CPU processing cycles and video RAM bandwidth.',
          'Unnecessary Services to Disable: Alerter, ClipBook, Error Reporting, Fast User Switching, IMAPI CD-Burning, Messenger, Network DDE, Remote Access, Telnet, WebClient, Windows Media Connect.'
        ],
        tips: [
          'Before defragmenting, always purge all temporary files and run disk cleanup in Safe Mode.',
          'Disable "Let Windows choose what is best" under System Properties -> Advanced -> Performance.'
        ]
      },
      {
        id: 'ch5-sec5',
        title: 'Peer-to-Peer File Transfer via Cat5 & USB Crossover Cables',
        description: 'Direct PC-to-PC data transfer without router infrastructure.',
        content: [
          'When no switch or local router is available, connect two computers directly using a Cat5 Crossover Cable (pins 1/2 swapped with 3/6).',
          'Static IP Configuration: Set PC #1 to IP `192.168.1.1` and PC #2 to `192.168.1.2` with Subnet Mask `255.255.255.0` and Gateway `192.168.1.3`.',
          'Enable NetBIOS over TCP/IP in Advanced WINS settings.',
          'Create a matching local user account (e.g. username `Transfer` with identical password) on both machines with local administrative privileges, share the target folder, and map network drive `\\\\192.168.1.1\\SharedFolder`.'
        ],
        codeSnippets: [
          {
            title: 'Network Drive Mapping Command',
            language: 'cmd',
            code: 'net use Z: \\\\192.168.1.1\\SharedFolder /user:Transfer P@ssw0rd123'
          }
        ]
      }
    ]
  },
  {
    id: 'ch6',
    chapterNumber: 6,
    title: 'Troubleshooting Decision Trees & Checklists',
    subtitle: 'Fall-Through Diagnostic Checklists for Audio, Power, CPU Loops, Keyboards, and Motherboards',
    category: 'Troubleshooting',
    iconName: 'AlertTriangle',
    summary: 'Structured logical decision trees: follow progressive Yes/No diagnostic branches to isolate root hardware and firmware failures.',
    sections: [
      {
        id: 'ch6-sec1',
        title: 'Master Fall-Through Troubleshooting Philosophy',
        description: 'How to logically isolate hardware defects without wasting parts.',
        content: [
          'Troubleshooting is a logical decision tree: at the top is the symptom; each branch leads to a verified Yes or No outcome.',
          'Core Rule: Did you change anything since the system was last operational? If Yes, immediately reverse the last hardware or software change. If No, begin with primary AC power and power supply verification.',
          'Minimal Boot Configuration: Strip the motherboard down to the bare essentials: CPU, 1 stick of RAM, Video Card, and Power Supply. Disconnect all SATA cables, optical drives, front-panel USB headers, and expansion cards. If the system POSTs, add components back one by one until the fault recurs.'
        ]
      }
    ]
  },
  {
    id: 'ch8',
    chapterNumber: 8,
    title: 'Laptop Care & Component Repair',
    subtitle: 'Batteries, Housing Disassembly, Keyboards, Trackpads, LCD Panels & Inverters',
    category: 'Laptops',
    iconName: 'Laptop',
    summary: 'Comprehensive laptop maintenance guide: disassembling clamshell cases without cracking clips, ribbon cable safety, LCD inverter replacement, and display cleaning protocols.',
    sections: [
      {
        id: 'ch8-sec1',
        title: 'Laptop Batteries: Myths, Li-Ion Chemistry, and Trickle Charging',
        description: 'Debunking battery memory myths and prolonging battery service life.',
        content: [
          'Battery Degradation Reality: Modern Lithium-Ion (Li-Ion) laptop battery packs consist of internal 1.5V/3.7V cylindrical cells wired in series/parallel with an internal micro-controller charge management PCB.',
          'Myth Debunked: Removing the battery while on AC power does not prevent chemical degradation; all Li-Ion cells slowly degrade once initially charged.',
          'Desktop Replacement Care: If running a laptop permanently on AC power, discharge the battery to approximately 40%-50% capacity, remove it, and store it in a cool, dry location to prevent continuous thermal stress from internal motherboard heat.'
        ],
        warnings: [
          'Never leave a swollen or non-charging battery pack permanently inside a hot chassis; thermal runaway can cause fires or casing warping.'
        ]
      },
      {
        id: 'ch8-sec2',
        title: 'Laptop Case Disassembly & Ribbon Cable Handling',
        description: 'Cracking stubborn laptop casings with plastic putty knives without breaking clips.',
        content: [
          'Laptop teardown requires systematic screw organization: Screws differ in length by fractions of a millimeter; putting a long screw into a short screw hole will puncture the top palmrest casing!',
          'Use an exacto knife to gently pry up screw cover adhesive pads and place them in order on a layout sheet.',
          'Prying Tool: Use a thin plastic putty knife or spudger along the seam between top and bottom shells. Never use metal flathead screwdrivers on plastic chassis seams.',
          'Ribbon Cable Latches: Lift the sliding collar or flip the zero-insertion-force (ZIF) plastic bail before pulling ribbon cables to avoid tearing fragile mylar copper traces.'
        ]
      },
      {
        id: 'ch8-sec3',
        title: 'Laptop LCD & Plasma Screen Cleaning Protocols',
        description: 'Preventing permanent polarizer scratching and liquid ingress inside display bezels.',
        content: [
          'LCD display surfaces are soft polarized polymer coatings that scratch easily from paper towels, wood-pulp tissues, or aggressive scrubbing.',
          'DO: Power off system completely and allow the screen to cool. Spray 99% Isopropyl alcohol or specialized display cleaner onto a soft microfiber cloth—NEVER directly onto the screen.',
          'DON\'T: Never use ammonia-based cleaners (Windex) on laptops as ammonia chemically etches copper traces and clouds anti-glare coatings. Never press heavily on the screen panel, which can permanently rupture liquid crystals into black blotches.'
        ],
        checklist: [
          'System powered off and unplugged',
          'Microfiber cloth used (no paper towels)',
          'Liquid sprayed onto cloth, never onto screen surface',
          'Allowed 10 minutes evaporation time before powering on'
        ]
      }
    ]
  },
  {
    id: 'ch9',
    chapterNumber: 9,
    title: 'Server Hardware, RAID & Network Services',
    subtitle: 'Tower vs Rackmount, ECC Memory, RAID 0/1/5, NIC Teaming, DNS, WINS & Active Directory',
    category: 'Servers & Networks',
    iconName: 'Database',
    summary: 'Enterprise server hardware and infrastructure guide: hardware RAID controller parity calculations, dual-NIC load balancing, and Active Directory container architecture.',
    sections: [
      {
        id: 'ch9-sec1',
        title: 'Hardware RAID Arrays: RAID 0, RAID 1 (Mirroring) & RAID 5 (Parity)',
        description: 'Calculating storage overhead, parity drive loss, and recovery from drive failure.',
        content: [
          'Hardware RAID controllers feature onboard processors and battery-backed write cache (BBWC) to accelerate disk I/O and safeguard against sudden power loss.',
          'RAID 0 (Striping): Maximum performance with zero redundancy. If 1 drive fails, all data is lost.',
          'RAID 1 (Mirroring): 1:1 disk duplication. Ideal for OS system partitions (`C:` drive). If one drive fails, the mirror continues seamlessly.',
          'RAID 5 (Distributed Parity): Requires a minimum of 3 drives. Data and parity are striped across all drives. Total usable capacity = `(N - 1) * Smallest_Drive_Capacity`. If one drive fails, replace it immediately to begin background rebuild.'
        ],
        table: {
          headers: ['RAID Level', 'Min Drives', 'Storage Efficiency', 'Fault Tolerance', 'Primary Use Case'],
          rows: [
            ['RAID 0', '2', '100% (Sum of all drives)', '0 drives (Any loss = Total Data Loss)', 'Scratch disks, high-speed rendering'],
            ['RAID 1', '2', '50% (Capacity of 1 drive)', '1 drive failure', 'Operating System / Boot partitions'],
            ['RAID 5', '3', '(N - 1) * Capacity', '1 drive failure', 'High-capacity business file storage & databases']
          ]
        },
        warnings: [
          'When creating RAID 5 arrays, always use drives of identical capacity. A single smaller drive will force the controller to truncate all other drives in the array to the smallest size!'
        ]
      },
      {
        id: 'ch9-sec2',
        title: 'Server NIC Teaming & Load Balancing',
        description: 'Combining multiple network interface cards for aggregated throughput and fault tolerance.',
        content: [
          'NIC Teaming combines two or more physical network interface cards (e.g. dual 3Com 3C905 or Intel PRO/1000) under a single virtual IP and MAC address.',
          'Load Balancing Mode: Distributes inbound and outbound network traffic across all teamed adapters, doubling or quadrupling local LAN throughput (e.g. 2x 100Mbps = 200Mbps aggregate bandwidth).',
          'Fault Tolerant Mode: One adapter remains active while the second acts as standby failover connected to a redundant switch.'
        ]
      }
    ]
  },
  {
    id: 'ch10',
    chapterNumber: 10,
    title: 'Data Backup Strategies & Scheduling',
    subtitle: 'Incremental vs Differential vs Full vs Image Backups & Automated Scheduling',
    category: 'Data Backup',
    iconName: 'Download',
    summary: 'Comprehensive disaster recovery planning: understanding backup types, storage media lifespans, and automated backup scheduling.',
    sections: [
      {
        id: 'ch10-sec1',
        title: 'Backup Methodologies: Full, Incremental, Differential & Image',
        description: 'Balancing backup window duration against disaster recovery restore speed.',
        content: [
          'Full Backup: Copies all selected files regardless of archive bit status. Longest backup time, fastest single-step restore.',
          'Incremental Backup: Copies only files created or modified since the last backup and clears the archive bit. Fastest daily backup, but requires the last Full backup PLUS every subsequent incremental set to restore.',
          'Differential Backup: Copies all files modified since the last Full backup without clearing archive bits. Faster recovery than incremental (requires only Full + latest Differential).',
          'Image / Clone: Byte-for-byte snapshot of physical partitions. Essential for bare-metal OS recovery.'
        ]
      }
    ]
  },
  {
    id: 'ch11',
    chapterNumber: 11,
    title: 'Hardware & Motherboard Reviews',
    subtitle: 'ABIT SG-80DC, ASUS P5LD2 R2.0, DFI Infinity 975X/G, ECS 945G-M3, and Tyan Tomcat I7210',
    category: 'Hardware Reviews',
    iconName: 'CircuitBoard',
    summary: 'Detailed bench reviews and architectural breakdowns of classic workstation and server motherboards, chipsets, and graphics cards.',
    sections: [
      {
        id: 'ch11-sec1',
        title: 'ASUS P5LD2 R2.0 LGA775 Motherboard Review',
        description: 'Intel 945P chipset, DDR2-667 dual channel, PCIe x16, and SATA RAID.',
        content: [
          'The ASUS P5LD2 R2.0 delivers top-tier reliability for LGA775 Intel Pentium 4 / Pentium D processors with FSB ranging from 533 MHz to 1066 MHz.',
          'Features 4x SATA2 ports with Intel ICH7R RAID (0, 1, 5, 10), Realtek ALC882 8-channel HD audio, Marvell Gigabit LAN, and PCI Express x16 graphics.',
          'Bench Rating: 8 / 10. Exceptional build quality, rock-solid stability, and wide processor upgrade paths.'
        ]
      },
      {
        id: 'ch11-sec2',
        title: 'Tyan Tomcat I7210 (S5112G2NR) Server Motherboard Review',
        description: 'Intel E7210 chipset, Socket 478, dual Gigabit LAN, and Silicon Image SATA RAID.',
        content: [
          'Designed for entry-level small business servers: Supports Socket 478 Pentium 4 / Celeron CPUs up to 2.8GHz, 4x DDR-400 ECC/non-ECC DIMMs up to 4GB, and dual Intel Gigabit Ethernet controllers.',
          'Storage: 2x ATA/133 IDE channels, 2x SATA ports (ICH5-S), and 4x SATA ports via Silicon Image Sil3114 controller with RAID 0, 1, 10 support.',
          'Bench Rating: 9 / 10. Outstanding server value without the prohibitive cost of enterprise Xeon platforms.'
        ]
      }
    ]
  },
  {
    id: 'ch13',
    chapterNumber: 13,
    title: 'Real-World Bench Tech Q&A & Forum Solvers',
    subtitle: '15+ Diagnostic Solutions to Real Hardware & OS Failures from the Bench',
    category: 'Forum Q&A',
    iconName: 'Search',
    summary: 'Actual diagnostic solutions to real-world customer hardware faults: freezing loops, drive capacity clipping, black screens with green LEDs, and RAM upgrade lockouts.',
    sections: [
      {
        id: 'ch13-sec1',
        title: 'Diagnostic Solutions Index',
        description: 'Searchable repository of customer repair scenarios and proven solutions.',
        content: [
          'Access the interactive Q&A solver below to match symptoms with proven bench solutions.'
        ]
      }
    ]
  }
];

export const DIY_REPAIR_TREES: TroubleshootingTree[] = [
  {
    id: 'tree-no-power',
    title: 'No Power / Total System Dead Diagnostic Tree',
    category: 'Power & Electrical',
    description: 'Step-by-step isolation when pressing the front power button produces no activity, fans, or LEDs.',
    initialQuestion: 'step-1',
    steps: [
      {
        id: 'step-1',
        prompt: 'Is there verified electrical power at the wall outlet or power strip (test with a known working lamp)?',
        yesNextId: 'step-2',
        noOutcome: 'Reset the circuit breaker, replace the power strip, or try a different verified AC wall receptacle.'
      },
      {
        id: 'step-2',
        prompt: 'Is the power cord firmly seated into both the power supply socket and the wall outlet, and is the PSU rear I/O rocker switch in the ON (I) position?',
        yesNextId: 'step-3',
        noOutcome: 'Plug in power cord securely and toggle the rocker switch to ON (I).'
      },
      {
        id: 'step-3',
        prompt: 'When pressing the front panel power switch, do any chassis cooling fans spin, LEDs light, or PSU fan click?',
        yesNextId: 'step-4',
        noNextId: 'step-5'
      },
      {
        id: 'step-4',
        prompt: 'System energizes but displays nothing on screen. Do you hear any speaker beep codes or see POST error numbers?',
        yesOutcome: 'Look up the specific BIOS Beep Code or POST digit in the Error Matrix to pinpoint the failing component (RAM, Video, or CPU).',
        noOutcome: 'Disconnect all SATA/IDE drives and expansion cards except 1 stick of RAM and Video. Check for short-to-ground on motherboard brass standoffs.'
      },
      {
        id: 'step-5',
        prompt: 'Disconnect all drive power plugs (Hard Drive, CD/DVD, Floppy) and front-panel USB headers. Does the PSU start when shorting the Power Switch header pins with a flathead screwdriver?',
        yesOutcome: 'A shorted auxiliary drive or broken front-panel switch wire was pulling the power rail to ground. Replace the faulty cable or switch.',
        noOutcome: 'The Power Supply Unit (PSU) or motherboard 12V VRM circuitry has suffered an internal component failure. Replace the power supply.'
      }
    ]
  },
  {
    id: 'tree-audio',
    title: 'Audio Noise, Distortion & No Sound Diagnostic Tree',
    category: 'Audio & Multimedia',
    description: 'Diagnosing buzzing, humming, cold solder joints, missing codecs, and silent sound cards.',
    initialQuestion: 'audio-step-1',
    steps: [
      {
        id: 'audio-step-1',
        prompt: 'Is the speaker icon visible in the Windows taskbar system tray by the clock?',
        yesNextId: 'audio-step-2',
        noNextId: 'audio-step-3'
      },
      {
        id: 'audio-step-2',
        prompt: 'When moving the audio cable plug gently at both the speaker and computer audio jack, does the sound crackle, buzz, or cut in and out?',
        yesOutcome: 'The audio cable has a broken internal wire or cold solder joint. Replace the 3.5mm stereo patch cable.',
        noOutcome: 'Open Device Manager -> Sound, video and game controllers. Verify that the audio device status reads "This device is working properly" and audio features are enabled.'
      },
      {
        id: 'audio-step-3',
        prompt: 'In Device Manager, do you see a yellow exclamation mark "?" under Sound or Other Devices?',
        yesOutcome: 'The audio device driver or CODEC is missing. Download and install the specific Realtek / SoundMax / Creative driver for your motherboard.',
        noOutcome: 'Check BIOS setup to ensure Integrated Audio is set to "Enabled" and not disabled.'
      }
    ]
  },
  {
    id: 'tree-boot-freeze',
    title: 'Boot Freeze / Underscore Cursor / 20-Min Freeze Tree',
    category: 'Storage & OS Boot',
    initialQuestion: 'boot-step-1',
    description: 'Diagnosing system stalls on BIOS splash screen, blinking underscore cursors, and periodic freezing.',
    steps: [
      {
        id: 'boot-step-1',
        prompt: 'Does the system stop at a black screen with a single blinking underscore cursor in the top-left corner after the BIOS splash?',
        yesNextId: 'boot-step-2',
        noNextId: 'boot-step-3'
      },
      {
        id: 'boot-step-2',
        prompt: 'Is this a brand new replacement hard drive or freshly assembled computer?',
        yesOutcome: 'The hard drive is in a RAW unpartitioned state without a Master Boot Record (MBR) or OS. Boot with your OS install CD to partition and format the drive.',
        noOutcome: 'The Master Boot Record (MBR) or boot partition has become corrupted. Boot into Recovery Console / ERD Commander and execute `fixmbr` and `fixboot`.'
      },
      {
        id: 'boot-step-3',
        prompt: 'Does the system boot normally but freeze solid after 5 to 20 minutes of operation, requiring a hard power cycle?',
        yesOutcome: 'Overheating CPU/VRM or failing thermal paste. Verify CPU fan spins, clean dust from heat sink fins, and apply fresh thermal compound. Also check memory timings in BIOS.'
      }
    ]
  }
];

export const DIY_REPAIR_FORUM_QA: ForumQAItem[] = [
  {
    id: 'qa-1',
    question: 'My desktop computer stopped coming on last week. Zero response.',
    tags: ['Power', 'PSU', 'Motherboard', 'Grounding'],
    symptomSummary: 'No lights on front panel, no fan spin when pressing power button.',
    answer: 'Begin with external verification: check wall outlet with a lamp and ensure the power cord is firmly seated. If good, open the chassis and disconnect power from all drives (HDD, CD-ROM, Floppy). Try powering on. If still dead, remove all RAM modules; if the motherboard speaker fails to emit missing-RAM beeps, either the power supply or motherboard has suffered a catastrophic ground failure.',
    diagnosticSteps: [
      'Test wall outlet and surge protector with a lamp.',
      'Unplug power cord, remove all internal drive power cables.',
      'Remove RAM sticks and listen for missing-memory speaker beep codes.',
      'If zero beeps and zero fan spin: Replace power supply unit.'
    ],
    preventativeTip: 'Always use a quality surge protector with clamp voltage protection.'
  },
  {
    id: 'qa-2',
    question: 'I upgraded my PC memory from two 256MB modules to two 1GB modules. When I put in the first 1GB module it booted normal, but with both installed there is only a blinking red light.',
    tags: ['RAM', 'Memory', 'Motherboard', 'LGA775 / Socket 478'],
    symptomSummary: 'System boots with 1GB single module, but fails to POST with 2GB total installed.',
    answer: 'The motherboard chipset or BIOS revision either does not support 2GB capacity or requires a CMOS reset to recalibrate memory density and dual-channel timings. Clear CMOS by unplugging AC power, removing the CR2032 coin cell battery for 2 minutes, and reinserting. Then install module #1, enter BIOS, save settings, power off, and install module #2.',
    diagnosticSteps: [
      'Unplug AC power and remove the CR2032 motherboard coin battery for 2 minutes.',
      'Boot with single 1GB module to access BIOS and save default timings.',
      'Test module #2 individually in Slot 1 to rule out a defective RAM stick.',
      'Insert both modules and test dual-channel vs single-channel slot configurations.'
    ],
    preventativeTip: 'Verify motherboard maximum supported RAM capacity and density limits in manufacturer manual.'
  },
  {
    id: 'qa-3',
    question: 'I am having a problem with my hard disk. It is an 80 GB hard disk, but after formatting with Disk Manager it is only showing 33.8 GB in BIOS settings.',
    tags: ['Hard Drive', 'IDE', 'BIOS Limitation', 'Jumper Clip'],
    symptomSummary: '80GB hard drive recognized as only 33.8GB in BIOS.',
    answer: 'This is the classic 32GB Capacity Clip jumper setting! Legacy IDE hard drives (Western Digital, Seagate, Maxtor) included a jumper pin setting specifically to fool older BIOSes that crashed on drives larger than 32GB (the 33.8GB barrier). Check the drive label diagram and remove the "Cap Limit" or "Capacity Limitation" jumper so the drive reports its true 80GB LBA capacity.',
    diagnosticSteps: [
      'Power off and remove the IDE hard drive from drive bay.',
      'Examine the jumper diagram on the hard drive top label.',
      'Locate the "Capacity Limitation Jumper" (often pins 5-6 on Western Digital).',
      'Remove the capacity clip jumper and leave only Cable Select or Master jumper.'
    ],
    preventativeTip: 'Ensure motherboard BIOS has 48-bit LBA support enabled.'
  },
  {
    id: 'qa-4',
    question: 'Computer shows an MSI splash screen, does some initialization, then goes black with a little blinking underscore cursor at the top left.',
    tags: ['Boot', 'FDISK', 'MBR', 'OS Setup'],
    symptomSummary: 'POST finishes successfully but boots into blinking underscore with no OS load.',
    answer: 'The hard drive is either a brand new "raw" unpartitioned drive without an active partition, or the Master Boot Record (MBR) signature (0x55AA) is missing. The BIOS successfully passes POST and searches for a boot sector, but finding none, drops into cursor wait state. Insert your Windows installation CD or DOS boot disk, run FDISK/Setup to create an active primary partition, format it, and install the OS.',
    diagnosticSteps: [
      'Enter BIOS setup (Del key) and verify hard drive is detected in IDE/SATA channel.',
      'Verify Boot Priority list places hard drive after CD-ROM.',
      'Boot with Windows Installation CD or WinPE recovery disk.',
      'Create a Primary Partition and mark it as Active.'
    ],
    preventativeTip: 'Never leave unformatted raw drives as primary boot priority.'
  },
  {
    id: 'qa-5',
    question: 'My PC freezes after about 20 minutes of booting. When I reboot it freezes after 5 minutes, and quicker every time until it stays frozen immediately.',
    tags: ['Thermal', 'CPU Overheating', 'Heat Sink', 'Thermal Paste'],
    symptomSummary: 'Progressively shorter freeze cycles with repeated reboots.',
    answer: 'Classic thermal throttling and runaway overheating! As the CPU and heat sink absorb heat, thermal saturation occurs. With dried thermal paste, a clogged heat sink, or stopped CPU fan, the processor cannot dissipate heat and locks up to prevent melting silicon. Because the heat sink remains hot, subsequent reboots hit the critical thermal threshold in minutes. Disassemble the CPU heat sink, clean old paste with 99% Isopropyl Alcohol, and apply fresh thermal compound.',
    diagnosticSteps: [
      'Power down and let the computer cool completely for 30 minutes.',
      'Inspect CPU cooler fan blades for dust bunnies and verify smooth spin.',
      'Unhook heat sink, clean processor heat spreader with Isopropyl alcohol.',
      'Apply fresh pea-sized dot of thermal paste and re-clamp heat sink securely.'
    ],
    preventativeTip: 'Clean chassis fan filters every 6 months to maintain positive airflow.'
  },
  {
    id: 'qa-6',
    question: 'My computer sounds like it is booting up and the monitor LED light turns green, but the screen stays completely black.',
    tags: ['Video', 'Monitor', 'RAMDAC', 'Cable'],
    symptomSummary: 'System POSTs, monitor detects signal (green LED), but no video is displayed.',
    answer: 'A green monitor LED indicates horizontal/vertical sync signals are detected from the video card, but no pixel data is reaching the display. Disconnect and firmly reseat both ends of the VGA/DVI cable. If using a dedicated video card, ensure the motherboard integrated video is disabled in BIOS and that the card is fully seated in the AGP/PCIe slot with power cables connected.',
    diagnosticSteps: [
      'Reseat VGA/DVI cable at both monitor and computer ports.',
      'Test monitor with another video source (laptop or spare desktop).',
      'Reseat video card in PCIe / AGP slot.',
      'Check if video is outputting to an alternate port (VGA vs DVI vs S-Video).'
    ]
  }
];
