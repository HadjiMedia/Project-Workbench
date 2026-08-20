import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  query, 
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, SecurityAuditLog, JobTicket } from '../types';
import { INITIAL_USERS, INITIAL_AUDIT_LOGS } from '../data/usersData';
import { INITIAL_TICKETS } from '../data/sampleTickets';

const USERS_COLLECTION = 'wb_users';
const AUDIT_COLLECTION = 'wb_audit_logs';
const TICKETS_COLLECTION = 'wb_tickets';

// Seed initial system users if Firestore collection is completely empty
export async function seedInitialDataIfEmpty() {
  try {
    const seeded = localStorage.getItem('wb_cloud_seeded_v2');
    if (seeded) return;

    const userSnap = await getDocs(collection(db, USERS_COLLECTION));
    if (userSnap.empty) {
      const batch = writeBatch(db);
      for (const user of INITIAL_USERS) {
        const docRef = doc(db, USERS_COLLECTION, user.id);
        batch.set(docRef, user);
      }
      for (const log of INITIAL_AUDIT_LOGS) {
        const docRef = doc(db, AUDIT_COLLECTION, log.id);
        batch.set(docRef, log);
      }
      for (const ticket of INITIAL_TICKETS) {
        const docRef = doc(db, TICKETS_COLLECTION, ticket.id);
        batch.set(docRef, ticket);
      }
      await batch.commit();
    }
    localStorage.setItem('wb_cloud_seeded_v2', 'true');
  } catch (error) {
    console.warn('Firebase auto-seed notice (offline or initial connection):', error);
  }
}

// Real-time Users Listener
export function subscribeToUsers(onUpdate: (users: User[]) => void) {
  try {
    const q = query(collection(db, USERS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((docSnap) => {
        usersList.push(docSnap.data() as User);
      });
      // Sort: pending first, then by date
      usersList.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
      });
      onUpdate(usersList);
    }, (error) => {
      console.warn('Firestore users subscription error:', error);
    });
  } catch (err) {
    console.warn('Failed to subscribe to firestore users:', err);
    return () => {};
  }
}

// Save or Update a single user in Cloud Firestore
export async function saveUserToCloud(user: User): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    throw error;
  }
}

// Update multiple users in Cloud Firestore
export async function updateUsersInCloud(users: User[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const user of users) {
      const userRef = doc(db, USERS_COLLECTION, user.id);
      batch.set(userRef, user, { merge: true });
    }
    await batch.commit();
  } catch (error) {
    console.error('Error updating users batch in Firestore:', error);
  }
}

// Delete user from Cloud Firestore
export async function deleteUserFromCloud(userId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user from Firestore:', error);
  }
}

// Bulk delete multiple users from Cloud Firestore
export async function deleteUsersFromCloud(userIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const userId of userIds) {
      const userRef = doc(db, USERS_COLLECTION, userId);
      batch.delete(userRef);
    }
    await batch.commit();
  } catch (error) {
    console.error('Error deleting users batch from Firestore:', error);
  }
}

// Real-time Audit Logs Listener
export function subscribeToAuditLogs(onUpdate: (logs: SecurityAuditLog[]) => void) {
  try {
    const q = query(collection(db, AUDIT_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const logsList: SecurityAuditLog[] = [];
      snapshot.forEach((docSnap) => {
        logsList.push(docSnap.data() as SecurityAuditLog);
      });
      // Sort newest first
      logsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(logsList);
    }, (error) => {
      console.warn('Firestore audit logs subscription error:', error);
    });
  } catch (err) {
    console.warn('Failed to subscribe to audit logs:', err);
    return () => {};
  }
}

// Add Audit Log to Cloud Firestore
export async function addAuditLogToCloud(log: SecurityAuditLog): Promise<void> {
  try {
    const logRef = doc(db, AUDIT_COLLECTION, log.id);
    await setDoc(logRef, log);
  } catch (error) {
    console.error('Error adding audit log to Firestore:', error);
  }
}

// Real-time Tickets Listener (Live multi-user sync)
export function subscribeToTickets(onUpdate: (tickets: JobTicket[]) => void) {
  try {
    const q = query(collection(db, TICKETS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const ticketList: JobTicket[] = [];
      snapshot.forEach((docSnap) => {
        ticketList.push(docSnap.data() as JobTicket);
      });
      // Sort newest first by creation timestamp or fallback
      ticketList.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      onUpdate(ticketList);
    }, (error) => {
      console.warn('Firestore tickets subscription error:', error);
    });
  } catch (err) {
    console.warn('Failed to subscribe to tickets:', err);
    return () => {};
  }
}

// Save or Update a single ticket in Cloud Firestore
export async function saveTicketToCloud(ticket: JobTicket): Promise<void> {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, ticket.id);
    await setDoc(ticketRef, ticket, { merge: true });
  } catch (error) {
    console.error('Error saving ticket to Firestore:', error);
  }
}

// Delete single ticket from Cloud Firestore
export async function deleteTicketFromCloud(ticketId: string): Promise<void> {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
    await deleteDoc(ticketRef);
  } catch (error) {
    console.error('Error deleting ticket from Firestore:', error);
  }
}

// Bulk delete multiple tickets from Cloud Firestore
export async function deleteTicketsFromCloud(ticketIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const ticketId of ticketIds) {
      const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
      batch.delete(ticketRef);
    }
    await batch.commit();
  } catch (error) {
    console.error('Error deleting tickets batch from Firestore:', error);
  }
}

// Save tickets batch
export async function saveTicketsInCloud(tickets: JobTicket[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const ticket of tickets) {
      const ticketRef = doc(db, TICKETS_COLLECTION, ticket.id);
      batch.set(ticketRef, ticket, { merge: true });
    }
    await batch.commit();
  } catch (error) {
    console.error('Error updating tickets batch in Firestore:', error);
  }
}
