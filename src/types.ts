export type PageId =
  | 'home'
  | 'about'
  | 'services'
  | 'gallery'
  | 'admission'
  | 'contact'
  | 'register'
  | 'student-login'
  | 'admin-login'
  | 'student-portal'
  | 'admin-portal';

export type ExamProgram = 'UTME' | 'WAEC' | 'NECO' | 'GCE' | 'IELTS' | 'ADULT_EDUCATION' | 'COMBINED_OLEVEL_UTME' | 'ATSWA' | 'TOEFL' | 'SAT' | string;

export type StudyMode = 'Physical Weekday' | 'Weekend Intensive' | 'Online Virtual Live' | 'Private 1-on-1';

export type StudentShift = 'Morning' | 'Evening';

export interface AdmissionApplication {
  id: string;
  fullName: string;
  surname?: string;
  firstName?: string;
  middleName?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female';
  maritalStatus?: 'Single' | 'Married';
  bloodGroup?: string;
  genotype?: string;
  nationality?: string;
  stateOfOrigin: string;
  lga?: string;
  hometown?: string;
  nin?: string;
  residentialAddress?: string;
  disabilityStatus?: string;
  parentName: string;
  parentPhone: string;
  parentRelationship?: string;
  parentEmail?: string;
  parentOccupation?: string;
  parentAddress?: string;
  secondarySchool?: string;
  graduationYear?: string;
  olevelStatus?: 'Result Available' | 'Awaiting Result (AR)';
  olevelExamBoard?: string;
  olevelExamYear?: string;
  olevelCenterNumber?: string;
  olevelCandidateNumber?: string;
  olevelGrades?: { subject: string; grade: string }[];
  program: ExamProgram;
  studyMode: StudyMode;
  studentShift?: StudentShift;
  academicSession?: string;
  targetInstitution?: string;
  targetCourse?: string;
  secondChoiceInstitution?: string;
  secondChoiceCourse?: string;
  thirdChoiceInstitution?: string;
  preferredExamTown?: string;
  subjectCombinations?: string[];
  submittedAt: string;
  status: 'Pending Review' | 'Pending' | 'Approved' | 'Interview Scheduled' | 'Enrolled' | 'Rejected';
  enrollmentStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentStatus?: 'NOT_PAID' | 'PENDING' | 'APPROVED' | 'EXPIRED' | 'REJECTED';
  student_id?: string;
  targetScore?: string;
  targetExamDate?: string;
  address?: string;
  subjects?: string[];
  notes?: string;
  assignedCohort?: string;
  password?: string;
  ieltsModule?: 'Academic' | 'General Training';
  ieltsTargetBand?: string;
  ieltsFocusArea?: string;
  destinationCountry?: string;
  jambProfileCode?: string;
  passportNumber?: string;
  passportExpiry?: string;
  passportPhotoUrl?: string;
  avatar?: string;
  photoUrl?: string;
  photo_url?: string;
  atswaStage?: string;
  satCollegeBoardId?: string;
}

export interface SubjectScore {
  subject: string;
  score: number;
  maxScore: number;
  grade?: string;
  trend: 'up' | 'down' | 'stable';
  teacherFeedback: string;
}

export interface MockTestResult {
  id: string;
  title: string;
  date: string;
  program: ExamProgram;
  totalScore: number;
  maxScore: number;
  percentage: number;
  percentile: number;
  subjects: SubjectScore[];
  status: 'Completed' | 'Pending Review';
}

export interface ScheduledLesson {
  id: string;
  title: string;
  subject: string;
  program: ExamProgram;
  tutorName: string;
  tutorAvatar?: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string; // e.g. "09:00 AM - 11:30 AM"
  room: string; // e.g. "CBT Hall A" or "Virtual Zoom Room 2"
  isLiveOnline: boolean;
  zoomLink?: string;
  materialsCount: number;
  topicSummary: string;
}

export interface OfficialReceipt {
  id: string;
  receiptNumber: string; // e.g. "DEC-REC-2026-8941"
  transactionReference: string; // e.g. "DEC-PAY-491024"
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  registrationNumber: string;
  program: string;
  studentShift: StudentShift;
  amount: number; // 20000 or 15000
  amountInWords: string;
  currency: 'NGN';
  monthPeriod: string; // e.g. "September 2026"
  validUntil: string; // e.g. "September 30, 2026"
  issueDate: string;
  approvedBy: string;
  approvedAt: string;
  qrPayload: string;
  status: 'Approved' | 'Pending Verification';
  paymentMethod: string;
  studentAvatar?: string;
  photoUrl?: string;
}

export interface TransactionRecord {
  id: string;
  reference: string;
  studentId: string;
  studentName: string;
  program: ExamProgram | string;
  amount: number;
  currency: 'NGN' | 'USD';
  status: 'Successful' | 'Pending' | 'Failed';
  paymentMethod: 'Paystack Card' | 'Bank Transfer' | 'USSD' | 'Cash / POS';
  description: string;
  timestamp: string;
  date?: string;
  type?: string;
  receiptUrl?: string;
  receiptNumber?: string;
  studentShift?: StudentShift;
  monthPeriod?: string;
  validUntil?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  qrPayload?: string;
}

