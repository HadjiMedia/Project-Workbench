import { User, SecurityAuditLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_01',
    email: 'admin@workbench.local',
    fullName: 'Master Supervisor',
    techCallsign: 'LEAD-OPS-01',
    role: 'admin',
    status: 'active',
    passwordHash: 'admin123', // Demo plaintext/hash
    registeredAt: '2026-01-10T08:00:00.000Z',
    registeredIp: '192.168.1.100 (Internal LAN)',
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: '192.168.1.100 (Internal LAN)',
    notes: 'Superuser System Administrator & Lab Supervisor',
    approvedBy: 'System Bootstrap',
    approvedAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'usr_tech_02',
    email: 'sarah.tech@workbench.local',
    fullName: 'Sarah Chen',
    techCallsign: 'BENCH-04',
    role: 'lead_tech',
    status: 'active',
    passwordHash: 'tech123',
    registeredAt: '2026-02-14T11:20:00.000Z',
    registeredIp: '73.189.42.11 (San Francisco, US)',
    lastLoginAt: '2026-08-19T14:30:00.000Z',
    lastLoginIp: '73.189.42.11',
    notes: 'Lead SMT soldering & GPU micro-repair specialist',
    approvedBy: 'Master Supervisor',
    approvedAt: '2026-02-14T12:00:00.000Z'
  },
  {
    id: 'usr_pending_03',
    email: 'alex.rivera@service.net',
    fullName: 'Alex Rivera',
    techCallsign: 'FIELD-RIVERA',
    role: 'bench_tech',
    status: 'pending',
    passwordHash: 'rivera2026',
    registeredAt: '2026-08-20T03:15:22.000Z',
    registeredIp: '198.51.100.45 (Austin, TX)',
    notes: 'Field technician applying for motherboard diagnostic access',
  },
  {
    id: 'usr_pending_04',
    email: 'jordan.k@hardware-repairs.io',
    fullName: 'Jordan Klein',
    techCallsign: 'J-KLEIN',
    role: 'trainee',
    status: 'pending',
    passwordHash: 'jordan99',
    registeredAt: '2026-08-20T04:45:10.000Z',
    registeredIp: '203.0.113.88 (Chicago, IL)',
    notes: 'Junior bench trainee requesting access to error code matrix and PSU tools',
  }
];

export const INITIAL_AUDIT_LOGS: SecurityAuditLog[] = [
  {
    id: 'log_001',
    timestamp: '2026-08-20 04:45:10',
    userEmail: 'jordan.k@hardware-repairs.io',
    action: 'USER_REGISTER_REQUEST',
    ip: '203.0.113.88',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    details: 'New registration submitted. Status set to Pending Approval.',
    severity: 'info'
  },
  {
    id: 'log_002',
    timestamp: '2026-08-20 03:15:22',
    userEmail: 'alex.rivera@service.net',
    action: 'USER_REGISTER_REQUEST',
    ip: '198.51.100.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    details: 'New registration submitted. Status set to Pending Approval.',
    severity: 'info'
  },
  {
    id: 'log_003',
    timestamp: '2026-08-19 14:30:00',
    userId: 'usr_tech_02',
    userEmail: 'sarah.tech@workbench.local',
    action: 'USER_LOGIN_SUCCESS',
    ip: '73.189.42.11',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: 'Authenticated successfully via technician portal.',
    severity: 'info'
  },
  {
    id: 'log_004',
    timestamp: '2026-08-18 09:12:44',
    userId: 'usr_admin_01',
    userEmail: 'admin@workbench.local',
    action: 'SYSTEM_SETTINGS_UPDATED',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    details: 'Shop tax rate and diagnostic work order policy updated.',
    severity: 'info'
  }
];

// Helper to fetch live client IP
export async function getClientIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      if (data.ip) return data.ip;
    }
  } catch (e) {
    // Fallback simulation when offline or blocked by adblockers
  }
  
  // Return deterministic local/network IP heuristic
  return '192.168.1.' + (10 + Math.floor(Math.random() * 89)) + ' (Local Client)';
}
