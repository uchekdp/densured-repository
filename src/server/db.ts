import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  role: 'admin' | 'student';
  email: string;
  student_id?: string;
  name: string;
  password_hash: string;
  salt: string;
  status: 'active' | 'pending_payment' | 'suspended';
  created_at: string;
}

export interface StudentRecord {
  id: string;
  student_id: string;
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  residential_address: string;
  state: string;
  lga: string;
  photo_url: string;
  avatar?: string;
  
  parent_name: string;
  parent_relationship: string;
  parent_phone: string;
  parent_email: string;
  parent_address: string;
  emergency_contact: string;

  current_school: string;
  current_class: string;
  previous_school?: string;
  intended_exam: string;
  preferred_programme: string;
  subjects: string[];

  registration_date: string;
  status: 'Pending Payment' | 'Active' | 'Payment Expired' | 'Suspended';
}

export interface PaymentRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_phone?: string;
  student_email?: string;
  program?: string;
  amount: number;
  payment_month: string;
  payment_year?: number;
  payment_date: string;
  reference: string;
  method: string;
  bank_teller_number?: string;
  proof_url?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Expired';
  submitted_date?: string;
  approval_date?: string;
  rejected_date?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  start_date?: string;
  expiry_date?: string;
  receipt_id?: string;
  receipt_number?: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
}

export interface ReceiptRecord {
  id: string;
  receipt_number: string;
  payment_id: string;
  student_id: string;
  student_name: string;
  student_email?: string;
  student_phone?: string;
  registration_number: string;
  program?: string;
  student_shift?: string;
  amount: number;
  amount_in_words?: string;
  currency: 'NGN';
  month_period: string;
  valid_until?: string;
  issue_date: string;
  approved_by: string;
  approved_at: string;
  qr_payload?: string;
  status: 'Approved';
  payment_method: string;
  photo_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  date: string;
  programme: string;
  class_name: string;
  session: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  marked_by: string;
  created_at: string;
}

export interface CBTQuestionRecord {
  id: string;
  test_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface CBTTestRecord {
  id: string;
  title: string;
  examination_type: string;
  subject: string;
  instructions: string;
  duration_minutes: number;
  question_count: number;
  status: 'published' | 'draft';
  created_at: string;
  questions?: CBTQuestionRecord[];
}

export interface CBTAttemptRecord {
  id: string;
  student_id: string;
  student_name: string;
  test_id: string;
  test_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  correct_count: number;
  wrong_count: number;
  time_used_seconds: number;
  started_at: number;
  submitted_at: string;
}

export interface StudyMaterialRecord {
  id: string;
  title: string;
  description: string;
  subject: string;
  programme: string;
  class_name: string;
  file_url: string;
  file_name: string;
  file_size: string;
  file_type: string;
  status: 'published' | 'draft';
  uploaded_at: string;
  uploaded_by: string;
  downloads_count: number;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  attachment_url?: string;
  status: 'published' | 'draft';
  created_at: string;
}

export interface AcademicProgressRecord {
  id: string;
  student_id: string;
  student_name?: string;
  subject: string;
  assessment_type: string;
  score: number;
  maximum_score: number;
  percentage: number;
  comment: string;
  date: string;
}

export interface GalleryRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  status: 'published' | 'draft';
  created_at: string;
}

export interface VideoRecord {
  id: string;
  title: string;
  description: string;
  video_url: string;
  status: 'published' | 'draft';
  created_at: string;
}

export interface AuditLogRecord {
  id: string;
  admin_name: string;
  action: string;
  details: string;
  timestamp: string;
  ip_address?: string;
}

export interface SettingsRecord {
  academy_name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  academic_session: string;
  default_tuition_fee: number;
}

export interface DatabaseSchema {
  users: UserRecord[];
  students: StudentRecord[];
  payments: PaymentRecord[];
  receipts: ReceiptRecord[];
  attendance: AttendanceRecord[];
  cbt_tests: CBTTestRecord[];
  cbt_questions: CBTQuestionRecord[];
  cbt_attempts: CBTAttemptRecord[];
  study_materials: StudyMaterialRecord[];
  announcements: AnnouncementRecord[];
  academic_progress: AcademicProgressRecord[];
  gallery: GalleryRecord[];
  videos: VideoRecord[];
  audit_logs: AuditLogRecord[];
  settings: SettingsRecord;
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'data', 'db.json');

