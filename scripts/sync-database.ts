import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import fs from 'fs';
import path from 'path';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export async function syncDatabase() {
  const dbPath = path.resolve(process.cwd(), 'data', 'db.json');
  if (!fs.existsSync(dbPath)) {
    console.error('db.json not found');
    return;
  }
  const localDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // 1. Fetch all Firestore students
  const firestoreStudents = new Map<string, any>();
  const snap = await getDocs(collection(db, 'students'));
  snap.forEach((d) => {
    firestoreStudents.set(d.id, { id: d.id, ...d.data() });
    const reg = d.data().registrationNumber || d.data().student_id;
    if (reg) firestoreStudents.set(reg, { id: d.id, ...d.data() });
  });

  console.log('Existing Firestore doc count:', snap.size);

  // 2. Upload local students to Firestore if not already present
  let uploadedCount = 0;
  for (const s of localDb.students || []) {
    const reg = s.student_id;
    if (!firestoreStudents.has(s.id) && !firestoreStudents.has(reg)) {
      const studentDoc = {
        id: s.id,
        registrationNumber: s.student_id,
        fullName: s.full_name,
        firstName: s.first_name,
        lastName: s.last_name,
        email: s.email,
        phone: s.phone,
        program: s.preferred_programme || 'UTME',
        studentShift: 'Morning',
        monthlyFee: 20000,
        subscriptionStatus: s.status === 'Active' ? 'Active' : s.status === 'Payment Expired' ? 'Payment Expired' : 'Pending Approval',
        subscriptionMonth: 'October 2026',
        tuitionPaid: s.status === 'Active' ? 20000 : 0,
        tuitionBalance: s.status === 'Active' ? 0 : 20000,
        residentialAddress: s.residential_address || '',
        stateOfOrigin: s.state || '',
        lga: s.lga || '',
        dateOfBirth: s.date_of_birth || '',
        gender: s.gender || '',
        parentName: s.parent_name || '',
        parentPhone: s.parent_phone || '',
        parentEmail: s.parent_email || '',
        createdAt: s.registration_date || new Date().toISOString(),
      };
      await setDoc(doc(db, 'students', s.student_id), studentDoc);
      uploadedCount++;
      console.log('Uploaded local student to Firestore:', s.student_id, s.full_name);
    }
  }

  // 3. For any Firestore student not in localDb, add them to localDb
  let addedToLocal = 0;
  const existingLocalRegs = new Set((localDb.students || []).map((s: any) => s.student_id));
  const seenRegs = new Set<string>();

  for (const [, fStudent] of firestoreStudents.entries()) {
    const reg = fStudent.registrationNumber || fStudent.student_id || fStudent.id;
    if (!reg || seenRegs.has(reg)) continue;
    seenRegs.add(reg);

    if (!existingLocalRegs.has(reg)) {
      const newLocalStudent = {
        id: fStudent.id || `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        student_id: reg,
        user_id: `usr-${reg.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        first_name: fStudent.firstName || (fStudent.fullName || '').split(' ')[0] || 'Candidate',
        middle_name: '',
        last_name: fStudent.lastName || (fStudent.fullName || '').split(' ').slice(1).join(' ') || '',
        full_name: fStudent.fullName || 'Candidate',
        date_of_birth: fStudent.dateOfBirth || '2007-01-01',
        gender: fStudent.gender || 'Male',
        phone: fStudent.phone || '08000000000',
        email: fStudent.email || `${reg.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.dec.ng`,
        residential_address: fStudent.residentialAddress || 'Lagos, Nigeria',
        state: fStudent.stateOfOrigin || 'Lagos',
        lga: fStudent.lga || 'Ojo',
        photo_url: fStudent.photoUrl || '',
        parent_name: fStudent.parentName || 'Parent / Guardian',
        parent_relationship: 'Parent',
        parent_phone: fStudent.parentPhone || '08000000000',
        parent_email: fStudent.parentEmail || '',
        parent_address: fStudent.residentialAddress || 'Lagos, Nigeria',
        emergency_contact: fStudent.phone || '08000000000',
        current_school: 'Secondary School',
        current_class: 'SS3 / Graduate',
        intended_exam: fStudent.program || 'UTME',
        preferred_programme: fStudent.program || 'UTME',
        subjects: ['Use of English', 'Mathematics', 'Physics', 'Chemistry'],
        registration_date: fStudent.createdAt || new Date().toISOString(),
        status: fStudent.subscriptionStatus === 'Active' ? 'Active' : 'Pending Payment',
      };
      localDb.students.push(newLocalStudent);
      existingLocalRegs.add(reg);
      addedToLocal++;
      console.log('Added Firestore student to local DB:', reg, fStudent.fullName);

      // Ensure user credentials record exists
      if (!localDb.users.some((u: any) => u.email === newLocalStudent.email || u.student_id === reg)) {
        localDb.users.push({
          id: newLocalStudent.user_id,
          role: 'student',
          email: newLocalStudent.email,
          student_id: reg,
          name: newLocalStudent.full_name,
          password_hash: '5d41402abc4b2a76b9719d911017c592',
          salt: 'safe_salt',
          status: 'active',
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  // Also ensure payments are uploaded to Firestore
  for (const p of localDb.payments || []) {
    await setDoc(
      doc(db, 'payments', p.id),
      {
        id: p.id,
        reference: p.reference,
        studentId: p.student_id,
        studentName: p.student_name,
        amount: p.amount,
        status: p.status,
        paymentMethod: p.method || 'Bank Transfer',
        monthPeriod: p.payment_month || 'October 2026',
        timestamp: p.payment_date || new Date().toISOString(),
      },
      { merge: true }
    );
  }

  // Save updated local database
  fs.writeFileSync(dbPath, JSON.stringify(localDb, null, 2), 'utf8');
  console.log(`Sync complete. Uploaded: ${uploadedCount}, Added to local: ${addedToLocal}. Total students: ${localDb.students.length}`);
}

syncDatabase()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