export interface StudentProfile {
  id: string;
  registrationNumber: string; // e.g. "DEC-2025-0142"
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  photoUrl?: string;
  photo_url?: string;
  passportPhotoUrl?: string;
  program: ExamProgram;
  studyMode: StudyMode;
  studentShift: StudentShift;
  monthlyFee: number; // 20000 for Morning, 15000 for Evening
  enrollmentStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentStatus?: 'NOT_PAID' | 'PENDING' | 'APPROVED' | 'EXPIRED' | 'REJECTED';
  paymentExpiryDate?: string;
  paymentMonth?: string;
  rejectionReason?: string;
  subscriptionStatus: 'Active' | 'Pending Approval' | 'Expired' | 'Unpaid';
  subscriptionExpiryDate?: string;
  subscriptionMonth?: string;
  hasFirstPaymentApproved?: boolean;
  lastApprovedReceipt?: OfficialReceipt;
  targetExamDate: string;
  daysRemaining: number;
  targetScore: string; // e.g. "320+" or "Band 8.0"
  currentAverageScore: number;
  attendanceRate: number; // e.g. 96%
  syllabusCompletion: number; // e.g. 78%
  tuitionTotal: number;
  tuitionPaid: number;
  tuitionBalance: number;
  currency: 'NGN' | 'USD';
  nextClass: string;
  assignedAdvisor: string;
  recentMockTests: MockTestResult[];
  password?: string;
  subjectCombinations?: string[];
  ieltsModule?: 'Academic' | 'General Training';
  ieltsTargetBand?: string;
  ieltsFocusArea?: string;
  destinationCountry?: string;
  targetInstitution?: string;
  targetCourse?: string;
  nin?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female';
  academicSession?: string;
  stateOfOrigin?: string;
  lga?: string;
  parentName?: string;
  parentPhone?: string;
  parentRelationship?: string;
  parentEmail?: string;
  parentOccupation?: string;
  parentAddress?: string;
  residentialAddress?: string;
  jambProfileCode?: string;
  selectedSubjects?: string[];
  attendanceHistory?: StudentAttendanceRecord[];
}

export interface StudentAttendanceRecord {
  id: string;
  date: string;
  time?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Excused';
  remark?: string;
  cohort?: string;
  subject?: string;
  venue?: string;
  takenBy?: string;
}

export interface MonthlyPaymentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  program?: string;
  registrationNumber: string;
  monthPeriod: string;
  amount: number;
  paymentMethod: string;
  referenceOrProof: string;
  bankTellerNumber?: string;
  paymentDate?: string;
  proofUrl?: string;
  studentRemarks?: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminRemarks?: string;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  transactionReference?: string;
  studentShift?: StudentShift;
  receiptNumber?: string;
}

export interface UploadedQuestionBatch {
  id: string;
  title: string;
  subject: string;
  fileName: string;
  filename?: string;
  fileType: 'DOCX' | 'DOC' | 'PDF';
  uploadedAt: string;
  uploadDate?: string;
  uploadedBy: string;
  questionCount: number;
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Pending';
  questions: PracticeQuestion[];
  parsedQuestions?: PracticeQuestion[];
  program?: string;
}

export type WebsitePageTarget =
  | 'hero'
  | 'home'
  | 'about'
  | 'services'
  | 'gallery'
  | 'admission'
  | 'contact'
  | 'all';

export interface GalleryItem {
  id: string;
  title: string;
  category: 'CBT Lab' | 'Classrooms' | 'Practicals' | 'Awards & Achievers' | 'Campus Life' | string;
  imageUrl: string;
  caption: string;
  year?: string;
  page?: WebsitePageTarget;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Urgent' | 'Academic' | 'Exam Registration' | 'Holiday';
  content: string;
  date: string;
  author: string;
}

export interface Testimonial {
  id: string;
  name: string;
  program: string;
  scoreAchieved: string;
  universityAdmitted: string;
  course: string;
  photoUrl: string;
  quote: string;
  year: string;
}

export interface ProgramItem {
  id: string;
  code: string;
  name: string;
  category: 'National O-Level' | 'Tertiary Entrance' | 'International' | 'Professional';
  duration: string;
  fee: number;
  activeStudents: number;
  description: string;
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  category: 'Sciences' | 'Arts & Humanities' | 'Commercial' | 'General';
  leadTutor: string;
  syllabusCoverage: number;
  weeklyHours: number;
  totalStudents: number;
}

export interface CourseModule {
  id: string;
  code: string;
  title: string;
  program: ExamProgram | string;
  subject: string;
  tutor: string;
  weeks: number;
  modulesCount: number;
  status: 'Active' | 'Upcoming' | 'Archived';
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  program: ExamProgram | string;
  fileType: 'PDF' | 'DOCX' | 'PPTX' | 'ZIP';
  fileSize: string;
  author: string;
  dateAdded: string;
  downloadsCount: number;
}

export interface PracticeQuestion {
  id: string;
  subject: string;
  program: ExamProgram | string;
  examYear?: string;
  questionText: string;
  options: { label: string; text: string }[];
  correctOption: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status?: 'Pending Review' | 'Approved' | 'Rejected';
  batchId?: string;
}

export interface CBTExam {
  id: string;
  title: string;
  program: ExamProgram;
  durationMinutes: number;
  totalQuestions: number;
  passMark: number;
  scheduledDate: string;
  status: 'Draft' | 'Active' | 'Completed';
  instructions: string;
}

export interface CBTAttempt {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
  status: 'Passed' | 'Failed';
}

export interface AttendanceEntry {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  status: 'Present' | 'Late' | 'Absent' | 'Excused';
  time?: string;
  remark?: string;
}

export interface DailyAttendanceSession {
  id: string;
  date: string;
  time?: string;
  program: ExamProgram | 'All';
  cohort: string;
  subject?: string;
  venue?: string;
  takenBy: string;
  entries: AttendanceEntry[];
}

export interface AuditLogItem {
  id: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Directorate / Super Admin' | 'Registrar' | 'CBT Coordinator' | 'Accounts Officer';
  lastLogin: string;
  status: 'Active' | 'Suspended';
  isSuperAdmin?: boolean;
}