// Password hashing utility using PBKDF2
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return computed === hash;
}

// In-memory database cache
let memoryDb: DatabaseSchema | null = null;

// Ensure database exists and is loaded
export function getDb(): DatabaseSchema {
  if (memoryDb) {
    checkPaymentExpirations(memoryDb);
    return memoryDb;
  }

  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      memoryDb = JSON.parse(raw);
      if (memoryDb) {
        checkPaymentExpirations(memoryDb);
        return memoryDb;
      }
    } catch (err) {
      console.error('Error reading db.json, generating initial database:', err);
    }
  }

  memoryDb = seedInitialDatabase();
  saveDb(memoryDb);
  return memoryDb;
}

export function saveDb(db: DatabaseSchema): void {
  memoryDb = db;
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${DB_FILE_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf-8');
    try {
      fs.renameSync(tempPath, DB_FILE_PATH);
    } catch {
      fs.copyFileSync(tempPath, DB_FILE_PATH);
      try {
        fs.unlinkSync(tempPath);
      } catch {}
    }
  } catch (err) {
    console.error('Error saving db to disk:', err);
  }
}

// Generate unique sequential Student ID: e.g. DECA-2026-0001
export function generateStudentId(db: DatabaseSchema): string {
  const year = new Date().getFullYear();
  const prefix = `DECA-${year}-`;
  const existingIds = (db.students || [])
    .map((s) => s?.student_id)
    .filter((id): id is string => typeof id === 'string' && id.startsWith(prefix));

  let maxNum = 0;
  for (const id of existingIds) {
    const parts = id.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  }

  const nextNum = maxNum + 1;
  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

// Generate unique sequential Receipt Number: e.g. DEA-REC-2026-00001
export function generateReceiptNumber(db: DatabaseSchema): string {
  const year = new Date().getFullYear();
  const prefix = `DEA-REC-${year}-`;
  const existingNumbers = (db.receipts || [])
    .map((r) => r?.receipt_number)
    .filter((num): num is string => typeof num === 'string' && num.startsWith(prefix));

  let maxNum = 0;
  for (const numStr of existingNumbers) {
    const parts = numStr.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  }

  const nextNum = maxNum + 1;
  return `${prefix}${String(nextNum).padStart(5, '0')}`;
}

// Check and update monthly payment validity (Start Date to Expiry Date)
export function checkPaymentExpirations(db: DatabaseSchema): void {
  const now = new Date();
  let updated = false;

  for (const payment of db.payments) {
    if (payment.status === 'Approved' && payment.expiry_date) {
      const expiry = new Date(payment.expiry_date);
      if (now > expiry) {
        payment.status = 'Expired';
        updated = true;
      }
    }
  }

  // Update student status based on active payments
  for (const student of db.students) {
    if (student.status === 'Suspended') continue;

    const studentApprovedPayments = db.payments.filter(
      (p) => p.student_id === student.student_id && p.status === 'Approved'
    );

    const hasActivePayment = studentApprovedPayments.some((p) => {
      if (!p.expiry_date) return false;
      return new Date(p.expiry_date) >= now;
    });

    if (hasActivePayment) {
      if (student.status !== 'Active') {
        student.status = 'Active';
        updated = true;
      }
    } else {
      const hasAnyPayment = db.payments.some((p) => p.student_id === student.student_id);
      if (hasAnyPayment) {
        if (student.status !== 'Payment Expired') {
          student.status = 'Payment Expired';
          updated = true;
        }
      } else {
        if (student.status !== 'Pending Payment') {
          student.status = 'Pending Payment';
          updated = true;
        }
      }
    }
  }

  if (updated) {
    saveDb(db);
  }
}

// Initial Database Seeding
function seedInitialDatabase(): DatabaseSchema {
  // Initial Admin Account: densuredconsultAcademy (securely hashed on server)
  const adminAuth = hashPassword('densuredconsultAcademy');

  const adminUser: UserRecord = {
    id: 'usr-admin-01',
    role: 'admin',
    email: 'Densuredconsult@gmail.com',
    name: 'Mr Akinjo Rotimi',
    password_hash: adminAuth.hash,
    salt: adminAuth.salt,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  // Student 1: Active student with approved payment for current month
  const student1Auth = hashPassword('Student1234#');
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const pastMonth = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const student1User: UserRecord = {
    id: 'usr-std-01',
    role: 'student',
    email: 'olawale.adebayo@student.dec.ng',
    student_id: 'DECA-2026-0001',
    name: 'Olawale Adebayo',
    password_hash: student1Auth.hash,
    salt: student1Auth.salt,
    status: 'active',
    created_at: new Date('2026-01-15').toISOString(),
  };

  const student1: StudentRecord = {
    id: 'std-rec-01',
    student_id: 'DECA-2026-0001',
    user_id: 'usr-std-01',
    first_name: 'Olawale',
    middle_name: 'Babajide',
    last_name: 'Adebayo',
    full_name: 'Olawale Adebayo',
    date_of_birth: '2007-04-12',
    gender: 'Male',
    phone: '+234 803 245 8891',
    email: 'olawale.adebayo@student.dec.ng',
    residential_address: '12 Doyin Plaza Road, Okomaiko, Lagos State',
    state: 'Lagos',
    lga: 'Ojo',
    photo_url: '',
    parent_name: 'Chief Emmanuel Adebayo',
    parent_relationship: 'Father',
    parent_phone: '+234 802 331 9901',
    parent_email: 'e.adebayo@gmail.com',
    parent_address: 'Block 4, Flat 2, Federal Housing Estate, Okomaiko, Lagos',
    emergency_contact: '+234 802 331 9901',
    current_school: 'Federal Government College, Ijanikin',
    current_class: 'SS3 / Graduate',
    intended_exam: 'UTME/JAMB',
    preferred_programme: 'UTME',
    subjects: ['Use of English', 'Mathematics', 'Physics', 'Chemistry'],
    registration_date: '2026-01-15',
    status: 'Active',
  };

  // Student 2: Payment expired student to verify payment expiration restriction
  const student2Auth = hashPassword('Student1234#');
  const student2User: UserRecord = {
    id: 'usr-std-02',
    role: 'student',
    email: 'chidinma.eze@student.dec.ng',
    student_id: 'DECA-2026-0002',
    name: 'Chidinma Eze',
    password_hash: student2Auth.hash,
    salt: student2Auth.salt,
    status: 'active',
    created_at: new Date('2026-01-10').toISOString(),
  };

  const student2: StudentRecord = {
    id: 'std-rec-02',
    student_id: 'DECA-2026-0002',
    user_id: 'usr-std-02',
    first_name: 'Chidinma',
    middle_name: 'Grace',
    last_name: 'Eze',
    full_name: 'Chidinma Eze',
    date_of_birth: '2008-01-22',
    gender: 'Female',
    phone: '+234 812 456 7890',
    email: 'chidinma.eze@student.dec.ng',
    residential_address: '8 Igboelerin Road, Okomaiko, Lagos',
    state: 'Lagos',
    lga: 'Ojo',
    photo_url: '',
    parent_name: 'Mrs. Ngozi Eze',
    parent_relationship: 'Mother',
    parent_phone: '+234 803 778 9912',
    parent_email: 'ngozi.eze@yahoo.com',
    parent_address: '8 Igboelerin Road, Okomaiko, Lagos',
    emergency_contact: '+234 803 778 9912',
    current_school: 'Queens College, Yaba',
    current_class: 'SS3',
    intended_exam: 'WAEC',
    preferred_programme: 'WAEC',
    subjects: ['Mathematics', 'English Language', 'Biology', 'Chemistry', 'Physics'],
    registration_date: '2026-01-10',
    status: 'Payment Expired',
  };

  // Student 3: Pending Registration / Pending Payment
  const student3Auth = hashPassword('Student1234#');
  const student3User: UserRecord = {
    id: 'usr-std-03',
    role: 'student',
    email: 'ibrahim.musa@student.dec.ng',
    student_id: 'DECA-2026-0003',
    name: 'Ibrahim Musa',
    password_hash: student3Auth.hash,
    salt: student3Auth.salt,
    status: 'pending_payment',
    created_at: new Date('2026-02-01').toISOString(),
  };

  const student3: StudentRecord = {
    id: 'std-rec-03',
    student_id: 'DECA-2026-0003',
    user_id: 'usr-std-03',
    first_name: 'Ibrahim',
    middle_name: 'Aliyu',
    last_name: 'Musa',
    full_name: 'Ibrahim Musa',
    date_of_birth: '2007-09-05',
    gender: 'Male',
    phone: '+234 809 334 1122',
    email: 'ibrahim.musa@student.dec.ng',
    residential_address: '15 Alaba Rago, Ojo, Lagos',
    state: 'Kano',
    lga: 'Nassarawa',
    photo_url: '',
    parent_name: 'Alhaji Aliyu Musa',
    parent_relationship: 'Father',
    parent_phone: '+234 803 112 3344',
    parent_email: 'aliyu.musa@gmail.com',
    parent_address: '15 Alaba Rago, Ojo, Lagos',
    emergency_contact: '+234 803 112 3344',
    current_school: 'King\'s College, Lagos',
    current_class: 'SS3',
    intended_exam: 'UTME/JAMB',
    preferred_programme: 'UTME',
    subjects: ['Use of English', 'Mathematics', 'Economics', 'Government'],
    registration_date: '2026-02-01',
    status: 'Pending Payment',
  };

  // Payments
  const receipt1: ReceiptRecord = {
    id: 'rec-001',
    receipt_number: 'DEA-REC-2026-00001',
    payment_id: 'pay-001',
    student_id: 'DECA-2026-0001',
    student_name: 'Olawale Adebayo',
    student_email: 'olawale.adebayo@student.dec.ng',
    student_phone: '+234 803 245 8891',
    registration_number: 'DECA-2026-0001',
    program: 'UTME',
    student_shift: 'Morning',
    amount: 20000,
    amount_in_words: 'TWENTY THOUSAND NAIRA ONLY',
    currency: 'NGN',
    month_period: 'October 2026',
    valid_until: nextMonth.toISOString().split('T')[0],
    issue_date: now.toISOString().split('T')[0],
    approved_by: 'Mr Akinjo Rotimi',
    approved_at: now.toISOString().split('T')[0],
    qr_payload: 'https://densuredconsult.ng/verify-receipt?receipt=DEA-REC-2026-00001&ref=PAY-DEC-2026-1049&status=APPROVED',
    status: 'Approved',
    payment_method: 'Bank Transfer (Direct)',
    created_at: now.toISOString(),
  };

  const payment1: PaymentRecord = {
    id: 'pay-001',
    student_id: 'DECA-2026-0001',
    student_name: 'Olawale Adebayo',
    student_phone: '+234 803 245 8891',
    student_email: 'olawale.adebayo@student.dec.ng',
    program: 'UTME',
    amount: 20000,
    payment_month: 'October 2026',
    payment_year: 2026,
    payment_date: now.toISOString().split('T')[0],
    reference: 'PAY-DEC-2026-1049',
    method: 'Bank Transfer (Direct)',
    status: 'Approved',
    approval_date: now.toISOString().split('T')[0],
    expiry_date: nextMonth.toISOString().split('T')[0],
    approved_by: 'Mr Akinjo Rotimi',
    receipt_id: 'rec-001',
    receipt_number: 'DEA-REC-2026-00001',
    notes: 'October 2026 Tuition Verified & Cleared',
    created_at: now.toISOString(),
  };

  const receipt2Expired: ReceiptRecord = {
    id: 'rec-002',
    receipt_number: 'DEA-REC-2026-00002',
    payment_id: 'pay-002',
    student_id: 'DECA-2026-0002',
    student_name: 'Chidinma Eze',
    student_email: 'chidinma.eze@student.dec.ng',
    student_phone: '+234 812 456 7890',
    registration_number: 'DECA-2026-0002',
    program: 'WAEC',
    student_shift: 'Morning',
    amount: 20000,
    amount_in_words: 'TWENTY THOUSAND NAIRA ONLY',
    currency: 'NGN',
    month_period: 'August 2026',
    valid_until: '2026-08-31',
    issue_date: '2026-08-01',
    approved_by: 'Mr Akinjo Rotimi',
    approved_at: '2026-08-01',
    qr_payload: 'https://densuredconsult.ng/verify-receipt?receipt=DEA-REC-2026-00002&ref=PAY-DEC-2026-0812&status=APPROVED',
    status: 'Approved',
    payment_method: 'POS Terminal',
    created_at: '2026-08-01T08:00:00.000Z',
  };

  const payment2Expired: PaymentRecord = {
    id: 'pay-002',
    student_id: 'DECA-2026-0002',
    student_name: 'Chidinma Eze',
    student_phone: '+234 812 456 7890',
    student_email: 'chidinma.eze@student.dec.ng',
    program: 'WAEC',
    amount: 20000,
    payment_month: 'August 2026',
    payment_year: 2026,
    payment_date: '2026-08-01',
    reference: 'PAY-DEC-2026-0812',
    method: 'POS Terminal',
    status: 'Expired',
    approval_date: '2026-08-01',
    expiry_date: '2026-08-31',
    approved_by: 'Mr Akinjo Rotimi',
    receipt_id: 'rec-002',
    receipt_number: 'DEA-REC-2026-00002',
    notes: 'August Tuition - Expired on 31st August 2026',
    created_at: '2026-08-01T08:00:00.000Z',
  };

  // Pending payment for Student 3 awaiting admin approval
  const payment3Pending: PaymentRecord = {
    id: 'pay-003',
    student_id: 'DECA-2026-0003',
    student_name: 'Ibrahim Musa',
    amount: 20000,
    payment_month: 'October 2026',
    payment_date: now.toISOString().split('T')[0],
    reference: 'PAY-DEC-2026-1088',
    method: 'Bank Transfer (OPAY)',
    status: 'Pending',
    notes: 'Newly submitted payment proof awaiting administrative verification',
  };

  // CBT Tests & Questions
  const cbtTest1: CBTTestRecord = {
    id: 'cbt-01',
    title: 'UTME 2026 Grand Simulation Mock 1',
    examination_type: 'UTME/JAMB',
    subject: 'Physics',
    instructions: 'JAMB 8-key CBT simulation. Answer all questions within the allocated time. Calculator not permitted.',
    duration_minutes: 30,
    question_count: 5,
    status: 'published',
    created_at: '2026-02-10',
  };

  const cbtQuestionsTest1: CBTQuestionRecord[] = [
    {
      id: 'q-101',
      test_id: 'cbt-01',
      question: 'A car accelerates uniformly from rest at 3 m/s² for 8 seconds. What distance does it cover in this time?',
      option_a: '48 m',
      option_b: '96 m',
      option_c: '192 m',
      option_d: '24 m',
      correct_answer: 'B',
      explanation: 'Using s = ut + 0.5*a*t² with u = 0: s = 0.5 * 3 * 8² = 0.5 * 3 * 64 = 96 meters.',
    },
    {
      id: 'q-102',
      test_id: 'cbt-01',
      question: 'Which of the following devices transforms electrical energy into mechanical energy?',
      option_a: 'Dynamo',
      option_b: 'Electric Motor',
      option_c: 'Transformer',
      option_d: 'Battery',
      correct_answer: 'B',
      explanation: 'An electric motor converts electrical energy into mechanical energy.',
    },
    {
      id: 'q-103',
      test_id: 'cbt-01',
      question: 'The unit of electric potential difference is the:',
      option_a: 'Ampere',
      option_b: 'Ohm',
      option_c: 'Volt',
      option_d: 'Coulomb',
      correct_answer: 'C',
      explanation: 'The SI unit of electric potential difference (voltage) is the Volt (V).',
    },
    {
      id: 'q-104',
      test_id: 'cbt-01',
      question: 'What is the frequency of a wave with velocity 340 m/s and wavelength 0.85 m?',
      option_a: '400 Hz',
      option_b: '289 Hz',
      option_c: '200 Hz',
      option_d: '800 Hz',
      correct_answer: 'A',
      explanation: 'v = f * λ => f = v / λ = 340 / 0.85 = 400 Hz.',
    },
    {
      id: 'q-105',
      test_id: 'cbt-01',
      question: 'Which of the following electromagnetic radiations has the shortest wavelength?',
      option_a: 'Radio waves',
      option_b: 'Infrared rays',
      option_c: 'Ultraviolet rays',
      option_d: 'Gamma rays',
      correct_answer: 'D',
      explanation: 'Gamma rays have the highest frequency and therefore the shortest wavelength in the electromagnetic spectrum.',
    },
  ];

  const cbtTest2: CBTTestRecord = {
    id: 'cbt-02',
    title: 'WAEC WASSCE General Mathematics Objective Drill',
    examination_type: 'WAEC',
    subject: 'Mathematics',
    instructions: 'Standard WAEC Paper 1 format. Select the correct option for each question.',
    duration_minutes: 25,
    question_count: 4,
    status: 'published',
    created_at: '2026-02-15',
  };

  const cbtQuestionsTest2: CBTQuestionRecord[] = [
    {
      id: 'q-201',
      test_id: 'cbt-02',
      question: 'If log₁₀(2) = 0.3010 and log₁₀(3) = 0.4771, calculate log₁₀(18).',
      option_a: '1.2552',
      option_b: '1.5642',
      option_c: '0.9821',
      option_d: '1.1450',
      correct_answer: 'A',
      explanation: 'log₁₀(18) = log₁₀(2 * 3²) = log₁₀(2) + 2*log₁₀(3) = 0.3010 + 2(0.4771) = 1.2552.',
    },
    {
      id: 'q-202',
      test_id: 'cbt-02',
      question: 'Solve for x in the equation 2^(2x - 1) = 32.',
      option_a: '2',
      option_b: '3',
      option_c: '4',
      option_d: '5',
      correct_answer: 'B',
      explanation: '32 = 2^5. So 2x - 1 = 5 => 2x = 6 => x = 3.',
    },
    {
      id: 'q-203',
      test_id: 'cbt-02',
      question: 'Find the quadratic equation whose roots are -3 and 5.',
      option_a: 'x² - 2x - 15 = 0',
      option_b: 'x² + 2x - 15 = 0',
      option_c: 'x² - 8x + 15 = 0',
      option_d: 'x² + 8x - 15 = 0',
      correct_answer: 'A',
      explanation: '(x - (-3))(x - 5) = (x + 3)(x - 5) = x² - 2x - 15 = 0.',
    },
    {
      id: 'q-204',
      test_id: 'cbt-02',
      question: 'The interior angles of a hexagon add up to:',
      option_a: '360°',
      option_b: '540°',
      option_c: '720°',
      option_d: '900°',
      correct_answer: 'C',
      explanation: 'Sum = (n - 2) * 180° = (6 - 2) * 180° = 4 * 180° = 720°.',
    },
  ];

  // Study Materials
  const materials: StudyMaterialRecord[] = [
    {
      id: 'mat-01',
      title: 'UTME 2026 Physics Formula Sheet & Calculation Shortcuts',
      description: 'Comprehensive formula compilation and derivation shortcuts for kinematics, optics, mechanics and nuclear physics.',
      subject: 'Physics',
      programme: 'UTME',
      class_name: 'Science Track',
      file_url: '/uploads/materials/physics-shortcuts-2026.pdf',
      file_name: 'physics-shortcuts-2026.pdf',
      file_size: '2.4 MB',
      file_type: 'PDF',
      status: 'published',
      uploaded_at: '2026-02-12',
      uploaded_by: 'Engr. Chidi Okafor',
      downloads_count: 142,
    },
    {
      id: 'mat-02',
      title: 'WAEC WASSCE Chemistry Practical Titration & Qualitative Analysis Manual',
      description: 'Step-by-step laboratory guidebook for acid-base titrations, redox reactions, gas testing, and flame tests.',
      subject: 'Chemistry',
      programme: 'WAEC',
      class_name: 'Science Track',
      file_url: '/uploads/materials/chemistry-practical-guide.pdf',
      file_name: 'chemistry-practical-guide.pdf',
      file_size: '3.1 MB',
      file_type: 'PDF',
      status: 'published',
      uploaded_at: '2026-02-18',
      uploaded_by: 'Mrs. Folashade Adeleke',
      downloads_count: 98,
    },
    {
      id: 'mat-03',
      title: 'Use of English: 250 Idioms, Registers and Lexical Pairs',
      description: 'High-frequency grammar rules, subject-verb agreement exceptions, and register vocabulary for JAMB and WAEC.',
      subject: 'Use of English',
      programme: 'UTME',
      class_name: 'All Classes',
      file_url: '/uploads/materials/english-lexical-rules.pdf',
      file_name: 'english-lexical-rules.pdf',
      file_size: '1.8 MB',
      file_type: 'PDF',
      status: 'published',
      uploaded_at: '2026-02-25',
      uploaded_by: 'Barrister T. Balogun',
      downloads_count: 210,
    },
  ];

  // Announcements
  const announcements: AnnouncementRecord[] = [
    {
      id: 'ann-01',
      title: 'Mandatory 2026 Grand National CBT Mock Examination',
      message: 'All registered UTME candidates are required to report to the CBT lab at 08:30 AM this Saturday. Biometric screening and photo ID clearance will be enforced.',
      target_audience: 'utme',
      status: 'published',
      created_at: '2026-03-01',
    },
    {
      id: 'ann-02',
      title: 'Official 2026/2027 Academic Session Timetable Released',
      message: 'Morning Shift (09:00 AM – 01:30 PM) and Evening Shift (02:00 PM – 06:30 PM) lectures have resumed in full swing. Check your subject timetables inside the portal.',
      target_audience: 'all',
      status: 'published',
      created_at: '2026-03-05',
    },
  ];

  // Attendance Initial Records
  const attendance: AttendanceRecord[] = [
    {
      id: 'att-rec-01',
      student_id: 'DECA-2026-0001',
      student_name: 'Olawale Adebayo',
      date: now.toISOString().split('T')[0],
      programme: 'UTME',
      class_name: 'Science Track',
      session: 'Morning',
      status: 'Present',
      marked_by: 'Admin Directorate',
      created_at: now.toISOString(),
    },
    {
      id: 'att-rec-02',
      student_id: 'DECA-2026-0002',
      student_name: 'Chidinma Eze',
      date: now.toISOString().split('T')[0],
      programme: 'WAEC',
      class_name: 'Science Track',
      session: 'Morning',
      status: 'Late',
      marked_by: 'Admin Directorate',
      created_at: now.toISOString(),
    },
  ];

  // Academic Progress Records
  const academicProgress: AcademicProgressRecord[] = [
    {
      id: 'prog-rec-01',
      student_id: 'DECA-2026-0001',
      student_name: 'Olawale Adebayo',
      subject: 'Physics',
      assessment_type: 'CBT Practice',
      score: 85,
      maximum_score: 100,
      percentage: 85.0,
      comment: 'Excellent understanding of kinematics and projectile motion.',
      date: '2026-02-28',
    },
    {
      id: 'prog-rec-02',
      student_id: 'DECA-2026-0001',
      student_name: 'Olawale Adebayo',
      subject: 'Chemistry',
      assessment_type: 'Class Test',
      score: 78,
      maximum_score: 100,
      percentage: 78.0,
      comment: 'Strong grasp of stoichiometry; revise organic reaction mechanisms.',
      date: '2026-03-02',
    },
  ];

  // Initial Gallery (Clean database-controlled)
  const gallery: GalleryRecord[] = [
    {
      id: 'gal-01',
      title: '120-Seat Computer-Based Testing Simulation Hall',
      description: 'Accredited CBT testing facility equipped with authentic JAMB 8-key interface workstations.',
      category: 'CBT Lab',
      image_url: '',
      status: 'published',
      created_at: '2026-01-20',
    },
    {
      id: 'gal-02',
      title: 'Science Practical Demonstration Laboratory',
      description: 'Hands-on practical apparatus for WAEC, NECO and GCE science candidate calibration.',
      category: 'Classrooms',
      image_url: '',
      status: 'published',
      created_at: '2026-01-22',
    },
  ];

  const settings: SettingsRecord = {
    academy_name: 'D Ensured Consult Academy',
    tagline: 'Learn, Emerge and Succeed.',
    address: 'Doyin Plaza, Igboelerin Bus Stop, Beside Prime-Mart, Okomaiko, Lagos State',
    phone: '08147896930',
    email: 'Densuredconsult@gmail.com',
    academic_session: '2026/2027 Academic Session',
    default_tuition_fee: 20000,
  };

  return {
    users: [adminUser, student1User, student2User, student3User],
    students: [student1, student2, student3],
    payments: [payment1, payment2Expired, payment3Pending],
    receipts: [receipt1, receipt2Expired],
    attendance,
    cbt_tests: [cbtTest1, cbtTest2],
    cbt_questions: [...cbtQuestionsTest1, ...cbtQuestionsTest2],
    cbt_attempts: [],
    study_materials: materials,
    announcements,
    academic_progress: academicProgress,
    gallery,
    videos: [],
    audit_logs: [
      {
        id: 'log-001',
        admin_name: 'Mr Akinjo Rotimi (Directorate Admin)',
        action: 'System Database Initialized',
        details: 'Initial database seed created with default academic session and tuition parameters.',
        timestamp: new Date().toISOString(),
      },
    ],
    settings,
  };
}

export function addAuditLog(
  db: DatabaseSchema,
  action: string,
  details: string,
  adminName: string = 'Mr Akinjo Rotimi (Directorate Admin)',
  ipAddress?: string
): void {
  if (!db.audit_logs) db.audit_logs = [];
  db.audit_logs.unshift({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    admin_name: adminName,
    action,
    details,
    timestamp: new Date().toISOString(),
    ip_address: ipAddress,
  });
}
