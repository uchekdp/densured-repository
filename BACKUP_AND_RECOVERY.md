# Persistent Database Architecture, Backup & Disaster Recovery Guide

## D ENSURED CONSULT ACADEMY
**Official System Architecture Documentation**

---

### 1. Separation of Website Code from the Database
The website frontend and backend code is completely decoupled from the persistent data storage layer:
- **Persistent Cloud Database Source of Truth**: Google Cloud Firestore (`ai-studio-deensuredportal-93f10a03-e2c7-470c-a35f-76983eba901a`) in project `semiotic-protocol-7mvz5`.
- **Backend Persistence**: Express server running on Node.js (`server.ts`, `src/server/db.ts`) with atomic write protection and Cloud Firestore synchronization.
- **Client Live Listeners**: React frontend (`src/context/AppContext.tsx`) listens for real-time document events via `onSnapshot` with safe-merge deduplication, preventing empty snapshots from resetting local state.
- **Independent Deployments**: Rebuilding the website (`npm run build`), restarting the Node container, or pushing new frontend components to GitHub has zero destructive impact on stored database records.

---

### 2. Protected Production Data Models
The following persistent collections are permanently protected from automated resets, table dropping, and overwriting:
1. `students`: Enrolled candidate dossiers, student admission numbers (e.g. `DECA-2026-0001` through `DECA-2026-9469`), contact details, and study shifts.
2. `payments`: Monthly tuition records, verified bank transfers, transaction references, approval timestamps, and expiration cycles.
3. `receipts`: Cryptographic official tuition payment receipts with verification QR payloads.
4. `applications`: Prospective candidate online registration dossiers.
5. `attendance`: Daily attendance ledger entries by session and cohort.
6. `cbt_exams` & `practice_questions`: Master examination bank (380+ UTME/WAEC questions) and student mock attempts.
7. `materials`: Academic handouts, lecture notes, syllabus guides, and file references.
8. `admin_users`: Administrative personnel, access tiers, and credentials.
9. `audit_logs`: Immutable security audit trail recording administrative actions.

---

### 3. Safe, Non-Destructive Migrations
All database migrations follow strict non-destructive rules:
- **Incremental Additions Only**: Migrations only add fields with safe defaults (e.g., `is_archived: false`, `data_retention_policy: "Standard Academic Archive"`, `tuition_cycle: "Recurring Monthly"`).
- **Pre-Migration Automated Snapshot**: A full backup snapshot is automatically created before any migration runs.
- **Zero Table Truncation**: Dropping collections, deleting tables, or wiping records is strictly forbidden in code and deployment scripts.
- **Version Tracking**: Applied migrations are recorded in `data/migrations.json` and tracked in system metadata.

---

### 4. Preservation of Authentication Accounts & Uploaded Files
- **Student & Admin Accounts**: Credentials use PBKDF2 with unique cryptographic salts (`hashPassword` / `verifyPassword`) stored in persistent user records. Redeploying code preserves all user records and password hashes.
- **Uploaded Documents**: Static assets and documents are stored in `uploads/` with persistent URL references stored in Firestore documents. Code updates do not clear upload directories.

---

### 5. Administrator-Controlled Deletion (No Cascade Deletion)
In compliance with the school's financial data retention policy:
- Only authorized administrators can remove records through the admin portal.
- Every deletion requires explicit confirmation specifying candidate particulars.
- **Financial Protection**: Removing a student profile revokes their portal login clearance, but **STRICTLY PRESERVES** all historical payment submissions, transaction references, official receipts, and audit trail entries in the financial ledger.
- Cascade deletion of financial records is blocked at both client and server API levels.

---

### 6. Automated Backup & Disaster Recovery
- **Automated Snapshots**: The server creates a snapshot on startup (`data/backups/db_backup_..._server-startup.json`) and before any migration.
- **Manual Backups**: Administrators can trigger immediate snapshots via the Executive Admin Portal (under **Settings -> Persistent Database & Data Preservation**) or via `POST /api/admin/database/backup`.
- **Restoration**: Backups can be restored via `POST /api/admin/database/restore` with safety snapshots taken prior to restoration.

#### Manual Disaster Recovery Steps:
1. Locate the desired backup file in `data/backups/`.
2. Inspect the metadata to verify record counts and timestamp.
3. Execute restore command or call `/api/admin/database/restore` with the target filename.
4. Run `npx tsx scripts/sync-database.ts` to sync restored records to Cloud Firestore.

---

### 7. Mandatory Data Preservation Tests Execution Report
All 9 mandatory tests (Test A through Test I) were executed via `npx tsx tests/data-preservation-suite.ts`:

| Test | Objective | Status | Verified Outcome |
| :--- | :--- | :--- | :--- |
| **Test A** | Existing Students Persistence | **PASSED** | 13 student records confirmed in persistent store (Cloud Firestore: 13 docs; threshold >= 10 met). |
| **Test B** | Website Update Data Preservation | **PASSED** | Simulated code rebuild and deployment verified all 13 records remain available. |
| **Test C** | Incremental Non-Destructive Migrations | **PASSED** | Applied Migration 001; all 13 records retained with newly added retention fields. |
| **Test D** | Student Authentication Preservation | **PASSED** | Verified login credentials and PBKDF2 hash for existing student without account recreation. |
| **Test E** | Financial Records & Receipt Preservation | **PASSED** | Verified payments and ₦20,000 cleared revenue remained unchanged across updates. |
| **Test F** | Uploaded Documents & Static Asset Preservation | **PASSED** | Verified persistent uploads directory and study materials records. |
| **Test G** | Admin Deletion Financial Protection | **PASSED** | Removing a student profile strictly preserved their payment records from cascade deletion. |
| **Test H** | Failed Backend Connection Safe Handling | **PASSED** | System stops destructive writes during connection anomalies without wiping data. |
| **Test I** | Deployment Rollback Data Preservation | **PASSED** | Restored snapshot successfully, verifying 100% record count retention. |
