import fs from 'fs';
import path from 'path';
import { DatabaseSchema, getDb, saveDb } from './db';

const BACKUP_DIR = path.resolve(process.cwd(), 'data', 'backups');
const MAX_BACKUPS = 30;

function ensureBackupDir(): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

export interface BackupInfo {
  filename: string;
  filepath: string;
  size: number;
  createdAt: string;
  studentsCount: number;
  paymentsCount: number;
  receiptsCount: number;
  reason?: string;
}

/**
 * Creates a timestamped, non-destructive backup of the entire database.
 */
export function createDatabaseBackup(reason = 'manual'): BackupInfo {
  ensureBackupDir();
  const db = getDb();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `db_backup_${timestamp}_${reason.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
  const filepath = path.join(BACKUP_DIR, filename);

  const payload = {
    metadata: {
      createdAt: new Date().toISOString(),
      reason,
      version: '2.0.0',
      system: 'D ENSURED CONSULT ACADEMY Persistent Ledger',
      recordCounts: {
        students: (db.students || []).length,
        users: (db.users || []).length,
        payments: (db.payments || []).length,
        receipts: (db.receipts || []).length,
        attendance: (db.attendance || []).length,
        cbtTests: (db.cbt_tests || []).length,
        studyMaterials: (db.study_materials || []).length,
        announcements: (db.announcements || []).length,
      },
    },
    data: db,
  };

  fs.writeFileSync(filepath, JSON.stringify(payload, null, 2), 'utf-8');
  const stats = fs.statSync(filepath);

  // Rotate old backups to keep at most MAX_BACKUPS
  rotateOldBackups();

  return {
    filename,
    filepath,
    size: stats.size,
    createdAt: new Date().toISOString(),
    studentsCount: (db.students || []).length,
    paymentsCount: (db.payments || []).length,
    receiptsCount: (db.receipts || []).length,
    reason,
  };
}

/**
 * Lists all existing database backups ordered from newest to oldest.
 */
export function listDatabaseBackups(): BackupInfo[] {
  ensureBackupDir();
  const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json'));

  const result: BackupInfo[] = [];
  for (const filename of files) {
    const filepath = path.join(BACKUP_DIR, filename);
    try {
      const stats = fs.statSync(filepath);
      const raw = fs.readFileSync(filepath, 'utf-8');
      const parsed = JSON.parse(raw);
      const meta = parsed.metadata || {};
      result.push({
        filename,
        filepath,
        size: stats.size,
        createdAt: meta.createdAt || stats.mtime.toISOString(),
        studentsCount: meta.recordCounts?.students ?? (parsed.data?.students || parsed.students || []).length,
        paymentsCount: meta.recordCounts?.payments ?? (parsed.data?.payments || parsed.payments || []).length,
        receiptsCount: meta.recordCounts?.receipts ?? (parsed.data?.receipts || parsed.receipts || []).length,
        reason: meta.reason || 'snapshot',
      });
    } catch {
      // Ignore unparseable files
    }
  }

  // Sort descending by creation date
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Restores the database from a verified backup snapshot.
 */
export function restoreDatabaseBackup(filename: string): { success: boolean; message: string; recordCount: number } {
  ensureBackupDir();
  const safeFilename = path.basename(filename);
  const filepath = path.join(BACKUP_DIR, safeFilename);

  if (!fs.existsSync(filepath)) {
    throw new Error(`Backup file "${safeFilename}" was not found.`);
  }

  // Before restoring, take a safety backup of current state
  createDatabaseBackup('pre-restore-safety-snapshot');

  const raw = fs.readFileSync(filepath, 'utf-8');
  const parsed = JSON.parse(raw);
  const restoredDb: DatabaseSchema = parsed.data || parsed;

  if (!restoredDb || !Array.isArray(restoredDb.students)) {
    throw new Error('Invalid backup file schema: missing students array.');
  }

  saveDb(restoredDb);

  return {
    success: true,
    message: `Database successfully restored from ${safeFilename}`,
    recordCount: restoredDb.students.length,
  };
}

function rotateOldBackups(): void {
  try {
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_BACKUPS) {
      const toDelete = files.slice(MAX_BACKUPS);
      for (const item of toDelete) {
        fs.unlinkSync(item.path);
      }
    }
  } catch (e) {
    console.error('Error rotating old backups:', e);
  }
}
