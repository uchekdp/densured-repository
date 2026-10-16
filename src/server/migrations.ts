import fs from 'fs';
import path from 'path';
import { DatabaseSchema, getDb, saveDb } from './db';
import { createDatabaseBackup } from './backup';

const MIGRATIONS_FILE = path.resolve(process.cwd(), 'data', 'migrations.json');

export interface MigrationRecord {
  id: string;
  name: string;
  appliedAt: string;
  recordsAffected: number;
  description: string;
}

export function getAppliedMigrations(): MigrationRecord[] {
  if (!fs.existsSync(MIGRATIONS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(MIGRATIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordMigration(migration: MigrationRecord): void {
  const current = getAppliedMigrations();
  current.push(migration);
  fs.writeFileSync(MIGRATIONS_FILE, JSON.stringify(current, null, 2), 'utf-8');
}

/**
 * Migration 001: Non-destructive addition of data retention, archival, and financial cycle fields
 */
function migration001_DataRetentionAndArchivalFields(db: DatabaseSchema): number {
  let count = 0;

  // Add safe defaults to all student records
  for (const student of db.students || []) {
    let modified = false;
    const s = student as any;
    if (s.is_deleted === undefined) {
      s.is_deleted = false;
      modified = true;
    }
    if (s.is_archived === undefined) {
      s.is_archived = false;
      modified = true;
    }
    if (!s.data_retention_policy) {
      s.data_retention_policy = 'Standard Academic Archive';
      modified = true;
    }
    if (!s.tuition_cycle) {
      s.tuition_cycle = 'Recurring Monthly';
      modified = true;
    }
    if (modified) count++;
  }

  // Add safe defaults to payment records
  for (const payment of db.payments || []) {
    let modified = false;
    const p = payment as any;
    if (p.is_archived === undefined) {
      p.is_archived = false;
      modified = true;
    }
    if (p.verified_amount === undefined && p.amount) {
      p.verified_amount = p.status === 'Approved' ? p.amount : 0;
      modified = true;
    }
    if (modified) count++;
  }

  return count;
}

/**
 * Runs all pending incremental migrations safely.
 * Never drops tables, resets collections, or deletes data.
 */
export function runPendingMigrations(): MigrationRecord[] {
  const applied = getAppliedMigrations();
  const appliedIds = new Set(applied.map((m) => m.id));
  const newlyApplied: MigrationRecord[] = [];

  const migrations: Array<{
    id: string;
    name: string;
    description: string;
    run: (db: DatabaseSchema) => number;
  }> = [
    {
      id: 'migration_001_data_retention_fields',
      name: 'Add Data Retention, Archival & Financial Cycle Fields',
      description: 'Safely adds non-destructive archival and monthly cycle fields to students and payments.',
      run: migration001_DataRetentionAndArchivalFields,
    },
  ];

  for (const mig of migrations) {
    if (!appliedIds.has(mig.id)) {
      // Step 4: Back up production data before any migration
      createDatabaseBackup(`pre-migration-${mig.id}`);

      const db = getDb();
      const affected = mig.run(db);
      saveDb(db);

      const record: MigrationRecord = {
        id: mig.id,
        name: mig.name,
        appliedAt: new Date().toISOString(),
        recordsAffected: affected,
        description: mig.description,
      };

      recordMigration(record);
      newlyApplied.push(record);
      console.log(`[Migration] Applied ${mig.id}: ${affected} records updated non-destructively.`);
    }
  }

  return newlyApplied;
}
