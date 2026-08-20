import { JobTicket, ShopSettings } from '../types';

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  shopName: 'Workbench Technical Diagnostic & Computer Lab',
  shopPhone: '(555) 842-8324',
  shopEmail: 'service@workbench-diagnostics.local',
  shopAddress: '742 Tech Boulevard, Suite 100, Silicon District, CA 94016',
  shopWebsite: 'www.workbench-diagnostics.local',
  taxId: 'TAX-8849-CA',
  currencySymbol: '$',
  defaultTaxRate: 8.25,
  warrantyDisclaimer: 'Standard 90-Day Hardware Warranty and 30-Day Labor Warranty applies to all performed repairs. Physical drops, liquid ingress, and overclocking customer modifications are excluded. Unclaimed equipment will be recycled after 60 days.'
};

export const INITIAL_TICKETS: JobTicket[] = [
  {
    id: 'tick_101',
    ticketNumber: 'TICK-1042',
    customerName: 'Marcus Vance',
    customerPhone: '+1 (555) 234-5891',
    customerEmail: 'm.vance@vancetech.io',
    deviceType: 'Gaming Rig',
    deviceBrandModel: 'Custom Rig (i9-14900K / RTX 4090 / ASUS Z790)',
    serialNumber: 'SN-VR4090-8812',
    passcodePin: 'No password (UEFI POST Issue)',
    physicalCondition: 'Glass panel intact. Light dust build-up in front radiator filter.',
    accessoriesIncluded: 'Tower only + AC Power Cord',
    reportedIssue: 'System enters bootloop with Orange DRAM LED on motherboard. Random blue screens with IRQL_NOT_LESS_OR_EQUAL and MEMORY_MANAGEMENT when XMP is enabled.',
    status: 'In Diagnostics',
    priority: 'Urgent',
    assignedTechnician: 'Alex Rivera (Lead Tech)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    estimatedCompletionDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    internalNotes: 'Tested DDR5 6400MHz kit. Memory training passes with stock JEDEC 4800MHz, fails on XMP Profile 1. Updated BIOS to latest microcode 0x12B.',
    diagnosticNotes: [
      {
        id: 'dn_1',
        timestamp: new Date(Date.now() - 86400000 * 1.5).toLocaleString(),
        technician: 'Alex Rivera',
        text: 'Visual inspection complete. No blown capacitors on VRM. Flashed BIOS to version 2402 via USB Flashback.'
      },
      {
        id: 'dn_2',
        timestamp: new Date(Date.now() - 86400000 * 0.8).toLocaleString(),
        technician: 'Alex Rivera',
        text: 'MemTest86 slot A2/B2 testing. Stick 1 passed 4 passes. Stick 2 threw 18 bit errors on test 7. Customer contacted for RAM RMA replacement.'
      }
    ],
    diagnosticChecklist: {
      postVerified: true,
      memTestPassed: false,
      thermalStressPassed: false,
      osIntegrityRepaired: true,
      chassisCleaned: true,
      backupCreated: false
    },
    items: [
      {
        id: 'item_1',
        type: 'labor',
        description: 'Advanced Level 3 Diagnostic Bench Fee (Hardware & Memory Testing)',
        quantity: 1,
        unitPrice: 89.00
      },
      {
        id: 'item_2',
        type: 'labor',
        description: 'BIOS Microcode Update & Stability Tuning',
        quantity: 1,
        unitPrice: 45.00
      },
      {
        id: 'item_3',
        type: 'part',
        description: 'Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz CL30 Replacement Kit',
        partNumber: 'CMK32GX5M2B6000C30',
        quantity: 1,
        unitPrice: 119.99
      }
    ],
    diagnosticFeeCredit: 45.00,
    discountAmount: 0.00,
    taxRatePercent: 8.25
  },
  {
    id: 'tick_102',
    ticketNumber: 'TICK-1043',
    customerName: 'Elena Rostova',
    customerPhone: '+1 (555) 782-9901',
    customerEmail: 'elena.rostova@designstudio.org',
    deviceType: 'Laptop',
    deviceBrandModel: 'Dell XPS 15 9520 (i7-12700H / 32GB RAM / RTX 3050Ti)',
    serialNumber: 'ST-9520-7XK91',
    passcodePin: '4829',
    physicalCondition: 'Minor hairline scratch on top lid. Rubber feet intact.',
    accessoriesIncluded: '130W USB-C Charger & Laptop Sleeve',
    reportedIssue: 'Windows Update stuck at 0% with error 0x80070002. Laptop runs hot and fans surge to 100% when launching Photoshop.',
    status: 'Ready for Pickup',
    priority: 'Normal',
    assignedTechnician: 'David Kim',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    estimatedCompletionDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    completedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    internalNotes: 'Purged SoftwareDistribution and reset CBS component store. Cleaned vapor chamber heatsink and applied Honeywell PTM7950 phase change thermal pad. Temps dropped from 98°C to 74°C under load.',
    diagnosticNotes: [
      {
        id: 'dn_3',
        timestamp: new Date(Date.now() - 86400000 * 2.5).toLocaleString(),
        technician: 'David Kim',
        text: 'Ran SFC /scannow and DISM /RestoreHealth. Fixed 4 corrupt DLLs. Windows Updates installed cleanly to build 22631.4037.'
      },
      {
        id: 'dn_4',
        timestamp: new Date(Date.now() - 86400000 * 1.1).toLocaleString(),
        technician: 'David Kim',
        text: 'Full internal dust blowout & PTM7950 repaste. 30-min Cinebench R23 loop completed with zero throttling.'
      }
    ],
    diagnosticChecklist: {
      postVerified: true,
      memTestPassed: true,
      thermalStressPassed: true,
      osIntegrityRepaired: true,
      chassisCleaned: true,
      backupCreated: true
    },
    items: [
      {
        id: 'item_4',
        type: 'labor',
        description: 'Comprehensive OS Repair, DISM Recovery & Windows Update Repair',
        quantity: 1,
        unitPrice: 75.00
      },
      {
        id: 'item_5',
        type: 'labor',
        description: 'Laptop Deep Clean & High-Performance Thermal Pad Repaste',
        quantity: 1,
        unitPrice: 65.00
      },
      {
        id: 'item_6',
        type: 'part',
        description: 'Honeywell PTM7950 Phase-Change Thermal Material',
        partNumber: 'PTM-7950-PAD',
        quantity: 1,
        unitPrice: 18.50
      }
    ],
    diagnosticFeeCredit: 0.00,
    discountAmount: 10.00,
    taxRatePercent: 8.25
  },
  {
    id: 'tick_103',
    ticketNumber: 'TICK-1044',
    customerName: 'Sarah Jenkins',
    customerPhone: '+1 (555) 441-2093',
    customerEmail: 's.jenkins@creativeops.net',
    deviceType: 'Desktop PC',
    deviceBrandModel: 'HP Omen 45L Prebuilt',
    serialNumber: 'HP-OMEN-849102',
    passcodePin: 'omen2024',
    physicalCondition: 'Front bezel intact, no visible damage.',
    accessoriesIncluded: 'Tower only',
    reportedIssue: 'Blue screen on boot: INACCESSIBLE_BOOT_DEVICE (0x0000007B) following Windows 11 23H2 upgrade.',
    status: 'Received',
    priority: 'High' as any,
    assignedTechnician: 'Alex Rivera',
    createdAt: new Date().toISOString(),
    estimatedCompletionDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    internalNotes: 'Initial intake. Suspected Intel VMD / RST driver drop or BCD corruption.',
    diagnosticNotes: [],
    diagnosticChecklist: {
      postVerified: true,
      memTestPassed: false,
      thermalStressPassed: false,
      osIntegrityRepaired: false,
      chassisCleaned: false,
      backupCreated: false
    },
    items: [
      {
        id: 'item_7',
        type: 'labor',
        description: 'Standard Hardware & OS Bootloader Diagnostic',
        quantity: 1,
        unitPrice: 69.00
      }
    ],
    diagnosticFeeCredit: 0.00,
    discountAmount: 0.00,
    taxRatePercent: 8.25
  }
];
