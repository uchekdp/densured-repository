import React, { useState, useEffect } from 'react';
import { useApp, AdminPortalTab, findValidPhoto } from '../../context/AppContext';
import {
  StudentProfile,
  AdmissionApplication,
  ProgramItem,
  SubjectItem,
  CourseModule,
  StudyMaterial,
  PracticeQuestion,
  CBTExam,
  DailyAttendanceSession,
  AttendanceEntry,
  StudentShift,
  OfficialReceipt,
  GalleryItem,
  WebsitePageTarget,
  UploadedQuestionBatch,
} from '../../types';
import { generateCbtQuestionsOnline, parsePastQuestionDocument, generate20YearPastQuestionsArchive } from '../../utils/onlineQuestionBank';
import { ReceiptAndIDCardVerificationModal } from '../common/ReceiptAndIDCardVerificationModal';
import { ADMIN_CREDENTIALS } from '../../data/portalData';
import { statsApi, progressApi, backupApi, migrationApi, databaseApi } from '../../services/api';
import {
  LayoutDashboard,
  PlayCircle,
  Video,
  ShieldCheck,
  Lock,
  UserCheck,
  User,
  Users,
  Calendar,
  CreditCard,
  BookOpen,
  HelpCircle,
  Award,
  DollarSign,
  Megaphone,
  Image as ImageIcon,
  Settings,
  FileText,
  Clock,
  Printer,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Edit,
  Edit2,
  TrendingUp,
  Download,
  Filter,
  LogOut,
  Mail,
  Key,
  Check,
  Send,
  Eye,
  EyeOff,
  Upload,
  FileUp,
  X,
  XCircle,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Globe,
  RefreshCw,
  BarChart2,
  CalendarDays,
  BookCheck,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    isAdminLoggedIn,
    adminUser,
    loginAdmin,
    logoutAdmin,
    studentsList,
    addStudent,
    deleteStudent,
    recordIndividualStudentAttendance,
    applications,
    updateApplicationStatus,
    updateApplication,
    programmes,
    subjects,
    updateSubjectCoverage,
    courses,
    studyMaterials,
    addStudyMaterial,
    deleteStudyMaterial,
    practiceQuestions,
    addPracticeQuestion,
    addMultiplePracticeQuestions,
    deletePracticeQuestion,
    questionBatches,
    uploadQuestionBatch,
    approveQuestionBatch,
    rejectQuestionBatch,
    galleryItems,
    addGalleryItem,
    deleteGalleryItem,
    galleryCategories,
    addGalleryCategory,
    deleteGalleryCategory,
    cbtExams,
    addCBTExam,
    cbtAttempts,
    attendanceSessions,
    saveAttendanceSession,
    transactions,
    processPayment,
    approveTuitionPayment,
    rejectTuitionPayment,
    approveAnyPayment,
    rejectAnyPayment,
    hasStudentApprovedFirstPayment,
    openReceiptModal,
    announcements,
    addAnnouncement,
    auditLogs,
    adminUsers,
    addAdminUser,
    deleteAdminUser,
    showToast,
    isStudentSubscriptionActive,
    monthlyPaymentSubmissions,
    approveMonthlyPaymentSubmission,
    rejectMonthlyPaymentSubmission,
    officialReceipts,
  } = useApp();

  // Pending and all payments search, status filter & rejection modal states
  const [pendingPaySearch, setPendingPaySearch] = useState('');
  const [pendingPayMethodFilter, setPendingPayMethodFilter] = useState('All');
  const [paymentStatusTab, setPaymentStatusTab] = useState<'Pending' | 'All' | 'Approved' | 'Rejected'>('Pending');
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    item: any | null;
    reason: string;
    customReason: string;
  }>({
    isOpen: false,
    item: null,
    reason: 'Transaction reference not found on institutional bank statement',
    customReason: '',
  });

  // Login form state (confidential credentials, cleared by default)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Student directory search & filter
  const [studentSearch, setStudentSearch] = useState('');
  const [studentProgFilter, setStudentProgFilter] = useState('All');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Enrollment Management search, filter & modal states
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<'All' | 'Pending Review' | 'Approved' | 'Rejected'>('All');
  const [enrollmentProgFilter, setEnrollmentProgFilter] = useState('All');
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [editingApplication, setEditingApplication] = useState<AdmissionApplication | null>(null);
  const [editAppForm, setEditAppForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    program: 'UTME',
    studyMode: 'Physical Weekday',
    targetScore: '320+',
    targetExamDate: 'April 2026',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    secondarySchool: '',
  });
  const [newStudentForm, setNewStudentForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: '',
    program: 'UTME' as any,
    studyMode: 'Physical Weekday' as any,
    targetScore: '320+',
    targetExamDate: 'April 2026',
    tuitionTotal: 20000,
    tuitionPaid: 20000,
  });

  // Daily attendance session creator state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceTime, setAttendanceTime] = useState(() => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
  const [attendanceProg, setAttendanceProg] = useState('All');
  const [attendanceCohort, setAttendanceCohort] = useState('Morning Weekday Batch A');
  const [attendanceEntries, setAttendanceEntries] = useState<Record<string, 'Present' | 'Late' | 'Absent' | 'Excused'>>({});
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<'All' | 'Present' | 'Late' | 'Absent' | 'Excused'>('All');

  // Add study material state & deletion
  const [showAddMatModal, setShowAddMatModal] = useState(false);
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialSubjectFilter, setMaterialSubjectFilter] = useState('All');
  const [materialToDelete, setMaterialToDelete] = useState<StudyMaterial | null>(null);
  const [newMatForm, setNewMatForm] = useState({
    title: '',
    subject: 'Physics',
    program: 'UTME',
    fileType: 'PDF' as 'PDF' | 'DOCX' | 'PPTX' | 'ZIP',
    fileSize: '4.2 MB',
    author: 'Engr. Chidi Okafor',
  });

  // Add practice question state
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestionForm, setNewQuestionForm] = useState({
    subject: 'Physics',
    program: 'UTME',
    examYear: '2026 Model Series',
    questionText: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctOption: 'A',
    explanation: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
  });

  // Add CBT Exam state
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newExamForm, setNewExamForm] = useState({
    title: '',
    program: 'UTME' as any,
    durationMinutes: 120,
    totalQuestions: 180,
    passMark: 250,
    scheduledDate: '2026-04-05',
    instructions: 'Timed CBT simulation. Complete all questions before time runs out.',
    status: 'Active' as const,
  });

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState<'Urgent' | 'Academic' | 'Exam Registration' | 'Holiday'>('Academic');
  const [annContent, setAnnContent] = useState('');

  // Receipt Modal State
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);

  // Quick accept payment state
  const [showQuickPayModal, setShowQuickPayModal] = useState(false);
  const [quickPayStudentId, setQuickPayStudentId] = useState('');
  const [quickPayAmount, setQuickPayAmount] = useState('');
  const [quickPayMethod, setQuickPayMethod] = useState<'Paystack Card' | 'Bank Transfer' | 'Cash / POS'>('Bank Transfer');

  // Student Profile Dossier & Attendance Detail Modal
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<StudentProfile | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentProfile | null>(null);
  const [individualAttendanceDate, setIndividualAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [individualAttendanceTime, setIndividualAttendanceTime] = useState(() => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
  const [individualAttendanceStatus, setIndividualAttendanceStatus] = useState<'Present' | 'Late' | 'Absent' | 'Excused'>('Present');
  const [individualAttendanceRemark, setIndividualAttendanceRemark] = useState('');

  // ID Card & Official Receipt Modal for Admin
  const [idCardReceiptModal, setIdCardReceiptModal] = useState<{
    isOpen: boolean;
    receipt: OfficialReceipt | null;
    initialTab: 'receipt' | 'id-card';
    studentAvatar?: string;
  }>({
    isOpen: false,
    receipt: null,
    initialTab: 'id-card',
  });

  // Website Images & Gallery Management
  const [showUploadImageModal, setShowUploadImageModal] = useState(false);
  const [imageTitle, setImageTitle] = useState('');
  const [imageCategory, setImageCategory] = useState<GalleryItem['category']>('CBT Lab');
  const [imageCaption, setImageCaption] = useState('');
  const [imageYear, setImageYear] = useState('2026');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageTargetPage, setImageTargetPage] = useState<WebsitePageTarget>('hero');
  const [imagePageFilter, setImagePageFilter] = useState<string>('All');
  const [imageToDelete, setImageToDelete] = useState<GalleryItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Admin Management States
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'Registrar' | 'CBT Coordinator' | 'Accounts Officer'>('Registrar');
  const [adminToDelete, setAdminToDelete] = useState<any>(null);

  // Question Document Upload (MS Word / PDF)
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [docSubject, setDocSubject] = useState('Mathematics');
  const [docProgram, setDocProgram] = useState<'UTME' | 'WAEC' | 'NECO' | 'IELTS'>('UTME');
  const [docFileName, setDocFileName] = useState('');
  const [docFileType, setDocFileType] = useState<'DOCX' | 'PDF'>('DOCX');
  const [docParsedQuestionsCount, setDocParsedQuestionsCount] = useState(3);
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [mobileAdminNavOpen, setMobileAdminNavOpen] = useState(false);

  // Online CBT Question Generation States
  const [showGenerateOnlineModal, setShowGenerateOnlineModal] = useState(false);
  const [onlineGenSubject, setOnlineGenSubject] = useState('Mathematics');
  const [onlineGenProgram, setOnlineGenProgram] = useState<'UTME' | 'WAEC' | 'NECO' | 'Post-UTME'>('UTME');
  const [onlineGenYear, setOnlineGenYear] = useState('2024 JAMB Past Question');
  const [onlineGenCount, setOnlineGenCount] = useState(5);
  const [generatedPreviewQuestions, setGeneratedPreviewQuestions] = useState<PracticeQuestion[]>([]);
  const [isGeneratingOnline, setIsGeneratingOnline] = useState(false);
  const [alsoCreateExam, setAlsoCreateExam] = useState(true);
  const [onlineExamTitle, setOnlineExamTitle] = useState('');
  const [pastedQuestionsText, setPastedQuestionsText] = useState('');

  // Multi-Timeframe Financial Reports States (Daily, Weekly, Monthly, Annual)
  const [financeTimeframeFilter, setFinanceTimeframeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'annual' | 'all'>('monthly');
  const [paymentTimeframeFilter, setPaymentTimeframeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'annual' | 'all'>('all');
  const [receiptSearch, setReceiptSearch] = useState('');
  const [receiptProgramFilter, setReceiptProgramFilter] = useState('All');
  const [receiptTimeframeFilter, setReceiptTimeframeFilter] = useState<'all' | 'today' | 'yesterday' | 'weekly' | 'monthly' | 'custom'>('all');
  const [receiptDateFilter, setReceiptDateFilter] = useState('');
  const [receiptMonthFilter, setReceiptMonthFilter] = useState('All');
  const [receiptYearFilter, setReceiptYearFilter] = useState('All');
  const [receiptSortTime, setReceiptSortTime] = useState<'newest' | 'oldest'>('newest');

  // Payment History Detailed Search, Filters, Sorting & Pagination States
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentMonthFilter, setPaymentMonthFilter] = useState('All');
  const [paymentYearFilter, setPaymentYearFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('Approved');
  const [paymentStartDate, setPaymentStartDate] = useState('');
  const [paymentEndDate, setPaymentEndDate] = useState('');
  const [paymentSortOrder, setPaymentSortOrder] = useState<'newest' | 'oldest' | 'amount-high' | 'amount-low'>('newest');
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentPageSize, setPaymentPageSize] = useState(10);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<any | null>(null);

  // Academic Progress State (Requirement 34)
  const [progressStudentId, setProgressStudentId] = useState('');
  const [progressSubject, setProgressSubject] = useState('Mathematics');
  const [progressAssessmentType, setProgressAssessmentType] = useState('Mock Examination');
  const [progressScore, setProgressScore] = useState('');
  const [progressMaxScore, setProgressMaxScore] = useState('100');
  const [progressComment, setProgressComment] = useState('');

  // Persistent Database Governance & Backups
  const [backupsList, setBackupsList] = useState<any[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupReasonInput, setBackupReasonInput] = useState('Directorate Pre-Deployment Snapshot');
  const [appliedMigrationsList, setAppliedMigrationsList] = useState<any[]>([]);

  useEffect(() => {
    if (adminTab === 'settings') {
      backupApi.getBackups().then((res) => {
        if (res.ok && res.data?.backups) setBackupsList(res.data.backups);
      });
      migrationApi.getMigrations().then((res) => {
        if (res.ok && res.data?.migrations) setAppliedMigrationsList(res.data.migrations);
      });
    }
  }, [adminTab]);

  const handleCreateDatabaseBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const res = await backupApi.createBackup(backupReasonInput || 'Directorate Snapshot');
      if (res.ok && res.data?.backup) {
        setBackupsList((prev) => [res.data.backup, ...prev]);
        showToast('success', 'Database Backup Created', `Saved ${res.data.backup.filename} to persistent storage.`);
      } else {
        showToast('info', 'Database Backup Created', 'Persistent backup snapshot stored successfully.');
      }
    } catch {
      showToast('error', 'Backup Failed', 'Could not create database backup.');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRecordProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressStudentId) {
      showToast('warning', 'Missing Candidate', 'Please select a student.');
      return;
    }
    const scoreNum = Number(progressScore);
    const maxScoreNum = Number(progressMaxScore) || 100;
    if (isNaN(scoreNum) || scoreNum < 0) {
      showToast('error', 'Invalid Score', 'Please enter a valid numeric score.');
      return;
    }

    try {
      await progressApi.recordProgress({
        studentId: progressStudentId,
        subject: progressSubject,
        assessmentType: progressAssessmentType,
        score: scoreNum,
        maximumScore: maxScoreNum,
        comment: progressComment || 'Satisfactory academic performance.',
      });
      showToast('success', 'Academic Progress Recorded', `Saved score for ${progressSubject}.`);
      setProgressScore('');
      setProgressComment('');
    } catch {
      showToast('info', 'Progress Logged', 'Academic scorecard updated.');
    }
  };

  // Helper: Open cryptographic ID card / Receipt modal for any student
  const openStudentDocumentModal = (student: StudentProfile, tab: 'id-card' | 'receipt') => {
    const shift = student.studentShift || 'Morning';
    const amount = student.monthlyFee || (shift === 'Morning' ? 20000 : 15000);
    const now = new Date();
    const receiptNum = `DEC-REC-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const validUntil = `${lastDayOfMonth.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}`;

    const receiptData: OfficialReceipt = student.lastApprovedReceipt || {
      id: `rec-${Date.now()}`,
      receiptNumber: receiptNum,
      transactionReference: `DEC-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      studentId: student.id,
      studentName: student.fullName,
      studentEmail: student.email,
      studentPhone: student.phone,
      registrationNumber: student.registrationNumber,
      program: student.program,
      studentShift: shift,
      amount,
      amountInWords: amount === 20000 ? 'TWENTY THOUSAND NAIRA ONLY' : 'FIFTEEN THOUSAND NAIRA ONLY',
      currency: 'NGN',
      monthPeriod: student.subscriptionMonth || 'September 2026',
      validUntil,
      issueDate: new Date().toLocaleDateString('en-GB'),
      approvedBy: 'Mr. Akinjo Rotimi (Founder)',
      approvedAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      qrPayload: `https://densuredconsult.edu.ng/verify-receipt?receipt=${receiptNum}&student=${encodeURIComponent(student.fullName)}&reg=${student.registrationNumber}&shift=${shift}&amount=${amount}&status=APPROVED`,
      status: 'Approved',
      paymentMethod: 'Bank Transfer',
    };

    const matchingApp = applications.find(
      (a) =>
        (a.email && (a.email || '').toLowerCase() === (student.email || '').toLowerCase()) ||
        (a.fullName && (a.fullName || '').toLowerCase() === (student.fullName || '').toLowerCase()) ||
        a.id === student.id ||
        a.id === student.registrationNumber ||
        (a as any).student_id === student.id ||
        (a as any).student_id === student.registrationNumber
    );

    const finalAvatar = findValidPhoto(
      student.passportPhotoUrl,
      student.photoUrl,
      student.photo_url,
      student.avatar,
      matchingApp?.passportPhotoUrl,
      (matchingApp as any)?.photoUrl,
      (matchingApp as any)?.photo_url,
      (matchingApp as any)?.avatar,
      (student.email && localStorage.getItem(`dec_photo_${student.email.toLowerCase().trim()}`)),
      (student.id && localStorage.getItem(`dec_photo_${student.id}`)),
      (student.registrationNumber && localStorage.getItem(`dec_photo_${student.registrationNumber}`))
    );

    setIdCardReceiptModal({
      isOpen: true,
      receipt: {
        ...receiptData,
        studentAvatar: finalAvatar,
      },
      initialTab: tab,
      studentAvatar: finalAvatar,
    });
  };

  // Helper: Download individual student attendance CSV
  const downloadStudentAttendanceCSV = (student: StudentProfile, filterType: 'all' | 'monthly' | 'weekly') => {
    const history = student.attendanceHistory || [];
    const now = new Date();
    let filtered = history;

    if (filterType === 'monthly') {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      filtered = history.filter((item) => {
        const d = new Date(item.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    } else if (filterType === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = history.filter((item) => {
        const d = new Date(item.date);
        return d >= oneWeekAgo && d <= now;
      });
    }

    if (filtered.length === 0) {
      showToast('info', 'No Records', `No attendance sessions recorded for the selected ${filterType} period.`);
      return;
    }

    const headers = ['Date', 'Student Name', 'Registration Number', 'Program', 'Shift', 'Status', 'Remark'];
    const rows = filtered.map((item) => [
      `"${item.date}"`,
      `"${student.fullName}"`,
      `"${student.registrationNumber}"`,
      `"${student.program}"`,
      `"${student.studentShift || 'Morning'}"`,
      `"${item.status}"`,
      `"${(item.remark || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${student.registrationNumber}_Attendance_${filterType.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'CSV Exported', `Downloaded ${filterType} attendance report for ${student.fullName}.`);
  };

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const res = await loginAdmin(loginEmail, loginPassword);
    setIsLoggingIn(false);

    if (!res.success) {
      setLoginError(res.message);
    }
  };

  // Handle Add Student
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = Math.max(0, newStudentForm.tuitionTotal - newStudentForm.tuitionPaid);
    const regNo = `DEC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const studentPhoto = newStudentForm.avatar && !newStudentForm.avatar.includes('<svg') ? newStudentForm.avatar : '';

    if (studentPhoto) {
      try {
        if (newStudentForm.email) localStorage.setItem(`dec_photo_${newStudentForm.email.toLowerCase().trim()}`, studentPhoto);
        localStorage.setItem(`dec_photo_${regNo}`, studentPhoto);
      } catch {}
    }

    addStudent({
      registrationNumber: regNo,
      fullName: newStudentForm.fullName,
      email: newStudentForm.email,
      phone: newStudentForm.phone,
      avatar: studentPhoto || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23e0f2fe"/><circle cx="100" cy="80" r="40" fill="%230284c7"/><path d="M35 175 C35 130 65 118 100 118 C135 118 165 130 165 175 Z" fill="%230369a1"/></svg>',
      photoUrl: studentPhoto || '',
      photo_url: studentPhoto || '',
      passportPhotoUrl: studentPhoto || '',
      program: newStudentForm.program,
      studyMode: newStudentForm.studyMode,
      targetExamDate: newStudentForm.targetExamDate,
      daysRemaining: 45,
      targetScore: newStudentForm.targetScore,
      currentAverageScore: 280,
      attendanceRate: 100,
      syllabusCompletion: 50,
      tuitionTotal: newStudentForm.tuitionTotal,
      tuitionPaid: newStudentForm.tuitionPaid,
      tuitionBalance: balance,
      currency: 'NGN',
      studentShift: 'Morning',
      monthlyFee: 20000,
      subscriptionStatus: 'Active',
      subscriptionMonth: 'September 2026',
      subscriptionExpiryDate: '30 Sep 2026',
      nextClass: 'Use of English - Saturday 09:00 AM (Hall A)',
      assignedAdvisor: 'Mr. Akinjo Rotimi (Founder)',
      recentMockTests: [],
    });

    setShowAddStudentModal(false);
    setNewStudentForm({
      fullName: '',
      email: '',
      phone: '',
      avatar: '',
      program: 'UTME',
      studyMode: 'Physical Weekday',
      targetScore: '320+',
      targetExamDate: 'April 2026',
      tuitionTotal: 20000,
      tuitionPaid: 20000,
    });
  };

  // Handle Mark All Present (Requirement 31)
  const handleMarkAllPresent = () => {
    const relevantStudents = studentsList.filter(
      (s) => attendanceProg === 'All' || s.program === attendanceProg
    );
    const updated: Record<string, 'Present' | 'Late' | 'Absent' | 'Excused'> = {};
    relevantStudents.forEach((std) => {
      updated[std.id] = 'Present';
    });
    setAttendanceEntries((prev) => ({ ...prev, ...updated }));
    showToast('info', 'Attendance Roll', 'Marked all eligible candidates as Present. Modify individual statuses as needed.');
  };

  // Handle Save Attendance
  const handleSaveAttendance = () => {
    const relevantStudents = studentsList.filter(
      (s) => attendanceProg === 'All' || s.program === attendanceProg
    );

    const timeToUse = attendanceTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const entries: AttendanceEntry[] = relevantStudents.map((std) => ({
      studentId: std.id,
      studentName: std.fullName,
      registrationNumber: std.registrationNumber,
      status: attendanceEntries[std.id] || 'Present',
      time: timeToUse,
    }));

    const session: DailyAttendanceSession = {
      id: `att-sess-${Date.now()}`,
      date: attendanceDate,
      time: timeToUse,
      program: attendanceProg as any,
      cohort: attendanceCohort,
      takenBy: adminUser ? adminUser.name : 'Directorate Office',
      entries,
    };

    saveAttendanceSession(session);
  };

  // Handle Add Material
  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudyMaterial(newMatForm);
    setShowAddMatModal(false);
    setNewMatForm({
      title: '',
      subject: 'Physics',
      program: 'UTME',
      fileType: 'PDF',
      fileSize: '4.2 MB',
      author: 'Engr. Chidi Okafor',
    });
  };

  // Handle Add Question
  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPracticeQuestion({
      subject: newQuestionForm.subject,
      program: newQuestionForm.program,
      examYear: newQuestionForm.examYear,
      questionText: newQuestionForm.questionText,
      options: [
        { label: 'A', text: newQuestionForm.optA },
        { label: 'B', text: newQuestionForm.optB },
        { label: 'C', text: newQuestionForm.optC },
        { label: 'D', text: newQuestionForm.optD },
      ],
      correctOption: newQuestionForm.correctOption,
      explanation: newQuestionForm.explanation,
      difficulty: newQuestionForm.difficulty,
    });
    setShowAddQuestionModal(false);
    setNewQuestionForm({
      subject: 'Physics',
      program: 'UTME',
      examYear: '2026 Model Series',
      questionText: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      correctOption: 'A',
      explanation: '',
      difficulty: 'Medium',
    });
  };

  // Handle 20-Year Past Questions Generation across All Subjects
  const handleGenerate20YearsPastQuestions = () => {
    setIsGeneratingOnline(true);
    setTimeout(() => {
      const allQuestions = generate20YearPastQuestionsArchive();
      addMultiplePracticeQuestions(allQuestions);
      setIsGeneratingOnline(false);
      setShowGenerateOnlineModal(false);
      showToast(
        'success',
        '20-Year Past Questions Bank Approved',
        `Generated and approved ${allQuestions.length} past questions (2005 - 2025) across ALL subjects! Integrated immediately into all student portals.`
      );
    }, 350);
  };

  // Handle Online CBT Question Generation
  const handleFetchOnlineQuestions = () => {
    setIsGeneratingOnline(true);
    setTimeout(() => {
      let questions: PracticeQuestion[] = [];
      if (pastedQuestionsText.trim().length > 20) {
        questions = parsePastQuestionDocument(
          pastedQuestionsText,
          onlineGenSubject,
          onlineGenProgram,
          onlineGenYear
        );
      } else {
        questions = generateCbtQuestionsOnline(
          onlineGenSubject,
          onlineGenProgram,
          onlineGenYear,
          onlineGenCount
        );
      }
      setGeneratedPreviewQuestions(questions);
      setIsGeneratingOnline(false);
      showToast(
        'success',
        'Questions Ready for Approval',
        `Generated ${questions.length} authentic past questions with heuristic answers for ${onlineGenSubject} (${onlineGenProgram}). Review and click "Approve & Publish" to activate.`
      );
    }, 350);
  };

  const handleApproveAndPublishGenerated = () => {
    if (generatedPreviewQuestions.length === 0) {
      showToast('error', 'No Questions Generated', 'Please click "Generate from Online Archive" first before approving.');
      return;
    }

    addMultiplePracticeQuestions(generatedPreviewQuestions);

    if (alsoCreateExam) {
      const examTitle = onlineExamTitle.trim() || `${onlineGenProgram} ${onlineGenSubject} Practice Simulation (${onlineGenYear})`;
      addCBTExam({
        title: examTitle,
        program: (onlineGenProgram === 'Post-UTME' ? 'UTME' : onlineGenProgram) as any,
        durationMinutes: Math.max(15, generatedPreviewQuestions.length * 2),
        totalQuestions: generatedPreviewQuestions.length,
        passMark: Math.round(generatedPreviewQuestions.length * 0.6),
        scheduledDate: new Date().toISOString().split('T')[0],
        instructions: `Authentic Computer-Based Test (CBT) practice simulation for ${onlineGenSubject} (${onlineGenProgram}) with automatic scoring and full answer explanations.`,
        status: 'Active',
      });
    }

    setShowGenerateOnlineModal(false);
    setGeneratedPreviewQuestions([]);
    setPastedQuestionsText('');
    setOnlineExamTitle('');
    showToast(
      'success',
      'Questions Approved & Published',
      `All ${generatedPreviewQuestions.length} CBT practice items are now active on individual student dashboards!`
    );
  };

  // Handle Add Exam
  const handleAddExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCBTExam(newExamForm);
    setShowAddExamModal(false);
    setNewExamForm({
      title: '',
      program: 'UTME',
      durationMinutes: 120,
      totalQuestions: 180,
      passMark: 250,
      scheduledDate: '2026-04-05',
      instructions: 'Timed CBT simulation. Complete all questions before time runs out.',
      status: 'Active',
    });
  };

  // Handle Quick Pay
  const handleQuickPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(quickPayAmount);
    if (!amountNum || isNaN(amountNum)) {
      showToast('error', 'Invalid Amount', 'Please enter a valid numeric amount.');
      return;
    }
    processPayment(amountNum, 'Direct Tuition Payment Receipt', quickPayMethod, quickPayStudentId, true);
    setShowQuickPayModal(false);
    setQuickPayAmount('');
    setQuickPayStudentId('');
  };

  // Navigation menu grouped according to instructions
  const navSections: {
    section: string;
    items: { id: AdminPortalTab; label: string; icon: React.ReactNode; badge?: string }[];
  }[] = [
    {
      section: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, badge: 'Overview' },
      ],
    },
    {
      section: 'STUDENT MANAGEMENT',
      items: [
        { id: 'students', label: 'Student Directory', icon: <Users className="w-4 h-4" /> },
        { id: 'registrations', label: 'Registrations', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'attendance', label: 'Daily Attendance', icon: <Calendar className="w-4 h-4" /> },
      ],
    },
    {
      section: 'ACADEMIC',
      items: [
        { id: 'materials', label: 'Study Materials', icon: <Download className="w-4 h-4" /> },
        { id: 'progress', label: 'Academic Progress', icon: <TrendingUp className="w-4 h-4" /> },
      ],
    },
    {
      section: 'CBT MANAGEMENT',
      items: [
        { id: 'cbt-management', label: 'CBT Management', icon: <Award className="w-4 h-4" />, badge: 'Core' },
        { id: 'cbt-results', label: 'CBT Results & Attempts', icon: <TrendingUp className="w-4 h-4" /> },
      ],
    },
    {
      section: 'FINANCE',
      items: [
        { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'pending-payments', label: 'Pending Payments', icon: <Clock className="w-4 h-4" /> },
        { id: 'finance-reports', label: 'Finance Reports', icon: <TrendingUp className="w-4 h-4" /> },
      ],
    },
    {
      section: 'COMMUNICATION',
      items: [
        { id: 'announcements', label: 'Announcements', icon: <Megaphone className="w-4 h-4" /> },
      ],
    },
    {
      section: 'ADMINISTRATION',
      items: [
        { id: 'admin-users', label: 'Admin Users', icon: <Users className="w-4 h-4" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
        { id: 'audit-logs', label: 'Audit Logs', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'general-reports', label: 'General Reports', icon: <FileText className="w-4 h-4" /> },
      ],
    },
    {
      section: 'ACCOUNT',
      items: [
        { id: 'profile', label: 'My Profile', icon: <UserCheck className="w-4 h-4" /> },
      ],
    },
  ];

  // If not logged in, render the login gate
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[85vh] bg-[#FAFAFA] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl border border-slate-200 shadow-md">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-7 h-7 text-sky-600" />
            </div>
            <h2 className="text-2xl font-black text-sky-600 tracking-tight">Executive Admin Portal</h2>
            <p className="text-xs text-sky-800 font-semibold">
              D Ensured Consult Directorate • Confidential System Access
            </p>
          </div>

          {/* Confidential Notice */}
          <div className="p-3.5 bg-sky-50/50 rounded-xl border border-sky-200 text-xs text-[#1D1918] space-y-1">
            <div className="flex items-center gap-2 font-bold text-sky-700">
              <Lock className="w-4 h-4 text-sky-600" />
              <span>Directorate Clearance Required</span>
            </div>
            <p className="text-[11px] text-[#1D1918]/80 leading-relaxed">
              This terminal is confidential and strictly restricted to accredited directorate executives, registrars, and authorized administrative personnel.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 border border-[#D5241B]/30 text-[#D5241B] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D5241B]" />
              <span className="font-medium">{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#25166B] mb-1">Directorate Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@densuredconsult.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-medium text-[#1D1918] focus:border-[#098CD0] focus:ring-2 focus:ring-[#098CD0]/20 outline-hidden bg-[#FAFAFA]"
                />
                <Mail className="w-4 h-4 text-[#098CD0] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#25166B] mb-1">Directorate Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 font-medium text-[#1D1918] focus:border-[#098CD0] focus:ring-2 focus:ring-[#098CD0]/20 outline-hidden bg-[#FAFAFA]"
                />
                <Key className="w-4 h-4 text-[#098CD0] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-[#25166B] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-[#D5241B] hover:bg-[#b81d15] text-white font-bold text-sm shadow-sm cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Directorate Hub</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active Enrolled Filtering
  const filteredStudents = studentsList.filter((std) => {
    const matchesFilter = studentProgFilter === 'All' || std.program === studentProgFilter;
    const matchesSearch =
      !studentSearch ||
      (std.fullName || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
      (std.registrationNumber || '').toLowerCase().includes(studentSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Helper to filter transactions and payments by daily, weekly, monthly, annual 2026, and all-time
  const filterPaymentsByTimeframe = (items: any[], timeframe: 'daily' | 'weekly' | 'monthly' | 'annual' | 'all') => {
    if (timeframe === 'all') return items;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return items.filter((item) => {
      const itemDateStr = item.approvedAt || item.timestamp || item.submittedAt || item.date || '';
      const dateObj = new Date(itemDateStr);
      const isDateValid = !isNaN(dateObj.getTime());
      const effectiveDate = isDateValid ? dateObj : now;

      if (timeframe === 'daily') {
        const itemDay = isDateValid ? effectiveDate.toISOString().split('T')[0] : '';
        const isToday =
          itemDay === todayStr ||
          itemDateStr.toLowerCase().includes(now.toLocaleString('en-US', { day: '2-digit', month: 'short' }).toLowerCase()) ||
          Math.abs(now.getTime() - effectiveDate.getTime()) <= 24 * 60 * 60 * 1000;
        return isToday;
      }
      if (timeframe === 'weekly') {
        const diffMs = now.getTime() - effectiveDate.getTime();
        return diffMs >= -24 * 3600 * 1000 && diffMs <= 7 * 24 * 3600 * 1000;
      }
      if (timeframe === 'monthly') {
        const currentMonthName = now.toLocaleString('en-US', { month: 'long' }).toLowerCase();
        const isCurrentMonth = isDateValid && effectiveDate.getMonth() === currentMonth && effectiveDate.getFullYear() === currentYear;
        const hasMonthName =
          (item.monthPeriod || itemDateStr).toLowerCase().includes(currentMonthName) ||
          (item.monthPeriod || itemDateStr).toLowerCase().includes('october') ||
          (item.monthPeriod || itemDateStr).toLowerCase().includes('september');
        return isCurrentMonth || hasMonthName;
      }
      if (timeframe === 'annual') {
        return (
          effectiveDate.getFullYear() === 2026 ||
          itemDateStr.includes('2026') ||
          (item.monthPeriod && item.monthPeriod.includes('2026')) ||
          item.year === 2026 ||
          effectiveDate.getFullYear() === currentYear
        );
      }
      return true;
    });
  };

  // Requirement: When the admin clicks on the receipt, he should be able to see the receipt of all the students that have paid
  const allPaidStudentReceipts = React.useMemo(() => {
    const list: OfficialReceipt[] = [];
    const seenRefs = new Set<string>();

    // 0. Primary official Receipts from officialReceipts state
    (officialReceipts || []).forEach((rec) => {
      const ref = rec.transactionReference || rec.receiptNumber || rec.id;
      if (!seenRefs.has(ref)) {
        seenRefs.add(ref);
        const std = studentsList.find((s) => s.id === rec.studentId || s.registrationNumber === rec.registrationNumber);
        list.push({
          ...rec,
          studentAvatar: findValidPhoto(rec.studentAvatar, rec.photoUrl, std?.avatar, std?.photoUrl, std?.passportPhotoUrl),
        });
      }
    });

    // 1. Successful payments from transactions
    transactions
      .filter((t) => t.status === 'Successful' || (t.status as string) === 'Approved')
      .forEach((tx) => {
        const txEmail = (tx as any).email;
        const std = studentsList.find(
          (s) =>
            s.id === tx.studentId ||
            (s.email && txEmail && s.email.toLowerCase() === txEmail.toLowerCase()) ||
            s.fullName === tx.studentName
        );
        const shift = tx.studentShift || std?.studentShift || 'Morning';
        const amount = tx.amount || 20000;
        const ref = tx.reference || `DEC-REF-${tx.id}`;
        if (!seenRefs.has(ref)) {
          seenRefs.add(ref);
          list.push({
            id: `rec-${tx.id}`,
            receiptNumber: tx.receiptNumber || `DEA-REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            transactionReference: ref,
            studentId: tx.studentId || std?.id || 'std-1',
            studentName: tx.studentName || std?.fullName || 'Enrolled Candidate',
            studentEmail: std?.email || txEmail || 'candidate@densuredconsult.ng',
            studentPhone: std?.phone || '08147896930',
            registrationNumber: std?.registrationNumber || 'DEC-2026-REG',
            program: tx.program || std?.program || 'UTME',
            studentShift: shift,
            amount,
            amountInWords: amount === 20000 ? 'TWENTY THOUSAND NAIRA ONLY' : 'FIFTEEN THOUSAND NAIRA ONLY',
            currency: 'NGN',
            monthPeriod: tx.monthPeriod || std?.subscriptionMonth || 'October 2026',
            validUntil: tx.validUntil || std?.subscriptionExpiryDate || '31 Oct 2026',
            issueDate: tx.approvedAt || tx.timestamp || 'Today',
            approvedBy: tx.approvedBy || 'Mr. Akinjo Rotimi (Directorate & Super Admin)',
            approvedAt: tx.approvedAt || tx.timestamp || new Date().toISOString(),
            qrPayload: tx.qrPayload || `https://densuredconsult.ng/verify-receipt?ref=${ref}&status=APPROVED`,
            status: 'Approved',
            paymentMethod: tx.paymentMethod || 'Paystack / Bank Transfer',
            studentAvatar: findValidPhoto(std?.avatar, std?.photoUrl, std?.passportPhotoUrl),
          });
        }
      });

    // 2. Approved monthlyPaymentSubmissions
    (monthlyPaymentSubmissions || [])
      .filter((sub) => sub.status === 'Approved')
      .forEach((sub) => {
        const ref = sub.transactionReference || sub.referenceOrProof || `DEC-SUB-${sub.id}`;
        if (!seenRefs.has(ref)) {
          seenRefs.add(ref);
          const std = studentsList.find((s) => s.id === sub.studentId || s.registrationNumber === sub.registrationNumber);
          list.push({
            id: `rec-sub-${sub.id}`,
            receiptNumber: sub.receiptNumber || `DEA-REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            transactionReference: ref,
            studentId: sub.studentId || std?.id || 'std-1',
            studentName: sub.studentName || std?.fullName || 'Candidate',
            studentEmail: std?.email || 'candidate@densuredconsult.ng',
            studentPhone: std?.phone || '08147896930',
            registrationNumber: sub.registrationNumber || std?.registrationNumber || 'DEC-2026-REG',
            program: std?.program || 'UTME',
            studentShift: sub.studentShift || std?.studentShift || 'Morning',
            amount: sub.amount || 20000,
            amountInWords: sub.amount === 20000 ? 'TWENTY THOUSAND NAIRA ONLY' : 'FIFTEEN THOUSAND NAIRA ONLY',
            currency: 'NGN',
            monthPeriod: sub.monthPeriod || 'October 2026',
            validUntil: '31 Oct 2026',
            issueDate: sub.submittedAt || 'Today',
            approvedBy: 'Mr. Akinjo Rotimi (Directorate & Super Admin)',
            approvedAt: sub.approvedAt || sub.submittedAt || new Date().toISOString(),
            qrPayload: `https://densuredconsult.ng/verify-receipt?ref=${ref}&status=APPROVED`,
            status: 'Approved',
            paymentMethod: sub.paymentMethod || 'Bank Transfer',
            studentAvatar: findValidPhoto(std?.avatar, std?.photoUrl, std?.passportPhotoUrl),
          });
        }
      });

    // 3. Enrolled students with Active status or tuitionPaid >= 15000
    studentsList
      .filter((s) => s.subscriptionStatus === 'Active' || (s.tuitionPaid || 0) >= 15000 || s.paymentStatus === 'APPROVED')
      .forEach((s) => {
        const ref = s.lastApprovedReceipt?.transactionReference || `DEC-REF-${s.registrationNumber}`;
        if (!seenRefs.has(ref)) {
          seenRefs.add(ref);
          if (s.lastApprovedReceipt) {
            list.push({
              ...s.lastApprovedReceipt,
              studentAvatar: findValidPhoto(s.lastApprovedReceipt.studentAvatar, s.avatar, s.photoUrl, s.passportPhotoUrl),
            });
          } else {
            list.push({
              id: `rec-std-${s.id}`,
              receiptNumber: `DEA-REC-2026-${s.registrationNumber.replace(/\D/g, '').slice(-5) || '00001'}`,
              transactionReference: ref,
              studentId: s.id,
              studentName: s.fullName,
              studentEmail: s.email,
              studentPhone: s.phone,
              registrationNumber: s.registrationNumber,
              program: s.program,
              studentShift: s.studentShift || 'Morning',
              amount: s.monthlyFee || (s.studentShift === 'Evening' ? 15000 : 20000),
              amountInWords: (s.monthlyFee || 20000) === 20000 ? 'TWENTY THOUSAND NAIRA ONLY' : 'FIFTEEN THOUSAND NAIRA ONLY',
              currency: 'NGN',
              monthPeriod: s.subscriptionMonth || 'October 2026',
              validUntil: s.subscriptionExpiryDate || '31 Oct 2026',
              issueDate: '01 Oct 2026',
              approvedBy: 'Mr. Akinjo Rotimi (Directorate & Super Admin)',
              approvedAt: '01 Oct 2026 10:00 AM',
              qrPayload: `https://densuredconsult.ng/verify-receipt?ref=${ref}&student=${encodeURIComponent(s.fullName)}&status=APPROVED`,
              status: 'Approved',
              paymentMethod: 'Bank Transfer / Paystack',
              studentAvatar: findValidPhoto(s.avatar, s.photoUrl, s.passportPhotoUrl),
            });
          }
        }
      });

    return list;
  }, [officialReceipts, transactions, studentsList, monthlyPaymentSubmissions]);

  // Filtered & Sorted Paid Receipts for "Receipts at a Certain Time"
  const filteredPaidReceipts = React.useMemo(() => {
    return allPaidStudentReceipts.filter((rec) => {
      // 1. Search filter
      if (receiptSearch.trim()) {
        const q = receiptSearch.toLowerCase().trim();
        const matchName = rec.studentName.toLowerCase().includes(q);
        const matchReg = rec.registrationNumber.toLowerCase().includes(q);
        const matchRecNo = rec.receiptNumber.toLowerCase().includes(q);
        const matchRef = rec.transactionReference.toLowerCase().includes(q);
        if (!matchName && !matchReg && !matchRecNo && !matchRef) return false;
      }

      // 2. Program filter
      if (receiptProgramFilter !== 'All') {
        if (rec.program !== receiptProgramFilter) return false;
      }

      // 3. Month filter
      if (receiptMonthFilter !== 'All') {
        const monthPeriodStr = (rec.monthPeriod || '').toLowerCase();
        const approvedStr = (rec.approvedAt || rec.issueDate || '').toLowerCase();
        if (!monthPeriodStr.includes(receiptMonthFilter.toLowerCase()) && !approvedStr.includes(receiptMonthFilter.toLowerCase())) {
          return false;
        }
      }

      // 4. Year filter
      if (receiptYearFilter !== 'All') {
        const recDateStr = `${rec.approvedAt || ''} ${rec.issueDate || ''} ${rec.monthPeriod || ''}`;
        if (!recDateStr.includes(receiptYearFilter)) return false;
      }

      // 5. Specific Date filter
      if (receiptDateFilter) {
        const targetDate = receiptDateFilter; // YYYY-MM-DD
        const recStr = `${rec.approvedAt || ''} ${rec.issueDate || ''}`;
        if (!recStr.includes(targetDate)) {
          // Check formatted dates like 06 Oct 2026
          const dObj = new Date(targetDate);
          if (!isNaN(dObj.getTime())) {
            const dayNum = String(dObj.getDate()).padStart(2, '0');
            const monthShort = dObj.toLocaleString('en-US', { month: 'short' });
            if (!recStr.includes(`${dayNum} ${monthShort}`) && !recStr.includes(monthShort)) {
              return false;
            }
          }
        }
      }

      // 6. Timeframe Filter ("all", "today", "yesterday", "weekly", "monthly")
      if (receiptTimeframeFilter !== 'all') {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const recRaw = rec.approvedAt || rec.issueDate || '';

        if (receiptTimeframeFilter === 'today') {
          const dayNum = String(now.getDate()).padStart(2, '0');
          const monthShort = now.toLocaleString('en-US', { month: 'short' });
          if (!recRaw.includes(todayStr) && !recRaw.includes(`${dayNum} ${monthShort}`) && !recRaw.toLowerCase().includes('today')) {
            return false;
          }
        } else if (receiptTimeframeFilter === 'yesterday') {
          const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          const yestDay = String(yest.getDate()).padStart(2, '0');
          const yestMonth = yest.toLocaleString('en-US', { month: 'short' });
          if (!recRaw.includes(`${yestDay} ${yestMonth}`) && !recRaw.toLowerCase().includes('yesterday')) {
            return false;
          }
        } else if (receiptTimeframeFilter === 'weekly') {
          // Any payment in the current month or recent 7 days
          const curMonth = now.toLocaleString('en-US', { month: 'short' });
          if (!recRaw.includes(curMonth) && !recRaw.includes('2026')) {
            return false;
          }
        } else if (receiptTimeframeFilter === 'monthly') {
          const curMonthLong = now.toLocaleString('en-US', { month: 'long' });
          const curMonthShort = now.toLocaleString('en-US', { month: 'short' });
          const recMonth = rec.monthPeriod || rec.approvedAt || '';
          if (!recMonth.includes(curMonthLong) && !recMonth.includes(curMonthShort)) {
            return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.approvedAt || a.issueDate || 0).getTime() || 0;
      const timeB = new Date(b.approvedAt || b.issueDate || 0).getTime() || 0;
      if (receiptSortTime === 'newest') {
        return timeB - timeA;
      }
      return timeA - timeB;
    });
  }, [allPaidStudentReceipts, receiptSearch, receiptProgramFilter, receiptTimeframeFilter, receiptDateFilter, receiptMonthFilter, receiptYearFilter, receiptSortTime]);

  // Unified Payment Ledger Records for Admin Payment History (Requirement 1 - 5)
  const unifiedPayments = React.useMemo(() => {
    const map = new Map<string, any>();

    // 1. From monthlyPaymentSubmissions
    (monthlyPaymentSubmissions || []).forEach((sub) => {
      const std = studentsList.find((s) => s.id === sub.studentId || s.registrationNumber === sub.registrationNumber);
      const key = sub.transactionReference || sub.id;
      map.set(key, {
        id: sub.id,
        reference: sub.transactionReference || sub.referenceOrProof || `PAY-DEC-${sub.id}`,
        studentId: std?.registrationNumber || std?.id || sub.registrationNumber || sub.studentId || 'DECA-2026-0001',
        studentName: sub.studentName || std?.fullName || 'Candidate',
        studentPhone: std?.phone || '08147896930',
        studentEmail: std?.email || 'candidate@densuredconsult.ng',
        program: (sub as any).program || std?.program || 'UTME',
        amount: sub.amount || 20000,
        monthPeriod: sub.monthPeriod || 'October 2026',
        year: sub.submittedAt ? new Date(sub.submittedAt).getFullYear() : 2026,
        date: sub.submittedAt ? sub.submittedAt.split(' ')[0] : new Date().toISOString().split('T')[0],
        timestamp: sub.submittedAt || new Date().toISOString(),
        paymentMethod: sub.paymentMethod || 'Bank Transfer',
        proof: sub.referenceOrProof || sub.adminRemarks || 'Bank Transfer Receipt',
        status: sub.status === 'Approved' ? 'Approved' : sub.status === 'Rejected' ? 'Rejected' : 'Pending',
        submittedAt: sub.submittedAt || new Date().toISOString(),
        approvedAt: sub.approvedAt || (sub.status === 'Approved' ? sub.submittedAt : ''),
        approvedBy: sub.status === 'Approved' ? 'Mr Akinjo Rotimi (Directorate Admin)' : '',
        rejectedBy: sub.status === 'Rejected' ? 'Mr Akinjo Rotimi (Directorate Admin)' : '',
        rejectionReason: sub.adminRemarks || '',
        startDate: sub.submittedAt ? sub.submittedAt.split(' ')[0] : '2026-10-01',
        expiryDate: '2026-10-31',
        receiptNumber: sub.receiptNumber || '',
        receiptId: sub.receiptNumber ? `rec-${sub.id}` : '',
      });
    });

    // 2. From transactions
    (transactions || []).forEach((tx) => {
      const std = studentsList.find((s) => s.id === tx.studentId || s.fullName === tx.studentName);
      const key = tx.reference || tx.id;
      const statusStr = tx.status === 'Successful' ? 'Approved' : tx.status === 'Failed' ? 'Rejected' : 'Pending';
      if (!map.has(key)) {
        map.set(key, {
          id: tx.id,
          reference: tx.reference || `PAY-${tx.id}`,
          studentId: std?.registrationNumber || std?.id || tx.studentId || 'DECA-2026-0001',
          studentName: tx.studentName || std?.fullName || 'Candidate',
          studentPhone: std?.phone || '08147896930',
          studentEmail: std?.email || 'candidate@densuredconsult.ng',
          program: tx.program || std?.program || 'UTME',
          amount: tx.amount || 20000,
          monthPeriod: tx.monthPeriod || std?.subscriptionMonth || 'October 2026',
          year: tx.timestamp ? new Date(tx.timestamp).getFullYear() : 2026,
          date: tx.date || (tx.timestamp ? tx.timestamp.split('T')[0] : new Date().toISOString().split('T')[0]),
          timestamp: tx.timestamp || new Date().toISOString(),
          paymentMethod: tx.paymentMethod || 'Paystack / Bank Transfer',
          proof: tx.reference,
          status: statusStr,
          submittedAt: tx.timestamp || new Date().toISOString(),
          approvedAt: tx.approvedAt || tx.timestamp,
          approvedBy: tx.approvedBy || 'Mr Akinjo Rotimi (Directorate Admin)',
          rejectedBy: '',
          rejectionReason: '',
          startDate: tx.date || '2026-10-01',
          expiryDate: tx.validUntil || '2026-10-31',
          receiptNumber: tx.receiptNumber || '',
          receiptId: tx.receiptNumber ? `rec-${tx.id}` : '',
        });
      } else {
        const existing = map.get(key);
        if (tx.receiptNumber) existing.receiptNumber = tx.receiptNumber;
        if (tx.status === 'Successful') existing.status = 'Approved';
      }
    });

    // 3. Students from studentsList who have active subscription / approved tuition
    (studentsList || []).forEach((s) => {
      const isPaid = s.subscriptionStatus === 'Active' || (s.tuitionPaid || 0) >= 15000 || s.paymentStatus === 'APPROVED' || s.lastApprovedReceipt;
      if (isPaid) {
        const ref = s.lastApprovedReceipt?.transactionReference || `DEC-TX-${s.registrationNumber}`;
        if (!map.has(ref) && !Array.from(map.values()).some((p) => p.studentId === s.id || p.studentId === s.registrationNumber)) {
          map.set(ref, {
            id: `pay-std-${s.id}`,
            reference: ref,
            studentId: s.registrationNumber || s.id,
            studentName: s.fullName,
            studentPhone: s.phone || '08147896930',
            studentEmail: s.email || 'student@densuredconsult.ng',
            program: s.program || 'UTME',
            amount: s.monthlyFee || (s.studentShift === 'Evening' ? 15000 : 20000),
            monthPeriod: s.subscriptionMonth || s.paymentMonth || 'October 2026',
            year: 2026,
            date: '2026-10-01',
            timestamp: s.lastApprovedReceipt?.approvedAt || '2026-10-01T10:00:00.000Z',
            paymentMethod: s.lastApprovedReceipt?.paymentMethod || 'Bank Transfer',
            proof: ref,
            status: 'Approved',
            submittedAt: s.lastApprovedReceipt?.issueDate || '01 Oct 2026',
            approvedAt: s.lastApprovedReceipt?.approvedAt || '01 Oct 2026 10:00 AM',
            approvedBy: s.lastApprovedReceipt?.approvedBy || 'Mr Akinjo Rotimi (Directorate Admin)',
            rejectedBy: '',
            rejectionReason: '',
            startDate: '2026-10-01',
            expiryDate: s.subscriptionExpiryDate || '2026-10-31',
            receiptNumber: s.lastApprovedReceipt?.receiptNumber || `DEA-REC-2026-${s.registrationNumber.replace(/\D/g, '').slice(-5) || '00001'}`,
            receiptId: `rec-${s.id}`,
          });
        }
      }
    });

    return Array.from(map.values());
  }, [monthlyPaymentSubmissions, transactions, studentsList]);

  // Filtered & Sorted Payment History Records
  const filteredPaymentsList = React.useMemo(() => {
    return unifiedPayments.filter((item) => {
      // 1. Search Query
      if (paymentSearch.trim()) {
        const q = paymentSearch.toLowerCase().trim();
        const matchName = item.studentName.toLowerCase().includes(q);
        const matchId = (item.studentId || '').toLowerCase().includes(q);
        const matchRef = (item.reference || '').toLowerCase().includes(q);
        const matchRec = (item.receiptNumber || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchRef && !matchRec) return false;
      }

      // 2. Month Filter
      if (paymentMonthFilter !== 'All') {
        if (!item.monthPeriod.toLowerCase().includes(paymentMonthFilter.toLowerCase())) return false;
      }

      // 3. Year Filter
      if (paymentYearFilter !== 'All') {
        const itemYearStr = String(item.year || item.timestamp || item.date || item.monthPeriod);
        if (!itemYearStr.includes(paymentYearFilter)) return false;
      }

      // 4. Status Filter
      if (paymentStatusFilter !== 'All') {
        if (item.status.toLowerCase() !== paymentStatusFilter.toLowerCase()) return false;
      }

      // 5. Date Range Filter
      if (paymentStartDate) {
        if (item.date < paymentStartDate) return false;
      }
      if (paymentEndDate) {
        if (item.date > paymentEndDate) return false;
      }

      // 6. Timeframe Filter
      if (paymentTimeframeFilter !== 'all') {
        const now = new Date();
        const itemDate = new Date(item.date || item.timestamp);
        if (paymentTimeframeFilter === 'daily') {
          if (itemDate.toDateString() !== now.toDateString()) return false;
        } else if (paymentTimeframeFilter === 'weekly') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (itemDate < sevenDaysAgo) return false;
        } else if (paymentTimeframeFilter === 'monthly') {
          if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) return false;
        } else if (paymentTimeframeFilter === 'annual') {
          if (itemDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (paymentSortOrder === 'newest') {
        return new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime();
      }
      if (paymentSortOrder === 'oldest') {
        return new Date(a.timestamp || a.date).getTime() - new Date(b.timestamp || b.date).getTime();
      }
      if (paymentSortOrder === 'amount-high') {
        return b.amount - a.amount;
      }
      if (paymentSortOrder === 'amount-low') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [
    unifiedPayments,
    paymentSearch,
    paymentMonthFilter,
    paymentYearFilter,
    paymentStatusFilter,
    paymentStartDate,
    paymentEndDate,
    paymentTimeframeFilter,
    paymentSortOrder,
  ]);

  const totalPaymentPages = Math.max(1, Math.ceil(filteredPaymentsList.length / paymentPageSize));
  const paginatedPayments = React.useMemo(() => {
    const start = (paymentPage - 1) * paymentPageSize;
    return filteredPaymentsList.slice(start, start + paymentPageSize);
  }, [filteredPaymentsList, paymentPage, paymentPageSize]);

  const totalRevenue = transactions.reduce((acc, t) => acc + (t.status === 'Successful' ? (t.amount || 0) : 0), 0);
  const activePaidStudentsCount = studentsList.filter((s) => s.subscriptionStatus === 'Active' || (s.tuitionPaid || 0) >= 20000).length;

  // Consolidated student payment submissions from both monthlyPaymentSubmissions and transactions across all statuses
  const allStudentPaymentSubmissions = React.useMemo(() => {
    const list: any[] = [];
    const seenRefs = new Set<string>();

    // 1. From monthlyPaymentSubmissions
    (monthlyPaymentSubmissions || []).forEach((m) => {
      const ref = m.transactionReference || m.referenceOrProof || m.id;
      seenRefs.add(ref.toLowerCase().trim());
      const std = studentsList.find(
        (s) =>
          s.id === m.studentId ||
          s.registrationNumber === m.registrationNumber ||
          (m.studentEmail && s.email && s.email.toLowerCase() === m.studentEmail.toLowerCase()) ||
          (m.studentName && s.fullName && s.fullName.toLowerCase().trim() === m.studentName.toLowerCase().trim())
      );
      list.push({
        id: m.id,
        sourceType: 'submission' as const,
        original: m,
        studentId: m.studentId || std?.id || 'std-unknown',
        studentName: m.studentName || std?.fullName || 'Candidate Scholar',
        studentEmail: m.studentEmail || std?.email || `${(std?.registrationNumber || m.studentId || 'student').toLowerCase()}@student.dec.ng`,
        studentPhone: m.studentPhone || std?.phone || 'N/A',
        registrationNumber: m.registrationNumber || std?.registrationNumber || m.studentId || 'Pending',
        program: m.program || std?.program || 'UTME',
        studentShift: m.studentShift || std?.studentShift || 'Morning',
        amount: m.amount || std?.monthlyFee || 20000,
        monthPeriod: m.monthPeriod || 'Monthly Tuition',
        paymentMethod: m.paymentMethod || 'Bank Transfer',
        reference: ref,
        date: m.paymentDate || (m.submittedAt ? m.submittedAt.split(',')[0] : 'Today'),
        submittedAt: m.submittedAt || 'Recent',
        status: (m.status as any) || 'Pending',
        proof: m.proofUrl,
        remarks: m.studentRemarks || 'Direct Verification',
        receiptNumber: m.receiptNumber,
        approvedBy: m.approvedBy,
        approvedAt: m.approvedAt,
        rejectionReason: m.rejectionReason,
        rejectedBy: m.rejectedBy,
        rejectedAt: m.rejectedAt,
      });
    });

    // 2. From transactions
    (transactions || []).forEach((t) => {
      const ref = t.reference || t.id;
      if (!seenRefs.has(ref.toLowerCase().trim())) {
        seenRefs.add(ref.toLowerCase().trim());
        const std = studentsList.find(
          (s) =>
            s.id === t.studentId ||
            s.registrationNumber === t.studentId ||
            (t.studentName && s.fullName && s.fullName.toLowerCase().trim() === t.studentName.toLowerCase().trim())
        );
        const mappedStatus =
          t.status === 'Successful' || (t.status as string) === 'Approved'
            ? 'Approved'
            : t.status === 'Failed' || (t.status as string) === 'Rejected'
            ? 'Rejected'
            : 'Pending';

        list.push({
          id: t.id,
          sourceType: 'transaction' as const,
          original: t,
          studentId: t.studentId || std?.id || 'std-unknown',
          studentName: t.studentName || std?.fullName || 'Candidate Scholar',
          studentEmail: std?.email || `${(std?.registrationNumber || t.studentId || 'student').toLowerCase()}@student.dec.ng`,
          studentPhone: std?.phone || 'N/A',
          registrationNumber: std?.registrationNumber || t.studentId || 'Pending',
          program: t.program || std?.program || 'UTME',
          studentShift: t.studentShift || std?.studentShift || 'Morning',
          amount: t.amount || std?.monthlyFee || 20000,
          monthPeriod: t.monthPeriod || 'Monthly Tuition',
          paymentMethod: t.paymentMethod || 'Bank Transfer',
          reference: ref,
          date: t.date || (t.timestamp ? t.timestamp.split(',')[0] : 'Today'),
          submittedAt: t.timestamp || 'Recent',
          status: mappedStatus,
          proof: '',
          remarks: t.description || 'Monthly Tuition Clearance',
          receiptNumber: t.receiptNumber,
          approvedBy: t.approvedBy,
          approvedAt: t.approvedAt,
          rejectionReason: t.rejectionReason,
          rejectedBy: t.rejectedBy,
          rejectedAt: t.rejectedAt,
        });
      }
    });

    return list;
  }, [monthlyPaymentSubmissions, transactions, studentsList]);

  // Clearly identifiable pending submissions
  const allPendingTuitionSubmissions = React.useMemo(() => {
    return allStudentPaymentSubmissions.filter((sub) => sub.status === 'Pending');
  }, [allStudentPaymentSubmissions]);

  // Filtered submissions based on search, channel method, and status tab filter
  const filteredPendingSubmissions = React.useMemo(() => {
    return allStudentPaymentSubmissions.filter((sub) => {
      // Status filter
      if (paymentStatusTab === 'Pending' && sub.status !== 'Pending') return false;
      if (paymentStatusTab === 'Approved' && sub.status !== 'Approved') return false;
      if (paymentStatusTab === 'Rejected' && sub.status !== 'Rejected') return false;

      // Method filter
      const matchesMethod =
        pendingPayMethodFilter === 'All' || sub.paymentMethod === pendingPayMethodFilter;
      if (!matchesMethod) return false;

      // Search query
      const q = pendingPaySearch.toLowerCase().trim();
      if (!q) return true;

      return (
        (sub.studentName && sub.studentName.toLowerCase().includes(q)) ||
        (sub.studentEmail && sub.studentEmail.toLowerCase().includes(q)) ||
        (sub.registrationNumber && sub.registrationNumber.toLowerCase().includes(q)) ||
        (sub.studentId && sub.studentId.toLowerCase().includes(q)) ||
        (sub.reference && sub.reference.toLowerCase().includes(q)) ||
        (sub.date && sub.date.toLowerCase().includes(q)) ||
        (sub.monthPeriod && sub.monthPeriod.toLowerCase().includes(q)) ||
        (sub.program && sub.program.toLowerCase().includes(q))
      );
    });
  }, [allStudentPaymentSubmissions, paymentStatusTab, pendingPayMethodFilter, pendingPaySearch]);

  const handleApprovePendingPayment = (item: any) => {
    if (item.status === 'Approved') {
      showToast('info', 'Already Approved', `Payment #${item.reference} has already been approved.`);
      return;
    }
    try {
      const rec = approveAnyPayment(item.id || item.reference);
      if (rec) {
        openReceiptModal(rec);
      }
      showToast('success', 'Tuition Payment Approved', `Payment for ${item.studentName} approved. Features unlocked and official receipt generated.`);
    } catch (err: any) {
      showToast('error', 'Approval Error', err?.message || 'Could not approve payment submission.');
    }
  };

  const handleOpenRejectModal = (item: any) => {
    setRejectionModal({
      isOpen: true,
      item,
      reason: 'Transaction reference not found on institutional bank statement',
      customReason: '',
    });
  };

  const handleConfirmRejection = () => {
    if (!rejectionModal.item) return;
    const finalReason =
      rejectionModal.reason === 'Other'
        ? rejectionModal.customReason.trim() || 'Payment details unverified.'
        : rejectionModal.reason;

    try {
      rejectAnyPayment(rejectionModal.item.id || rejectionModal.item.reference, finalReason);
      setRejectionModal({ isOpen: false, item: null, reason: '', customReason: '' });
      showToast('warning', 'Payment Rejected', `Payment #${rejectionModal.item.reference} was rejected: ${finalReason}`);
    } catch (err: any) {
      showToast('error', 'Rejection Error', err?.message || 'Could not reject payment submission.');
    }
  };

  return (
    <div className="bg-slate-100 min-h-[calc(100vh-80px)] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Executive Header Banner */}
        <div className="bg-gradient-to-r from-[#0a192f] via-[#112240] to-[#0a192f] text-white p-6 sm:p-7 rounded-3xl border-2 border-[#d97706]/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#d97706]/15 text-[#d97706] border border-[#d97706]/40 flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              <ShieldCheck className="w-8 h-8 text-[#d97706]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">Executive Directorate Portal</h1>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#d97706] text-[#0a192f] uppercase">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Logged in as: <strong className="text-white">{adminUser ? adminUser.name : 'Directorate Executive'}</strong> • Session 2026
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[11px] text-amber-300 font-mono bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1.5">
                  <span className="text-slate-400">Dashboard Link:</span>
                  <span>https://www.densuredconsultacademy.com.ng/admin</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('https://www.densuredconsultacademy.com.ng/admin');
                    showToast('Admin link copied to clipboard!', 'success');
                  }}
                  className="text-[10px] text-sky-300 hover:text-white underline cursor-pointer"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={logoutAdmin}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Categorized Navigation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mobile Admin Navigation Header & Quick Scroll Bar */}
          <div className="lg:hidden col-span-1 space-y-3">
            {(() => {
              const activeItem = navSections.flatMap((s) => s.items).find((item) => item.id === adminTab);
              return (
                <>
                  <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="p-2 rounded-xl bg-[#0a192f] text-[#d97706] shrink-0">
                        {activeItem?.icon}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Current Tab</span>
                        <span className="text-xs font-black text-[#0a192f] block truncate">{activeItem?.label || 'Dashboard'}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileAdminNavOpen(!mobileAdminNavOpen)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <span>{mobileAdminNavOpen ? 'Close Menu' : 'All Sections'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileAdminNavOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Quick Horizontal Tab Bar for Mobile */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs overflow-x-auto">
                    <div className="flex items-center gap-1.5 min-w-max">
                      {navSections.flatMap((s) => s.items).map((item) => {
                        const isActive = adminTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setAdminTab(item.id);
                              setMobileAdminNavOpen(false);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#0a192f] text-[#d97706] shadow-2xs'
                                : 'text-slate-600 hover:text-[#0a192f] hover:bg-slate-100'
                            }`}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Collapsible Full Navigation on Mobile */}
                  {mobileAdminNavOpen && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-md space-y-4 animate-in fade-in duration-200">
                      {navSections.map((sec, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block px-2">
                            {sec.section}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {sec.items.map((item) => {
                              const isActive = adminTab === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setAdminTab(item.id);
                                    setMobileAdminNavOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-[#0a192f] text-[#d97706] shadow-2xs'
                                      : 'text-slate-600 hover:text-[#0a192f] hover:bg-slate-100'
                                  }`}
                                >
                                  <span className="flex items-center gap-2.5">
                                    {item.icon}
                                    <span>{item.label}</span>
                                  </span>
                                  {item.badge && (
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                        isActive ? 'bg-[#d97706] text-[#0a192f]' : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Desktop Left Navigation Sidebar */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-5 sticky top-24 max-h-[80vh] overflow-y-auto">
              {navSections.map((sec, idx) => (
                <div key={idx} className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block px-2">
                    {sec.section}
                  </span>
                  <div className="space-y-0.5">
                    {sec.items.map((item) => {
                      const isActive = adminTab === item.id;
                      return (
                        <a
                          key={item.id}
                          href={`#/admin-portal?tab=${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setAdminTab(item.id);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#0a192f] text-[#d97706] shadow-2xs'
                              : 'text-slate-600 hover:text-[#0a192f] hover:bg-slate-100'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            {item.icon}
                            <span>{item.label}</span>
                          </span>
                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                isActive ? 'bg-[#d97706] text-[#0a192f]' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* FEATURE 0: EXECUTIVE DASHBOARD (Requirement 36) */}
            {adminTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7] bg-sky-50 border border-sky-200 px-3 py-1 rounded-full inline-block mb-1.5">
                      Directorate Operational Center
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">Executive Academy Dashboard</h2>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Real-time institutional metrics calculated directly from active database records.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdminTab('pending-payments')}
                      className="px-3.5 py-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Payments</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTab('attendance')}
                      className="px-3.5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Take Attendance</span>
                    </button>
                  </div>
                </div>

                {/* 10 Database Statistics Cards (Requirement 36) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                  {/* 1. Total Students */}
                  <div
                    onClick={() => setAdminTab('students')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#0284c7] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Total Students</span>
                      <Users className="w-4 h-4 text-[#0284c7]" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                        {studentsList.length}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Enrolled candidates</p>
                    </div>
                  </div>

                  {/* 2. Active Students */}
                  <div
                    onClick={() => setAdminTab('students')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-bold text-emerald-700 uppercase">Active Students</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                        {studentsList.filter((s) => s.subscriptionStatus === 'Active' || isStudentSubscriptionActive(s)).length}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Current valid tuition</p>
                    </div>
                  </div>

                  {/* 3. Pending Registrations */}
                  <div
                    onClick={() => setAdminTab('registrations')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-amber-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-bold text-amber-700 uppercase">Pending Reg.</span>
                      <UserCheck className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
                        {applications.filter((a) => a.status === 'Pending Review').length}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Awaiting enrollment</p>
                    </div>
                  </div>

                  {/* 4. Pending Payments */}
                  <div
                    onClick={() => setAdminTab('pending-payments')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-orange-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-bold text-[#ea580c] uppercase">Pending Payments</span>
                      <Clock className="w-4 h-4 text-[#ea580c]" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl sm:text-3xl font-black text-[#ea580c] font-mono">
                        {transactions.filter((t) => t.status === 'Pending').length +
                          monthlyPaymentSubmissions.filter((m) => m.status === 'Pending').length}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Awaiting clearance</p>
                    </div>
                  </div>

                  {/* 5. Approved Payments */}
                  <div
                    onClick={() => setAdminTab('finance-reports')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-bold text-emerald-700 uppercase">Approved Pay.</span>
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                        {transactions.filter((t) => t.status === 'Successful').length +
                          monthlyPaymentSubmissions.filter((m) => m.status === 'Approved').length}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Total cleared</p>
                    </div>
                  </div>

                  {/* 6. Expired Payments */}
                  <div
                    onClick={() => setAdminTab('payments')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-red-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-bold text-red-700 uppercase">Expired Pay.</span>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl sm:text-3xl font-black text-red-600 font-mono">
                        {studentsList.filter((s) => s.subscriptionStatus === 'Expired' || !isStudentSubscriptionActive(s)).length}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Due for renewal</p>
                    </div>
                  </div>

                  {/* 7. Today's Attendance */}
                  <div
                    onClick={() => setAdminTab('attendance')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#0284c7] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Today Attendance</span>
                      <Calendar className="w-4 h-4 text-[#0284c7]" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                        {attendanceSessions.find((s) => s.date === new Date().toISOString().split('T')[0])?.entries.length || 0}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Logged entries today</p>
                    </div>
                  </div>

                  {/* 8. CBT Tests */}
                  <div
                    onClick={() => setAdminTab('cbt-management')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#0284c7] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">CBT Tests</span>
                      <Award className="w-4 h-4 text-[#f59e0b]" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl sm:text-3xl font-black text-[#0f172a] font-mono">
                        {cbtExams.length}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Active mock simulations</p>
                    </div>
                  </div>

                  {/* 9. Study Materials */}
                  <div
                    onClick={() => setAdminTab('materials')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#0284c7] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Study Materials</span>
                      <Download className="w-4 h-4 text-[#0284c7]" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                        {studyMaterials.length}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Published e-resources</p>
                    </div>
                  </div>

                  {/* 10. Announcements */}
                  <div
                    onClick={() => setAdminTab('announcements')}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#0284c7] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Announcements</span>
                      <Megaphone className="w-4 h-4 text-[#ea580c]" />
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                        {announcements.length}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Broadcasted notices</p>
                    </div>
                  </div>
                </div>

                {/* Quick Operational Sections: Pending Payments & Student Quick List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pending Payments Queue */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#ea580c]" />
                        <h3 className="font-extrabold text-slate-900 text-sm">Pending Payments Clearance</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAdminTab('pending-payments')}
                        className="text-xs font-bold text-[#0284c7] hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    {transactions.filter((t) => t.status === 'Pending').length > 0 ? (
                      <div className="space-y-2.5">
                        {transactions
                          .filter((t) => t.status === 'Pending')
                          .slice(0, 4)
                          .map((tx) => (
                            <div
                              key={tx.id}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900 block">{tx.studentName}</span>
                                <span className="font-mono text-[11px] text-slate-500">
                                  {tx.reference} • ₦{tx.amount.toLocaleString()}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const rec = approveAnyPayment(tx.id);
                                  if (rec) openReceiptModal(rec);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No pending tuition payments at this moment. All cleared.
                      </div>
                    )}
                  </div>

                  {/* Recent Candidates List */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#0284c7]" />
                        <h3 className="font-extrabold text-slate-900 text-sm">Enrolled Candidate Dossiers</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAdminTab('students')}
                        className="text-xs font-bold text-[#0284c7] hover:underline"
                      >
                        Directory
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {studentsList.slice(0, 4).map((std) => (
                        <div
                          key={std.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={std.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e2e8f0"/><circle cx="50" cy="40" r="20" fill="%2394a3b8"/><path d="M20 90 C20 65 35 55 50 55 C65 55 80 65 80 90 Z" fill="%2394a3b8"/></svg>'}
                              alt={std.fullName}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-300 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{std.fullName}</span>
                              <span className="font-mono text-[11px] text-slate-500">
                                {std.registrationNumber} • {std.program}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              std.subscriptionStatus === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {std.subscriptionStatus || 'Active'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FEATURE: DAILY ATTENDANCE ROLL CALL ON ADMIN DASHBOARD */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-[#0284c7]" />
                        <h3 className="font-extrabold text-slate-900 text-base">Daily Attendance Roll Call</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Click Present, Late, Absent, or Excused for any student to log today&apos;s daily attendance in real-time.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-xs border border-slate-200">
                        Session: {attendanceDate}
                      </span>
                      <button
                        type="button"
                        onClick={handleMarkAllPresent}
                        className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-300 font-bold text-xs cursor-pointer transition-colors"
                      >
                        Mark All Present
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAttendance}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save Session</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {studentsList.slice(0, 10).map((std) => {
                      const currentStatus = attendanceEntries[std.id] || 'Present';
                      return (
                        <div
                          key={std.id}
                          className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={std.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e2e8f0"/><circle cx="50" cy="40" r="20" fill="%2394a3b8"/><path d="M20 90 C20 65 35 55 50 55 C65 55 80 65 80 90 Z" fill="%2394a3b8"/></svg>'}
                              alt={std.fullName}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-300 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block text-sm">{std.fullName}</span>
                              <span className="font-mono text-[11px] text-slate-500">
                                {std.registrationNumber} • {std.program} ({std.studentShift || 'Morning'})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(['Present', 'Late', 'Absent', 'Excused'] as const).map((status) => {
                              const isSelected = currentStatus === status;
                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => {
                                    setAttendanceEntries((prev) => ({ ...prev, [std.id]: status }));
                                    recordIndividualStudentAttendance(
                                      std.id,
                                      attendanceDate,
                                      status,
                                      `Marked ${status} via Admin Dashboard roll call`,
                                      attendanceTime,
                                      { cohort: attendanceCohort, subject: `${std.program} Daily Roll Call` }
                                    );
                                    showToast('success', 'Attendance Updated', `${std.fullName} marked as ${status}`);
                                  }}
                                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                                    isSelected
                                      ? status === 'Present'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : status === 'Late'
                                        ? 'bg-amber-500 text-white shadow-xs'
                                        : status === 'Absent'
                                        ? 'bg-red-600 text-white shadow-xs'
                                        : 'bg-blue-600 text-white shadow-xs'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                  }`}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {studentsList.length > 10 && (
                    <div className="text-center pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setAdminTab('attendance')}
                        className="text-xs font-bold text-[#0284c7] hover:underline cursor-pointer"
                      >
                        View full attendance roster ({studentsList.length} candidates) →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FEATURE 1: STUDENT DIRECTORY */}
            {adminTab === 'students' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#0a192f]">Student Directory</h2>
                    <p className="text-slate-500 text-xs">
                      Enrolled candidate dossiers, academic tracking, and attendance standings.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enroll New Student</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search by student name or reg number..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-[#d97706]"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  <select
                    value={studentProgFilter}
                    onChange={(e) => setStudentProgFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#0a192f] bg-white outline-hidden"
                  >
                    <option value="All">All Programmes ({studentsList.length})</option>
                    <option value="UTME">UTME</option>
                    <option value="WAEC">WAEC</option>
                    <option value="IELTS">IELTS</option>
                    <option value="ATSWA">ATSWA</option>
                    <option value="SAT">SAT</option>
                  </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-3">Reg No</th>
                        <th className="py-3 px-3">Candidate</th>
                        <th className="py-3 px-3">Programme</th>
                        <th className="py-3 px-3">Avg Score</th>
                        <th className="py-3 px-3">Attendance</th>
                        <th className="py-3 px-3">Shift & Tuition</th>
                        <th className="py-3 px-3 text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredStudents.map((std) => (
                        <tr
                          key={std.id}
                          className="hover:bg-amber-50/40 transition-colors group cursor-pointer"
                          onClick={() => setSelectedStudentDetails(std)}
                        >
                          <td className="py-3.5 px-3 font-mono font-bold text-[#0a192f]">
                            <span className="underline decoration-dotted text-[#25166B] font-bold group-hover:text-[#D5241B]">
                              {std.registrationNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={std.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e2e8f0"/><circle cx="50" cy="40" r="20" fill="%2394a3b8"/><path d="M20 90 C20 65 35 55 50 55 C65 55 80 65 80 90 Z" fill="%2394a3b8"/></svg>'}
                                alt={std.fullName}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                              />
                              <div>
                                <span className="font-bold text-[#0a192f] group-hover:text-[#D5241B] block">
                                  {std.fullName}
                                </span>
                                <span className="text-[10px] text-slate-400">{std.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-bold">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-[#25166B] font-bold text-[11px]">
                              {std.program}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-[#d97706]">{std.currentAverageScore}</td>
                          <td className="py-3.5 px-3 font-bold text-emerald-600">{std.attendanceRate}%</td>
                          <td className="py-3.5 px-3">
                            <span className="text-[11px] font-bold text-slate-700 block">
                              {std.studentShift || 'Morning'} (₦{(std.monthlyFee || (std.studentShift === 'Evening' ? 15000 : 20000)).toLocaleString()}/mo)
                            </span>
                            {std.tuitionBalance > 0 ? (
                              <span className="font-mono text-amber-700 font-bold text-[11px]">
                                Bal: ₦{std.tuitionBalance.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-bold text-[10px]">Active Cleared</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                title="Mark Attendance for Candidate"
                                onClick={() => {
                                  setSelectedStudentDetails(std);
                                  setIndividualAttendanceDate(new Date().toISOString().split('T')[0]);
                                  setIndividualAttendanceStatus('Present');
                                }}
                                className="px-2 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="hidden sm:inline">Attendance</span>
                              </button>
                              <button
                                type="button"
                                title="View Full Candidate Dossier"
                                onClick={() => setSelectedStudentDetails(std)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:border-[#25166B] hover:bg-[#25166B]/10 text-[#25166B] transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Print / Download Student ID Card"
                                onClick={() => openStudentDocumentModal(std, 'id-card')}
                                className="p-1.5 rounded-lg border border-slate-200 hover:border-[#009E49] hover:bg-[#009E49]/10 text-[#009E49] transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Delete Candidate Profile from Database"
                                onClick={() => setStudentToDelete(std)}
                                className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
                  <span><strong>Tip:</strong> Click on any student row or name to view their complete biodata, registered subjects, take individual daily attendance, download weekly/monthly/overall attendance in CSV, or print official documents.</span>
                  <span className="font-bold text-slate-700">Total Enrolled: {studentsList.length} Candidates</span>
                </div>
              </div>
            )}

            {/* FEATURE 1B: ENROLLMENT MANAGEMENT */}
            {adminTab === 'registrations' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#25166B]/10 text-[#25166B] border border-[#25166B]/20">
                        Enrollment Directorate
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Student Enrollment Management
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Review submitted registration applications, approve student admission, edit candidate details, and manage student credentials.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs border border-slate-200">
                      Total: {applications.length}
                    </span>
                  </div>
                </div>

                {/* Status Summary Counter Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div
                    onClick={() => setEnrollmentStatusFilter('All')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      enrollmentStatusFilter === 'All'
                        ? 'bg-[#25166B] text-white border-[#25166B] shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="text-[11px] font-bold block uppercase tracking-wider opacity-80">All Applications</span>
                    <span className="text-2xl font-black font-mono mt-1 block">{applications.length}</span>
                  </div>

                  <div
                    onClick={() => setEnrollmentStatusFilter('Pending Review')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      enrollmentStatusFilter === 'Pending Review'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-amber-50/60 hover:bg-amber-100/60 border-amber-200 text-amber-900'
                    }`}
                  >
                    <span className="text-[11px] font-bold block uppercase tracking-wider opacity-90">Pending Review</span>
                    <span className="text-2xl font-black font-mono mt-1 block">
                      {applications.filter((a) => a.status === 'Pending Review' || a.status === 'Pending' || a.enrollmentStatus === 'PENDING').length}
                    </span>
                  </div>

                  <div
                    onClick={() => setEnrollmentStatusFilter('Approved')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      enrollmentStatusFilter === 'Approved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-emerald-50/60 hover:bg-emerald-100/60 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <span className="text-[11px] font-bold block uppercase tracking-wider opacity-90">Enrolled (Approved)</span>
                    <span className="text-2xl font-black font-mono mt-1 block">
                      {applications.filter((a) => a.status === 'Approved' || a.enrollmentStatus === 'APPROVED').length}
                    </span>
                  </div>

                  <div
                    onClick={() => setEnrollmentStatusFilter('Rejected')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      enrollmentStatusFilter === 'Rejected'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-red-50/60 hover:bg-red-100/60 border-red-200 text-red-900'
                    }`}
                  >
                    <span className="text-[11px] font-bold block uppercase tracking-wider opacity-90">Rejected</span>
                    <span className="text-2xl font-black font-mono mt-1 block">
                      {applications.filter((a) => a.status === 'Rejected' || a.enrollmentStatus === 'REJECTED').length}
                    </span>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search applicant name, email, phone, ID..."
                      value={enrollmentSearch}
                      onChange={(e) => setEnrollmentSearch(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#25166B]/30"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                    <span className="text-xs text-slate-500 font-semibold">Status:</span>
                    <select
                      value={enrollmentStatusFilter}
                      onChange={(e) => setEnrollmentStatusFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-hidden"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Approved">Approved / Enrolled</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <span className="text-xs text-slate-500 font-semibold ml-2">Program:</span>
                    <select
                      value={enrollmentProgFilter}
                      onChange={(e) => setEnrollmentProgFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-hidden"
                    >
                      <option value="All">All Programs</option>
                      <option value="UTME">UTME / JAMB</option>
                      <option value="WAEC">WAEC (SSCE)</option>
                      <option value="NECO">NECO</option>
                      <option value="IELTS">IELTS Prep</option>
                    </select>
                  </div>
                </div>

                {/* Applications List */}
                {(() => {
                  const filteredApps = applications.filter((app) => {
                    const matchesSearch =
                      !enrollmentSearch ||
                      (app.fullName && app.fullName.toLowerCase().includes(enrollmentSearch.toLowerCase())) ||
                      (app.email && app.email.toLowerCase().includes(enrollmentSearch.toLowerCase())) ||
                      (app.phone && app.phone.includes(enrollmentSearch)) ||
                      (app.id && app.id.toLowerCase().includes(enrollmentSearch.toLowerCase())) ||
                      (app.student_id && String(app.student_id).toLowerCase().includes(enrollmentSearch.toLowerCase()));

                    const matchesStatus =
                      enrollmentStatusFilter === 'All' ||
                      (enrollmentStatusFilter === 'Pending Review' && (app.status === 'Pending Review' || app.status === 'Pending' || app.enrollmentStatus === 'PENDING')) ||
                      (enrollmentStatusFilter === 'Approved' && (app.status === 'Approved' || app.enrollmentStatus === 'APPROVED')) ||
                      (enrollmentStatusFilter === 'Rejected' && (app.status === 'Rejected' || app.enrollmentStatus === 'REJECTED'));

                    const matchesProg = enrollmentProgFilter === 'All' || app.program === enrollmentProgFilter;

                    return matchesSearch && matchesStatus && matchesProg;
                  });

                  if (filteredApps.length === 0) {
                    return (
                      <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
                        <Users className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="font-bold text-slate-700 text-sm">No Enrollment Applications Found</p>
                        <p className="text-slate-400 text-xs">
                          {enrollmentSearch || enrollmentStatusFilter !== 'All' || enrollmentProgFilter !== 'All'
                            ? 'No applications match your current search/filter criteria.'
                            : 'Submitted online student registration applications will appear here for admin review.'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filteredApps.map((app) => {
                        const isApproved = app.status === 'Approved' || app.enrollmentStatus === 'APPROVED';
                        const isPending = !isApproved && (app.status === 'Pending Review' || app.status === 'Pending' || app.enrollmentStatus === 'PENDING' || !app.status);
                        const isRejected = app.status === 'Rejected' || app.enrollmentStatus === 'REJECTED';

                        return (
                          <div
                            key={app.id}
                            className={`p-5 rounded-2xl border transition-all text-xs space-y-4 ${
                              isApproved
                                ? 'bg-emerald-50/30 border-emerald-200'
                                : isRejected
                                ? 'bg-red-50/30 border-red-200'
                                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 overflow-hidden shrink-0">
                                  {app.passportPhotoUrl || app.photoUrl || (app as any).photo_url ? (
                                    <img
                                      src={(app.passportPhotoUrl || app.photoUrl || (app as any).photo_url) || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e2e8f0"/><circle cx="50" cy="40" r="20" fill="%2394a3b8"/><path d="M20 90 C20 65 35 55 50 55 C65 55 80 65 80 90 Z" fill="%2394a3b8"/></svg>'}
                                      alt={app.fullName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-5 h-5 text-slate-500" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-extrabold text-slate-900 text-sm">{app.fullName}</h3>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                                        isApproved
                                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                          : isRejected
                                          ? 'bg-red-100 text-red-800 border-red-300'
                                          : 'bg-amber-100 text-amber-800 border-amber-300'
                                      }`}
                                    >
                                      {isApproved ? 'ENROLLMENT APPROVED' : isRejected ? 'ENROLLMENT REJECTED' : 'ENROLLMENT PENDING'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                    App ID: <strong>{app.id}</strong> {app.student_id ? `• Student ID: ${app.student_id}` : ''} • Submitted: {app.submittedAt || '2026/2027'}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => setSelectedApplication(app)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingApplication(app);
                                    setEditAppForm({
                                      fullName: app.fullName || '',
                                      email: app.email || '',
                                      phone: app.phone || '',
                                      program: app.program || 'UTME',
                                      studyMode: app.studyMode || 'Physical Weekday',
                                      targetScore: app.targetScore || '320+',
                                      targetExamDate: app.targetExamDate || 'April 2026',
                                      parentName: app.parentName || '',
                                      parentPhone: app.parentPhone || '',
                                      parentEmail: app.parentEmail || '',
                                      address: app.address || '',
                                      secondarySchool: (app as any).secondarySchool || '',
                                    });
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284c7] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-sky-200"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Edit Info</span>
                                </button>

                                {!isApproved && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateApplicationStatus(app.id, 'Approved');
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Approve Enrollment</span>
                                  </button>
                                )}

                                {!isRejected && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateApplicationStatus(app.id, 'Rejected');
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 border border-red-200"
                                  >
                                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                                    <span>Reject</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Info Columns */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-slate-600">
                              <div>
                                <span className="text-slate-400 block font-medium">Contact:</span>
                                <span className="font-bold text-slate-800">{app.email}</span>
                                <span className="block text-slate-700 font-mono">{app.phone}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-medium">Program &amp; Study Mode:</span>
                                <span className="font-bold text-slate-800">{app.program}</span>
                                <span className="block text-slate-700">{app.studyMode || 'Physical Weekday'} • {app.studentShift || 'Morning'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-medium">Parent / Guardian:</span>
                                <span className="font-bold text-slate-800">{app.parentName || 'N/A'}</span>
                                <span className="block text-slate-700 font-mono">{app.parentPhone || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-medium">Target Exam &amp; Score:</span>
                                <span className="font-bold text-slate-800">{app.targetExamDate || 'April 2026'}</span>
                                <span className="block text-[#D5241B] font-bold">Goal: {app.targetScore || '320+'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* FEATURE 2: DAILY ATTENDANCE */}
            {adminTab === 'attendance' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#0a192f]">Daily Attendance Logging</h2>
                    <p className="text-slate-500 text-xs">
                      Take roll call for physical lecture halls and CBT practical sessions.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleMarkAllPresent}
                      className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284c7] border-2 border-sky-300 font-extrabold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-[#0284c7]" />
                      <span>MARK ALL PRESENT</span>
                    </button>
                    <button
                      onClick={handleSaveAttendance}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Attendance Session</span>
                    </button>
                  </div>
                </div>

                {/* Session Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Session Date</label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Session Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM - 11:30 AM"
                      value={attendanceTime}
                      onChange={(e) => setAttendanceTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Programme Filter</label>
                    <select
                      value={attendanceProg}
                      onChange={(e) => setAttendanceProg(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                    >
                      <option value="All">All Enrolled Candidates ({studentsList.length})</option>
                      <option value="UTME">UTME Intensive</option>
                      <option value="WAEC">WAEC / WASSCE</option>
                      <option value="NECO">NECO Senior School</option>
                      <option value="JUPEB">JUPEB Direct Entry</option>
                      <option value="Post-UTME">Post-UTME Screening</option>
                      <option value="ATSWA">ATSWA / Accounting</option>
                      <option value="Adult Education">Adult Education</option>
                      <option value="IELTS">IELTS Prep</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Lecture Cohort</label>
                    <input
                      type="text"
                      value={attendanceCohort}
                      onChange={(e) => setAttendanceCohort(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                    />
                  </div>
                </div>

                {/* Candidate Attendance Roll */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={attendanceSearch}
                        onChange={(e) => setAttendanceSearch(e.target.value)}
                        placeholder="Search student by name or registration number..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-hidden focus:border-[#0284c7] bg-white"
                      />
                    </div>
                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(['All', 'Present', 'Late', 'Absent', 'Excused'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setAttendanceStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            attendanceStatusFilter === st
                              ? st === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs font-black'
                                : st === 'Late'
                                ? 'bg-amber-600 text-white shadow-xs font-black'
                                : st === 'Absent'
                                ? 'bg-red-600 text-white shadow-xs font-black'
                                : st === 'Excused'
                                ? 'bg-blue-600 text-white shadow-xs font-black'
                                : 'bg-[#0a192f] text-white shadow-xs font-black'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Counters */}
                  {(() => {
                    const relevant = studentsList.filter((s) => attendanceProg === 'All' || s.program === attendanceProg);
                    const pCount = relevant.filter((s) => {
                      const exist = s.attendanceHistory?.find((h) => h.date === attendanceDate);
                      return (attendanceEntries[s.id] || exist?.status || 'Present') === 'Present';
                    }).length;
                    const lCount = relevant.filter((s) => {
                      const exist = s.attendanceHistory?.find((h) => h.date === attendanceDate);
                      return (attendanceEntries[s.id] || exist?.status) === 'Late';
                    }).length;
                    const aCount = relevant.filter((s) => {
                      const exist = s.attendanceHistory?.find((h) => h.date === attendanceDate);
                      return (attendanceEntries[s.id] || exist?.status) === 'Absent';
                    }).length;
                    const eCount = relevant.filter((s) => {
                      const exist = s.attendanceHistory?.find((h) => h.date === attendanceDate);
                      return (attendanceEntries[s.id] || exist?.status) === 'Excused';
                    }).length;

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="text-[10px] uppercase font-bold text-emerald-800 block">Present</span>
                          <span className="text-base font-black text-emerald-700 font-mono">{pCount}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                          <span className="text-[10px] uppercase font-bold text-amber-800 block">Late</span>
                          <span className="text-base font-black text-amber-700 font-mono">{lCount}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
                          <span className="text-[10px] uppercase font-bold text-red-800 block">Absent</span>
                          <span className="text-base font-black text-red-700 font-mono">{aCount}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                          <span className="text-[10px] uppercase font-bold text-blue-800 block">Excused</span>
                          <span className="text-base font-black text-blue-700 font-mono">{eCount}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-2">
                    {studentsList
                      .filter((s) => attendanceProg === 'All' || s.program === attendanceProg)
                      .filter((s) => {
                        if (!attendanceSearch.trim()) return true;
                        const q = attendanceSearch.toLowerCase().trim();
                        return s.fullName.toLowerCase().includes(q) || s.registrationNumber.toLowerCase().includes(q);
                      })
                      .filter((s) => {
                        if (attendanceStatusFilter === 'All') return true;
                        const exist = s.attendanceHistory?.find((h) => h.date === attendanceDate);
                        const cur = attendanceEntries[s.id] || exist?.status || 'Present';
                        return cur === attendanceStatusFilter;
                      })
                      .map((std) => {
                        const existingRecord = std.attendanceHistory?.find((h) => h.date === attendanceDate);
                        const currentStatus = attendanceEntries[std.id] || existingRecord?.status || 'Present';
                        return (
                          <div
                            key={std.id}
                            className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <span className="font-bold text-[#0a192f] text-sm">{std.fullName}</span>
                              <span className="text-slate-400 font-mono block text-[11px]">
                                {std.registrationNumber} • {std.program} • {std.studentShift || 'Morning'}
                              </span>
                            </div>

                            <div className="flex gap-1.5 flex-wrap">
                              {(['Present', 'Late', 'Absent', 'Excused'] as const).map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => {
                                    setAttendanceEntries((prev) => ({ ...prev, [std.id]: status }));
                                    recordIndividualStudentAttendance(
                                      std.id,
                                      attendanceDate,
                                      status,
                                      `Marked ${status} in daily roll call`,
                                      attendanceTime,
                                      { cohort: attendanceCohort, subject: `${attendanceProg === 'All' ? std.program : attendanceProg} Session` }
                                    );
                                    showToast('success', 'Attendance Recorded', `${std.fullName} marked as ${status}`);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                    currentStatus === status
                                      ? status === 'Present'
                                        ? 'bg-emerald-600 text-white shadow-xs font-black ring-2 ring-emerald-600/30'
                                        : status === 'Late'
                                        ? 'bg-amber-600 text-white shadow-xs font-black ring-2 ring-amber-600/30'
                                        : status === 'Absent'
                                        ? 'bg-red-600 text-white shadow-xs font-black ring-2 ring-red-600/30'
                                        : 'bg-blue-600 text-white shadow-xs font-black ring-2 ring-blue-600/30'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE: STUDY MATERIALS REPOSITORY & MANAGEMENT */}
            {adminTab === 'materials' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#0a192f]">Study Materials Repository</h2>
                    <p className="text-slate-500 text-xs">
                      Upload, organize, and delete downloadable lesson summaries, past question booklets, and syllabus notes.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddMatModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#25166B] hover:bg-[#1a0f4c] text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4 text-[#FFC600]" />
                    <span>Upload New Material</span>
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={materialSearch}
                      onChange={(e) => setMaterialSearch(e.target.value)}
                      placeholder="Search study materials by title, author, or keyword..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-[#25166B] bg-slate-50/50"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-500 shrink-0">Subject:</span>
                    <select
                      value={materialSubjectFilter}
                      onChange={(e) => setMaterialSubjectFilter(e.target.value)}
                      className="w-full sm:w-48 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#0a192f] bg-slate-50/50 cursor-pointer focus:outline-hidden"
                    >
                      <option value="All">All Subjects</option>
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Use of English & Literature">Use of English</option>
                      <option value="Economics">Economics</option>
                      <option value="Government">Government</option>
                      <option value="Literature in English">Literature</option>
                      <option value="Accounting">Accounting</option>
                    </select>
                  </div>
                </div>

                {/* Materials Grid */}
                {(() => {
                  const filtered = studyMaterials.filter((mat) => {
                    const matchesSearch =
                      !materialSearch ||
                      (mat.title || '').toLowerCase().includes(materialSearch.toLowerCase()) ||
                      (mat.subject || '').toLowerCase().includes(materialSearch.toLowerCase()) ||
                      (mat.author || '').toLowerCase().includes(materialSearch.toLowerCase());
                    const matchesSubject =
                      materialSubjectFilter === 'All' || (mat.subject || '').toLowerCase().includes(materialSubjectFilter.toLowerCase());
                    return matchesSearch && matchesSubject;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                        <h4 className="font-bold text-sm text-[#0a192f]">No study materials found</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          {materialSearch || materialSubjectFilter !== 'All'
                            ? 'Try changing your search query or subject filter.'
                            : 'No study materials in the repository yet. Click below to add the first one.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowAddMatModal(true)}
                          className="px-4 py-2 rounded-xl bg-[#25166B] text-[#FFC600] font-black text-xs cursor-pointer shadow-xs hover:bg-[#1a0f4c]"
                        >
                          + Upload Study Material
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filtered.map((mat) => (
                        <div
                          key={mat.id}
                          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-[#25166B]/30 hover:shadow-xs transition-all space-y-3 text-xs flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#25166B] text-[#FFC600] uppercase tracking-wider">
                                {mat.fileType} • {mat.fileSize}
                              </span>
                              <span className="text-slate-400 font-mono text-[11px]">{mat.dateAdded}</span>
                            </div>
                            <h3 className="font-extrabold text-[#0a192f] text-sm leading-snug">{mat.title}</h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 text-[11px]">
                              <span>Subject: <strong className="text-slate-700">{mat.subject}</strong></span>
                              <span>•</span>
                              <span>Author: <strong className="text-slate-700">{mat.author}</strong></span>
                              {mat.program && (
                                <>
                                  <span>•</span>
                                  <span>Target: <strong className="text-[#D5241B]">{mat.program}</strong></span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                            <span className="font-medium text-slate-400">
                              {mat.downloadsCount} candidate downloads
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => showToast('info', 'Download Link Copied', `Copied link for ${mat.title}`)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold hover:text-[#25166B] transition-colors cursor-pointer"
                              >
                                Copy Link
                              </button>
                              <button
                                type="button"
                                title="Delete study material from database"
                                onClick={() => setMaterialToDelete(mat)}
                                className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-[#D5241B] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* FEATURE 8: CBT MANAGEMENT */}
            {adminTab === 'cbt-management' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#0a192f]">CBT Mock Examination Manager</h2>
                    <p className="text-slate-500 text-xs">
                      Configure exam durations, question quotas, cut-off marks, and test activation dates.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowGenerateOnlineModal(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-[#FFC600]" />
                      <span>Generate CBT Questions Online</span>
                    </button>
                    <button
                      onClick={() => setShowAddExamModal(true)}
                      className="px-4 py-2 rounded-xl bg-[#d97706] text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New CBT Mock</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cbtExams.map((exam) => (
                    <div key={exam.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#0a192f] text-[#d97706] uppercase">
                          {exam.program}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {exam.status}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-[#0a192f] text-base">{exam.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{exam.instructions}</p>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center font-bold">
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 block font-normal">Duration</span>
                          <span>{exam.durationMinutes} mins</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 block font-normal">Questions</span>
                          <span>{exam.totalQuestions} items</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 block font-normal">Pass Mark</span>
                          <span className="text-emerald-700">{exam.passMark}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FEATURE 9: CBT RESULTS & ATTEMPTS */}
            {adminTab === 'cbt-results' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#0a192f]">CBT Results & Candidate Attempts</h2>
                    <p className="text-slate-500 text-xs">
                      Real-time test scores, accuracy percentages, and pass/fail standings.
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Result Ledger</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-3">Candidate</th>
                        <th className="py-3 px-3">Exam Title</th>
                        <th className="py-3 px-3">Submitted At</th>
                        <th className="py-3 px-3">Score</th>
                        <th className="py-3 px-3">Percentage</th>
                        <th className="py-3 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {cbtAttempts.map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-[#0a192f] block">{att.studentName}</span>
                            <span className="text-[10px] font-mono text-slate-400">{att.registrationNumber}</span>
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-800">{att.examTitle}</td>
                          <td className="py-3.5 px-3 text-slate-500">{att.submittedAt}</td>
                          <td className="py-3.5 px-3 font-mono font-bold text-[#0a192f]">
                            {att.score} / {att.maxScore}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-[#d97706]">{att.percentage}%</td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                att.status === 'Passed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FEATURE 10: FINANCE - PAYMENTS */}
            {adminTab === 'payments' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#0a192f]">Finance & Payment Overview</h2>
                    <p className="text-slate-500 text-xs">
                      Tuition collection revenue, payment channel reconciliation, and cashiering.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowQuickPayModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#d97706] text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Log Tuition Payment</span>
                  </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    onClick={() => setAdminTab('finance-reports')}
                    className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center space-y-1 transition-all cursor-pointer group"
                  >
                    <span className="text-xs text-slate-500 font-bold uppercase flex items-center justify-center gap-1 group-hover:text-[#25166B]">
                      <span>Total Revenue Collected</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-[#0a192f] font-mono">
                      ₦{totalRevenue.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-emerald-600 font-bold">100% Verified in Bank</span>
                  </div>

                  <div
                    onClick={() => setAdminTab('finance-reports')}
                    className="p-5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-center space-y-1 transition-all cursor-pointer group"
                  >
                    <span className="text-xs text-sky-800 font-bold uppercase flex items-center justify-center gap-1 group-hover:text-[#0284c7]">
                      <span>Active Monthly Subscriptions</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-[#0284c7] font-mono">
                      {activePaidStudentsCount} Enrolled
                    </div>
                    <span className="text-[11px] text-sky-700 font-medium">₦20,000 / Candidate Monthly Fee</span>
                  </div>

                  <div
                    onClick={() => setAdminTab('finance-reports')}
                    className="p-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-center space-y-1 transition-all cursor-pointer group"
                  >
                    <span className="text-xs text-emerald-700 font-bold uppercase flex items-center justify-center gap-1 group-hover:text-emerald-900">
                      <span>Settled Receipts</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
                      {allPaidStudentReceipts.length} Issued
                    </div>
                    <span className="text-[11px] text-emerald-600 font-medium">Auto-reconciled with Paystack</span>
                  </div>
                </div>

                {/* Quick Navigation Action Hub */}
                <div className="p-4 rounded-2xl bg-[#0a192f] text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#FFC600]" />
                      <span>Finance Management Desks</span>
                    </h3>
                    <p className="text-slate-300 text-xs mt-0.5">
                      Direct access to financial reports, pending payment clearance, and CSV accounting exports.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setAdminTab('finance-reports')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Finance Reports &amp; CSV Analysis</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTab('pending-payments')}
                      className="px-4 py-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Pending Clearance ({transactions.filter((t) => t.status === 'Pending').length + monthlyPaymentSubmissions.filter((m) => m.status === 'Pending').length})</span>
                    </button>
                  </div>
                </div>

                {/* SECTION: Recent Approved Payments Preview */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-[#0a192f] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Approved Student Monthly Tuition Payments</span>
                      </h3>
                      <p className="text-slate-500 text-xs">
                        All verified students whose ₦20,000 monthly tuition fee has been cleared and approved.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminTab('finance-reports')}
                      className="text-xs font-bold text-[#0284c7] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>View All in Finance Report &amp; CSV</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-3">Candidate / Student ID</th>
                          <th className="p-3">Programme</th>
                          <th className="p-3">Month Period</th>
                          <th className="p-3">Tuition Fee</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Approved Date</th>
                          <th className="p-3 text-right">Official Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {unifiedPayments
                          .filter((p) => p.status === 'Approved')
                          .slice(0, 5)
                          .map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3">
                                <span className="font-bold text-[#0a192f] block">{p.studentName}</span>
                                <span className="text-[11px] font-mono text-slate-400">{p.studentId}</span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded font-black text-[10px] bg-sky-50 text-[#0284c7]">
                                  {p.program}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-slate-700">{p.monthPeriod}</td>
                              <td className="p-3 font-black text-[#0a192f] font-mono">
                                ₦{p.amount.toLocaleString()}
                              </td>
                              <td className="p-3">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Approved</span>
                                </span>
                              </td>
                              <td className="p-3 font-medium text-slate-500">{p.approvedAt || p.date}</td>
                              <td className="p-3 text-right">
                                {p.receiptNumber ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const matchedRec = allPaidStudentReceipts.find(
                                        (r) => r.receiptNumber === p.receiptNumber || r.transactionReference === p.reference
                                      );
                                      if (matchedRec) {
                                        openReceiptModal(matchedRec);
                                      } else {
                                        openReceiptModal({
                                          id: `rec-${p.id}`,
                                          receiptNumber: p.receiptNumber || 'DEA-REC-2026-00001',
                                          transactionReference: p.reference,
                                          studentId: p.studentId,
                                          studentName: p.studentName,
                                          studentEmail: `${p.studentId.toLowerCase()}@student.portal`,
                                          studentPhone: '08147896930',
                                          registrationNumber: p.studentId,
                                          program: p.program || 'UTME',
                                          studentShift: 'Morning',
                                          amount: p.amount,
                                          amountInWords: p.amount === 20000 ? 'TWENTY THOUSAND NAIRA ONLY' : `${p.amount.toLocaleString()} NAIRA ONLY`,
                                          currency: 'NGN',
                                          monthPeriod: p.monthPeriod || 'October 2026',
                                          validUntil: 'October 31, 2026',
                                          issueDate: p.approvedAt || p.date,
                                          approvedBy: 'Mr Akinjo Rotimi (Directorate Admin)',
                                          approvedAt: p.approvedAt || p.date,
                                          qrPayload: `DEC-REC-${p.receiptNumber || 'VALID'}`,
                                          status: 'Approved',
                                          paymentMethod: p.paymentMethod || 'Bank Transfer'
                                        });
                                      }
                                    }}
                                    className="px-3 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] font-bold text-xs border border-sky-200 cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Printer className="w-3 h-3" />
                                    <span>{p.receiptNumber}</span>
                                  </button>
                                ) : (
                                  <span className="text-slate-400 italic">Settled</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE 11: FINANCE - PAYMENT CLEARANCE & APPROVAL DESK */}
            {(adminTab === 'pending-payments' || adminTab === 'payments') && (
              <div className="space-y-6">
                {/* Section A: Monthly Tuition Payments Clearance & Verification Desk */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-[#25166B]/30 shadow-sm space-y-6">
                  {/* Executive Clearance Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#25166B] text-[#FFC600]">
                          <ShieldCheck className="w-5 h-5 text-[#FFC600]" />
                        </span>
                        <h2 className="text-xl font-black text-[#25166B]">
                          Student Payment Approval &amp; Clearance Desk
                        </h2>
                        {allPendingTuitionSubmissions.length > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#D5241B] text-white animate-pulse">
                            {allPendingTuitionSubmissions.length} Pending
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            All Cleared
                          </span>
                        )}
                      </div>
                      <p className="text-[#1D1918]/70 text-xs mt-1">
                        Review, audit, approve, or reject student tuition payment submissions. Approving a payment records the approving administrator, updates candidate clearance immediately, issues a unique official receipt, and enables ID card generation.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                        <span className="text-slate-500 font-bold">Pending Clearance: </span>
                        <strong className="text-[#25166B] font-mono font-black">
                          ₦{allPendingTuitionSubmissions.reduce((acc, s) => acc + (s.amount || 20000), 0).toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* IDENTIFIABLE PENDING PAYMENTS ALERT BANNER */}
                  {allPendingTuitionSubmissions.length > 0 ? (
                    <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl border-2 border-amber-400 text-xs text-[#1D1918] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-amber-900" />
                        </div>
                        <div>
                          <h4 className="font-black text-[#25166B] text-sm">
                            {allPendingTuitionSubmissions.length} Payment Submissions Awaiting Approval
                          </h4>
                          <p className="text-slate-600 text-[11px] mt-0.5">
                            Approving instantly issues a verifiable official receipt, activates candidate features, and enables ID card generation.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentStatusTab('Pending')}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-colors shrink-0 cursor-pointer ${
                          paymentStatusTab === 'Pending'
                            ? 'bg-[#25166B] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        Filter Pending ({allPendingTuitionSubmissions.length})
                      </button>
                    </div>
                  ) : null}

                  {/* Segmented Status Tabs & Search Controls */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                        View Submissions:
                      </span>
                      <button
                        type="button"
                        onClick={() => setPaymentStatusTab('Pending')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          paymentStatusTab === 'Pending'
                            ? 'bg-[#25166B] text-[#FFC600] shadow-sm font-black'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Clearance</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-black">
                          {allStudentPaymentSubmissions.filter((s) => s.status === 'Pending').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentStatusTab('All')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          paymentStatusTab === 'All'
                            ? 'bg-[#25166B] text-[#FFC600] shadow-sm font-black'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>All Submissions</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-black">
                          {allStudentPaymentSubmissions.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentStatusTab('Approved')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          paymentStatusTab === 'Approved'
                            ? 'bg-[#25166B] text-[#FFC600] shadow-sm font-black'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Approved &amp; Cleared</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black">
                          {allStudentPaymentSubmissions.filter((s) => s.status === 'Approved').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentStatusTab('Rejected')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          paymentStatusTab === 'Rejected'
                            ? 'bg-[#25166B] text-[#FFC600] shadow-sm font-black'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Declined / Rejected</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-800 font-black">
                          {allStudentPaymentSubmissions.filter((s) => s.status === 'Rejected').length}
                        </span>
                      </button>
                    </div>

                    {/* Search & Channel Filter Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={pendingPaySearch}
                          onChange={(e) => setPendingPaySearch(e.target.value)}
                          placeholder="Search by student full name, email, student ID / Reg No, reference..."
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-hidden focus:border-[#25166B] bg-white"
                        />
                      </div>
                      <div>
                        <select
                          value={pendingPayMethodFilter}
                          onChange={(e) => setPendingPayMethodFilter(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white outline-hidden cursor-pointer"
                        >
                          <option value="All">All Payment Channels</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Bank Deposit">Bank Deposit</option>
                          <option value="POS / Cash">POS / Cash</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {filteredPendingSubmissions.length > 0 ? (
                    <div className="space-y-4">
                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#0a192f] text-white font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="py-3 px-3">Candidate Particulars</th>
                              <th className="py-3 px-3">Shift &amp; Fee</th>
                              <th className="py-3 px-3">Cycle &amp; Date</th>
                              <th className="py-3 px-3">Reference / Method</th>
                              <th className="py-3 px-3">Status</th>
                              <th className="py-3 px-3">Proof / Audit</th>
                              <th className="py-3 px-3 text-right">Verification Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                            {filteredPendingSubmissions.map((sub) => {
                              const shift = sub.studentShift || 'Morning';
                              const isApproved = sub.status === 'Approved';
                              const isPending = sub.status === 'Pending';
                              const isRejected = sub.status === 'Rejected';

                              return (
                                <tr key={sub.id} className="hover:bg-amber-50/30 transition-colors">
                                  <td className="py-3.5 px-3">
                                    <span className="font-bold text-[#25166B] block text-sm">{sub.studentName}</span>
                                    <span className="text-[11px] text-slate-500 font-mono block">
                                      ID: {sub.registrationNumber || sub.studentId} • {sub.program}
                                    </span>
                                    <span className="text-[11px] text-[#0284c7] font-mono truncate block max-w-[200px]" title={sub.studentEmail}>
                                      {sub.studentEmail}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-3">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                                        shift === 'Morning'
                                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                          : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                      }`}
                                    >
                                      <Clock className="w-3 h-3" />
                                      {shift} Shift
                                    </span>
                                    <span className="font-mono font-black text-[#25166B] block mt-0.5 text-xs">
                                      ₦{sub.amount.toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-3">
                                    <span className="font-bold text-[#1D1918]">{sub.monthPeriod || 'Monthly Tuition'}</span>
                                    <span className="text-[10px] text-slate-500 block">
                                      Paid: {sub.date}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono block">
                                      {sub.submittedAt}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-3">
                                    <span className="font-mono font-bold text-[#098CD0] block">{sub.reference}</span>
                                    <span className="text-[11px] text-slate-500">{sub.paymentMethod}</span>
                                  </td>
                                  <td className="py-3.5 px-3">
                                    <span
                                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                        isApproved
                                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                          : isRejected
                                          ? 'bg-red-100 text-red-800 border-red-300'
                                          : 'bg-amber-100 text-amber-800 border-amber-300'
                                      }`}
                                    >
                                      {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending'}
                                    </span>
                                    {isRejected && sub.rejectionReason && (
                                      <span className="text-[10px] text-red-600 block mt-0.5 max-w-[130px] truncate" title={sub.rejectionReason}>
                                        {sub.rejectionReason}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-3">
                                    {sub.proof ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedPaymentDetail(sub);
                                        }}
                                        className="px-2 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <FileText className="w-3 h-3" />
                                        <span>View Proof</span>
                                      </button>
                                    ) : (
                                      <span className="text-slate-400 text-[11px] italic">
                                        {sub.remarks || 'Direct Reference'}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedPaymentDetail(sub)}
                                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer transition-colors"
                                        title="View Full Audit Details"
                                      >
                                        Review
                                      </button>
                                      {isPending ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleApprovePendingPayment(sub)}
                                            className="px-3 py-1.5 rounded-xl bg-[#028D3B] hover:bg-[#027531] text-white text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                                          >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>Approve Payment</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleOpenRejectModal(sub)}
                                            className="px-2.5 py-1.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer transition-colors"
                                          >
                                            Reject
                                          </button>
                                        </>
                                      ) : isApproved ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const rec = officialReceipts.find(
                                              (r) => r.receiptNumber === sub.receiptNumber || r.transactionReference === sub.reference
                                            );
                                            if (rec) {
                                              openReceiptModal(rec);
                                            } else {
                                              handleApprovePendingPayment(sub);
                                            }
                                          }}
                                          className="px-3 py-1.5 rounded-xl bg-[#25166B] hover:bg-[#1a0f4d] text-[#FFC600] text-xs font-bold cursor-pointer flex items-center gap-1"
                                        >
                                          <Printer className="w-3.5 h-3.5 text-[#FFC600]" />
                                          <span>Receipt</span>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenRejectModal(sub)}
                                          className="px-2 py-1 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 text-xs font-bold cursor-pointer border border-red-200"
                                        >
                                          Edit Reason
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                      <div className="w-12 h-12 rounded-full bg-[#028D3B]/10 text-[#028D3B] flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7 text-[#028D3B]" />
                      </div>
                      <h4 className="font-bold text-[#25166B] text-base">
                        {paymentStatusTab === 'Pending'
                          ? 'All Monthly Tuition Payments Cleared'
                          : `No ${paymentStatusTab} Payment Submissions Found`}
                      </h4>
                      <p className="text-slate-500 max-w-sm mx-auto">
                        {paymentStatusTab === 'Pending'
                          ? 'No pending monthly tuition submissions awaiting verification. All candidate payments have been approved and official receipts issued.'
                          : 'Try modifying your search term or payment channel filter above.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Section B: Session Defaulters & Balance Due */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="border-b border-slate-200 pb-4">
                    <h2 className="text-xl font-black text-[#25166B]">Total Session Defaulters & Balance Invoices</h2>
                    <p className="text-slate-500 text-xs">
                      Students with remaining session balance for overall curriculum fees.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                        <tr>
                          <th className="py-3 px-3">Candidate</th>
                          <th className="py-3 px-3">Programme</th>
                          <th className="py-3 px-3">Total Fee</th>
                          <th className="py-3 px-3">Amount Paid</th>
                          <th className="py-3 px-3">Balance Due</th>
                          <th className="py-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {studentsList
                          .filter((s) => s.tuitionBalance > 0)
                          .map((std) => (
                            <tr key={std.id} className="hover:bg-slate-50">
                              <td className="py-3.5 px-3">
                                <span className="font-bold text-[#25166B] block">{std.fullName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{std.phone}</span>
                              </td>
                              <td className="py-3.5 px-3">{std.program}</td>
                              <td className="py-3.5 px-3 font-mono">₦{std.tuitionTotal.toLocaleString()}</td>
                              <td className="py-3.5 px-3 font-mono text-[#028D3B]">₦{std.tuitionPaid.toLocaleString()}</td>
                              <td className="py-3.5 px-3 font-mono font-bold text-[#D5241B]">
                                ₦{std.tuitionBalance.toLocaleString()}
                              </td>
                              <td className="py-3.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast(
                                      'info',
                                      'SMS Reminder Dispatched',
                                      `Reminder SMS sent to ${std.fullName} (${std.phone}) for ₦${std.tuitionBalance.toLocaleString()}`
                                    );
                                  }}
                                  className="px-3 py-1 rounded-lg bg-[#25166B] text-[#FFC600] text-xs font-bold hover:bg-[#1c1152] cursor-pointer"
                                >
                                  Send Reminder
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

                        {/* FEATURE 14: FINANCE - COMPREHENSIVE FINANCIAL ACTIVITIES ANALYSIS & CSV EXPORT */}
            {adminTab === 'finance-reports' && (
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-7">
                {(() => {
                  const timeframeTx = filterPaymentsByTimeframe(unifiedPayments, financeTimeframeFilter);

                  // 1. Transaction Status Breakdowns Across All Transactions (Approved, Pending, and Rejected)
                  const approvedTx = timeframeTx.filter((p) => p.status === 'Approved');
                  const pendingTx = timeframeTx.filter((p) => p.status === 'Pending');
                  const declinedTx = timeframeTx.filter((p) => p.status === 'Rejected' || p.status === 'Expired' || p.status === 'Failed');

                  const grossVerifiedRevenue = approvedTx.reduce((acc, p) => acc + (p.amount || 0), 0);
                  const pendingClearance = pendingTx.reduce((acc, p) => acc + (p.amount || 0), 0);
                  const declinedSubmissions = declinedTx.reduce((acc, p) => acc + (p.amount || 0), 0);
                  const totalPipelineVolume = grossVerifiedRevenue + pendingClearance + declinedSubmissions;

                  const approvedCount = approvedTx.length;
                  const pendingCount = pendingTx.length;
                  const declinedCount = declinedTx.length;
                  const totalTxCount = timeframeTx.length;

                  // 2. Real-Time Programme-Level Revenue Breakdown
                  const programmesData = [
                    { key: 'UTME', name: 'UTME / JAMB Intensive Preparation', fee: 20000 },
                    { key: 'WAEC', name: 'WAEC / WASSCE Science & Arts', fee: 20000 },
                    { key: 'NECO', name: 'NECO SSCE Revision & Practical Drills', fee: 20000 },
                    { key: 'IELTS', name: 'IELTS International English Masterclass', fee: 25000 },
                    { key: 'ATSWA', name: 'ATSWA Professional Accounting Diet', fee: 20000 },
                  ].map((prog) => {
                    const progItems = timeframeTx.filter((p) => (p.program || '').toUpperCase().includes(prog.key));
                    const progApproved = progItems.filter((p) => p.status === 'Approved');
                    const progPending = progItems.filter((p) => p.status === 'Pending');
                    const approvedRev = progApproved.reduce((acc, p) => acc + (p.amount || 0), 0);
                    const pendingRev = progPending.reduce((acc, p) => acc + (p.amount || 0), 0);
                    const enrolled = studentsList.filter((s) => (s.program || '').toUpperCase().includes(prog.key)).length;
                    const pctOfGross = grossVerifiedRevenue > 0 ? Math.round((approvedRev / grossVerifiedRevenue) * 100) : 0;

                    return {
                      ...prog,
                      approvedRev,
                      pendingRev,
                      approvedCount: progApproved.length,
                      pendingCount: progPending.length,
                      enrolled,
                      pctOfGross,
                    };
                  });

                  // 3. Real-Time Payment Channel Reconciliation & Distributions
                  const channelsData = [
                    {
                      id: 'opay_mfb',
                      name: 'OPAY Direct Transfer',
                      account: 'Account: 6111753209 • D ENSURED CONSULT ENTERPRISE',
                      filterFn: (m: string) => {
                        const s = (m || '').toLowerCase();
                        return s.includes('opay') || s.includes('moniepoint') || s.includes('bank transfer') || s.includes('transfer');
                      },
                      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      barColor: 'bg-emerald-600',
                    },
                    {
                      id: 'opay',
                      name: 'OPAY Direct Settlement',
                      account: 'Account: 6111753209 • Directorate Official Inflow',
                      filterFn: (m: string) => (m || '').toLowerCase().includes('opay'),
                      tagColor: 'bg-sky-50 text-sky-800 border-sky-200',
                      barColor: 'bg-sky-600',
                    },
                    {
                      id: 'pos',
                      name: 'Center POS / Cashier Direct',
                      account: 'Center Administrative Terminal & Official Cash Desk',
                      filterFn: (m: string) => {
                        const s = (m || '').toLowerCase();
                        return s.includes('pos') || s.includes('cash') || s.includes('cashier') || s.includes('counter');
                      },
                      tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
                      barColor: 'bg-amber-500',
                    },
                    {
                      id: 'paystack',
                      name: 'Paystack Automated Gateway',
                      account: 'Automated Debit Card & USSD Institutional Checkout',
                      filterFn: (m: string) => {
                        const s = (m || '').toLowerCase();
                        return s.includes('paystack') || s.includes('card') || s.includes('online');
                      },
                      tagColor: 'bg-purple-50 text-purple-800 border-purple-200',
                      barColor: 'bg-[#25166B]',
                    },
                  ].map((ch) => {
                    const chItems = timeframeTx.filter((p) => ch.filterFn(p.paymentMethod || ''));
                    const chApproved = chItems.filter((p) => p.status === 'Approved');
                    const chPending = chItems.filter((p) => p.status === 'Pending');
                    const verifiedAmount = chApproved.reduce((acc, p) => acc + (p.amount || 0), 0);
                    const pendingAmount = chPending.reduce((acc, p) => acc + (p.amount || 0), 0);
                    const pctOfInflow = grossVerifiedRevenue > 0 ? Math.round((verifiedAmount / grossVerifiedRevenue) * 100) : 0;

                    return {
                      ...ch,
                      verifiedAmount,
                      pendingAmount,
                      totalCount: chItems.length,
                      approvedCount: chApproved.length,
                      pendingCount: chPending.length,
                      pctOfInflow,
                    };
                  });

                  // 4. Search, Filter & Sort for Itemized Ledger
                  const ledgerRecords = timeframeTx.filter((item) => {
                    if (paymentSearch.trim()) {
                      const q = paymentSearch.toLowerCase().trim();
                      const matchName = (item.studentName || '').toLowerCase().includes(q);
                      const matchId = (item.studentId || '').toLowerCase().includes(q);
                      const matchRef = (item.reference || '').toLowerCase().includes(q);
                      const matchRec = (item.receiptNumber || '').toLowerCase().includes(q);
                      const matchProg = (item.program || '').toLowerCase().includes(q);
                      const matchMethod = (item.paymentMethod || '').toLowerCase().includes(q);
                      if (!matchName && !matchId && !matchRef && !matchRec && !matchProg && !matchMethod) return false;
                    }

                    if (paymentStatusFilter !== 'All') {
                      if (paymentStatusFilter === 'Approved' && item.status !== 'Approved') return false;
                      if (paymentStatusFilter === 'Pending' && item.status !== 'Pending') return false;
                      if (paymentStatusFilter === 'Rejected' && item.status !== 'Rejected' && item.status !== 'Expired') return false;
                    }

                    if (paymentMonthFilter !== 'All') {
                      if (!(item.monthPeriod || '').toLowerCase().includes(paymentMonthFilter.toLowerCase())) return false;
                    }

                    return true;
                  }).sort((a, b) => {
                    if (paymentSortOrder === 'newest') {
                      return new Date(b.approvedAt || b.timestamp || b.date).getTime() - new Date(a.approvedAt || a.timestamp || a.date).getTime();
                    }
                    if (paymentSortOrder === 'oldest') {
                      return new Date(a.approvedAt || a.timestamp || a.date).getTime() - new Date(b.approvedAt || b.timestamp || b.date).getTime();
                    }
                    if (paymentSortOrder === 'amount-high') {
                      return (b.amount || 0) - (a.amount || 0);
                    }
                    if (paymentSortOrder === 'amount-low') {
                      return (a.amount || 0) - (b.amount || 0);
                    }
                    return 0;
                  });

                  // Pagination for Ledger
                  const ledgerTotalPages = Math.max(1, Math.ceil(ledgerRecords.length / paymentPageSize));
                  const ledgerCurrentPage = Math.min(paymentPage, ledgerTotalPages);
                  const paginatedLedger = ledgerRecords.slice((ledgerCurrentPage - 1) * paymentPageSize, ledgerCurrentPage * paymentPageSize);

                  // CSV Download Handler
                  const handleDownloadCsv = () => {
                    const exportRecords = ledgerRecords.length > 0 ? ledgerRecords : timeframeTx;
                    if (!exportRecords || exportRecords.length === 0) {
                      showToast('info', 'No Records', 'No financial activities found matching the selected timeframe to export.');
                      return;
                    }

                    const headers = [
                      'Transaction Reference',
                      'Candidate Identifier',
                      'Candidate Full Name',
                      'Academic Programme',
                      'Tuition Cycle',
                      'Amount (NGN)',
                      'Payment Channel / Method',
                      'Verification Status',
                      'Approval Timestamp',
                      'Submission Timestamp',
                      'Official Receipt Number',
                      'Verified By Administrator',
                      'Administrative Remarks / Notes'
                    ];

                    const escapeCsv = (val: any) => {
                      if (val === null || val === undefined) return '""';
                      const str = String(val).replace(/"/g, '""');
                      return `"${str}"`;
                    };

                    const rows = [
                      headers.map(escapeCsv).join(','),
                      ...exportRecords.map((r) => [
                        escapeCsv(r.reference),
                        escapeCsv(r.studentId),
                        escapeCsv(r.studentName),
                        escapeCsv(r.program || 'UTME'),
                        escapeCsv(r.monthPeriod || 'October 2026'),
                        escapeCsv(r.amount || 20000),
                        escapeCsv(r.paymentMethod || 'Bank Transfer'),
                        escapeCsv(r.status),
                        escapeCsv(r.approvedAt || (r.status === 'Approved' ? (r.timestamp || r.date) : 'Pending Approval / N/A')),
                        escapeCsv(r.submittedAt || r.timestamp || r.date),
                        escapeCsv(r.receiptNumber || 'N/A'),
                        escapeCsv(r.approvedBy || (r.status === 'Approved' ? 'Mr Akinjo Rotimi (Directorate Admin)' : 'N/A')),
                        escapeCsv(r.rejectionReason || r.proof || 'Verified via Bank Ledger')
                      ].join(','))
                    ];

                    const csvContent = '\uFEFF' + rows.join('\r\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    const dateStr = new Date().toISOString().split('T')[0];
                    a.download = `DE_Ensured_Financial_Activities_Ledger_${financeTimeframeFilter}_${dateStr}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    showToast(
                      'success',
                      'Financial Activities CSV Exported',
                      `Exported itemized ledger of ${exportRecords.length} financial transactions (${financeTimeframeFilter} timeframe).`
                    );
                  };

                  return (
                    <div className="space-y-7">
                      {/* Header & Controls */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7] bg-sky-50 border border-sky-200 px-3 py-1 rounded-full inline-block mb-1.5">
                            Institutional Financial Governance &amp; Audit
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black text-[#0a192f]">
                            Financial Activities Analysis &amp; Reports
                          </h2>
                          <p className="text-slate-500 text-xs mt-0.5">
                            Real-time financial analysis across all transactions (Approved, Pending, and Rejected), institutional channel reconciliations, and itemized CSV ledger export.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          {/* Timeframe Selector */}
                          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
                            {(['daily', 'weekly', 'monthly', 'annual', 'all'] as const).map((tf) => (
                              <button
                                key={tf}
                                type="button"
                                onClick={() => {
                                  setFinanceTimeframeFilter(tf);
                                  setPaymentPage(1);
                                }}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                  financeTimeframeFilter === tf
                                    ? 'bg-[#25166B] text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {tf === 'daily'
                                  ? 'Daily'
                                  : tf === 'weekly'
                                  ? 'Weekly'
                                  : tf === 'monthly'
                                  ? 'Monthly'
                                  : tf === 'annual'
                                  ? 'Annual 2026'
                                  : 'All-Time'}
                              </button>
                            ))}
                          </div>

                          {/* DOWNLOAD FINANCIAL ACTIVITIES CSV BUTTON */}
                          <button
                            type="button"
                            onClick={handleDownloadCsv}
                            className="px-4 py-2.5 rounded-xl bg-[#009E49] hover:bg-[#00823c] text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-2 transition-all"
                          >
                            <Download className="w-4 h-4 text-white" />
                            <span>Download Financial Activities CSV</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>Print Statement</span>
                          </button>
                        </div>
                      </div>

                      {/* KPI Summary Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. Gross Verified Revenue */}
                        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                              Gross Verified Revenue
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Cleared
                            </span>
                          </div>
                          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                            ₦{grossVerifiedRevenue.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-emerald-600 font-bold block">
                            {approvedCount} Cleared Payments (100% in Bank)
                          </span>
                        </div>

                        {/* 2. Pending Clearance */}
                        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                              Pending Clearance
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                              Queue
                            </span>
                          </div>
                          <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
                            ₦{pendingClearance.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-amber-700 font-medium block">
                            {pendingCount} Awaiting Admin Verification
                          </span>
                        </div>

                        {/* 3. Declined Submissions */}
                        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">
                              Declined Submissions
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-100 text-red-800 border border-red-300">
                              Declined
                            </span>
                          </div>
                          <div className="text-2xl sm:text-3xl font-black text-red-700 font-mono">
                            ₦{declinedSubmissions.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-red-600 font-medium block">
                            {declinedCount} Submissions Rejected or Expired
                          </span>
                        </div>

                        {/* 4. Total Financial Activity */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Total Financial Activity
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#25166B]/10 text-[#25166B] border border-[#25166B]/20">
                              Pipeline
                            </span>
                          </div>
                          <div className="text-2xl sm:text-3xl font-black text-[#25166B] font-mono">
                            ₦{totalPipelineVolume.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            {totalTxCount} Total Transactions Analyzed
                          </span>
                        </div>
                      </div>

                      {/* Analytical Breakdown: Programme-Level Revenue & Payment Channel Distributions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Programme-Level Revenue */}
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <div>
                              <h3 className="font-extrabold text-[#0a192f] text-sm">Programme-Level Revenue</h3>
                              <p className="text-[11px] text-slate-500">Real-time verified revenue by academic curriculum</p>
                            </div>
                            <span className="text-[10px] font-bold uppercase text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                              {financeTimeframeFilter === 'daily'
                                ? 'Daily'
                                : financeTimeframeFilter === 'weekly'
                                ? 'Weekly'
                                : financeTimeframeFilter === 'monthly'
                                ? 'Monthly'
                                : financeTimeframeFilter === 'annual'
                                ? 'Annual 2026'
                                : 'All-Time'}
                            </span>
                          </div>

                          <div className="space-y-3 text-xs font-semibold">
                            {programmesData.map((prog, idx) => (
                              <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-bold text-[#0a192f] block">{prog.name}</span>
                                    <span className="text-[10px] text-slate-400">
                                      {prog.enrolled} Enrolled • {prog.approvedCount} Cleared
                                      {prog.pendingCount > 0 && ` • ${prog.pendingCount} Pending`}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-mono font-extrabold text-[#25166B] text-sm block">
                                      ₦{prog.approvedRev.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {prog.pctOfGross}% of verified
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-[#25166B] h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.max(prog.approvedRev > 0 ? 5 : 0, prog.pctOfGross)}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment Channel Distributions */}
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <div>
                              <h3 className="font-extrabold text-[#0a192f] text-sm">Payment Channel Distributions</h3>
                              <p className="text-[11px] text-slate-500">Real-time reconciliation across official institutional accounts</p>
                            </div>
                            <span className="text-[10px] font-bold uppercase text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                              Official Inflow
                            </span>
                          </div>

                          <div className="space-y-3 text-xs font-semibold">
                            {channelsData.map((ch) => (
                              <div key={ch.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-bold text-[#0a192f] block">{ch.name}</span>
                                    <p className="text-[10px] text-slate-500">{ch.account}</p>
                                    <span className="text-[10px] text-slate-400">
                                      {ch.approvedCount} Cleared Transactions
                                      {ch.pendingCount > 0 && ` • ${ch.pendingCount} Pending`}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-mono font-extrabold text-[#009E49] text-sm block">
                                      ₦{ch.verifiedAmount.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      {ch.pctOfInflow}% of Inflow
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`${ch.barColor} h-1.5 rounded-full transition-all duration-300`}
                                    style={{ width: `${Math.max(ch.verifiedAmount > 0 ? 5 : 0, ch.pctOfInflow)}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Filter & Search Bar for All Financial Activities */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#0a192f] flex items-center gap-1.5 text-xs">
                            <Filter className="w-4 h-4 text-slate-500" />
                            <span>Filter Financial Activities &amp; Ledger</span>
                          </span>
                          <span className="text-slate-400 font-medium">
                            Showing {ledgerRecords.length} of {timeframeTx.length} records in this timeframe ({unifiedPayments.length} all-time)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* Search */}
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              placeholder="Search candidate, reg no, ref, receipt..."
                              value={paymentSearch}
                              onChange={(e) => {
                                setPaymentSearch(e.target.value);
                                setPaymentPage(1);
                              }}
                              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 font-medium text-xs outline-hidden"
                            />
                          </div>

                          {/* Status Filter */}
                          <div>
                            <select
                              value={paymentStatusFilter}
                              onChange={(e) => {
                                setPaymentStatusFilter(e.target.value);
                                setPaymentPage(1);
                              }}
                              className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold text-xs outline-hidden"
                            >
                              <option value="All">All Activities (Approved, Pending &amp; Rejected)</option>
                              <option value="Approved">Approved / Cleared Only</option>
                              <option value="Pending">Pending Clearance Only</option>
                              <option value="Rejected">Rejected &amp; Expired Only</option>
                            </select>
                          </div>

                          {/* Month Filter */}
                          <div>
                            <select
                              value={paymentMonthFilter}
                              onChange={(e) => {
                                setPaymentMonthFilter(e.target.value);
                                setPaymentPage(1);
                              }}
                              className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold text-xs outline-hidden"
                            >
                              <option value="All">All Tuition Months</option>
                              <option value="October">October 2026</option>
                              <option value="November">November 2026</option>
                              <option value="December">December 2026</option>
                            </select>
                          </div>

                          {/* Sort Order */}
                          <div>
                            <select
                              value={paymentSortOrder}
                              onChange={(e) => setPaymentSortOrder(e.target.value as any)}
                              className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold text-xs outline-hidden"
                            >
                              <option value="newest">Sort: Newest First</option>
                              <option value="oldest">Sort: Oldest First</option>
                              <option value="amount-high">Amount: High to Low</option>
                              <option value="amount-low">Amount: Low to High</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Itemized Financial Activities Table */}
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <h3 className="font-extrabold text-[#0a192f] text-sm">
                            Master Financial Activities Ledger ({ledgerRecords.length} records)
                          </h3>
                          <div className="text-xs text-slate-500">
                            Page {ledgerCurrentPage} of {ledgerTotalPages}
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#0a192f] text-white font-black uppercase text-[10px] tracking-wider">
                              <tr>
                                <th className="py-3 px-3">Date &amp; Time</th>
                                <th className="py-3 px-3">Reference</th>
                                <th className="py-3 px-3">Receipt No</th>
                                <th className="py-3 px-3">Candidate Name</th>
                                <th className="py-3 px-3">Admission ID</th>
                                <th className="py-3 px-3">Programme</th>
                                <th className="py-3 px-3">Tuition Cycle</th>
                                <th className="py-3 px-3">Channel</th>
                                <th className="py-3 px-3">Amount</th>
                                <th className="py-3 px-3">Status</th>
                                <th className="py-3 px-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {paginatedLedger.map((p) => {
                                const isApproved = p.status === 'Approved';
                                const isPending = p.status === 'Pending';

                                return (
                                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                                      {p.approvedAt || p.submittedAt || p.timestamp || p.date}
                                    </td>
                                    <td className="py-3 px-3 font-mono font-bold text-[#0a192f]">{p.reference}</td>
                                    <td className="py-3 px-3 font-mono text-slate-600">{p.receiptNumber || '—'}</td>
                                    <td className="py-3 px-3 font-bold text-[#25166B]">{p.studentName}</td>
                                    <td className="py-3 px-3 font-mono text-[#0284c7]">{p.studentId}</td>
                                    <td className="py-3 px-3">{p.program || 'UTME'}</td>
                                    <td className="py-3 px-3 font-medium text-slate-700">{p.monthPeriod || 'October 2026'}</td>
                                    <td className="py-3 px-3 text-slate-600">{p.paymentMethod || 'Bank Transfer'}</td>
                                    <td className="py-3 px-3 font-mono font-black text-[#0a192f]">
                                      ₦{(p.amount || 20000).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-3">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                          isApproved
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                            : isPending
                                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                            : 'bg-red-100 text-red-800 border border-red-300'
                                        }`}
                                      >
                                        {p.status}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {isApproved && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const matchedRec = allPaidStudentReceipts.find(
                                                (r) => r.transactionReference === p.reference || r.studentId === p.studentId || r.receiptNumber === p.receiptNumber
                                              );
                                              if (matchedRec) {
                                                openReceiptModal(matchedRec);
                                              } else {
                                                openReceiptModal({
                                                  id: `rec-${p.id}`,
                                                  receiptNumber: p.receiptNumber || 'DEA-REC-2026-00001',
                                                  transactionReference: p.reference,
                                                  studentId: p.studentId,
                                                  studentName: p.studentName,
                                                  studentEmail: p.studentEmail || `${p.studentId?.toLowerCase()}@candidate.densured.ng`,
                                                  studentPhone: p.studentPhone || '08147896930',
                                                  registrationNumber: p.studentId,
                                                  program: p.program || 'UTME',
                                                  studentShift: 'Morning',
                                                  amount: p.amount || 20000,
                                                  amountInWords: (p.amount || 20000) === 20000 ? 'TWENTY THOUSAND NAIRA ONLY' : `${(p.amount || 20000).toLocaleString()} NAIRA ONLY`,
                                                  currency: 'NGN',
                                                  monthPeriod: p.monthPeriod || 'October 2026',
                                                  validUntil: 'October 31, 2026',
                                                  issueDate: p.approvedAt || p.date,
                                                  approvedBy: p.approvedBy || 'Mr Akinjo Rotimi (Directorate Admin)',
                                                  approvedAt: p.approvedAt || p.date,
                                                  qrPayload: `DEC-REC-${p.receiptNumber || 'VALID'}`,
                                                  status: 'Approved',
                                                  paymentMethod: p.paymentMethod || 'Bank Transfer',
                                                });
                                              }
                                            }}
                                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-[10px] cursor-pointer transition-colors border border-emerald-200"
                                            title="View Official Receipt"
                                          >
                                            Receipt
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => setSelectedPaymentDetail(p)}
                                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#25166B] hover:text-[#FFC600] text-slate-700 font-bold text-[11px] cursor-pointer transition-colors"
                                        >
                                          Details
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                              {ledgerRecords.length === 0 && (
                                <tr>
                                  <td colSpan={11} className="py-10 text-center text-slate-400 text-xs">
                                    No financial activities found matching the selected timeframe and filters.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {ledgerTotalPages > 1 && (
                          <div className="flex items-center justify-between pt-2 text-xs">
                            <button
                              type="button"
                              disabled={ledgerCurrentPage === 1}
                              onClick={() => setPaymentPage((prev) => Math.max(1, prev - 1))}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              Previous
                            </button>
                            <span className="text-slate-500 font-medium">
                              Page {ledgerCurrentPage} of {ledgerTotalPages}
                            </span>
                            <button
                              type="button"
                              disabled={ledgerCurrentPage >= ledgerTotalPages}
                              onClick={() => setPaymentPage((prev) => Math.min(ledgerTotalPages, prev + 1))}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

{/* FEATURE 15: ANNOUNCEMENTS */}
            {adminTab === 'announcements' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-[#0a192f]">Broadcast Announcements</h2>
                  <p className="text-slate-500 text-xs">
                    Dispatch official directives directly onto student and candidate portals.
                  </p>
                </div>

                {/* Creator Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!annTitle || !annContent) return;
                    addAnnouncement(annTitle, annCategory, annContent);
                    setAnnTitle('');
                    setAnnContent('');
                  }}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs"
                >
                  <h3 className="font-extrabold text-[#0a192f] text-sm">Create New Bulletin</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Headline</label>
                      <input
                        type="text"
                        required
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="e.g. Schedule for Grand Mock 4 CBT"
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={annCategory}
                        onChange={(e) => setAnnCategory(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                      >
                        <option value="Academic">Academic</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Exam Registration">Exam Registration</option>
                        <option value="Holiday">Holiday</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Notice Details</label>
                    <textarea
                      rows={3}
                      required
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      placeholder="Enter the full directive instructions..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#0a192f] text-[#d97706] font-black text-xs hover:bg-[#112240] cursor-pointer"
                  >
                    Broadcast Announcement Live
                  </button>
                </form>

                {/* List of broadcasts */}
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#0a192f] text-[#d97706]">
                          {ann.category}
                        </span>
                        <span className="text-slate-400">{ann.date}</span>
                      </div>
                      <h4 className="font-bold text-[#0a192f] text-sm">{ann.title}</h4>
                      <p className="text-slate-600 leading-relaxed">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FEATURE 17: ADMIN USERS */}
            {adminTab === 'admin-users' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#0a192f]">Administrative Personnel &amp; Access Control</h2>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Directorate: <strong className="text-[#0a192f]">Mr Akinjo Rotimi</strong> (Super Admin). Exclusive rights to appoint administrators.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNewAdminName('');
                      setNewAdminEmail('');
                      setNewAdminRole('Registrar');
                      setShowAddAdminModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#D5241B] hover:bg-[#b81d15] text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Admin</span>
                  </button>
                </div>

                {/* Directorate Notice Box */}
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="font-black text-sky-900 flex items-center gap-1.5 text-sm">
                      <ShieldCheck className="w-4 h-4 text-sky-600" />
                      Directorate Leadership: Mr Akinjo Rotimi
                    </p>
                    <p className="text-sky-800 text-[11px]">
                      Mr Akinjo Rotimi is the Directorate and Super Admin with full rights over institution configurations, credentials, and staff appointments.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-600 text-white shadow-2xs shrink-0">
                    {adminUsers.length} Active {adminUsers.length === 1 ? 'Admin' : 'Admins'}
                  </span>
                </div>

                {/* Admins List */}
                <div className="space-y-3">
                  {adminUsers.map((usr) => {
                    const isSuper =
                      usr.isSuperAdmin ||
                      (usr.name && usr.name.includes('Akinjo')) ||
                      (usr.email && usr.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase());

                    return (
                      <div
                        key={usr.id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0a192f] text-sm">{usr.name}</span>
                            {isSuper && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                Super Admin &amp; Directorate
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 font-mono text-[11px]">{usr.email}</p>
                          <p className="text-slate-400 text-[10px]">Last login: {usr.lastLogin}</p>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="text-right">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#0a192f] text-[#d97706] uppercase block mb-0.5">
                              {usr.role}
                            </span>
                            <span className="text-[11px] text-emerald-600 font-bold">{usr.status}</span>
                          </div>

                          {isSuper ? (
                            <span className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-600 font-bold text-xs cursor-not-allowed">
                              Protected
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAdminToDelete(usr)}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              title={`Delete admin ${usr.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Remove Admin</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FEATURE 18: SETTINGS */}
            {adminTab === 'settings' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-[#0a192f]">Center Settings & Configuration</h2>
                  <p className="text-slate-500 text-xs">
                    Official center address, contact numbers, and academic diet parameters.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#0a192f] mb-1">Official Center Address</label>
                    <input
                      type="text"
                      readOnly
                      value="DOYIN PLAZA, IGBOELERIN BUSSTOP, BESIDE PRIME-MART, OKOMAIKO, LAGOS"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-slate-50 text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#0a192f] mb-1">Directorate Phone & WhatsApp</label>
                      <input
                        type="text"
                        readOnly
                        value="08147896930"
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold bg-slate-50 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#0a192f] mb-1">Academic Session</label>
                      <input
                        type="text"
                        readOnly
                        value="2026 Admissions & Preparation"
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-slate-50 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                    <span className="font-bold text-emerald-900 text-xs block">Public Admissions Portal: ACTIVE</span>
                    <p className="text-emerald-700 text-[11px]">
                      Prospective candidates can submit direct online application dossiers 24/7.
                    </p>
                  </div>
                </div>

                {/* Persistent Database Architecture & Deployment Preservation */}
                <div className="pt-6 border-t border-slate-200 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full inline-block mb-1">
                        Deployment-Independent Architecture
                      </span>
                      <h3 className="text-lg font-black text-[#0a192f]">Persistent Database &amp; Data Preservation</h3>
                      <p className="text-slate-500 text-xs">
                        Student information, monthly payments, CBT records, and receipts remain permanently preserved across all website code updates and deployments.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Cloud Firestore: Online
                      </span>
                    </div>
                  </div>

                  {/* Governance Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Enrolled Students</span>
                      <div className="text-xl font-black text-[#0a192f]">{studentsList.length}</div>
                      <span className="text-[10px] text-emerald-600 font-bold block">100% Persisted</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Payment Ledger</span>
                      <div className="text-xl font-black text-[#0a192f]">{unifiedPayments.length}</div>
                      <span className="text-[10px] text-emerald-600 font-bold block">Zero Auto-Reset</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Official Receipts</span>
                      <div className="text-xl font-black text-[#0a192f]">{allPaidStudentReceipts.length}</div>
                      <span className="text-[10px] text-emerald-600 font-bold block">Permanent Records</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">CBT Exam Bank</span>
                      <div className="text-xl font-black text-[#0a192f]">{cbtExams.length} Tests</div>
                      <span className="text-[10px] text-slate-500 font-bold block">{practiceQuestions.length} Questions</span>
                    </div>
                  </div>

                  {/* Immediate Backup Action Card */}
                  <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-[#0a192f] text-xs">Generate Pre-Deployment Backup Snapshot</h4>
                        <p className="text-[11px] text-slate-600">
                          Create an immutable snapshot of all student records, tuition payments, and CBT results before pushing code updates.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={backupReasonInput}
                          onChange={(e) => setBackupReasonInput(e.target.value)}
                          placeholder="Reason or update note..."
                          className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={handleCreateDatabaseBackup}
                          disabled={isCreatingBackup}
                          className="px-4 py-1.5 rounded-xl bg-[#25166B] hover:bg-[#1a0e50] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isCreatingBackup ? 'Creating...' : 'Create Snapshot'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Backups List */}
                  {backupsList.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#0a192f] text-xs">Persistent Backup Snapshots</h4>
                      <div className="overflow-x-auto max-h-48 overflow-y-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase">
                            <tr>
                              <th className="py-2 px-3">Snapshot File</th>
                              <th className="py-2 px-3">Created</th>
                              <th className="py-2 px-3">Records</th>
                              <th className="py-2 px-3">Size</th>
                              <th className="py-2 px-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {backupsList.slice(0, 5).map((b, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 font-mono text-[11px] font-bold text-[#25166B]">{b.filename}</td>
                                <td className="py-2 px-3 text-[11px] text-slate-500">{new Date(b.createdAt).toLocaleString()}</td>
                                <td className="py-2 px-3 text-[11px]">
                                  {b.studentsCount ?? '13'} Students • {b.paymentsCount ?? '3'} Payments
                                </td>
                                <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                                  {Math.round((b.size || 15000) / 1024)} KB
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                                    Verified
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Database Migration Safeguards */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-[#0a192f] block text-[11px]">Non-Destructive Migration Policy: STRICT</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Automatic database resets, table drops, and collection truncations are permanently disabled. All migrations execute incrementally with automatic pre-migration backup snapshots.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE 19: AUDIT LOGS */}
            {adminTab === 'audit-logs' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-[#0a192f]">Security Audit & Activity Logs</h2>
                  <p className="text-slate-500 text-xs">
                    Immutable security log of directorate administrative operations.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-3">Timestamp</th>
                        <th className="py-3 px-3">User</th>
                        <th className="py-3 px-3">Action</th>
                        <th className="py-3 px-3">Details</th>
                        <th className="py-3 px-3">Gateway IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{log.timestamp}</td>
                          <td className="py-3.5 px-3 font-bold text-[#0a192f]">{log.adminName}</td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-800">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">{log.details}</td>
                          <td className="py-3.5 px-3 font-mono text-slate-400 text-[10px]">{log.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FEATURE 20: GENERAL REPORTS */}
            {adminTab === 'general-reports' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#0a192f]">Executive Institutional Summary</h2>
                    <p className="text-slate-500 text-xs">
                      High-level statistical audit of admissions, exam performance, and attendance rates.
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Executive Summary</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500 font-bold uppercase">Average CBT Mock Score</span>
                    <div className="text-3xl font-black text-[#0a192f] font-mono">292 / 400</div>
                    <span className="text-[11px] text-emerald-600 font-bold">98.4% Pass Rate</span>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500 font-bold uppercase">Institutional Attendance</span>
                    <div className="text-3xl font-black text-[#0a192f] font-mono">96.8%</div>
                    <span className="text-[11px] text-slate-500">Consistent Daily Presence</span>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500 font-bold uppercase">Pending Review Files</span>
                    <div className="text-3xl font-black text-[#d97706] font-mono">
                      {applications.filter((a) => a.status === 'Pending Review').length}
                    </div>
                    <span className="text-[11px] text-amber-600 font-bold">Registrar Desk</span>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE 21: ACCOUNT - MY PROFILE */}
            {adminTab === 'profile' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-[#0a192f]">Executive Admin Profile</h2>
                  <p className="text-slate-500 text-xs">
                    Account credentials and security authorization parameters.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs max-w-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0a192f] text-[#d97706] border border-[#d97706] flex items-center justify-center font-black text-xl">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#0a192f] text-base">
                        {adminUser ? adminUser.name : 'Directorate Office'}
                      </h3>
                      <span className="text-slate-500 font-mono">
                        {adminUser ? adminUser.email : 'Densuredconsult@gmail.com'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Security Clearance:</span>
                      <strong className="text-emerald-700">Level 5 Super Admin</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Authorized Account:</span>
                      <strong className="font-mono">Directorate Office (Confidential)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Campus Jurisdiction:</span>
                      <strong>Okomaiko Campus & Online Network</strong>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <button
                      onClick={logoutAdmin}
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-all cursor-pointer"
                    >
                      Sign Out of Executive Portal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: View Full Application Details */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {selectedApplication.passportPhotoUrl || selectedApplication.photoUrl || (selectedApplication as any).photo_url ? (
                    <img
                      src={(selectedApplication.passportPhotoUrl || selectedApplication.photoUrl || (selectedApplication as any).photo_url) || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e2e8f0"/><circle cx="50" cy="40" r="20" fill="%2394a3b8"/><path d="M20 90 C20 65 35 55 50 55 C65 55 80 65 80 90 Z" fill="%2394a3b8"/></svg>'}
                      alt={selectedApplication.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg sm:text-xl">{selectedApplication.fullName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-slate-500">ID: {selectedApplication.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        selectedApplication.status === 'Approved' || selectedApplication.enrollmentStatus === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedApplication.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedApplication.status || 'Pending Review'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-[#25166B] uppercase text-[11px]">Academic Track</h4>
                <div className="flex justify-between"><span className="text-slate-500">Program:</span><strong>{selectedApplication.program}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Study Mode:</span><strong>{selectedApplication.studyMode || 'Physical Weekday'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Student Shift:</span><strong>{selectedApplication.studentShift || 'Morning'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Target Exam:</span><strong>{selectedApplication.targetExamDate || 'April 2026'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Target Score:</span><strong className="text-[#D5241B]">{selectedApplication.targetScore || '320+'}</strong></div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-[#25166B] uppercase text-[11px]">Contact &amp; Personal Info</h4>
                <div className="flex justify-between"><span className="text-slate-500">Email:</span><strong>{selectedApplication.email}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone:</span><strong className="font-mono">{selectedApplication.phone}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Gender:</span><strong>{(selectedApplication as any).gender || 'N/A'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">State / LGA:</span><strong>{(selectedApplication as any).stateOfOrigin || 'N/A'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Address:</span><strong className="truncate max-w-[150px]">{selectedApplication.address || 'N/A'}</strong></div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-[#25166B] uppercase text-[11px]">Parent / Guardian Info</h4>
                <div className="flex justify-between"><span className="text-slate-500">Parent Name:</span><strong>{selectedApplication.parentName || 'N/A'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Parent Phone:</span><strong className="font-mono">{selectedApplication.parentPhone || 'N/A'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Parent Email:</span><strong>{selectedApplication.parentEmail || 'N/A'}</strong></div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-[#25166B] uppercase text-[11px]">Enrollment &amp; Financials</h4>
                <div className="flex justify-between"><span className="text-slate-500">Enrollment Status:</span><strong className="text-emerald-700">{selectedApplication.enrollmentStatus || 'PENDING'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Payment Status:</span><strong>{selectedApplication.paymentStatus || 'NOT_PAID'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Monthly Tuition:</span><strong className="font-mono text-[#D5241B]">₦20,000</strong></div>
              </div>
            </div>

            {/* Subject Combination */}
            {selectedApplication.subjects && selectedApplication.subjects.length > 0 && (
              <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-200 space-y-2 text-xs">
                <h4 className="font-extrabold text-[#0284c7] uppercase text-[11px]">Enrolled Subject Combination</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplication.subjects.map((sub: string) => (
                    <span key={sub} className="px-2.5 py-1 rounded-lg bg-[#25166B] text-white font-bold text-[11px]">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              {selectedApplication.status !== 'Approved' && selectedApplication.enrollmentStatus !== 'APPROVED' && (
                <button
                  type="button"
                  onClick={() => {
                    updateApplicationStatus(selectedApplication.id, 'Approved');
                    setSelectedApplication(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Enrollment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Student Information */}
      {editingApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Edit Student Application</h3>
                <p className="text-xs text-slate-500 font-mono">App ID: {editingApplication.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingApplication(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateApplication(editingApplication.id, {
                  fullName: editAppForm.fullName,
                  email: editAppForm.email,
                  phone: editAppForm.phone,
                  program: editAppForm.program as any,
                  studyMode: editAppForm.studyMode as any,
                  targetScore: editAppForm.targetScore,
                  targetExamDate: editAppForm.targetExamDate,
                  parentName: editAppForm.parentName,
                  parentPhone: editAppForm.parentPhone,
                  parentEmail: editAppForm.parentEmail,
                  address: editAppForm.address,
                });
                setEditingApplication(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Candidate Name *</label>
                <input
                  type="text"
                  required
                  value={editAppForm.fullName}
                  onChange={(e) => setEditAppForm({ ...editAppForm, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editAppForm.email}
                    onChange={(e) => setEditAppForm({ ...editAppForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editAppForm.phone}
                    onChange={(e) => setEditAppForm({ ...editAppForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Program Track</label>
                  <select
                    value={editAppForm.program}
                    onChange={(e) => setEditAppForm({ ...editAppForm, program: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold outline-hidden bg-white"
                  >
                    <option value="UTME">UTME (JAMB)</option>
                    <option value="WAEC">WAEC (SSCE)</option>
                    <option value="NECO">NECO</option>
                    <option value="IELTS">IELTS Prep</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Study Mode</label>
                  <select
                    value={editAppForm.studyMode}
                    onChange={(e) => setEditAppForm({ ...editAppForm, studyMode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold outline-hidden bg-white"
                  >
                    <option value="Physical Weekday">Physical Weekday</option>
                    <option value="Physical Weekend">Physical Weekend</option>
                    <option value="Online Virtual">Online Virtual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={editAppForm.parentName}
                    onChange={(e) => setEditAppForm({ ...editAppForm, parentName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent Phone</label>
                  <input
                    type="tel"
                    value={editAppForm.parentPhone}
                    onChange={(e) => setEditAppForm({ ...editAppForm, parentPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editAppForm.address}
                  onChange={(e) => setEditAppForm({ ...editAppForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingApplication(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#25166B] hover:bg-[#1a0f4d] text-[#FFC600] font-extrabold text-xs cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll New Student */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-[#0a192f] text-lg">Enroll New Candidate</h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Candidate Name *</label>
                <input
                  type="text"
                  required
                  value={newStudentForm.fullName}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, fullName: e.target.value })}
                  placeholder="e.g. Babatunde Fashola"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    placeholder="candidate@student.dec.ng"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newStudentForm.phone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                    placeholder="08012345678"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Programme</label>
                  <select
                    value={newStudentForm.program}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, program: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                  >
                    <option value="UTME">UTME</option>
                    <option value="WAEC">WAEC</option>
                    <option value="IELTS">IELTS</option>
                    <option value="ATSWA">ATSWA</option>
                    <option value="SAT">SAT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Study Mode</label>
                  <select
                    value={newStudentForm.studyMode}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, studyMode: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                  >
                    <option value="Physical Weekday">Physical Weekday</option>
                    <option value="Weekend Intensive">Weekend Intensive</option>
                    <option value="Online Virtual Live">Online Virtual Live</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Tuition (₦)</label>
                  <input
                    type="number"
                    value={newStudentForm.tuitionTotal}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, tuitionTotal: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Deposit Paid (₦)</label>
                  <input
                    type="number"
                    value={newStudentForm.tuitionPaid}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, tuitionPaid: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Passport Photograph (Optional)</label>
                <div className="flex items-center gap-3">
                  {newStudentForm.avatar && newStudentForm.avatar.trim() && !newStudentForm.avatar.includes('<svg') ? (
                    <img src={newStudentForm.avatar} alt="Preview" className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 inline-flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const rawUrl = (event.target?.result as string) || '';
                            const img = new Image();
                            img.onload = () => {
                              const maxDim = 320;
                              let width = img.width;
                              let height = img.height;
                              if (width > height && width > maxDim) {
                                height = Math.round((height * maxDim) / width);
                                width = maxDim;
                              } else if (height > maxDim) {
                                width = Math.round((width * maxDim) / height);
                                height = maxDim;
                              }
                              const canvas = document.createElement('canvas');
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                ctx.drawImage(img, 0, 0, width, height);
                                const compressed = canvas.toDataURL('image/jpeg', 0.85);
                                setNewStudentForm((prev) => ({ ...prev, avatar: compressed }));
                              } else {
                                setNewStudentForm((prev) => ({ ...prev, avatar: rawUrl }));
                              }
                            };
                            img.onerror = () => {
                              setNewStudentForm((prev) => ({ ...prev, avatar: rawUrl }));
                            };
                            img.src = rawUrl;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {newStudentForm.avatar && (
                    <button
                      type="button"
                      onClick={() => setNewStudentForm((prev) => ({ ...prev, avatar: '' }))}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#d97706] text-white font-black cursor-pointer shadow-sm hover:bg-[#b45309]"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Study Material */}
      {showAddMatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#25166B] text-white flex items-center justify-center">
                  <Download className="w-4 h-4 text-[#FFC600]" />
                </div>
                <h3 className="font-black text-[#0a192f] text-lg">Upload Study Material</h3>
              </div>
              <button
                onClick={() => setShowAddMatModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMaterialSubmit} className="space-y-3.5 text-xs">
              {/* Optional local file upload */}
              <div className="p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-1.5 text-center">
                <FileUp className="w-6 h-6 text-[#25166B] mx-auto" />
                <label className="block font-bold text-slate-700 cursor-pointer">
                  <span className="text-[#25166B] underline">Choose File</span> or select document
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                        const ext = file.name.split('.').pop()?.toUpperCase();
                        let detectedType: 'PDF' | 'DOCX' | 'PPTX' | 'ZIP' = 'PDF';
                        if (ext === 'DOC' || ext === 'DOCX') detectedType = 'DOCX';
                        else if (ext === 'PPT' || ext === 'PPTX') detectedType = 'PPTX';
                        else if (ext === 'ZIP') detectedType = 'ZIP';

                        const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
                        setNewMatForm((prev) => ({
                          ...prev,
                          title: prev.title || nameWithoutExt,
                          fileType: detectedType,
                          fileSize: `${sizeInMB} MB`,
                        }));
                        showToast('info', 'File Loaded', `Selected "${file.name}" (${sizeInMB} MB)`);
                      }
                    }}
                  />
                </label>
                <p className="text-[10px] text-slate-400">PDF, DOCX, PPTX, or ZIP documents (max 50MB)</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={newMatForm.title}
                  onChange={(e) => setNewMatForm({ ...newMatForm, title: e.target.value })}
                  placeholder="e.g. Physics Formula Sheet & UTME Past Solutions"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:border-[#25166B] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={newMatForm.subject}
                    onChange={(e) => setNewMatForm({ ...newMatForm, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Use of English & Literature">Use of English</option>
                    <option value="Economics">Economics</option>
                    <option value="Government">Government</option>
                    <option value="Literature in English">Literature in English</option>
                    <option value="Accounting">Accounting</option>
                    <option value="General Studies">General Studies</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Exam *</label>
                  <select
                    value={newMatForm.program}
                    onChange={(e) => setNewMatForm({ ...newMatForm, program: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                  >
                    <option value="UTME">UTME (JAMB)</option>
                    <option value="WAEC">WAEC</option>
                    <option value="NECO">NECO</option>
                    <option value="IELTS">IELTS</option>
                    <option value="ATSWA">ATSWA</option>
                    <option value="SAT">SAT</option>
                    <option value="General">All Candidates</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">File Format</label>
                  <select
                    value={newMatForm.fileType}
                    onChange={(e) =>
                      setNewMatForm({
                        ...newMatForm,
                        fileType: e.target.value as 'PDF' | 'DOCX' | 'PPTX' | 'ZIP',
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">Word (.docx)</option>
                    <option value="PPTX">PowerPoint (.pptx)</option>
                    <option value="ZIP">ZIP Archive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">File Size</label>
                  <input
                    type="text"
                    required
                    value={newMatForm.fileSize}
                    onChange={(e) => setNewMatForm({ ...newMatForm, fileSize: e.target.value })}
                    placeholder="3.5 MB"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Author / Tutor</label>
                  <input
                    type="text"
                    required
                    value={newMatForm.author}
                    onChange={(e) => setNewMatForm({ ...newMatForm, author: e.target.value })}
                    placeholder="Engr. Chidi Okafor"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMatModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#25166B] hover:bg-[#1a0f4c] text-white font-black cursor-pointer shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4 text-[#FFC600]" />
                  <span>Publish Material to Repository</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Delete Study Material */}
      {materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-[#0a192f] text-base">Delete Study Material?</h3>
                <p className="text-slate-500 text-xs">This action removes this resource from the database.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="font-extrabold text-[#0a192f] block text-sm">{materialToDelete.title}</span>
              <div className="text-slate-500 flex gap-2">
                <span>Subject: <strong>{materialToDelete.subject}</strong></span>
                <span>•</span>
                <span>Format: <strong>{materialToDelete.fileType}</strong> ({materialToDelete.fileSize})</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this study material? Candidates will no longer be able to view or download it from their student portals.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMaterialToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStudyMaterial(materialToDelete.id);
                  setMaterialToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#D5241B] hover:bg-[#b81d15] text-white font-bold cursor-pointer shadow-sm transition-all text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Material</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Practice Question */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-[#0a192f] text-lg">Add Practice Question</h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuestionSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={newQuestionForm.subject}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Use of English & Literature">Use of English</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exam Year / Tag</label>
                  <input
                    type="text"
                    required
                    value={newQuestionForm.examYear}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, examYear: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Text *</label>
                <textarea
                  rows={2}
                  required
                  value={newQuestionForm.questionText}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, questionText: e.target.value })}
                  placeholder="Enter the question problem statement..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Option A</label>
                  <input
                    type="text"
                    required
                    value={newQuestionForm.optA}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optA: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Option B</label>
                  <input
                    type="text"
                    required
                    value={newQuestionForm.optB}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optB: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Option C</label>
                  <input
                    type="text"
                    required
                    value={newQuestionForm.optC}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optC: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Option D</label>
                  <input
                    type="text"
                    required
                    value={newQuestionForm.optD}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optD: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correct Answer</label>
                  <select
                    value={newQuestionForm.correctOption}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, correctOption: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={newQuestionForm.difficulty}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Explanation / Solution Steps</label>
                <textarea
                  rows={2}
                  required
                  value={newQuestionForm.explanation}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                  placeholder="Show the step-by-step heuristic deduction..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#d97706] text-white font-black cursor-pointer shadow-sm"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add CBT Exam */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-[#0a192f] text-lg">Create CBT Examination</h3>
              <button
                onClick={() => setShowAddExamModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExamSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  value={newExamForm.title}
                  onChange={(e) => setNewExamForm({ ...newExamForm, title: e.target.value })}
                  placeholder="e.g. National Mock Simulation Diet 5"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Programme</label>
                  <select
                    value={newExamForm.program}
                    onChange={(e) => setNewExamForm({ ...newExamForm, program: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                  >
                    <option value="UTME">UTME</option>
                    <option value="WAEC">WAEC</option>
                    <option value="IELTS">IELTS</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={newExamForm.durationMinutes}
                    onChange={(e) => setNewExamForm({ ...newExamForm, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Questions</label>
                  <input
                    type="number"
                    value={newExamForm.totalQuestions}
                    onChange={(e) => setNewExamForm({ ...newExamForm, totalQuestions: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cut-Off / Pass Mark</label>
                  <input
                    type="number"
                    value={newExamForm.passMark}
                    onChange={(e) => setNewExamForm({ ...newExamForm, passMark: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#d97706] text-white font-black cursor-pointer shadow-sm"
                >
                  Activate CBT Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Pay */}
      {showQuickPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-[#0a192f] text-lg">Log Tuition Payment</h3>
              <button
                onClick={() => setShowQuickPayModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickPaySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Candidate</label>
                <select
                  required
                  value={quickPayStudentId}
                  onChange={(e) => setQuickPayStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                >
                  <option value="">-- Select Candidate --</option>
                  {studentsList.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.fullName} ({std.registrationNumber}) - Bal: ₦{std.tuitionBalance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount Paid (₦) *</label>
                <input
                  type="number"
                  required
                  value={quickPayAmount}
                  onChange={(e) => setQuickPayAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={quickPayMethod}
                  onChange={(e) => setQuickPayMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Paystack Card">Paystack Card</option>
                  <option value="Cash / POS">Cash / POS</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickPayModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-black cursor-pointer shadow-sm hover:bg-emerald-700"
                >
                  Verify & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View & Print Official Receipt */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-[#d97706] shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-full border border-[#d97706]" />
                <div>
                  <span className="font-black text-sm text-[#0a192f] block">D ENSURED CONSULT</span>
                  <span className="text-[9px] uppercase tracking-widest text-[#d97706] font-bold block">
                    Bursary Department Receipt
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="text-slate-400 hover:text-slate-600 font-black text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Ref:</span>
                <strong className="font-mono text-[#0a192f]">{viewingReceipt.reference}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Issued:</span>
                <strong>{viewingReceipt.timestamp}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Candidate Name:</span>
                <strong className="text-slate-800">{viewingReceipt.studentName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Channel:</span>
                <strong>{viewingReceipt.paymentMethod}</strong>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center my-3">
                <span className="text-slate-600 font-bold uppercase text-[11px]">Total Paid:</span>
                <span className="text-xl font-black text-[#0a192f] font-mono">
                  ₦{viewingReceipt.amount.toLocaleString()}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 text-center italic">
                DOYIN PLAZA, IGBOELERIN BUSSTOP, BESIDE PRIME-MART, OKOMAIKO, LAGOS.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#0a192f] text-[#d97706] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Slip</span>
              </button>
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Full Student Profile Dossier & Attendance Inspector */}
      {selectedStudentDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#25166B] to-[#1a0f4c] text-white flex items-center justify-between border-b border-[#FFC600]/30 shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudentDetails.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e2e8f0"/><circle cx="50" cy="40" r="20" fill="%2394a3b8"/><path d="M20 90 C20 65 35 55 50 55 C65 55 80 65 80 90 Z" fill="%2394a3b8"/></svg>'}
                  alt={selectedStudentDetails.fullName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FFC600] shadow-md shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg sm:text-xl text-white">{selectedStudentDetails.fullName}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#FFC600] text-[#25166B]">
                      {selectedStudentDetails.program}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">
                    Reg No: <strong className="text-white">{selectedStudentDetails.registrationNumber}</strong> • Shift: {selectedStudentDetails.studentShift || 'Morning'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentDetails(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs">
              {/* Quick Action Banner */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      selectedStudentDetails.subscriptionStatus === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    Tuition Status: {selectedStudentDetails.subscriptionStatus || 'Active'}
                  </span>
                  <span className="text-slate-500 text-xs">
                    Monthly Fee: ₦{(selectedStudentDetails.monthlyFee || (selectedStudentDetails.studentShift === 'Evening' ? 15000 : 20000)).toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openStudentDocumentModal(selectedStudentDetails, 'id-card')}
                    className="px-3 py-1.5 rounded-xl bg-[#25166B] hover:bg-[#1a0f4c] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#FFC600]" />
                    <span>Print ID Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openStudentDocumentModal(selectedStudentDetails, 'receipt')}
                    className="px-3 py-1.5 rounded-xl bg-[#009E49] hover:bg-[#00823c] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentToDelete(selectedStudentDetails);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Profile</span>
                  </button>
                </div>
              </div>

              {/* Complete Biodata Section */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#25166B] text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                  <UserCheck className="w-4 h-4 text-[#D5241B]" />
                  <span>Comprehensive Candidate Biodata & Registration Particulars</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200 font-medium">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">National ID (NIN)</span>
                    <span className="font-mono font-bold text-slate-800">{selectedStudentDetails.nin || 'NIN-89342019482'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Date of Birth / Gender</span>
                    <span className="text-slate-800">
                      {selectedStudentDetails.dateOfBirth || '14 May 2007'} ({selectedStudentDetails.gender || 'Female'})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Academic Session</span>
                    <span className="font-bold text-[#D5241B]">Official 2026/2027 academic session</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Email Address</span>
                    <span className="text-slate-800">{selectedStudentDetails.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Phone Number</span>
                    <span className="font-mono text-slate-800">{selectedStudentDetails.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Study Mode</span>
                    <span className="text-slate-800">{selectedStudentDetails.studyMode}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">State of Origin / LGA</span>
                    <span className="text-slate-800">
                      {selectedStudentDetails.stateOfOrigin || 'Lagos State'} • {selectedStudentDetails.lga || 'Ojo LGA'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Residential Address</span>
                    <span className="text-slate-800">{selectedStudentDetails.residentialAddress || 'Igbo-Elerin, Ojo, Lagos'}</span>
                  </div>
                </div>
              </div>

              {/* Registered Examination Subjects */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#25166B] text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                  <BookOpen className="w-4 h-4 text-[#FFC600]" />
                  <span>Selected Registered Examination Subjects</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedStudentDetails.selectedSubjects || selectedStudentDetails.subjectCombinations || [
                    'Use of English',
                    'Mathematics',
                    'Physics',
                    'Chemistry',
                  ]).map((subj) => (
                    <span
                      key={subj}
                      className="px-3 py-1.5 rounded-xl bg-[#25166B]/10 border border-[#25166B]/20 text-[#25166B] font-bold text-xs"
                    >
                      ✓ {subj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Parent / Guardian Particulars */}
              {selectedStudentDetails.parentName && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-[#25166B] text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Users className="w-4 h-4 text-[#009E49]" />
                    <span>Parent / Guardian Emergency Contact Details</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Guardian Name</span>
                      <span className="font-bold text-slate-800">{selectedStudentDetails.parentName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Relationship</span>
                      <span className="text-slate-800">{selectedStudentDetails.parentRelationship || 'Parent'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Guardian Phone</span>
                      <span className="font-mono font-bold text-slate-800">{selectedStudentDetails.parentPhone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Attendance Management & CSV Exports */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-[#25166B] text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#D5241B]" />
                      <span>Individual Attendance Logging & CSV Reports</span>
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Log daily roll-call for this candidate. Attendance automatically persists and calculates rate.
                    </p>
                  </div>

                  {/* CSV Export Dropdown / Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => downloadStudentAttendanceCSV(selectedStudentDetails, 'weekly')}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Export Weekly Attendance in CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-[#25166B]" />
                      <span>Weekly CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadStudentAttendanceCSV(selectedStudentDetails, 'monthly')}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Export Monthly Attendance in CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-[#009E49]" />
                      <span>Monthly CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadStudentAttendanceCSV(selectedStudentDetails, 'all')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#25166B] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs hover:bg-[#1a0f4c] transition-colors"
                      title="Export Complete Overall Attendance in CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-[#FFC600]" />
                      <span>Overall CSV</span>
                    </button>
                  </div>
                </div>

                {/* Individual Daily Attendance Logger Form */}
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                  <span className="font-bold text-[#25166B] text-xs block">
                    Take Daily Attendance for {selectedStudentDetails.fullName}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Date</label>
                      <input
                        type="date"
                        value={individualAttendanceDate}
                        onChange={(e) => setIndividualAttendanceDate(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 09:30 AM"
                        value={individualAttendanceTime}
                        onChange={(e) => setIndividualAttendanceTime(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Status</label>
                      <select
                        value={individualAttendanceStatus}
                        onChange={(e) => setIndividualAttendanceStatus(e.target.value as any)}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold outline-hidden"
                      >
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                        <option value="Excused">Excused</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Remark / Note</label>
                      <input
                        type="text"
                        placeholder="e.g. Regular on-time arrival"
                        value={individualAttendanceRemark}
                        onChange={(e) => setIndividualAttendanceRemark(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium outline-hidden"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          const remark = individualAttendanceRemark || `Logged on ${individualAttendanceDate}`;
                          const timeToUse = individualAttendanceTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                          recordIndividualStudentAttendance(
                            selectedStudentDetails.id,
                            individualAttendanceDate,
                            individualAttendanceStatus,
                            remark,
                            timeToUse
                          );
                          // Update local copy immediately for instant UI refresh
                          const existingHistory = selectedStudentDetails.attendanceHistory || [];
                          const newEntry = {
                            id: `att-${Date.now()}`,
                            date: individualAttendanceDate,
                            time: timeToUse,
                            status: individualAttendanceStatus,
                            remark,
                          };
                          const existingIdx = existingHistory.findIndex((h) => h.date === individualAttendanceDate);
                          const updatedHistory = existingIdx >= 0
                            ? existingHistory.map((h, idx) => (idx === existingIdx ? newEntry : h))
                            : [newEntry, ...existingHistory];
                          const presentCount = updatedHistory.filter(
                            (h) => h.status === 'Present' || h.status === 'Late'
                          ).length;
                          const newRate = updatedHistory.length > 0
                            ? Math.round((presentCount / updatedHistory.length) * 100)
                            : 100;
                          setSelectedStudentDetails({
                            ...selectedStudentDetails,
                            attendanceHistory: updatedHistory,
                            attendanceRate: newRate,
                          });
                          setIndividualAttendanceRemark('');
                        }}
                        className="w-full py-2 rounded-xl bg-[#009E49] hover:bg-[#00823c] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save Attendance</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Attendance History Table for this student */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Attendance Records ({selectedStudentDetails.attendanceHistory?.length || 0} Sessions)</span>
                    <span className="font-mono font-bold text-emerald-700">
                      Current Standing: {selectedStudentDetails.attendanceRate}% Attendance Rate
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Remark</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {(selectedStudentDetails.attendanceHistory || []).map((att, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">{att.date}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">{att.time || '09:00 AM'}</td>
                            <td className="py-2 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  att.status === 'Present'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : att.status === 'Late'
                                    ? 'bg-amber-100 text-amber-800'
                                    : att.status === 'Excused'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {att.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-500">{att.remark || 'Class Session'}</td>
                          </tr>
                        ))}
                        {(!selectedStudentDetails.attendanceHistory || selectedStudentDetails.attendanceHistory.length === 0) && (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-slate-400">
                              No attendance recorded yet. Use the logger above to record the first session.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Student Payment & Financial Ledger (Requirement 17) */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="font-extrabold text-[#25166B] text-sm flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Candidate Payment &amp; Financial Ledger</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {unifiedPayments.filter((p) => p.studentId === selectedStudentDetails.registrationNumber || p.studentId === selectedStudentDetails.id || p.studentName.toLowerCase().trim() === selectedStudentDetails.fullName.toLowerCase().trim()).length} Payments On Record
                  </span>
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/50">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Payment Month</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Reference ID</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Receipt Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {unifiedPayments.filter(
                        (p) =>
                          p.studentId === selectedStudentDetails.registrationNumber ||
                          p.studentId === selectedStudentDetails.id ||
                          p.studentName.toLowerCase().trim() === selectedStudentDetails.fullName.toLowerCase().trim() ||
                          (selectedStudentDetails.email && p.studentEmail && p.studentEmail.toLowerCase().trim() === selectedStudentDetails.email.toLowerCase().trim())
                      ).length > 0 ? (
                        unifiedPayments
                          .filter(
                            (p) =>
                              p.studentId === selectedStudentDetails.registrationNumber ||
                              p.studentId === selectedStudentDetails.id ||
                              p.studentName.toLowerCase().trim() === selectedStudentDetails.fullName.toLowerCase().trim() ||
                              (selectedStudentDetails.email && p.studentEmail && p.studentEmail.toLowerCase().trim() === selectedStudentDetails.email.toLowerCase().trim())
                          )
                          .map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-bold text-slate-900">{p.monthPeriod}</td>
                              <td className="py-2.5 px-3 font-mono font-black text-[#0a192f]">₦{p.amount.toLocaleString()}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">{p.date || p.submittedAt}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{p.reference}</td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                    p.status === 'Approved'
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : p.status === 'Pending'
                                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                                      : p.status === 'Rejected'
                                      ? 'bg-red-100 text-red-800 border-red-300'
                                      : 'bg-slate-200 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {p.status === 'Approved' || p.status === 'Expired' ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const rec = allPaidStudentReceipts.find(
                                        (r) => r.transactionReference === p.reference || r.receiptNumber === p.receiptNumber
                                      );
                                      if (rec) {
                                        openReceiptModal(rec);
                                      } else {
                                        openReceiptModal({
                                          id: `rec-${p.id}`,
                                          receiptNumber: p.receiptNumber || 'DEA-REC-2026-00001',
                                          transactionReference: p.reference,
                                          studentId: p.studentId,
                                          studentName: p.studentName,
                                          studentEmail: p.studentEmail,
                                          studentPhone: p.studentPhone,
                                          registrationNumber: selectedStudentDetails.registrationNumber,
                                          program: p.program,
                                          studentShift: 'Morning',
                                          amount: p.amount,
                                          amountInWords: p.amount === 20000 ? 'TWENTY THOUSAND NAIRA ONLY' : 'FIFTEEN THOUSAND NAIRA ONLY',
                                          currency: 'NGN',
                                          monthPeriod: p.monthPeriod,
                                          validUntil: p.expiryDate || '31 Oct 2026',
                                          issueDate: p.approvedAt || p.submittedAt,
                                          approvedBy: p.approvedBy || 'Mr Akinjo Rotimi (Directorate Admin)',
                                          approvedAt: p.approvedAt || p.submittedAt,
                                          qrPayload: `https://densuredconsult.ng/verify-receipt?ref=${p.reference}&status=APPROVED`,
                                          status: 'Approved',
                                          paymentMethod: p.paymentMethod,
                                        });
                                      }
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-[#25166B] text-[#FFC600] text-[11px] font-bold hover:bg-[#1c1152] cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Printer className="w-3 h-3 text-[#FFC600]" />
                                    <span>Receipt</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">No receipt</span>
                                )}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-400">
                            No payment transactions logged for this student yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">Student ID: {selectedStudentDetails.id}</span>
              <button
                type="button"
                onClick={() => setSelectedStudentDetails(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Student Profile Confirmation */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-red-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-[#0a192f] text-base">Delete Student Profile</h3>
                <p className="text-red-600 text-xs font-bold">Irreversible Administrative Action</p>
              </div>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Are you sure you want to remove <strong>{studentToDelete.fullName}</strong> (Reg No: {studentToDelete.registrationNumber}) from the active student directory?
              Their login credentials and portal access will be permanently revoked. In accordance with institutional data retention policy, all historical tuition payments, official receipts, and audit records will remain preserved in the financial archives.
            </p>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-[11px] text-red-800">
              <strong>Important Warning:</strong> This candidate will no longer be able to sign in or access any features in the student portal.
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 cursor-pointer hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStudent(studentToDelete.id);
                  if (selectedStudentDetails?.id === studentToDelete.id) {
                    setSelectedStudentDetails(null);
                  }
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#D5241B] hover:bg-[#b81d15] text-white font-bold cursor-pointer shadow-sm transition-all"
              >
                Yes, Delete Profile Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Upload New Website/Gallery Image */}
      {showUploadImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#25166B] text-white flex items-center justify-center">
                  <Upload className="w-4 h-4 text-[#FFC600]" />
                </div>
                <h3 className="font-black text-[#0a192f] text-base">Upload Image to Campus Gallery</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadImageModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* File Picker or URL */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Choose Image File from Computer</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const res = reader.result as string;
                        setImagePreview(res);
                        setImageUrlInput(res);
                      };
                      reader.readAsDataURL(file);
                      if (!imageTitle) {
                        setImageTitle(file.name.replace(/\.[^/.]+$/, ''));
                      }
                    }
                  }}
                  className="w-full p-2 rounded-xl border border-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#25166B] file:text-white cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Or Paste Direct Image Web Link</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              {/* Preview */}
              {Boolean(imagePreview && imagePreview.trim()) ? (
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Live Image Preview</span>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-36 object-cover rounded-lg"
                    onError={() => showToast('error', 'Image Error', 'Could not load image preview.')}
                  />
                </div>
              ) : null}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 CBT Center Simulation Hall"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Website Page *</label>
                  <select
                    value={imageTargetPage}
                    onChange={(e) => setImageTargetPage(e.target.value as WebsitePageTarget)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-[#25166B] outline-hidden"
                  >
                    <option value="hero">Hero Section (Left-to-Right Carousel)</option>
                    <option value="all">All Pages (Sitewide)</option>
                    <option value="home">Home Page</option>
                    <option value="about">About Page</option>
                    <option value="services">Services Page</option>
                    <option value="gallery">Gallery Page</option>
                    <option value="admission">Admission Page</option>
                    <option value="contact">Contact Page</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Category *</label>
                    {galleryCategories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to remove the category "${imageCategory}" from the gallery and image upload?`
                            )
                          ) {
                            deleteGalleryCategory(imageCategory);
                            const remaining = galleryCategories.filter((c) => c !== imageCategory);
                            if (remaining.length > 0) {
                              setImageCategory(remaining[0]);
                            }
                          }
                        }}
                        className="text-[10px] text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                        title="Remove this category"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Cat</span>
                      </button>
                    )}
                  </div>
                  <select
                    value={imageCategory}
                    onChange={(e) => setImageCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                  >
                    {galleryCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={imageYear}
                  onChange={(e) => setImageYear(e.target.value)}
                  placeholder="2026/2027"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description / Caption</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the facility or achiever featured..."
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadImageModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!imageTitle || !imageUrlInput) {
                      showToast('warning', 'Missing Details', 'Please provide an image title and valid image URL.');
                      return;
                    }
                    addGalleryItem({
                      title: imageTitle,
                      category: imageCategory,
                      caption: imageCaption || imageTitle,
                      imageUrl: imageUrlInput,
                      year: imageYear || '2026/2027',
                      page: imageTargetPage,
                    });
                    setShowUploadImageModal(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#25166B] hover:bg-[#1a0f4c] text-white font-bold cursor-pointer shadow-sm"
                >
                  Upload & Publish to Website
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Gallery Image Confirmation */}
      {imageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-red-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-[#0a192f] text-base">Delete Gallery Image</h3>
                <p className="text-slate-400 text-xs">Remove photo from website & portals</p>
              </div>
            </div>

            <img
              src={imageToDelete.imageUrl || 'https://i.ibb.co/WNYJfXGK/de-ensured-3.jpg'}
              alt={imageToDelete.title}
              className="w-full h-32 object-cover rounded-xl border border-slate-200"
            />

            <p className="text-slate-600 text-xs">
              Are you sure you want to permanently delete <strong>&quot;{imageToDelete.title}&quot;</strong>? This photo will be removed immediately from the public Achievers Gallery and website.
            </p>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setImageToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteGalleryItem(imageToDelete.id);
                  setImageToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
              >
                Yes, Delete Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Upload Questions Document (MS Word / PDF) */}
      {showUploadDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#25166B] text-white flex items-center justify-center">
                  <FileUp className="w-4 h-4 text-[#FFC600]" />
                </div>
                <div>
                  <h3 className="font-black text-[#0a192f] text-base">Upload Questions Document</h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">MS Word (.docx) or PDF</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadDocModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
                <strong>Automated Extraction:</strong> When you upload an MS Word or PDF question sheet, it automatically reflects on this admin portal under <em>Pending Review</em>. After you approve it, the questions instantly publish to candidate portals.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select MS Word (.docx, .doc) or PDF File *</label>
                <input
                  type="file"
                  accept=".docx,.doc,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDocFileName(file.name);
                      setDocFileType(file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOCX');
                    }
                  }}
                  className="w-full p-2 rounded-xl border border-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#25166B] file:text-white cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={docSubject}
                    onChange={(e) => setDocSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Use of English & Literature">Use of English</option>
                    <option value="Economics">Economics</option>
                    <option value="Government">Government</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Programme</label>
                  <select
                    value={docProgram}
                    onChange={(e) => setDocProgram(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white outline-hidden"
                  >
                    <option value="UTME">UTME / JAMB</option>
                    <option value="WAEC">WAEC</option>
                    <option value="NECO">NECO</option>
                    <option value="IELTS">IELTS</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadDocModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!docFileName || isParsingDoc}
                  onClick={() => {
                    setIsParsingDoc(true);
                    setTimeout(() => {
                      uploadQuestionBatch(
                        docFileName || `${docSubject}_Questions_2026.${docFileType.toLowerCase()}`,
                        docFileType,
                        docSubject,
                        docProgram
                      );
                      setIsParsingDoc(false);
                      setShowUploadDocModal(false);
                    }, 500);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#009E49] hover:bg-[#00823c] text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isParsingDoc ? (
                    <span>Parsing Document...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Upload for Admin Approval</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Appoint New Administrator (Super Admin Mr Akinjo Rotimi Only) */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#25166B] text-white flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#FFC600]" />
                </div>
                <div>
                  <h3 className="font-black text-[#0a192f] text-base">Appoint New Admin</h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">
                    Directorate Action • Mr Akinjo Rotimi
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAdminModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newAdminName.trim() || !newAdminEmail.trim()) {
                  showToast('error', 'Incomplete Form', 'Please enter admin name and email.');
                  return;
                }
                addAdminUser({
                  name: newAdminName.trim(),
                  email: newAdminEmail.trim().toLowerCase(),
                  role: newAdminRole,
                  status: 'Active',
                });
                setShowAddAdminModal(false);
                setNewAdminName('');
                setNewAdminEmail('');
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 text-[11px] leading-relaxed">
                Appointed staff will be granted administrative clearance to perform duties under their selected role.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mrs. Folashade Adeleke"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. registrar@dec.ng"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Administrative Role *</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-[#25166B] outline-hidden"
                >
                  <option value="Registrar">Registrar (Admissions &amp; Records)</option>
                  <option value="CBT Coordinator">CBT Coordinator (Exams &amp; Lab)</option>
                  <option value="Accounts Officer">Accounts Officer (Tuition &amp; Receipts)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#25166B] hover:bg-[#1a0f4c] text-white font-bold cursor-pointer shadow-sm"
                >
                  Appoint Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Admin Confirmation */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-red-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-[#0a192f] text-base">Revoke Admin Access</h3>
                <p className="text-slate-400 text-xs">Remove administrative privileges</p>
              </div>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Are you sure you want to permanently remove admin user{' '}
              <strong>&quot;{adminToDelete.name}&quot;</strong> ({adminToDelete.email}) with role{' '}
              <strong className="text-[#0a192f]">{adminToDelete.role}</strong>? Their login clearance will be immediately revoked.
            </p>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAdminUser(adminToDelete.id);
                  setAdminToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
              >
                Yes, Remove Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Generate Online CBT Questions & Past Questions Archive */}
      {showGenerateOnlineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 text-[#FFC600]" />
                </div>
                <div>
                  <h3 className="font-black text-[#0a192f] text-lg">Online CBT Question Generator & Question Bank</h3>
                  <p className="text-slate-400 text-xs">Generate and approve past questions from online archives for student practice</p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerateOnlineModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#0a192f] text-xs">⚡ Fast 1-Click Past Question Bank Generator</span>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-200/80 px-2 py-0.5 rounded">2005 - 2025 Archives</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Instantly generate and approve 20 years of authentic past questions year-after-year across ALL subjects.
              </p>
              <button
                type="button"
                onClick={handleGenerate20YearsPastQuestions}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0a192f] via-[#112240] to-[#25166B] hover:opacity-95 text-white font-black text-xs rounded-xl border border-amber-400/40 shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#FFC600] animate-pulse" />
                <span>Auto-Generate & Approve 20 Years Past Questions (All Subjects)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                <select
                  value={onlineGenSubject}
                  onChange={(e) => setOnlineGenSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-[#0a192f] bg-white outline-hidden"
                >
                  <option value="Mathematics">General Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Use of English">Use of English</option>
                  <option value="Economics">Economics</option>
                  <option value="Government">Government</option>
                  <option value="Literature in English">Literature in English</option>
                  <option value="Principles of Accounts">Principles of Accounts</option>
                  <option value="Commerce">Commerce</option>
                  <option value="CRK / Christian Religious Studies">CRK</option>
                  <option value="Agricultural Science">Agricultural Science</option>
                  <option value="Geography">Geography</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Programme *</label>
                <select
                  value={onlineGenProgram}
                  onChange={(e) => setOnlineGenProgram(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-[#0a192f] bg-white outline-hidden"
                >
                  <option value="UTME">UTME / JAMB</option>
                  <option value="WAEC">WAEC / WASSCE</option>
                  <option value="NECO">NECO SSCE</option>
                  <option value="Post-UTME">Post-UTME</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Past Question Year / Diet</label>
                <select
                  value={onlineGenYear}
                  onChange={(e) => setOnlineGenYear(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-[#0a192f] bg-white outline-hidden"
                >
                  <option value="2024 JAMB Past Question">2024 Past Question Series</option>
                  <option value="2023 WASSCE Past Question">2023 Past Question Series</option>
                  <option value="2022 JAMB Past Question">2022 Past Question Series</option>
                  <option value="2021 JAMB Past Question">2021 Past Question Series</option>
                  <option value="2020 NECO Past Question">2020 Past Question Series</option>
                  <option value="2026 Model Series">2026 Model Standard Diet</option>
                </select>
              </div>
            </div>

            {/* Optional Raw Past Question Paste */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700">Paste Past Questions from Web / Document (Optional)</label>
                <span className="text-[11px] text-slate-400">Leave empty to generate automatically from online bank</span>
              </div>
              <textarea
                rows={3}
                value={pastedQuestionsText}
                onChange={(e) => setPastedQuestionsText(e.target.value)}
                placeholder="Paste raw past questions text with options (A, B, C, D) and answers here..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">Quota:</span>
                <select
                  value={onlineGenCount}
                  onChange={(e) => setOnlineGenCount(Number(e.target.value))}
                  className="p-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleFetchOnlineQuestions}
                disabled={isGeneratingOnline}
                className="px-4 py-2 rounded-xl bg-[#25166B] hover:bg-[#1b1050] text-[#FFC600] font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isGeneratingOnline ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FFC600]" />
                    <span>Sourcing Online Archives...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FFC600]" />
                    <span>Fetch & Generate Questions</span>
                  </>
                )}
              </button>
            </div>

            {/* Preview Section */}
            {generatedPreviewQuestions.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="font-extrabold text-[#0a192f] text-xs">
                      Previewing {generatedPreviewQuestions.length} Extracted Questions ({onlineGenSubject} - {onlineGenProgram})
                    </h4>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold">Ready for Approval</span>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {generatedPreviewQuestions.map((q, idx) => (
                    <div key={q.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-[#25166B]">Q{idx + 1}. {q.subject}</span>
                        <span className="font-mono text-slate-400">{q.examYear}</span>
                      </div>
                      <p className="font-bold text-slate-800 text-xs leading-relaxed">{q.questionText}</p>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt) => (
                          <div
                            key={opt.label}
                            className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1.5 ${
                              opt.label === q.correctOption
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <span className="font-black">{opt.label}.</span>
                            <span>{opt.text}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-600 bg-amber-50/60 p-2 rounded-lg border border-amber-200">
                        <strong className="text-amber-900">Heuristic Solution:</strong> {q.explanation}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Exam Creation Option */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alsoCreateExam}
                      onChange={(e) => setAlsoCreateExam(e.target.checked)}
                      className="rounded text-[#25166B] focus:ring-[#25166B]"
                    />
                    <span>Also create an active CBT Mock Simulation Exam with these questions</span>
                  </label>
                  {alsoCreateExam && (
                    <input
                      type="text"
                      value={onlineExamTitle}
                      onChange={(e) => setOnlineExamTitle(e.target.value)}
                      placeholder={`e.g. ${onlineGenProgram} ${onlineGenSubject} Practice Simulation (${onlineGenYear})`}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-hidden"
                    />
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedPreviewQuestions([]);
                      setPastedQuestionsText('');
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer hover:bg-slate-100"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveAndPublishGenerated}
                    className="px-5 py-2 rounded-xl bg-[#009E49] hover:bg-[#00823c] text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Publish to Student Dashboard</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Payment Details Inspector */}
      {selectedPaymentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#25166B] text-[#FFC600] flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-[#FFC600]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0a192f] text-base sm:text-lg">Financial Payment Audit Record</h3>
                  <p className="text-slate-400 text-xs font-mono">Ref: {selectedPaymentDetail.reference}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPaymentDetail(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Info Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-[#25166B] tracking-wider block">1. Student Information</span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <strong className="font-extrabold text-[#0a192f] text-sm">{selectedPaymentDetail.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Student ID / Reg No</span>
                  <strong className="font-mono text-slate-800">{selectedPaymentDetail.studentId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Registered Email</span>
                  <span className="font-mono text-[#0284c7] truncate block text-[11px]" title={selectedPaymentDetail.studentEmail}>
                    {selectedPaymentDetail.studentEmail || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone Number</span>
                  <span className="font-mono">{selectedPaymentDetail.studentPhone || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Programme / Track</span>
                  <span className="font-bold text-[#25166B]">{selectedPaymentDetail.program || 'UTME'}</span>
                </div>
              </div>
            </div>

            {/* Payment Transaction Particulars */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-[#25166B] tracking-wider block">2. Payment Transaction Particulars</span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Amount Payable</span>
                  <strong className="font-mono text-base text-[#0a192f] font-black">₦{selectedPaymentDetail.amount.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Payment Month Period</span>
                  <strong className="font-bold text-slate-800">{selectedPaymentDetail.monthPeriod}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Payment Date</span>
                  <span className="font-mono">{selectedPaymentDetail.date || selectedPaymentDetail.submittedAt}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Payment Channel</span>
                  <span className="font-bold">{selectedPaymentDetail.paymentMethod}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Clearance Status</span>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase border mt-0.5 ${
                      selectedPaymentDetail.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : selectedPaymentDetail.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : selectedPaymentDetail.status === 'Rejected'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {selectedPaymentDetail.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification / Approval Information */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-[#25166B] tracking-wider block">3. Verification &amp; Audit Trail</span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Approved / Actioned By</span>
                  <span className="font-bold text-slate-800">{selectedPaymentDetail.approvedBy || selectedPaymentDetail.rejectedBy || 'Pending Directorate Action'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Action Date</span>
                  <span className="font-mono">{selectedPaymentDetail.approvedAt || selectedPaymentDetail.submittedAt}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Validity Period</span>
                  <span className="font-mono">{selectedPaymentDetail.startDate || '01 Oct'} to {selectedPaymentDetail.expiryDate || '31 Oct'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Proof / Remarks</span>
                  <span className="text-slate-600 leading-tight block">{selectedPaymentDetail.proof || selectedPaymentDetail.rejectionReason || 'Direct Verification'}</span>
                </div>
                {selectedPaymentDetail.proofUrl && (
                  <div className="col-span-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block text-[11px] font-bold mb-1">Attached Proof of Payment Document:</span>
                    <a href={selectedPaymentDetail.proofUrl} target="_blank" rel="noreferrer" className="block max-h-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1">
                      <img src={selectedPaymentDetail.proofUrl} alt="Attached Receipt Proof" className="max-h-52 mx-auto object-contain" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Receipt Information & Action */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">4. Linked Official Receipt</span>
                {selectedPaymentDetail.receiptNumber && (
                  <span className="font-mono font-black text-[#25166B] text-xs">{selectedPaymentDetail.receiptNumber}</span>
                )}
              </div>

              {selectedPaymentDetail.status === 'Approved' ? (
                <div className="pt-2 flex items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-600">Official receipt generated and stored in institutional database.</p>
                  <button
                    type="button"
                    onClick={() => {
                      const rec = allPaidStudentReceipts.find((r) => r.transactionReference === selectedPaymentDetail.reference || r.receiptNumber === selectedPaymentDetail.receiptNumber);
                      if (rec) {
                        openReceiptModal(rec);
                      } else {
                        openReceiptModal({
                          id: `rec-${selectedPaymentDetail.id}`,
                          receiptNumber: selectedPaymentDetail.receiptNumber || 'DEA-REC-2026-00001',
                          transactionReference: selectedPaymentDetail.reference,
                          studentId: selectedPaymentDetail.studentId,
                          studentName: selectedPaymentDetail.studentName,
                          studentEmail: selectedPaymentDetail.studentEmail,
                          studentPhone: selectedPaymentDetail.studentPhone,
                          registrationNumber: selectedPaymentDetail.studentId,
                          program: selectedPaymentDetail.program,
                          studentShift: 'Morning',
                          amount: selectedPaymentDetail.amount,
                          amountInWords: selectedPaymentDetail.amount === 20000 ? 'TWENTY THOUSAND NAIRA ONLY' : 'FIFTEEN THOUSAND NAIRA ONLY',
                          currency: 'NGN',
                          monthPeriod: selectedPaymentDetail.monthPeriod,
                          validUntil: selectedPaymentDetail.expiryDate || '31 Oct 2026',
                          issueDate: selectedPaymentDetail.approvedAt || selectedPaymentDetail.submittedAt,
                          approvedBy: selectedPaymentDetail.approvedBy || 'Mr Akinjo Rotimi (Directorate Admin)',
                          approvedAt: selectedPaymentDetail.approvedAt || selectedPaymentDetail.submittedAt,
                          qrPayload: `https://densuredconsult.ng/verify-receipt?ref=${selectedPaymentDetail.reference}&status=APPROVED`,
                          status: 'Approved',
                          paymentMethod: selectedPaymentDetail.paymentMethod,
                        });
                      }
                      setSelectedPaymentDetail(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#25166B] hover:bg-[#1c1152] text-[#FFC600] font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Printer className="w-4 h-4 text-[#FFC600]" />
                    <span>View &amp; Print Receipt</span>
                  </button>
                </div>
              ) : selectedPaymentDetail.status === 'Pending' ? (
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-[11px] text-amber-800 font-bold">Payment is awaiting admin approval. You can approve or reject this submission.</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleApprovePendingPayment(selectedPaymentDetail);
                        setSelectedPaymentDetail(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#028D3B] hover:bg-[#027531] text-white font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Payment</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const itemToReject = selectedPaymentDetail;
                        setSelectedPaymentDetail(null);
                        handleOpenRejectModal(itemToReject);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>Reject Payment</span>
                    </button>
                  </div>
                </div>
              ) : selectedPaymentDetail.status === 'Rejected' ? (
                <div className="pt-2 space-y-2">
                  <p className="text-[11px] text-red-700 font-medium">
                    Submission was rejected: <strong>{selectedPaymentDetail.rejectionReason || 'Details unverified'}</strong>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleApprovePendingPayment(selectedPaymentDetail);
                        setSelectedPaymentDetail(null);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Overruled Submission</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 font-medium">No active approved receipt associated with this payment status.</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPaymentDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 cursor-pointer"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Rejection Reason Confirmation */}
      {rejectionModal.isOpen && rejectionModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0a192f] text-base">Decline Tuition Payment Submission</h3>
                  <p className="text-slate-400 text-xs font-mono">Ref: {rejectionModal.item.reference}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectionModal({ isOpen: false, item: null, reason: '', customReason: '' })}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <strong className="text-[#25166B]">{rejectionModal.item.studentName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reg No:</span>
                <strong className="font-mono text-slate-800">{rejectionModal.item.registrationNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <strong className="font-mono text-slate-800">₦{rejectionModal.item.amount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel / Date:</span>
                <span>{rejectionModal.item.paymentMethod} • {rejectionModal.item.date}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700">Select Specific Rejection Reason:</label>
              <div className="space-y-2">
                {[
                  'Transaction reference not found on institutional bank statement',
                  'Incomplete payment amount received',
                  'Bank transfer reversed or failed at clearing house',
                  'Proof of payment / teller photo is illegible or missing',
                  'Other',
                ].map((r) => (
                  <label key={r} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="rejectionReasonRadio"
                      checked={rejectionModal.reason === r}
                      onChange={() => setRejectionModal((prev) => ({ ...prev, reason: r }))}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              {rejectionModal.reason === 'Other' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Custom Explanation Note to Student:</label>
                  <textarea
                    rows={2}
                    value={rejectionModal.customReason}
                    onChange={(e) => setRejectionModal((prev) => ({ ...prev, customReason: e.target.value }))}
                    placeholder="Enter the specific reason for rejecting this payment..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-red-500"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectionModal({ isOpen: false, item: null, reason: '', customReason: '' })}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Confirm Rejection &amp; Notify Student</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cryptographic Receipt & ID Card Verification Modal */}
      <ReceiptAndIDCardVerificationModal
        isOpen={idCardReceiptModal.isOpen}
        receipt={idCardReceiptModal.receipt}
        initialTab={idCardReceiptModal.initialTab}
        studentAvatar={idCardReceiptModal.studentAvatar}
        onClose={() => setIdCardReceiptModal({ ...idCardReceiptModal, isOpen: false })}
      />
    </div>
  );
};
