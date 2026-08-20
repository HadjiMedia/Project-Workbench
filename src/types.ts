export type TabId = 
  | 'errors'
  | 'psu'
  | 'scripts'
  | 'techsuite'
  | 'cheatsheets'
  | 'tickets'
  | 'invoice'
  | 'pinouts'
  | 'serial'
  | 'motherboard'
  | 'kb'
  | 'shortcuts'
  | 'admin';

export type UserRole = 'admin' | 'lead_tech' | 'bench_tech' | 'trainee';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'rejected';

export interface User {
  id: string;
  email: string;
  fullName: string;
  techCallsign: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string; // Stored hash / encoded
  registeredAt: string;
  registeredIp: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userEmail: string;
  action: string;
  ip: string;
  userAgent: string;
  details?: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface BeepCodeDefinition {
  id: string;
  biosType: 'AMI UEFI / BIOS' | 'Award / Phoenix' | 'Dell / Alienware' | 'HP / Compaq' | 'Lenovo ThinkPad';
  pattern: string; // e.g. "1 Long, 2 Short"
  title: string;
  meaning: string;
  troubleshooting: string;
  tones: { freq: number; durationMs: number; pauseMs: number }[];
}

export interface SubnetCalcResult {
  ip: string;
  cidr: number;
  netmask: string;
  netmaskHex: string;
  wildcard: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  usableHosts: number;
  ipClass: 'A' | 'B' | 'C' | 'D (Multicast)' | 'E (Experimental)';
  isPrivate: boolean;
}

export interface WindowsErrorCode {
  hex: string;
  name: string;
  category: 'Windows Update' | 'BSOD & Kernel' | 'Component Store / DISM' | 'Filesystem & Storage' | 'Security & Permissions' | 'Activation & Licensing';
  description: string;
  symptoms: string[];
  causes: string[];
  solutionSteps: string[];
  commands?: {
    label: string;
    type: 'cmd' | 'powershell' | 'reg';
    code: string;
  }[];
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface PsuComponentSelection {
  cpuModel: string;
  cpuTdp: number;
  cpuOverclockW: number;
  gpuModel: string;
  gpuTgp: number;
  gpuCount: number;
  ramSticks: number;
  ramType: 'DDR4' | 'DDR5';
  m2NvmeCount: number;
  sataSsdCount: number;
  sataHddCount: number;
  caseFansCount: number;
  aioPumpType: 'none' | '120mm' | '240mm' | '360mm' | 'custom_d5';
  pcieExpansionCards: number;
  rgbLightingWatts: number;
  usbPeripheralsWatts: number;
  loadHeadroomPercent: number; // e.g. 25%
}

export interface RailOutput {
  rail: '+12V' | '+5V' | '+3.3V' | '+5VSB' | '-12V';
  nominalVoltage: number;
  minVoltage: number;
  maxVoltage: number;
  estimatedWatts: number;
  estimatedAmps: number;
  tolerancePercent: string;
  measuredVoltage?: number;
}

export interface ScriptOption {
  id: string;
  category: 'System Integrity' | 'Network & DNS' | 'Cache & Temp' | 'Windows Update' | 'Performance & Storage' | 'Diagnostics & Logs';
  title: string;
  description: string;
  cmdCode: string;
  psCode: string;
  enabled: boolean;
  requiresReboot?: boolean;
}

export interface ScriptConfig {
  format: 'bat' | 'ps1';
  autoElevate: boolean;
  logToDesktop: boolean;
  pauseAtEnd: boolean;
  echoHeaders: boolean;
  customHeaderNote: string;
}

export type TicketStatus = 
  | 'Received'
  | 'In Diagnostics'
  | 'Awaiting Parts'
  | 'Repair In Progress'
  | 'Testing / QA'
  | 'Ready for Pickup'
  | 'Completed'
  | 'Cancelled';

export type TicketPriority = 'Low' | 'Normal' | 'Urgent' | 'Critical';

export interface DiagnosticNote {
  id: string;
  timestamp: string;
  technician: string;
  text: string;
}

export interface InvoiceItem {
  id: string;
  type: 'part' | 'labor' | 'fee';
  description: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
}

export interface JobTicket {
  id: string;
  ticketNumber: string; // e.g. "TICK-1024"
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deviceType: 'Desktop PC' | 'Gaming Rig' | 'Laptop' | 'MacBook / iMac' | 'Server / NAS' | 'Console / Other';
  deviceBrandModel: string;
  serialNumber: string;
  passcodePin: string;
  physicalCondition: string;
  accessoriesIncluded: string;
  reportedIssue: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTechnician: string;
  createdAt: string;
  estimatedCompletionDate: string;
  completedAt?: string;
  internalNotes: string;
  diagnosticNotes: DiagnosticNote[];
  diagnosticChecklist: {
    postVerified: boolean;
    memTestPassed: boolean;
    thermalStressPassed: boolean;
    osIntegrityRepaired: boolean;
    chassisCleaned: boolean;
    backupCreated: boolean;
  };
  items: InvoiceItem[];
  diagnosticFeeCredit: number;
  discountAmount: number;
  taxRatePercent: number;
}

export interface ShopSettings {
  shopName: string;
  shopPhone: string;
  shopEmail: string;
  shopAddress: string;
  shopWebsite: string;
  taxId: string;
  currencySymbol: string;
  defaultTaxRate: number;
  warrantyDisclaimer: string;
}

export interface MotherboardHotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  category: 'jumper' | 'power' | 'core' | 'expansion' | 'diag';
  brief: string;
  specs: string;
  symptoms: string;
  jumperGuide: string[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  code?: string;
  restricted: boolean;
  updatedAt: number;
}

export interface ShortcutItem {
  id: string;
  app: 'powerpoint' | 'photoshop' | 'windows' | 'vscode' | 'premiere' | 'linux';
  category: string;
  action: string;
  keys: string[];
  desc: string;
}

export interface SerialLogEntry {
  id: string;
  timestamp: string;
  type: 'rx' | 'tx' | 'system' | 'error';
  data: string;
  postCodeMatch?: {
    code: string;
    description: string;
    phase: string;
  };
}

export interface PinoutDefinition {
  id: string;
  title: string;
  subtitle: string;
  category: 'Power' | 'Front Panel' | 'Data / USB' | 'Cooling';
  description: string;
  voltageSummary: string;
  probingSafety: string;
  pins: {
    pinNumber: number;
    pinName: string;
    color: string;
    voltage: string;
    type: '12V' | '5V' | '3.3V' | '-12V' | '5VSB' | 'GND' | 'Signal' | 'Sense' | 'NC';
    description: string;
    expectedDmm: string;
  }[];
}
