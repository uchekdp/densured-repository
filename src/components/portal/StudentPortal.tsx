const DEFAULT_AVATAR_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23e0f2fe"/><circle cx="100" cy="80" r="40" fill="%230284c7"/><path d="M35 175 C35 130 65 118 100 118 C135 118 165 130 165 175 Z" fill="%230369a1"/></svg>';
import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp, StudentPortalTab } from '../../context/AppContext';
import {
  StudentProfile,
  ScheduledLesson,
  MockTestResult,
  StudyMaterial,
  PracticeQuestion,
  StudentShift,
  OfficialReceipt,
} from '../../types';
import {
  LayoutDashboard,
  CreditCard,
  User,
  CalendarCheck,
  Award,
  BookOpen,
  Megaphone,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  FileText,
  Search,
  ExternalLink,
  HelpCircle,
  Sparkles,
  QrCode,
  ShieldCheck,
  GraduationCap,
  PlayCircle,
  RotateCcw,
  Check,
  DollarSign,
  LogOut,
  XCircle,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Upload,
  Camera,
  BookCheck,
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const {
    studentTab,
    setStudentTab,
    currentStudent,
    studentsList,
    applications,
    updateStudentPhoto,
    isStudentLoggedIn,
    loginStudent,
    logoutStudent,
    setCurrentPage,
    lessons,
    openPaymentModal,
    transactions,
    submitMonthlyTuition,
    approveTuitionPayment,
    isStudentSubscriptionActive,
    openReceiptModal,
    setAdminTab,
    navigateTo,
    announcements,
    studyMaterials,
    practiceQuestions,
    cbtExams,
    cbtAttempts,
    recordCBTAttempt,
    showToast,
    monthlyPaymentSubmissions,
    submitMonthlyPayment,
    officialReceipts,
  } = useApp();

  // Monthly Tuition Subscription & Lock Gate State
  const isSubscriptionActive = isStudentSubscriptionActive(currentStudent);
  const pendingTx = transactions.find(
    (t) =>
      (t.studentId === currentStudent.id ||
        t.studentId === currentStudent.registrationNumber ||
        (t.studentName && t.studentName.toLowerCase().trim() === currentStudent.fullName.toLowerCase().trim())) &&
      t.status === 'Pending'
  );

  const pendingSub = (monthlyPaymentSubmissions || []).find(
    (m) =>
      (m.studentId === currentStudent.id ||
        m.registrationNumber === currentStudent.registrationNumber ||
        (m.studentName && m.studentName.toLowerCase().trim() === currentStudent.fullName.toLowerCase().trim())) &&
      m.status === 'Pending'
  );

  const activePendingPayment = pendingSub
    ? {
        reference: pendingSub.transactionReference || pendingSub.referenceOrProof || 'DEC-PAY-REF',
        amount: pendingSub.amount || currentStudent.monthlyFee || 20000,
        date: pendingSub.paymentDate || (pendingSub.submittedAt ? pendingSub.submittedAt.split(',')[0] : 'Today'),
        method: pendingSub.paymentMethod || 'Bank Transfer',
        submittedAt: pendingSub.submittedAt || new Date().toLocaleString(),
      }
    : pendingTx
    ? {
        reference: pendingTx.reference || 'DEC-PAY-REF',
        amount: pendingTx.amount || currentStudent.monthlyFee || 20000,
        date: pendingTx.timestamp?.split(',')[0] || pendingTx.timestamp?.split(' ')[0] || 'Today',
        method: pendingTx.paymentMethod || 'Bank Transfer',
        submittedAt: pendingTx.timestamp || new Date().toLocaleString(),
      }
    : null;

  const activeRejectedPayment = (monthlyPaymentSubmissions || []).find(
    (m) =>
      (m.studentId === currentStudent.id ||
        m.registrationNumber === currentStudent.registrationNumber ||
        (m.studentName && m.studentName.toLowerCase().trim() === currentStudent.fullName.toLowerCase().trim())) &&
      m.status === 'Rejected'
  ) || transactions.find(
    (t) =>
      (t.studentId === currentStudent.id ||
        t.studentId === currentStudent.registrationNumber ||
        (t.studentName && t.studentName.toLowerCase().trim() === currentStudent.fullName.toLowerCase().trim())) &&
      (t.status === 'Failed' || (t as any).status === 'Rejected')
  );

  const now = new Date();
  const currentMonthPeriod = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const defaultEndOfMonth = `${lastDayOfMonth.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}, 11:59 PM`;
  const defaultValidUntil = `${lastDayOfMonth.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}`;

  const [selectedShift, setSelectedShift] = useState<StudentShift>(
    currentStudent.studentShift || 'Morning'
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('Bank Transfer');
  const [isSubmittingMonthly, setIsSubmittingMonthly] = useState(false);
  const [idCardZoom, setIdCardZoom] = useState<number>(1.25);
  const [materialSubjectFilter, setMaterialSubjectFilter] = useState<string>('All');

  // Tuition Payment Submission Form State (for student finance tab)
  const [financePayShift, setFinancePayShift] = useState<StudentShift>(currentStudent.studentShift || 'Morning');
  const [financePayMethod, setFinancePayMethod] = useState<string>('Bank Transfer');
  const [financePayAmount, setFinancePayAmount] = useState<number>(currentStudent.monthlyFee || 20000);
  const [financePayRef, setFinancePayRef] = useState<string>('');
  const [financePayDate, setFinancePayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [financePayerName, setFinancePayerName] = useState<string>(currentStudent.fullName);
  const [financeProofUrl, setFinanceProofUrl] = useState<string>('');
  const [financeRemarks, setFinanceRemarks] = useState<string>('');
  const [isSubmittingTuition, setIsSubmittingTuition] = useState<boolean>(false);
  const [showFinanceForm, setShowFinanceForm] = useState<boolean>(false);

  const isValidPhoto = (url?: any): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.length === 0) return false;
    if (trimmed.includes('<svg') || trimmed.includes('data:image/svg') || trimmed.includes('unsplash.com')) return false;
    return true;
  };

  const findValidPhoto = (...candidates: any[]): string => {
    for (const c of candidates) {
      if (isValidPhoto(c)) return c;
    }
    return '';
  };

  const getStudentPhoto = (studentObj: any): string => {
    if (!studentObj) return '';
    return findValidPhoto(
      studentObj.passportPhotoUrl,
      studentObj.photoUrl,
      studentObj.photo_url,
      studentObj.studentAvatar,
      studentObj.avatar,
      studentObj.image,
      studentObj.picture
    );
  };

  // Multi-tier photo resolution for student ID card
  const studentAvatarImg = useMemo(() => {
    // 1. Direct photo on currentStudent
    const directPic = getStudentPhoto(currentStudent);
    if (directPic) return directPic;

    // 2. Matching application
    const matchingApp = applications.find(
      (a) =>
        (a.email && (a.email || '').toLowerCase() === (currentStudent.email || '').toLowerCase()) ||
        (a.fullName && (a.fullName || '').toLowerCase() === (currentStudent.fullName || '').toLowerCase()) ||
        a.id === currentStudent.id ||
        a.id === currentStudent.registrationNumber ||
        (a as any).student_id === currentStudent.id ||
        (a as any).student_id === currentStudent.registrationNumber
    );
    const appPic = getStudentPhoto(matchingApp);
    if (appPic) return appPic;

    // 3. Match from studentsList
    const inList = studentsList.find(
      (s) =>
        s.id === currentStudent.id ||
        s.registrationNumber === currentStudent.registrationNumber ||
        (s.email && (s.email || '').toLowerCase() === (currentStudent.email || '').toLowerCase())
    );
    const inListPic = getStudentPhoto(inList);
    if (inListPic) return inListPic;

    // 4. LocalStorage
    const localPhoto =
      (currentStudent.email && localStorage.getItem(`dec_photo_${currentStudent.email.toLowerCase().trim()}`)) ||
      (currentStudent.id && localStorage.getItem(`dec_photo_${currentStudent.id}`)) ||
      (currentStudent.registrationNumber && localStorage.getItem(`dec_photo_${currentStudent.registrationNumber}`));
    if (isValidPhoto(localPhoto)) return localPhoto!;

    return (
      (isValidPhoto(currentStudent.avatar) ? currentStudent.avatar : '') ||
      DEFAULT_AVATAR_SVG
    );
  }, [currentStudent, applications, studentsList]);

  // Handler to upload / replace student passport photo directly from ID card view
  const handleStudentPassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File Too Large', 'Passport photo must be under 5 MB.');
        return;
      }
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
            updateStudentPhoto(currentStudent.id, compressed);
          } else {
            updateStudentPhoto(currentStudent.id, rawUrl);
          }
        };
        img.onerror = () => {
          updateStudentPhoto(currentStudent.id, rawUrl);
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // ID Card Generation Eligibility: Unlocked if student has their first approved monthly payment (Requirement 1 & 3)
  const canGenerateIdCard = Boolean(
    isSubscriptionActive ||
    currentStudent.hasFirstPaymentApproved ||
    currentStudent.paymentStatus === 'APPROVED' ||
    (monthlyPaymentSubmissions || []).some(
      (m) =>
        (m.studentId === currentStudent.id || m.registrationNumber === currentStudent.registrationNumber) &&
        m.status === 'Approved'
    ) ||
    (transactions || []).some(
      (t) =>
        (t.studentId === currentStudent.id || t.studentId === currentStudent.registrationNumber) &&
        (t.status === 'Successful' || (t.status as string) === 'Approved')
    ) ||
    (officialReceipts || []).some(
      (r) =>
        r.studentId === currentStudent.id ||
        r.registrationNumber === currentStudent.registrationNumber ||
        (r.studentEmail && currentStudent.email && r.studentEmail.toLowerCase() === currentStudent.email.toLowerCase())
    )
  );

  // Authoritative Approved Official Receipts for current student
  const studentApprovedReceipts = useMemo(() => {
    const list: OfficialReceipt[] = [];
    const seenRefs = new Set<string>();

    // 1. From officialReceipts
    (officialReceipts || []).forEach((r) => {
      const isMatch =
        r.studentId === currentStudent.id ||
        r.registrationNumber === currentStudent.registrationNumber ||
        (r.studentEmail && currentStudent.email && r.studentEmail.toLowerCase() === currentStudent.email.toLowerCase()) ||
        (r.studentName && currentStudent.fullName && r.studentName.toLowerCase().trim() === currentStudent.fullName.toLowerCase().trim());
      if (isMatch && r.status === 'Approved') {
        const refKey = (r.transactionReference || r.receiptNumber || r.id).toLowerCase();
        if (!seenRefs.has(refKey)) {
          seenRefs.add(refKey);
          list.push(r);
        }
      }
    });

    // 2. From approved monthlyPaymentSubmissions if not yet in list
    (monthlyPaymentSubmissions || []).forEach((m) => {
      const isMatch =
        (m.studentId === currentStudent.id ||
          m.registrationNumber === currentStudent.registrationNumber ||
          (m.studentName && currentStudent.fullName && m.studentName.toLowerCase().trim() === currentStudent.fullName.toLowerCase().trim())) &&
        m.status === 'Approved';
      if (isMatch) {
        const refKey = (m.transactionReference || m.referenceOrProof || m.id).toLowerCase();
        if (!seenRefs.has(refKey)) {
          seenRefs.add(refKey);
          const now = new Date();
          const receiptNum = m.receiptNumber || `DEA-REC-2026-${String(list.length + 1).padStart(5, '0')}`;
          list.push({
            id: `rec-${m.id}`,
            receiptNumber: receiptNum,
            transactionReference: m.transactionReference || m.referenceOrProof || 'DEC-TX-REF',
            studentId: currentStudent.id,
            studentName: currentStudent.fullName,
            studentEmail: currentStudent.email,
            studentPhone: currentStudent.phone,
            registrationNumber: currentStudent.registrationNumber,
            program: currentStudent.program,
            studentShift: m.studentShift || currentStudent.studentShift || 'Morning',
            amount: m.amount || currentStudent.monthlyFee || 20000,
            amountInWords: (m.amount || 20000) === 20000 ? 'TWENTY THOUSAND NAIRA ONLY' : `${(m.amount || 20000).toLocaleString()} NAIRA ONLY`,
            currency: 'NGN',
            monthPeriod: m.monthPeriod || currentMonthPeriod,
            validUntil: currentStudent.subscriptionExpiryDate || defaultEndOfMonth,
            issueDate: m.paymentDate || (m.submittedAt ? m.submittedAt.split(',')[0] : new Date().toLocaleDateString('en-GB')),
            approvedBy: m.approvedBy || 'Mr Akinjo Rotimi (Directorate Admin)',
            approvedAt: m.approvedAt || m.submittedAt || new Date().toLocaleDateString('en-GB'),
            qrPayload: `https://densuredconsult.ng/verify-receipt?receipt=${receiptNum}&ref=${refKey}&status=APPROVED`,
            status: 'Approved',
            paymentMethod: (m.paymentMethod as any) || 'Bank Transfer',
            studentAvatar: studentAvatarImg,
            photoUrl: studentAvatarImg,
          });
        }
      }
    });

    // 3. From approved transactions if not yet in list
    (transactions || []).forEach((t) => {
      const isMatch =
        (t.studentId === currentStudent.id ||
          t.studentId === currentStudent.registrationNumber ||
          (t.studentName && currentStudent.fullName && t.studentName.toLowerCase().trim() === currentStudent.fullName.toLowerCase().trim())) &&
        (t.status === 'Successful' || (t.status as string) === 'Approved');
      if (isMatch) {
        const refKey = (t.reference || t.id).toLowerCase();
        if (!seenRefs.has(refKey)) {
          seenRefs.add(refKey);
          const now = new Date();
          const receiptNum = t.receiptNumber || `DEA-REC-2026-${String(list.length + 1).padStart(5, '0')}`;
          list.push({
            id: `rec-${t.id}`,
            receiptNumber: receiptNum,
            transactionReference: t.reference || 'DEC-TX-REF',
            studentId: currentStudent.id,
            studentName: currentStudent.fullName,
            studentEmail: currentStudent.email,
            studentPhone: currentStudent.phone,
            registrationNumber: currentStudent.registrationNumber,
            program: t.program || currentStudent.program,
            studentShift: t.studentShift || currentStudent.studentShift || 'Morning',
            amount: t.amount || currentStudent.monthlyFee || 20000,
            amountInWords: (t.amount || 20000) === 20000 ? 'TWENTY THOUSAND NAIRA ONLY' : `${(t.amount || 20000).toLocaleString()} NAIRA ONLY`,
            currency: 'NGN',
            monthPeriod: t.monthPeriod || currentMonthPeriod,
            validUntil: t.validUntil || currentStudent.subscriptionExpiryDate || defaultEndOfMonth,
            issueDate: t.date || (t.timestamp ? t.timestamp.split(',')[0] : new Date().toLocaleDateString('en-GB')),
            approvedBy: t.approvedBy || 'Mr Akinjo Rotimi (Directorate Admin)',
            approvedAt: t.approvedAt || t.date || new Date().toLocaleDateString('en-GB'),
            qrPayload: t.qrPayload || `https://densuredconsult.ng/verify-receipt?receipt=${receiptNum}&status=APPROVED`,
            status: 'Approved',
            paymentMethod: (t.paymentMethod as any) || 'Bank Transfer',
            studentAvatar: studentAvatarImg,
            photoUrl: studentAvatarImg,
          });
        }
      }
    });

    return list;
  }, [officialReceipts, monthlyPaymentSubmissions, transactions, currentStudent, studentAvatarImg, currentMonthPeriod, defaultEndOfMonth]);

  // Open the authentic Official Receipt with Logo and QR Code
  const handleOpenOfficialReceipt = (tx?: any) => {
    // If passed an existing OfficialReceipt directly
    if (tx && tx.receiptNumber && tx.amount) {
      openReceiptModal({
        ...tx,
        studentAvatar: studentAvatarImg,
        photoUrl: studentAvatarImg,
      });
      return;
    }

    // Try finding in studentApprovedReceipts first
    const ref = tx?.reference || tx?.transactionReference;
    const existingRec = studentApprovedReceipts.find(
      (r) =>
        (ref && (r.transactionReference?.toLowerCase() === ref.toLowerCase() || r.receiptNumber === tx?.receiptNumber)) ||
        (tx?.receiptNumber && r.receiptNumber === tx.receiptNumber)
    );

    if (existingRec) {
      openReceiptModal({
        ...existingRec,
        studentAvatar: studentAvatarImg,
        photoUrl: studentAvatarImg,
      });
      return;
    }

    if (currentStudent.lastApprovedReceipt && (!tx || tx.reference === currentStudent.lastApprovedReceipt.transactionReference)) {
      openReceiptModal({
        ...currentStudent.lastApprovedReceipt,
        studentAvatar: studentAvatarImg,
        photoUrl: studentAvatarImg,
      });
      return;
    }

    if (studentApprovedReceipts.length > 0) {
      openReceiptModal({
        ...studentApprovedReceipts[0],
        studentAvatar: studentAvatarImg,
        photoUrl: studentAvatarImg,
      });
      return;
    }

    const targetTx = tx || transactions.find((t) => (t.studentId === currentStudent.id || t.studentId === currentStudent.registrationNumber) && (t.status === 'Successful' || (t.status as string) === 'Approved'));
    const shift = targetTx?.studentShift || currentStudent.studentShift || 'Morning';
    const amount = targetTx?.amount || currentStudent.monthlyFee || 20000;
    const receiptNum = targetTx?.receiptNumber || `DEA-REC-2026-${String(officialReceipts.length + 1).padStart(5, '0')}`;
    const month = targetTx?.monthPeriod || currentStudent.subscriptionMonth || currentMonthPeriod;
    const validUntil = targetTx?.validUntil || currentStudent.subscriptionExpiryDate || defaultEndOfMonth;

    const officialReceipt: OfficialReceipt = {
      id: `rec-${targetTx ? targetTx.id : Date.now()}`,
      receiptNumber: receiptNum,
      transactionReference: targetTx ? (targetTx.reference || targetTx.id) : `DEC-PAY-${Date.now().toString().slice(-6)}`,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      studentEmail: currentStudent.email,
      studentPhone: currentStudent.phone,
      registrationNumber: currentStudent.registrationNumber,
      program: currentStudent.program,
      studentShift: shift,
      amount,
      amountInWords: amount === 20000 ? 'TWENTY THOUSAND NAIRA ONLY' : `${amount.toLocaleString()} NAIRA ONLY`,
      currency: 'NGN',
      monthPeriod: month,
      validUntil,
      issueDate: targetTx?.timestamp || new Date().toLocaleDateString('en-GB'),
      approvedBy: targetTx?.approvedBy || 'Mr. Akinjo Rotimi (Directorate Admin)',
      approvedAt: targetTx?.approvedAt || 'Immediate Verification',
      qrPayload: `https://densuredconsult.ng/verify-receipt?receipt=${receiptNum}&student=${encodeURIComponent(currentStudent.fullName)}&reg=${currentStudent.registrationNumber}&shift=${shift}&amount=${amount}&status=APPROVED`,
      status: 'Approved',
      paymentMethod: (targetTx?.paymentMethod as any) || 'Bank Transfer',
      studentAvatar: studentAvatarImg,
      photoUrl: studentAvatarImg,
    };

    openReceiptModal(officialReceipt);
  };

  const handleDownloadIdCard = () => {
    const cardEl = document.getElementById('student-portal-id-card-front');
    const cardBackEl = document.getElementById('student-portal-id-card-back');
    if (cardEl && currentStudent) {
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>DEC_Student_ID_${currentStudent.registrationNumber}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { 
      size: 3.375in 2.125in; 
      margin: 0; 
    }
    @media print { 
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; background: #fff; }
      .cr80-print-card { 
        width: 3.375in !important; 
        height: 2.125in !important; 
        max-width: 3.375in !important; 
        max-height: 2.125in !important; 
        margin: 0 !important; 
        page-break-after: always; 
        border-radius: 0.125in !important;
      }
    }
    body { background: #f1f5f9; display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 16px; font-family: ui-sans-serif, system-ui, sans-serif; }
  </style>
</head>
<body>
  <div class="cr80-print-card" style="width: 3.375in; height: 2.125in;">
    ${cardEl.innerHTML}
  </div>
  ${cardBackEl ? `<div class="cr80-print-card" style="width: 3.375in; height: 2.125in;">${cardBackEl.innerHTML}</div>` : ''}
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DEC_Student_ID_3.375x2.125_${currentStudent.registrationNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      window.print();
    }
  };

  // Student Login Gate state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // CBT interactive simulator state
  const [activeCbtExamId, setActiveCbtExamId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [examTimeLeft, setExamTimeLeft] = useState<number>(600); // 10 mins for test
  const [isExamCompleted, setIsExamCompleted] = useState<boolean>(false);
  const [examScore, setExamScore] = useState<{ correct: number; total: number; percentage: number } | null>(null);

  // Practice sets filter & interactive answer reveal
  const [practiceSubjectFilter, setPracticeSubjectFilter] = useState<string>('All');
  const [practiceYearFilter, setPracticeYearFilter] = useState<string>('All');
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});
  const [practiceUserAnswers, setPracticeUserAnswers] = useState<Record<string, string>>({});

  // Receipt Modal state for printable official receipt
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<any | null>(null);

  // Filter and consolidate transactions & payment submissions for current student
  const studentTransactions = useMemo(() => {
    const records: any[] = [];
    const seenRefs = new Set<string>();

    // 1. From monthlyPaymentSubmissions
    (monthlyPaymentSubmissions || [])
      .filter(
        (m) =>
          m.studentId === currentStudent.id ||
          m.registrationNumber === currentStudent.registrationNumber ||
          (m.studentName && m.studentName.toLowerCase().trim() === currentStudent.fullName.toLowerCase().trim())
      )
      .forEach((m) => {
        const ref = m.transactionReference || m.referenceOrProof || m.id;
        seenRefs.add(ref.toLowerCase().trim());
        records.push({
          id: m.id,
          reference: ref,
          receiptNumber: m.receiptNumber,
          date: m.paymentDate || (m.submittedAt ? m.submittedAt.split(',')[0] : 'Today'),
          timestamp: m.submittedAt,
          approvedAt: m.approvedAt,
          paymentMethod: m.paymentMethod,
          amount: m.amount,
          status: m.status === 'Approved' ? 'Successful' : m.status === 'Rejected' ? 'Failed' : 'Pending',
          rawStatus: m.status,
          rejectionReason: m.rejectionReason,
          monthPeriod: m.monthPeriod,
          studentShift: m.studentShift,
        });
      });

    // 2. From transactions
    (transactions || [])
      .filter(
        (t) =>
          t.studentId === currentStudent.id ||
          t.studentId === currentStudent.registrationNumber ||
          (t.studentName && t.studentName.toLowerCase().trim() === currentStudent.fullName.toLowerCase().trim())
      )
      .forEach((t) => {
        const ref = t.reference || t.id;
        if (!seenRefs.has(ref.toLowerCase().trim())) {
          seenRefs.add(ref.toLowerCase().trim());
          records.push({
            id: t.id,
            reference: ref,
            receiptNumber: t.receiptNumber,
            date: t.date || (t.timestamp ? t.timestamp.split(',')[0] : 'Today'),
            timestamp: t.timestamp,
            approvedAt: t.approvedAt,
            paymentMethod: t.paymentMethod,
            amount: t.amount,
            status: t.status,
            rawStatus: t.status === 'Successful' ? 'Approved' : t.status === 'Failed' ? 'Rejected' : 'Pending',
            rejectionReason: (t as any).rejectionReason,
            monthPeriod: t.monthPeriod,
            studentShift: t.studentShift,
          });
        }
      });

    return records;
  }, [monthlyPaymentSubmissions, transactions, currentStudent]);

  const handleProofFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File Too Large', 'Please upload an image smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFinanceProofUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinancePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!financePayRef.trim()) {
      showToast('error', 'Reference Required', 'Please enter your bank transfer reference or teller number.');
      return;
    }
    setIsSubmittingTuition(true);
    try {
      const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

      // 1. Submit through monthlyPaymentSubmissions
      submitMonthlyPayment({
        studentId: currentStudent.id,
        studentName: currentStudent.fullName,
        studentEmail: currentStudent.email,
        studentPhone: currentStudent.phone,
        program: currentStudent.program,
        registrationNumber: currentStudent.registrationNumber,
        monthPeriod: currentMonth,
        amount: Number(financePayAmount) || currentStudent.monthlyFee || 20000,
        paymentMethod: financePayMethod,
        referenceOrProof: financePayRef.trim(),
        transactionReference: financePayRef.trim(),
        bankTellerNumber: financePayRef.trim(),
        paymentDate: financePayDate,
        proofUrl: financeProofUrl,
        studentRemarks: financeRemarks,
        studentShift: financePayShift,
      });

      // 2. Also record in transactions
      submitMonthlyTuition(
        currentStudent.id,
        financePayShift,
        financePayMethod as any
      );

      showToast('success', 'Tuition Payment Submitted', 'Payment information logged. Current status: Pending Approval.');
      setShowFinanceForm(false);
      setFinancePayRef('');
      setFinanceRemarks('');
      setFinanceProofUrl('');
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message || 'Could not submit payment.');
    } finally {
      setIsSubmittingTuition(false);
    }
  };

  // Countdown timer for CBT
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeCbtExamId && !isExamCompleted && examTimeLeft > 0) {
      timer = setInterval(() => {
        setExamTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCbtExamId, isExamCompleted, examTimeLeft]);

  const [selectedCbtSubjectFilter, setSelectedCbtSubjectFilter] = useState<string>('All');
  const [cbtReviewFilter, setCbtReviewFilter] = useState<'failed' | 'all'>('failed');
  const [completedExamQuestions, setCompletedExamQuestions] = useState<PracticeQuestion[]>([]);

  const registeredSubjects = currentStudent.selectedSubjects?.length
    ? currentStudent.selectedSubjects
    : currentStudent.subjectCombinations?.length
    ? currentStudent.subjectCombinations
    : ['Mathematics', 'Physics', 'Chemistry', 'Use of English'];

  // CBT questions dynamically generated from student's registered subjects
  const studentCbtQuestions = useMemo(() => {
    let matching = practiceQuestions.filter((q) =>
      registeredSubjects.some(
        (subj) =>
          subj &&
          q?.subject &&
          (subj.toLowerCase().includes(q.subject.toLowerCase()) ||
            q.subject.toLowerCase().includes(subj.toLowerCase()))
      )
    );
    if (matching.length === 0) matching = practiceQuestions;

    if (selectedCbtSubjectFilter !== 'All') {
      const bySubject = matching.filter(
        (q) =>
          q.subject.toLowerCase().includes(selectedCbtSubjectFilter.toLowerCase()) ||
          selectedCbtSubjectFilter.toLowerCase().includes(q.subject.toLowerCase())
      );
      if (bySubject.length > 0) return bySubject;
    }

    return matching;
  }, [practiceQuestions, registeredSubjects, selectedCbtSubjectFilter]);

  // Study materials tailored to student's chosen subjects or all uploaded materials
  const filteredStudyMaterials = useMemo(() => {
    if (materialSubjectFilter === 'All') {
      return studyMaterials;
    }
    if (materialSubjectFilter === 'My Subjects') {
      return studyMaterials.filter((mat) => {
        if (mat.subject === 'General' || mat.subject === 'All') return true;
        return registeredSubjects.some(
          (subj) =>
            subj &&
            mat?.subject &&
            (subj.toLowerCase().includes(mat.subject.toLowerCase()) ||
              mat.subject.toLowerCase().includes(subj.toLowerCase()))
        );
      });
    }
    return studyMaterials.filter((mat) => (mat.subject || '').toLowerCase().includes(materialSubjectFilter.toLowerCase()));
  }, [studyMaterials, registeredSubjects, materialSubjectFilter]);

  const handleStartExam = (examId: string) => {
    setActiveCbtExamId(examId);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setExamTimeLeft(600);
    setIsExamCompleted(false);
    setExamScore(null);
    setCompletedExamQuestions([]);
    showToast('info', 'CBT Mock Started', `Simulation generated for your registered subjects: ${registeredSubjects.join(', ')}`);
  };

  const handleSelectAnswer = (qIndex: number, optionLabel: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionLabel,
    }));
  };

  const handleFinishExam = () => {
    const examQuestions = studentCbtQuestions;
    setCompletedExamQuestions(examQuestions);
    let correctCount = 0;
    examQuestions.forEach((q: any, idx: number) => {
      if (selectedAnswers[idx] === q.correctOption) {
        correctCount += 1;
      }
    });

    const total = examQuestions.length || 1;
    const percentage = Math.round((correctCount / total) * 100);
    const scaledScore = Math.round((percentage / 100) * 400);

    setExamScore({
      correct: correctCount,
      total,
      percentage,
    });
    setIsExamCompleted(true);

    const activeExam = cbtExams.find((e) => e.id === activeCbtExamId);
    recordCBTAttempt({
      examId: activeCbtExamId || 'cbt-jam-01',
      examTitle: activeExam ? `${activeExam.title}` : `${selectedCbtSubjectFilter === 'All' ? 'Registered Subjects' : selectedCbtSubjectFilter} CBT Practice`,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      registrationNumber: currentStudent.registrationNumber,
      score: scaledScore,
      maxScore: 400,
      percentage,
      status: percentage >= 60 ? 'Passed' : 'Failed',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const LockedFeatureNotice: React.FC<{ featureName: string }> = ({ featureName }) => (
    <div className="bg-white rounded-3xl border-2 border-amber-400/80 p-6 sm:p-10 text-center max-w-xl mx-auto space-y-6 shadow-sm animate-in fade-in duration-200 my-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto">
        <Lock className="w-8 h-8 text-amber-600" />
      </div>
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
          Payment-Protected Learning Feature
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-[#25166B]">
          {featureName} is Locked
        </h3>
        <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
          {activePendingPayment ? (
            <span>
              Your tuition payment information has been submitted and is currently awaiting administrative verification. All restricted features will unlock automatically as soon as your payment has been approved by the Directorate administrator.
            </span>
          ) : (
            <span>
              Your tuition payment for this month has not been approved. Your access to CBT practice, ID card services, study materials, and other restricted portal features is temporarily locked. Please pay your monthly tuition fee and submit your payment information. Your access will be restored automatically after the administrator approves your payment.
            </span>
          )}
        </p>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2 max-w-md mx-auto">
        <div className="flex justify-between">
          <span className="text-slate-500">Candidate Name:</span>
          <strong className="text-[#25166B]">{currentStudent.fullName}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Admission Number / Student ID:</span>
          <strong className="font-mono text-[#0284c7]">{currentStudent.registrationNumber}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Current Tuition Month:</span>
          <strong className="text-slate-900 font-bold">{currentMonthPeriod}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Payment Status:</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
              activePendingPayment
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : activeRejectedPayment
                ? 'bg-red-100 text-red-900 border-red-300'
                : 'bg-red-100 text-red-900 border-red-300'
            }`}
          >
            {activePendingPayment
              ? 'Pending Approval'
              : activeRejectedPayment
              ? 'Rejected - Resubmission Required'
              : 'Payment Required'}
          </span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
          <span className="text-slate-700">Amount Due for {currentMonthPeriod}:</span>
          <span className="font-mono text-[#D5241B] text-sm">₦{(currentStudent.monthlyFee || 20000).toLocaleString()}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setStudentTab('finance');
          if (!activePendingPayment) setShowFinanceForm(true);
        }}
        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
      >
        <CreditCard className="w-4 h-4" />
        <span>{activePendingPayment ? 'View Pending Submission' : "Pay This Month's Tuition"}</span>
      </button>
    </div>
  );

  const navItems: { id: StudentPortalTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'receipts', label: 'Receipts', icon: <FileText className="w-4 h-4" />, badge: studentApprovedReceipts.length > 0 ? `${studentApprovedReceipts.length}` : undefined },
    { id: 'id-card', label: 'My ID Card', icon: <CreditCard className="w-4 h-4" />, badge: 'Official' },
    { id: 'profile', label: 'Candidate Profile', icon: <User className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance Record', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'cbt-mocks', label: 'Mock Exams (CBT)', icon: <Award className="w-4 h-4" />, badge: 'Active' },
    { id: 'results', label: 'My Results', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'progress', label: 'Academic Progress', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'practice-sets', label: 'Practice Sets', icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'timetables', label: 'Timetables', icon: <Clock className="w-4 h-4" /> },
    { id: 'notes', label: 'Lecture Notes', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'finance', label: 'Tuition & Payment', icon: <DollarSign className="w-4 h-4" /> },
  ];

  const handleStudentLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const res = await loginStudent(loginIdentifier, loginPassword);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.message);
    }
  };

  if (!isStudentLoggedIn) {
    return (
      <div className="min-h-[85vh] bg-[#FAFAFA] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl border border-slate-200 shadow-md">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-sm">
              <GraduationCap className="w-7 h-7 text-sky-600" />
            </div>
            <h2 className="text-2xl font-black text-sky-600 tracking-tight">Student e-portal Sign In</h2>
            <p className="text-xs text-sky-800 font-semibold">
              D Ensured Consult • Individual Candidate Access Desk
            </p>
          </div>

          {/* Quick Info Box */}
          <div className="p-3.5 bg-sky-50/50 rounded-xl border border-sky-200 text-xs text-[#1D1918] space-y-1">
            <div className="flex items-center gap-2 font-bold text-sky-700">
              <Lock className="w-4 h-4 text-sky-600" />
              <span>Registered Candidate Authentication</span>
            </div>
            <p className="text-[11px] text-slate-900 leading-relaxed font-medium">
              Sign in with your official <strong>Registration Number</strong> (e.g. <code>DEC-2026-XXXX</code>) or registered <strong>Email Address</strong> and your portal password.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 border border-[#D5241B]/30 text-[#D5241B] text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D5241B]" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleStudentLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#25166B] mb-1">
                Registration Number or Email Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. DEC-2026-4821 or student@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-medium text-[#1D1918] focus:border-[#098CD0] focus:ring-2 focus:ring-[#098CD0]/20 outline-hidden bg-[#FAFAFA]"
                />
                <User className="w-4 h-4 text-[#098CD0] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#25166B] mb-1">
                Portal Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your portal password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 font-medium text-[#1D1918] focus:border-[#098CD0] focus:ring-2 focus:ring-[#098CD0]/20 outline-hidden bg-[#FAFAFA]"
                />
                <Lock className="w-4 h-4 text-[#098CD0] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-[#25166B] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button: Primary Red #D5241B */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-[#D5241B] hover:bg-[#b81d15] text-white font-bold text-sm shadow-sm cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <span>Verifying Student Record...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Sign In to Student e-portal</span>
                </>
              )}
            </button>
          </form>



          {/* New student prompt */}
          <div className="text-center pt-2">
            <p className="text-xs text-[#1D1918]/70">
              New candidate?{' '}
              <button
                type="button"
                onClick={() => setCurrentPage('admission')}
                className="font-bold text-[#098CD0] hover:underline cursor-pointer"
              >
                Complete UTME / IELTS Registration Here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-[calc(100vh-80px)] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Student Profile Quick Switcher Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={studentAvatarImg || DEFAULT_AVATAR_SVG}
              alt={currentStudent.fullName}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#098CD0]/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#25166B] text-base sm:text-lg">
                  {currentStudent.fullName}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-[#25166B]/10 text-[#25166B] border border-[#25166B]/20">
                  {currentStudent.program}
                </span>
              </div>
              <p className="text-xs text-[#1D1918]/70 font-medium">
                Reg No: <strong className="font-mono text-[#1D1918]">{currentStudent.registrationNumber}</strong> • Mode:{' '}
                <strong className="text-[#1D1918]">{currentStudent.studyMode}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sign Out Button */}
            <button
              type="button"
              onClick={logoutStudent}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-[#D5241B] hover:bg-red-50 text-xs font-bold text-slate-600 hover:text-[#D5241B] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Active Subscription Banner or Payment Status Alert */}
        {isSubscriptionActive ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#028D3B]/15 text-[#028D3B] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#028D3B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#25166B] text-sm sm:text-base">
                    Monthly Pass Active: {currentStudent.studentShift} Student
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#028D3B] text-white">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Monthly Tuition: <strong>₦{currentStudent.monthlyFee.toLocaleString()}/mo</strong> • Valid until end of month: <strong className="text-[#25166B]">{currentStudent.subscriptionExpiryDate || currentStudent.paymentExpiryDate || defaultEndOfMonth}</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenOfficialReceipt()}
              className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-[#25166B] hover:bg-[#1c1152] text-[#FFC600] font-extrabold text-xs shadow-xs cursor-pointer flex items-center gap-2 shrink-0 transition-all"
            >
              <QrCode className="w-4 h-4 text-[#FFC600]" />
              <span>View Official Receipt (with QR Code)</span>
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 border-2 border-amber-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {activePendingPayment
                    ? 'Monthly tuition payment pending administrator approval.'
                    : activeRejectedPayment
                    ? 'Payment submission requires revision.'
                    : 'Your student portal features are currently locked.'}
                </h3>
                <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                  {activePendingPayment
                    ? 'Your payment information has been submitted and is currently awaiting administrative verification. Access will be granted after your payment has been approved.'
                    : activeRejectedPayment
                    ? `Reason: ${activeRejectedPayment.rejectionReason || 'Details unverified'}. Please review and resubmit your payment information.`
                    : 'Your student portal features are currently locked. Please pay your tuition fee and submit your payment information for administrative verification. Access will be granted after your payment has been approved.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setStudentTab('finance');
                if (!activePendingPayment) setShowFinanceForm(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {activePendingPayment
                  ? 'View Payment Status'
                  : activeRejectedPayment
                  ? 'Resubmit Tuition Payment'
                  : 'Submit Tuition Payment'}
              </span>
            </button>
          </div>
        )}

        {/* Horizontal Scrollable Tabs with Direct Links */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs overflow-x-auto">
          <nav className="flex items-center gap-1.5 min-w-max">
            {navItems.map((tab) => {
              const isActive = studentTab === tab.id;
              return (
                <a
                  key={tab.id}
                  href={`#/student-portal?tab=${tab.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setStudentTab(tab.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#25166B] text-[#FFC600] shadow-sm'
                      : 'text-slate-600 hover:text-[#25166B] hover:bg-slate-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {((!isSubscriptionActive && ['cbt-mocks', 'practice-sets', 'notes', 'progress', 'results', 'attendance', 'timetables'].includes(tab.id)) ||
                    (!canGenerateIdCard && tab.id === 'id-card')) && (
                    <span className="text-amber-500 font-bold text-xs" title="Locked until tuition approved">
                      🔒
                    </span>
                  )}
                  {tab.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        isActive ? 'bg-[#FFC600] text-[#25166B]' : 'bg-amber-100 text-[#25166B]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* TAB 1: DASHBOARD */}
        {studentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* PENDING PAYMENT NOTIFICATION CARD */}
            {activePendingPayment && !isSubscriptionActive && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-400">
                          Pending Approval
                        </span>
                        <span className="text-xs text-amber-800 font-bold">Directorate Verification Underway</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-[#25166B] mt-1">
                        Tuition Payment Information Submitted
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setStudentTab('finance')}
                    className="px-4 py-2 bg-[#25166B] hover:bg-[#1a0f4d] text-[#FFC600] rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                  >
                    View Status &amp; Form →
                  </button>
                </div>

                <p className="text-xs text-amber-900/90 leading-relaxed">
                  An administrator is reviewing your payment. All tuition-protected features (CBT practice &amp; examinations, Student ID card generation, tuition receipts, study materials) remain locked until an administrator approves your payment. Once approved, full portal access will be granted automatically.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] block font-medium">Payment Reference</span>
                    <span className="font-mono font-bold text-[#0284c7] text-xs truncate block">{activePendingPayment.reference}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] block font-medium">Amount Submitted</span>
                    <span className="font-mono font-bold text-slate-900 text-xs block">₦{activePendingPayment.amount.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] block font-medium">Payment Date</span>
                    <span className="font-bold text-slate-800 text-xs block">{activePendingPayment.date}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] block font-medium">Payment Method</span>
                    <span className="font-bold text-slate-800 text-xs block">{activePendingPayment.method}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200 col-span-2 sm:col-span-1">
                    <span className="text-slate-500 text-[10px] block font-medium">Date &amp; Time Submitted</span>
                    <span className="font-bold text-slate-800 text-xs block">{activePendingPayment.submittedAt}</span>
                  </div>
                </div>
              </div>
            )}

            {/* UNPAID / LOCKED FEATURES NOTICE BANNER */}
            {!isSubscriptionActive && !activePendingPayment && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0">
                      <Lock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-200 text-orange-900 border border-orange-400">
                          Portal Locked
                        </span>
                        {activeRejectedPayment && (
                          <span className="text-xs text-red-600 font-bold">
                            Previous submission declined: {activeRejectedPayment.rejectionReason}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-[#25166B] mt-1">
                        Tuition Payment Required
                      </h3>
                      <p className="text-xs text-slate-700 mt-1 max-w-xl leading-relaxed">
                        Your student portal features are currently locked. Please pay your tuition fee and submit your payment information for administrative verification. Access will be granted after your payment has been approved.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setStudentTab('finance');
                      setShowFinanceForm(true);
                    }}
                    className="px-6 py-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Submit Tuition Payment</span>
                  </button>
                </div>
              </div>
            )}
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d97706]/20 border border-[#d97706]/30 text-[#d97706] text-xs font-black uppercase mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    e-portal Student Desk
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Welcome back, {currentStudent.fullName}!
                  </h2>
                  <p className="text-slate-300 text-sm mt-1 max-w-xl">
                    Your target score goal is <strong className="text-[#f59e0b]">{currentStudent.targetScore}</strong>.
                    You are in the final countdown to your official {currentStudent.program} exams.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center shrink-0 w-full md:w-auto">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 block">
                    Official Exam Date
                  </span>
                  <div className="text-2xl font-black text-[#f59e0b] font-mono mt-0.5">
                    {currentStudent.daysRemaining} Days Left
                  </div>
                  <span className="text-xs text-slate-300 block mt-0.5">{currentStudent.targetExamDate}</span>
                </div>
              </div>
            </div>

            {/* Metric KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                  <span>Current Avg Score</span>
                  <Award className="w-4 h-4 text-[#d97706]" />
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#0a192f] font-mono">
                  {currentStudent.currentAverageScore}
                  <span className="text-xs text-slate-400 font-normal"> / 400</span>
                </div>
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Top 6% in Class Percentile
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                  <span>Attendance Rate</span>
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#0a192f] font-mono">
                  {currentStudent.attendanceRate}%
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {currentStudent.attendanceHistory && currentStudent.attendanceHistory.length > 0
                    ? `${currentStudent.attendanceHistory.filter((h) => h.status === 'Present' || h.status === 'Late').length} of ${currentStudent.attendanceHistory.length} lectures attended`
                    : '0 lectures logged yet'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                  <span>Syllabus Coverage</span>
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#0a192f] font-mono">
                  {currentStudent.syllabusCompletion}%
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-[#d97706] h-full rounded-full"
                    style={{ width: `${currentStudent.syllabusCompletion}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                  <span>Tuition Balance</span>
                  <DollarSign className="w-4 h-4 text-amber-600" />
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#0a192f] font-mono">
                  ₦{currentStudent.tuitionBalance.toLocaleString()}
                </div>
                {currentStudent.tuitionBalance > 0 ? (
                  <button
                    onClick={() => openPaymentModal(currentStudent.tuitionBalance, 'Tuition Balance Clearance')}
                    className="text-xs text-[#d97706] font-extrabold hover:underline cursor-pointer"
                  >
                    Clear Balance Now →
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-bold">100% Fully Cleared</span>
                )}
              </div>
            </div>

            {/* Quick Actions & Next Class */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Next Lesson Box */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-[#0a192f] text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#d97706]" />
                    <span>Next Scheduled Class</span>
                  </h3>
                  <a
                    href="#/student-portal?tab=timetables"
                    onClick={(e) => {
                      e.preventDefault();
                      setStudentTab('timetables');
                    }}
                    className="text-xs font-bold text-[#d97706] hover:underline"
                  >
                    View Timetable →
                  </a>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#0a192f] text-[#d97706] uppercase">
                      Physical Hall A
                    </span>
                    <h4 className="font-bold text-[#0a192f] text-sm">
                      {currentStudent.nextClass}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Assigned Lead: {currentStudent.assignedAdvisor}
                    </p>
                  </div>
                  <a
                    href="#/student-portal?tab=notes"
                    onClick={(e) => {
                      e.preventDefault();
                      setStudentTab('notes');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0a192f] hover:bg-[#112240] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Download Handout
                  </a>
                </div>

                {/* Quick Portal Shortcuts */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-2">
                    Quick Shortcuts:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <a
                      href="#/student-portal?tab=cbt-mocks"
                      onClick={(e) => {
                        e.preventDefault();
                        setStudentTab('cbt-mocks');
                      }}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-center space-y-1 transition-colors block"
                    >
                      <Award className="w-5 h-5 text-[#d97706] mx-auto" />
                      <span className="text-xs font-bold text-[#0a192f] block">Take CBT Mock</span>
                    </a>

                    <a
                      href="#/student-portal?tab=id-card"
                      onClick={(e) => {
                        e.preventDefault();
                        setStudentTab('id-card');
                      }}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-center space-y-1 transition-colors block"
                    >
                      <CreditCard className="w-5 h-5 text-blue-600 mx-auto" />
                      <span className="text-xs font-bold text-[#0a192f] block">Student ID Card</span>
                    </a>

                    <a
                      href="#/student-portal?tab=notes"
                      onClick={(e) => {
                        e.preventDefault();
                        setStudentTab('notes');
                      }}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-center space-y-1 transition-colors block"
                    >
                      <BookOpen className="w-5 h-5 text-emerald-600 mx-auto" />
                      <span className="text-xs font-bold text-[#0a192f] block">Lecture Notes</span>
                    </a>

                    <a
                      href="#/student-portal?tab=receipts"
                      onClick={(e) => {
                        e.preventDefault();
                        setStudentTab('receipts');
                      }}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-center space-y-1 transition-colors block"
                    >
                      <FileText className="w-5 h-5 text-purple-600 mx-auto" />
                      <span className="text-xs font-bold text-[#0a192f] block">Receipts</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Latest Announcement Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-[#0a192f] text-base flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-[#d97706]" />
                    <span>Notice Board</span>
                  </h3>
                  <a
                    href="#/student-portal?tab=announcements"
                    onClick={(e) => {
                      e.preventDefault();
                      setStudentTab('announcements');
                    }}
                    className="text-xs font-bold text-[#d97706] hover:underline"
                  >
                    All →
                  </a>
                </div>

                <div className="space-y-3">
                  {announcements.slice(0, 3).map((ann) => (
                    <div key={ann.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-[#d97706] uppercase">{ann.category}</span>
                        <span className="text-slate-400">{ann.date}</span>
                      </div>
                      <h4 className="font-bold text-[#0a192f] text-xs leading-snug">{ann.title}</h4>
                      <p className="text-slate-600 text-[11px] line-clamp-2">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY ID CARD */}
        {studentTab === 'id-card' && (
          !canGenerateIdCard ? (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-8 h-8 text-amber-700" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Verification Clearance Required
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#25166B]">
                  Official Student Identity Card Locked
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">
                  {activePendingPayment
                    ? `Your tuition payment (#${activePendingPayment.reference}) is currently awaiting administrative approval. Your official CR80 student ID card with encrypted QR verification code will be enabled automatically as soon as an administrator approves your payment.`
                    : activeRejectedPayment
                    ? `Your previous payment submission was declined: ${activeRejectedPayment.rejectionReason || 'Details unverified'}. ID card generation remains locked until a verified payment is approved.`
                    : 'Official student identity card generation requires at least one approved monthly tuition payment. Once an administrator approves your payment, your official student ID card is enabled permanently.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2 max-w-md mx-auto text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Candidate:</span>
                  <strong className="text-slate-900 font-bold">{currentStudent.fullName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Student ID / Reg No:</span>
                  <strong className="font-mono text-[#0284c7]">{currentStudent.registrationNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Academic Programme:</span>
                  <strong className="text-[#25166B]">{currentStudent.program}</strong>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500 font-medium">Clearance Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    activePendingPayment
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : activeRejectedPayment
                      ? 'bg-red-100 text-red-900 border border-red-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {activePendingPayment ? 'Pending Approval' : activeRejectedPayment ? 'Declined - Resubmit' : 'Payment Required'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStudentTab('finance');
                  if (!activePendingPayment) setShowFinanceForm(true);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>{activePendingPayment ? 'View Pending Payment Status' : 'Pay Monthly Tuition & Unlock ID Card'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#25166B]">
                    Official Student Identity Card
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Authorized identity credential with embedded cryptographic QR code issued by D Ensured Consult Directorate for the Official 2026/2027 academic session.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#0284c7] font-bold text-xs shadow-xs cursor-pointer transition-all border border-[#0284c7]">
                    <Upload className="w-4 h-4" />
                    <span>Upload/Change Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStudentPassportUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenOfficialReceipt()}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#D5241B] hover:bg-[#b81d15] text-white font-black text-xs shadow-xs cursor-pointer transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadIdCard}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFC600] hover:bg-[#e6b300] text-[#25166B] font-black text-xs shadow-xs cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ID</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1D1918] font-bold text-xs shadow-xs cursor-pointer transition-all border border-slate-200"
                  >
                    <Printer className="w-4 h-4 text-[#D5241B]" />
                    <span>Print ID Card</span>
                  </button>
                </div>
              </div>

              {/* ID Card Graphic Front & Back - CR80 Standard (3.375 x 2.125 inches) */}
              <div className="space-y-4">
                {/* CR80 Standard Dimension Header & Scale Selector */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-2xs print:hidden text-xs max-w-2xl mx-auto">
                  <div>
                    <span className="font-black text-[#25166B] block">
                      Candidate Student ID Card (CR80 Standard)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Official Dimensions: <strong className="text-[#D5241B]">3.375 x 2.125 inches</strong> (85.6mm × 54.0mm)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px] font-bold">Zoom:</span>
                    <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200">
                      {[1, 1.25, 1.5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setIdCardZoom(s)}
                          className={`px-2.5 py-0.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                            idCardZoom === s
                              ? 'bg-[#25166B] text-white shadow-xs'
                              : 'text-slate-600 hover:text-[#25166B]'
                          }`}
                        >
                          {s === 1 ? '100% (3.375"×2.125")' : `${Math.round(s * 100)}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scaled ID Cards Container */}
                <div className="overflow-x-auto py-2 flex flex-col items-center gap-6">
                  {/* Front of ID Card (3.375in x 2.125in) */}
                  <div
                    style={{
                      transform: idCardZoom !== 1 ? `scale(${idCardZoom})` : undefined,
                      transformOrigin: 'top center',
                      marginBottom: idCardZoom > 1 ? `${(idCardZoom - 1) * 204}px` : '0',
                    }}
                    className="transition-transform duration-150"
                  >
                    <div
                      id="student-portal-id-card-front"
                      className="cr80-id-card relative bg-white border-2 border-[#FFC600] shadow-xl overflow-hidden flex flex-col justify-between"
                      style={{
                        width: '3.375in',
                        height: '2.125in',
                        minWidth: '3.375in',
                        minHeight: '2.125in',
                        maxWidth: '3.375in',
                        maxHeight: '2.125in',
                        borderRadius: '0.125in',
                      }}
                    >
                      {/* Top Navy & Gold Header */}
                      <div className="bg-gradient-to-r from-[#0a192f] via-[#25166B] to-[#0284c7] text-white px-2.5 py-1.5 flex items-center justify-between border-b-2 border-[#FFC600]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-white p-0.5 shrink-0 border border-[#FFC600]">
                            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-full" />
                          </div>
                          <div>
                            <span className="font-extrabold text-[10px] tracking-tight block text-white leading-tight">
                              D ENSURED CONSULT
                            </span>
                            <span className="text-[6.5px] uppercase tracking-widest text-[#FFC600] font-black block leading-none">
                              Learn, Emerge and Succeed.
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-1.5 py-0.5 rounded text-[7.5px] font-black bg-[#FFC600] text-[#0a192f] uppercase tracking-wider block">
                            {currentStudent.studentShift || 'Morning'}
                          </span>
                          <span className="text-[6.5px] text-white/90 font-bold block mt-0.5">
                            2026/2027 Session
                          </span>
                        </div>
                      </div>

                      {/* Body: Photo & Credentials */}
                      <div className="px-2.5 py-1.5 flex items-start gap-2 flex-1 bg-gradient-to-b from-white via-slate-50/50 to-white">
                        {/* Photo with clean gold & navy ring */}
                        <div className="relative shrink-0">
                          <img
                            src={studentAvatarImg || DEFAULT_AVATAR_SVG}
                            alt={currentStudent.fullName}
                            style={{ width: '0.72in', height: '0.90in' }}
                            className="rounded-lg object-cover border-2 border-[#FFC600] ring-1 ring-[#0a192f]/20 shadow-xs bg-slate-100"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                DEFAULT_AVATAR_SVG;
                            }}
                          />
                          <div className="absolute -bottom-1 -right-0.5 px-1 py-0.2 rounded bg-[#028D3B] text-white font-black text-[6.5px] uppercase tracking-wider shadow-2xs">
                            CLEARED
                          </div>
                        </div>

                        <div className="flex-1 space-y-0.5 leading-tight">
                          <div>
                            <span className="text-[7px] text-slate-400 uppercase font-black tracking-wider block">Candidate Name</span>
                            <h3 className="text-[10.5px] font-black text-[#0a192f] leading-tight truncate">
                              {currentStudent.fullName}
                            </h3>
                          </div>

                          <div>
                            <span className="text-[6.5px] text-slate-400 uppercase font-bold tracking-wider block">Reg Number</span>
                            <strong className="font-mono text-[9.5px] font-black text-[#0284c7]">
                              {currentStudent.registrationNumber}
                            </strong>
                          </div>

                          <div className="grid grid-cols-2 gap-1 pt-0.5 border-t border-slate-200 text-[7px]">
                            <div>
                              <span className="text-slate-400 block">Shift</span>
                              <strong className="text-[#0a192f]">{currentStudent.studentShift || 'Morning'}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Program</span>
                              <strong className="text-[#0a192f] truncate block">{currentStudent.program}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Bar: Barcode, Expiry & QR */}
                      <div className="px-2.5 py-1 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[7px]">
                        <div className="space-y-0.2">
                          <div className="font-mono text-[#0a192f] text-[7.5px] tracking-widest font-black leading-none">
                            |||| || ||||| || ||||
                          </div>
                          <span className="text-[6.5px] text-[#028D3B] font-mono font-bold block">
                            EXPIRES: {currentStudent.subscriptionExpiryDate || '30 Sep 2026'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="text-right leading-none">
                            <span className="text-[6px] text-[#0284c7] font-black block">DIRECTORATE</span>
                            <span className="text-[5.5px] text-slate-500">Mr. Akinjo Rotimi</span>
                          </div>
                          <div className="bg-white p-0.5 rounded border border-[#0284c7]/30 shadow-2xs shrink-0">
                            <QRCodeSVG
                              value={`https://densuredconsult.edu.ng/verify?reg=${currentStudent.registrationNumber}&student=${encodeURIComponent(currentStudent.fullName)}&status=VALID`}
                              size={28}
                              level="M"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back of ID Card (3.375in x 2.125in) */}
                  <div
                    style={{
                      transform: idCardZoom !== 1 ? `scale(${idCardZoom})` : undefined,
                      transformOrigin: 'top center',
                      marginBottom: idCardZoom > 1 ? `${(idCardZoom - 1) * 204}px` : '0',
                    }}
                    className="transition-transform duration-150"
                  >
                    <div
                      id="student-portal-id-card-back"
                      className="cr80-id-card relative bg-white border-2 border-slate-300 shadow-md overflow-hidden flex flex-col justify-between p-2.5 text-[7.5px] text-[#1D1918]"
                      style={{
                        width: '3.375in',
                        height: '2.125in',
                        minWidth: '3.375in',
                        minHeight: '2.125in',
                        maxWidth: '3.375in',
                        maxHeight: '2.125in',
                        borderRadius: '0.125in',
                      }}
                    >
                      <div className="border-b border-[#FFC600] pb-1 flex items-center justify-between bg-gradient-to-r from-[#0a192f] to-[#25166B] text-white p-1 rounded-md">
                        <span className="font-extrabold uppercase tracking-wider text-[#FFC600] text-[8px]">
                          TERMS &amp; CENTER REGULATIONS
                        </span>
                        <span className="text-[6.5px] font-bold text-white bg-emerald-600 px-1 py-0.2 rounded">
                          OFFICIAL 2026/2027
                        </span>
                      </div>

                      <ul className="list-disc pl-3 space-y-0.5 text-slate-600 text-[7px] leading-tight mt-1">
                        <li>This card is the property of D Ensured Consult and must be presented for CBT mock drills and physical lectures.</li>
                        <li>Cardholder is officially cleared for student e-portal resources, past questions, and test simulations.</li>
                        <li>Loss or damage must be promptly reported to the directorate desk.</li>
                      </ul>

                      <div className="pt-1 border-t border-slate-200 text-[6.5px] text-slate-600 space-y-0.2 leading-tight">
                        <p><strong>Campus:</strong> DOYIN PLAZA, IGBOELERIN BUSSTOP, OKOMAIKO, LAGOS</p>
                        <p><strong>Hotline:</strong> <span className="font-mono font-bold text-[#0284c7]">08147896930</span> | Densuredconsult@gmail.com</p>
                      </div>

                      <div className="flex justify-between items-center pt-0.5 border-t border-slate-200 text-[6.5px]">
                        <span className="font-mono text-slate-400">Card Type: CR80 PVC Standard</span>
                        <span className="font-serif italic font-bold text-[#0a192f]">Akinjo Rotimi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

        {/* TAB 3: CANDIDATE PROFILE */}
        {studentTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-[#0a192f]">Candidate Academic Profile</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Detailed enrollment records, chosen subjects, and academic targets.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card Summary */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="relative inline-block mx-auto">
                  <img
                    src={studentAvatarImg || DEFAULT_AVATAR_SVG}
                    alt={currentStudent.fullName}
                    className="w-24 h-24 rounded-2xl object-cover mx-auto ring-4 ring-[#d97706]/40 shadow-md bg-white"
                  />
                  <label className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#0284c7] hover:bg-[#026aa2] text-white shadow-md cursor-pointer transition-transform hover:scale-110" title="Update Passport Photo">
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStudentPassportUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0a192f] text-lg">{currentStudent.fullName}</h3>
                  <span className="text-xs text-[#d97706] font-bold block">{currentStudent.email}</span>
                  <span className="text-xs text-slate-500 font-mono mt-0.5 block">{currentStudent.phone}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registration ID:</span>
                    <strong className="font-mono text-slate-800">{currentStudent.registrationNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Academic Diet:</span>
                    <strong className="text-slate-800">2026 Session</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Center:</span>
                    <strong className="text-slate-800">Okomaiko Campus</strong>
                  </div>
                </div>
              </div>

              {/* Comprehensive Profile Form/Fields */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">Enrolled Programme:</span>
                    <strong className="text-[#0a192f] text-sm block">{currentStudent.program}</strong>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">Study Mode:</span>
                    <strong className="text-[#0a192f] text-sm block">{currentStudent.studyMode}</strong>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">Assigned Academic Advisor:</span>
                    <strong className="text-[#0a192f] text-sm block">{currentStudent.assignedAdvisor}</strong>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">Target Score Goal:</span>
                    <strong className="text-[#d97706] text-sm block">{currentStudent.targetScore}</strong>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-[#098CD0]/30 shadow-xs space-y-3">
                  <h4 className="font-bold text-[#25166B] text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#028D3B]" />
                    <span>
                      {currentStudent.program === 'IELTS'
                        ? 'IELTS Module Specifications & Skills Plan'
                        : 'Official 4-Subject Combination & Syllabus Plan'}
                    </span>
                  </h4>

                  {currentStudent.program === 'IELTS' ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-lg bg-[#25166B] text-white font-bold">
                          Module: {currentStudent.ieltsModule || 'Academic'}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-[#028D3B]/10 text-[#028D3B] font-bold border border-[#028D3B]/20">
                          Target: {currentStudent.ieltsTargetBand || 'Band 8.0'}
                        </span>
                        {currentStudent.destinationCountry && (
                          <span className="px-3 py-1 rounded-lg bg-slate-100 text-[#1D1918] font-bold">
                            Destination: {currentStudent.destinationCountry}
                          </span>
                        )}
                      </div>
                      <div className="p-3 bg-[#FAFAFA] rounded-xl border border-slate-200">
                        <span className="font-bold text-[#25166B] block mb-1">British Council 4-Skill Tracks:</span>
                        <p className="text-[#1D1918]/80">
                          Active laboratory enrollment in: <strong>Listening Audio Lab</strong>, <strong>Reading Heuristics</strong>,{' '}
                          <strong>Writing Tasks 1 & 2</strong>, and <strong>Speaking 1-on-1 Interview Simulations</strong>.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <span className="font-bold text-[#25166B] block">Approved 4 Examination Subjects:</span>
                      <div className="flex flex-wrap gap-2">
                        {currentStudent.subjectCombinations && currentStudent.subjectCombinations.length > 0 ? (
                          currentStudent.subjectCombinations.map((sub, i) => (
                            <span
                              key={i}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                (sub || '').toLowerCase().includes('english')
                                  ? 'bg-[#25166B] text-white flex items-center gap-1 shadow-2xs'
                                  : 'bg-white border border-[#098CD0]/40 text-[#25166B]'
                              }`}
                            >
                              {sub}
                            </span>
                          ))
                        ) : (
                          <>
                            <span className="px-3 py-1.5 rounded-lg bg-[#25166B] text-white font-bold flex items-center gap-1 shadow-2xs">
                              <Lock className="w-3 h-3 text-[#FFC600]" />
                              English Language (Compulsory)
                            </span>
                            <span className="px-3 py-1.5 rounded-lg bg-white border border-[#098CD0]/40 text-[#25166B] font-bold">Mathematics</span>
                            <span className="px-3 py-1.5 rounded-lg bg-white border border-[#098CD0]/40 text-[#25166B] font-bold">Physics</span>
                            <span className="px-3 py-1.5 rounded-lg bg-white border border-[#098CD0]/40 text-[#25166B] font-bold">Chemistry</span>
                          </>
                        )}
                      </div>
                      {currentStudent.targetInstitution && (
                        <p className="text-[11px] text-[#1D1918]/70 pt-1">
                          Target Institution: <strong>{currentStudent.targetInstitution}</strong> • Course: <strong>{currentStudent.targetCourse}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ATTENDANCE RECORD */}
        {studentTab === 'attendance' && (
          !isSubscriptionActive ? (
            <LockedFeatureNotice featureName="Daily Attendance Ledger" />
          ) : (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0a192f]">Daily Attendance Record</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Official roll call and register logs taken by the Directorate Office.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  Standing: {currentStudent.attendanceRate}% Attendance Rate
                </div>
              </div>
            </div>

            {/* Attendance Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                <span className="text-[11px] text-slate-500 font-bold uppercase">Total Sessions Logged</span>
                <div className="text-2xl font-black text-[#0a192f] font-mono">
                  {(currentStudent.attendanceHistory || []).length}
                </div>
                <span className="text-[11px] text-slate-400 block">Lectures &amp; CBT Practicals</span>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-center space-y-1">
                <span className="text-[11px] text-emerald-800 font-bold uppercase">Sessions Attended</span>
                <div className="text-2xl font-black text-emerald-800 font-mono">
                  {(currentStudent.attendanceHistory || []).filter((h) => h.status === 'Present' || h.status === 'Late').length}
                </div>
                <span className="text-[11px] text-emerald-700 block">Punctual &amp; Late Sessions</span>
              </div>

              <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200 text-center space-y-1">
                <span className="text-[11px] text-[#0284c7] font-bold uppercase">Overall Rate</span>
                <div className="text-2xl font-black text-[#0284c7] font-mono">
                  {currentStudent.attendanceRate}%
                </div>
                <span className="text-[11px] text-sky-700 block">
                  {currentStudent.attendanceRate >= 80 ? 'Good Standing' : currentStudent.attendanceRate >= 60 ? 'Satisfactory' : 'Attention Required'}
                </span>
              </div>
            </div>

            {/* Attendance Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Time Logged</th>
                    <th className="py-3.5 px-4">Session / Module</th>
                    <th className="py-3.5 px-4">Hall / Venue</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {currentStudent.attendanceHistory && currentStudent.attendanceHistory.length > 0 ? (
                    currentStudent.attendanceHistory.map((att) => {
                      const isPresent = att.status === 'Present';
                      const isLate = att.status === 'Late';
                      const isAbsent = att.status === 'Absent';

                      return (
                        <tr key={att.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-bold font-mono text-[#0a192f]">
                            {att.date}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-700">
                              <Clock className="w-3 h-3 text-[#0284c7]" />
                              <span>{att.time || '09:00 AM'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#0a192f] block">
                              {att.remark || att.subject || `${currentStudent.program} Core Lecture`}
                            </span>
                            {att.cohort && (
                              <span className="text-[10px] text-slate-400 font-medium block">
                                Cohort: {att.cohort}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {att.venue || 'Lecture Hall A (Okomaiko Campus)'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border ${
                                isPresent
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : isLate
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : isAbsent
                                  ? 'bg-red-100 text-red-800 border-red-300'
                                  : 'bg-blue-100 text-blue-800 border-blue-300'
                              }`}
                            >
                              {isPresent && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {isLate && <Clock className="w-3 h-3 text-amber-600" />}
                              {isAbsent && <XCircle className="w-3 h-3 text-red-600" />}
                              <span>{att.status}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                            <CalendarCheck className="w-6 h-6 text-[#0284c7]" />
                          </div>
                          <p className="font-bold text-slate-800 text-sm">No Attendance Records Logged Yet</p>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            When the admin takes daily attendance from the Directorate Admin Dashboard, the session date, exact time, venue, and status will automatically appear here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )
        )}

        {/* TAB 5: CBT & EXAMINATIONS: MOCK EXAMS (CBT) */}
        {studentTab === 'cbt-mocks' && (
          !isSubscriptionActive ? (
            <LockedFeatureNotice featureName="Computer-Based Test (CBT) Mock Examinations" />
          ) : (
            <div className="space-y-6">
            {!activeCbtExamId ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7] bg-sky-50 border border-sky-200 px-3 py-1 rounded-full inline-block mb-1.5">
                      Exam Standard Simulation
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0a192f]">
                      Computer-Based Test (CBT) Practice Hub
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Practice past questions tailored to your registered subjects with instant scoring and heuristic explanations.
                    </p>
                  </div>

                  {/* Registered Subject Filter Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-bold">Subject:</span>
                    <select
                      value={selectedCbtSubjectFilter}
                      onChange={(e) => setSelectedCbtSubjectFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#0a192f] bg-white outline-hidden focus:border-[#25166B]"
                    >
                      <option value="All">All Registered Subjects ({registeredSubjects.length})</option>
                      {registeredSubjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Candidate's Registered Subjects Banner */}
                <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <BookCheck className="w-5 h-5 text-[#0284c7]" />
                    <div>
                      <span className="font-extrabold text-[#0a192f]">Your Registered Subject Combination:</span>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        {registeredSubjects.join(' • ')} ({currentStudent.program} Track)
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {studentCbtQuestions.length} Questions in Pool
                  </span>
                </div>

                {/* CBT Exam Simulations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cbtExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 hover:border-[#d97706]/60 hover:bg-slate-50 transition-all space-y-3.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#0a192f] text-[#d97706] uppercase">
                          {exam.program}
                        </span>
                        <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#d97706]" />
                          {exam.durationMinutes} Minutes
                        </span>
                      </div>

                      <h3 className="font-extrabold text-[#0a192f] text-base">{exam.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{exam.instructions}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                        <span className="text-slate-500 font-medium">
                          Target Subjects: <strong>{selectedCbtSubjectFilter === 'All' ? 'Registered Combination' : selectedCbtSubjectFilter}</strong>
                        </span>
                        <button
                          onClick={() => handleStartExam(exam.id)}
                          className="px-4 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white font-extrabold text-xs shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>Start CBT Practice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Active Interactive CBT Simulator Window */
              <div className="bg-white rounded-3xl border-2 border-[#d97706] shadow-xl overflow-hidden">
                {/* CBT Header */}
                <div className="bg-[#0a192f] text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-black text-[#d97706] block">
                      Active CBT Mock Simulation
                    </span>
                    <h3 className="font-extrabold text-base sm:text-lg">
                      {cbtExams.find((e) => e.id === activeCbtExamId)?.title || 'National Mock Exam'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 px-4 py-1.5 rounded-xl border border-white/20 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-300" />
                      <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wide">
                        TIME REMAINING: {formatTime(examTimeLeft)}
                      </span>
                    </div>

                    {!isExamCompleted && (
                      <button
                        onClick={handleFinishExam}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-sm"
                      >
                        Submit Test
                      </button>
                    )}
                  </div>
                </div>

                {/* CBT Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  {!isExamCompleted ? (
                    <div>
                      {/* Question Pallet */}
                      <div className="flex flex-wrap gap-1.5 mb-6 pb-4 border-b border-slate-200">
                        {studentCbtQuestions.map((q: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              currentQuestionIndex === idx
                                ? 'bg-[#0a192f] text-[#d97706] ring-2 ring-[#d97706]'
                                : selectedAnswers[idx]
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Current Question */}
                      {studentCbtQuestions[currentQuestionIndex] && (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-[#d97706]/15 text-[#d97706]">
                                {studentCbtQuestions[currentQuestionIndex].subject}
                              </span>
                              <span className="text-xs text-slate-400 font-bold">
                                Question {currentQuestionIndex + 1} of {studentCbtQuestions.length}
                              </span>
                            </div>
                            <p className="text-base sm:text-lg font-bold text-[#0a192f] leading-relaxed">
                              {studentCbtQuestions[currentQuestionIndex].questionText}
                            </p>
                          </div>

                          {/* Options */}
                          <div className="space-y-2.5">
                            {studentCbtQuestions[currentQuestionIndex].options.map((opt: { label: string; text: string }) => {
                              const isSelected = selectedAnswers[currentQuestionIndex] === opt.label;
                              return (
                                <button
                                  key={opt.label}
                                  onClick={() => handleSelectAnswer(currentQuestionIndex, opt.label)}
                                  className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                                    isSelected
                                      ? 'border-[#d97706] bg-amber-50/50 text-[#0a192f] font-bold shadow-2xs'
                                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                      isSelected
                                        ? 'bg-[#d97706] text-white'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {opt.label}
                                  </span>
                                  <span className="text-sm font-medium">{opt.text}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Prev / Next controls */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                            <button
                              disabled={currentQuestionIndex === 0}
                              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs disabled:opacity-40 cursor-pointer"
                            >
                              ← Previous Question
                            </button>

                            {currentQuestionIndex < studentCbtQuestions.length - 1 ? (
                              <button
                                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                                className="px-5 py-2 rounded-xl bg-[#0a192f] text-white font-bold text-xs cursor-pointer hover:bg-[#112240]"
                              >
                                Next Question →
                              </button>
                            ) : (
                              <button
                                onClick={handleFinishExam}
                                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs cursor-pointer hover:bg-emerald-700 shadow-sm"
                              >
                                Complete & View Score
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Score Screen & Failed Questions Heuristic Explanations Review */
                    <div className="space-y-6">
                      <div className="text-center py-4 space-y-3 max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                          <Check className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-[#0a192f]">Practice Simulation Completed!</h3>
                        <p className="text-slate-600 text-xs">
                          Your test has been officially scored and your academic progression has been updated.
                        </p>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                          <span className="text-xs text-slate-500 uppercase font-bold">Estimated JAMB / WAEC Scaled Score</span>
                          <div className="text-4xl font-black text-[#d97706] font-mono">
                            {Math.round(((examScore?.percentage || 0) / 100) * 400)} / 400
                          </div>
                          <p className="text-xs text-slate-600 font-medium">
                            Accuracy: {examScore?.correct} of {examScore?.total} correct ({examScore?.percentage}%) • Status:{' '}
                            <strong className={(examScore?.percentage || 0) >= 60 ? 'text-emerald-700' : 'text-red-600'}>
                              {(examScore?.percentage || 0) >= 60 ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                            </strong>
                          </p>
                        </div>

                        <div className="flex gap-2 justify-center pt-2">
                          <button
                            onClick={() => setActiveCbtExamId(null)}
                            className="px-5 py-2.5 rounded-xl bg-[#0a192f] text-white font-bold text-xs cursor-pointer hover:bg-[#112240]"
                          >
                            Return to CBT Hub
                          </button>
                          <button
                            onClick={() => handleStartExam(activeCbtExamId || 'cbt-jam-01')}
                            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-100 flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retake Test</span>
                          </button>
                        </div>
                      </div>

                      {/* Missed Questions & Explanations Review Section */}
                      <div className="border-t border-slate-200 pt-6 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <div>
                            <h4 className="font-black text-[#0a192f] text-sm">
                              Detailed Answers & Heuristic Solution Review
                            </h4>
                            <p className="text-slate-500 text-xs">
                              Review step-by-step explanations for questions to master the concepts.
                            </p>
                          </div>

                          <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => setCbtReviewFilter('failed')}
                              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                cbtReviewFilter === 'failed'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Failed Questions ({completedExamQuestions.filter((_, idx) => selectedAnswers[idx] !== completedExamQuestions[idx]?.correctOption).length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setCbtReviewFilter('all')}
                              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                cbtReviewFilter === 'all'
                                  ? 'bg-[#0a192f] text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              All Questions ({completedExamQuestions.length})
                            </button>
                          </div>
                        </div>

                        {/* Questions List with Explanations */}
                        <div className="space-y-4">
                          {completedExamQuestions
                            .map((q, idx) => ({ q, idx, userAns: selectedAnswers[idx], isCorrect: selectedAnswers[idx] === q.correctOption }))
                            .filter((item) => (cbtReviewFilter === 'failed' ? !item.isCorrect : true))
                            .map(({ q, idx, userAns, isCorrect }) => (
                              <div
                                key={q.id || idx}
                                className={`p-5 rounded-2xl border-2 space-y-3 text-xs transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-50/50 border-emerald-200'
                                    : 'bg-red-50/40 border-red-200'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#0a192f] text-[#FFC600]">
                                      {q.subject}
                                    </span>
                                    <span className="font-bold text-[#0a192f]">Question {idx + 1}</span>
                                  </div>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      isCorrect
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-red-100 text-red-800 border border-red-300'
                                    }`}
                                  >
                                    {isCorrect ? '✓ Correct Answer' : '✕ Missed / Failed'}
                                  </span>
                                </div>

                                <p className="font-bold text-slate-900 text-sm leading-relaxed">
                                  {q.questionText}
                                </p>

                                {/* Options breakdown */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                  {q.options.map((opt) => {
                                    const isUserChoice = userAns === opt.label;
                                    const isCorrectOpt = opt.label === q.correctOption;

                                    return (
                                      <div
                                        key={opt.label}
                                        className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                                          isCorrectOpt
                                            ? 'border-emerald-500 bg-emerald-100/70 text-emerald-900 font-bold'
                                            : isUserChoice && !isCorrectOpt
                                            ? 'border-red-400 bg-red-100/70 text-red-900 font-bold'
                                            : 'border-slate-200 bg-white text-slate-600'
                                        }`}
                                      >
                                        <span
                                          className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs shrink-0 ${
                                            isCorrectOpt
                                              ? 'bg-emerald-600 text-white'
                                              : isUserChoice && !isCorrectOpt
                                              ? 'bg-red-600 text-white'
                                              : 'bg-slate-100 text-slate-600'
                                          }`}
                                        >
                                          {opt.label}
                                        </span>
                                        <span className="text-xs">{opt.text}</span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Step-by-Step Heuristic Solution */}
                                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Step-by-Step Solution & Heuristic Explanation:</span>
                                  </div>
                                  <p className="text-slate-700 text-xs leading-relaxed">
                                    {q.explanation}
                                  </p>
                                </div>
                              </div>
                            ))}

                          {cbtReviewFilter === 'failed' &&
                            completedExamQuestions.filter((_, idx) => selectedAnswers[idx] !== completedExamQuestions[idx]?.correctOption).length === 0 && (
                              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 font-bold text-xs space-y-1">
                                <p className="text-sm font-black">Outstanding Work! 100% Correct</p>
                                <p className="text-emerald-600">You did not fail any questions in this practice simulation.</p>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      )}
        {/* TAB 6: MY RESULTS */}
        {studentTab === 'results' && (
          !isSubscriptionActive ? (
            <LockedFeatureNotice featureName="Real-time Exam Results & Standings" />
          ) : (
            (() => {
          const studentCbtAttempts = cbtAttempts.filter(
            (att) => att.studentId === currentStudent.id || att.registrationNumber === currentStudent.registrationNumber
          );
          const totalAttempts = studentCbtAttempts.length;
          const avgScore = totalAttempts > 0
            ? Math.round(studentCbtAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / totalAttempts)
            : 0;
          const passedCount = studentCbtAttempts.filter((a) => a.status === 'Passed').length;

          return (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0a192f]">My CBT Test Results</h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Real-time test scores, accuracy percentages, and pass/fail standings from your CBT practice simulations.
                      </p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Result Slip</span>
                    </button>
                  </div>

                  {studentCbtAttempts.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#d97706] flex items-center justify-center mx-auto">
                        <Award className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-extrabold text-[#0a192f]">No Real-Time CBT Results Logged Yet</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Take an interactive CBT practice simulation or mock exam to generate your live test score, accuracy percentage, and pass/fail standing!
                      </p>
                      <button
                        type="button"
                        onClick={() => setStudentTab('cbt-mocks')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white font-extrabold text-xs shadow-sm cursor-pointer transition-all"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Start CBT Practice Now</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Tests Attempted</span>
                          <div className="text-2xl font-black text-[#0a192f] font-mono">{totalAttempts}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Average Score</span>
                          <div className="text-2xl font-black text-[#0284c7] font-mono">{avgScore}%</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Passed Tests</span>
                          <div className="text-2xl font-black text-emerald-700 font-mono">{passedCount} / {totalAttempts}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Overall Standing</span>
                          <div className={`text-base font-extrabold ${passedCount >= totalAttempts / 2 ? 'text-emerald-700' : 'text-red-600'}`}>
                            {passedCount >= totalAttempts / 2 ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {studentCbtAttempts.map((test) => (
                          <div key={test.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-extrabold text-[#0a192f] text-sm">{test.examTitle}</h3>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                    test.status === 'Passed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-red-100 text-red-800 border-red-300'
                                  }`}>
                                    {test.status} Standing
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono">{test.submittedAt}</span>
                              </div>

                              <div className="text-right">
                                <span className="text-xl font-black text-[#0a192f] font-mono">
                                  {test.score} <span className="text-xs text-slate-400 font-normal">/ {test.maxScore}</span>
                                </span>
                                <span className="text-xs text-emerald-600 font-extrabold block">
                                  Accuracy: {test.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
            </div>
            )
          })()
        )
        )}

        {/* TAB 6B: ACADEMIC PROGRESS */}
        {studentTab === 'progress' && (
          !isSubscriptionActive ? (
            <LockedFeatureNotice featureName="Academic Performance & Progress Ledger" />
          ) : (
            (() => {
          const studentCbtAttempts = cbtAttempts.filter(
            (att) => att.studentId === currentStudent.id || att.registrationNumber === currentStudent.registrationNumber
          );
          const totalAttemptsCount = studentCbtAttempts.length;
          const totalMaxQuestions = studentCbtAttempts.reduce((acc, a) => acc + (a.maxScore || 0), 0);
          const totalAchievedScore = studentCbtAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
          const overallAccuracyPercentage = totalMaxQuestions > 0
            ? ((totalAchievedScore / totalMaxQuestions) * 100).toFixed(1)
            : '0.0';

          const cumulativeAverageScore = totalAttemptsCount > 0
            ? Math.round(studentCbtAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / totalAttemptsCount)
            : 0;

          const passedCount = studentCbtAttempts.filter((a) => a.status === 'Passed').length;
          const passStanding = totalAttemptsCount === 0
            ? 'No Test History'
            : passedCount >= Math.ceil(totalAttemptsCount / 2)
            ? 'Passed Standing'
            : 'Needs Improvement';

          return (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7] bg-sky-50 border border-sky-200 px-3 py-1 rounded-full inline-block mb-1.5">
                        Academic Performance Ledger
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">Continuous Academic Progress</h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Real-time test scores, accuracy percentages, and pass/fail standings dynamically tracked per student.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Progress Report</span>
                    </button>
                  </div>

                  {/* High-Level Standing Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Cumulative Average</span>
                      <div className="text-2xl sm:text-3xl font-black text-[#0284c7] font-mono">
                        {totalAttemptsCount > 0 ? `${cumulativeAverageScore}%` : '--'}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">Real-time CBT Score</span>
                    </div>

                    <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Assessments Logged</span>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                        {totalAttemptsCount}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Real-time Submissions</span>
                    </div>

                    <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Accuracy Rate</span>
                      <div className="text-2xl sm:text-3xl font-black text-[#ea580c] font-mono">
                        {overallAccuracyPercentage}%
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{totalAchievedScore}/{totalMaxQuestions} Marks</span>
                    </div>

                    <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Academic Standing</span>
                      <div className={`text-lg sm:text-xl font-black font-mono ${passStanding === 'Passed Standing' ? 'text-emerald-700' : passStanding === 'Needs Improvement' ? 'text-red-600' : 'text-slate-400'}`}>
                        {passStanding}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold">{passedCount} Passed / {totalAttemptsCount} Total</span>
                    </div>
                  </div>

                  {/* Assessment History Table */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm">Real-Time Assessment Log &amp; Accuracy Standings</h3>
                    {totalAttemptsCount === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center mx-auto">
                          <Award className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-extrabold text-[#0a192f]">No Real-Time CBT Scores Recorded Yet</h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Complete a CBT practice simulation or mock exam to generate real-time test scores, accuracy percentages, and pass/fail standings!
                        </p>
                        <button
                          type="button"
                          onClick={() => setStudentTab('cbt-mocks')}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-sky-700 text-white font-extrabold text-xs shadow-sm cursor-pointer transition-all"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>Start CBT Practice</span>
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                              <th className="p-3.5">Assessment Type</th>
                              <th className="p-3.5">Test Title</th>
                              <th className="p-3.5">Date &amp; Time</th>
                              <th className="p-3.5">Score</th>
                              <th className="p-3.5">Accuracy %</th>
                              <th className="p-3.5">Pass / Fail Standing</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {studentCbtAttempts.map((att) => (
                              <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3.5 font-bold text-slate-800">
                                  <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-extrabold border border-amber-200">
                                    CBT Practice
                                  </span>
                                </td>
                                <td className="p-3.5 font-bold text-slate-900">{att.examTitle}</td>
                                <td className="p-3.5 font-mono text-slate-500">{att.submittedAt}</td>
                                <td className="p-3.5 font-mono font-bold text-slate-800">
                                  {att.score} / {att.maxScore}
                                </td>
                                <td className="p-3.5">
                                  <span className="px-2.5 py-0.5 rounded-full font-bold font-mono text-[11px] bg-sky-100 text-sky-800">
                                    {att.percentage.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  <span className={`px-2.5 py-1 rounded-full font-extrabold text-[11px] border ${
                                    att.status === 'Passed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-red-100 text-red-800 border-red-300'
                                  }`}>
                                    {att.status} Standing
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
            </div>
            )
          })()
        )
        )}

        {/* TAB 7: PRACTICE SETS */}
        {studentTab === 'practice-sets' && (
          !isSubscriptionActive ? (
            <LockedFeatureNotice featureName="20-Year Past Questions Practice Bank" />
          ) : (
            (() => {
          const yearsList = Array.from({ length: 21 }, (_, i) => (2005 + i).toString()).reverse(); // 2025 down to 2005

          const filteredQuestions = practiceQuestions.filter((q) => {
            const matchSubject = practiceSubjectFilter === 'All' || q.subject.toLowerCase().includes(practiceSubjectFilter.toLowerCase());
            const matchYear = practiceYearFilter === 'All' || (q.examYear || '').includes(practiceYearFilter);
            return matchSubject && matchYear;
          });

          return (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0a192f]">Interactive Practice Question Bank</h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        20 Years Past Question Archives (2005–2025) year after year across all subjects with instant answer checking and heuristic solutions.
                      </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-bold">Subject:</span>
                        <select
                          value={practiceSubjectFilter}
                          onChange={(e) => setPracticeSubjectFilter(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-[#0a192f] bg-white outline-hidden focus:border-[#25166B]"
                        >
                          <option value="All">All Subjects</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Biology">Biology</option>
                          <option value="Use of English">Use of English</option>
                          <option value="Economics">Economics</option>
                          <option value="Government">Government</option>
                          <option value="Literature in English">Literature</option>
                          <option value="Commerce">Commerce &amp; Accounts</option>
                          <option value="Agricultural Science">Agric Science</option>
                          <option value="CRK">CRK / Religious Studies</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-bold">Exam Year:</span>
                        <select
                          value={practiceYearFilter}
                          onChange={(e) => setPracticeYearFilter(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-[#0a192f] bg-white outline-hidden focus:border-[#25166B]"
                        >
                          <option value="All">All Years (2005 - 2025)</option>
                          {yearsList.map((y) => (
                            <option key={y} value={y}>{y} Past Questions</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Banner Counter */}
                  <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#0a192f]">
                      Showing {filteredQuestions.length} Past Questions
                      {practiceSubjectFilter !== 'All' ? ` for ${practiceSubjectFilter}` : ' across All Subjects'}
                      {practiceYearFilter !== 'All' ? ` (${practiceYearFilter} Edition)` : ' (2005–2025 Archive)'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-black text-[10px]">
                      Year-by-Year Past Questions
                    </span>
                  </div>

                  {/* Questions List */}
                  {filteredQuestions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <p className="text-xs text-slate-500 font-medium">No past questions matched the selected subject and year filter.</p>
                      <button
                        onClick={() => {
                          setPracticeSubjectFilter('All');
                          setPracticeYearFilter('All');
                        }}
                        className="text-xs text-[#0284c7] font-bold hover:underline cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredQuestions.map((q, idx) => {
                        const isRevealed = revealedExplanations[q.id];
                        const chosenOpt = practiceUserAnswers[q.id];
                        return (
                          <div
                            key={q.id}
                            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#0a192f] text-[#d97706]">
                                  {q.subject}
                                </span>
                                <span className="text-slate-600 font-mono font-bold text-[11px] bg-slate-200 px-2 py-0.5 rounded">{q.examYear}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                                {q.difficulty}
                              </span>
                            </div>

                            <h4 className="font-bold text-[#0a192f] text-sm leading-relaxed">
                              {idx + 1}. {q.questionText}
                            </h4>

                            {/* Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options.map((opt) => {
                                const isSelected = chosenOpt === opt.label;
                                const isCorrect = isRevealed && opt.label === q.correctOption;
                                const isWrong = isRevealed && isSelected && opt.label !== q.correctOption;
                                return (
                                  <button
                                    key={opt.label}
                                    onClick={() => {
                                      setPracticeUserAnswers((prev) => ({ ...prev, [q.id]: opt.label }));
                                    }}
                                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                                      isCorrect
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                                        : isWrong
                                        ? 'border-red-400 bg-red-50 text-red-900'
                                        : isSelected
                                        ? 'border-[#d97706] bg-amber-50/50 text-[#0a192f] font-bold'
                                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                                    }`}
                                  >
                                    <span
                                      className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                        isCorrect
                                          ? 'bg-emerald-600 text-white'
                                          : isWrong
                                          ? 'bg-red-600 text-white'
                                          : isSelected
                                          ? 'bg-[#d97706] text-white'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {opt.label}
                                    </span>
                                    <span className="text-xs">{opt.text}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Reveal Explanation Button */}
                            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                              <button
                                onClick={() => {
                                  setRevealedExplanations((prev) => ({
                                    ...prev,
                                    [q.id]: !prev[q.id],
                                  }));
                                }}
                                className="text-xs text-[#d97706] font-bold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>{isRevealed ? 'Hide Solution' : 'Check Correct Answer & Heuristic Solution'}</span>
                              </button>
                            </div>

                            {isRevealed && (
                              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-slate-800 space-y-1">
                                <span className="font-bold text-[#0a192f] block">
                                  Correct Answer: Option {q.correctOption}
                                </span>
                                <p className="text-[11px] leading-relaxed text-slate-600">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
            </div>
            )
          })()
        )
        )}

        {/* TAB 8: TIMETABLES */}
        {studentTab === 'timetables' && (
          !isSubscriptionActive ? (
            <LockedFeatureNotice featureName="Master Weekly Timetable" />
          ) : (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0a192f]">Weekly Master Timetable</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Scheduled lecture halls, practical labs, and virtual live sessions.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Schedule</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#0a192f] text-[#d97706] uppercase">
                      {lesson.dayOfWeek}
                    </span>
                    <span className="text-slate-500 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#d97706]" />
                      {lesson.time}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-[#0a192f] text-sm">{lesson.title}</h3>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{lesson.topicSummary}</p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Venue: <strong className="text-slate-800">{lesson.room}</strong></span>
                    <span>Tutor: <strong className="text-slate-800">{lesson.tutorName}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )
        )}

        {/* TAB 9: LECTURE NOTES & STUDY MATERIALS */}
        {studentTab === 'notes' && (
          !isSubscriptionActive ? (
            <LockedFeatureNotice featureName="Digital Handouts & Study Materials" />
          ) : (
            <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0a192f]">Digital Study Materials &amp; Handouts</h2>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Official lesson summaries, formula cheat sheets, and syllabus compilations uploaded from the Directorate.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Filter:</span>
                    <select
                      value={materialSubjectFilter}
                      onChange={(e) => setMaterialSubjectFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-[#0a192f] bg-slate-50 cursor-pointer focus:outline-hidden"
                    >
                      <option value="All">All Academy Materials ({studyMaterials.length})</option>
                      <option value="My Subjects">My Enrolled Subjects</option>
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Use of English & Literature">Use of English</option>
                      <option value="Economics">Economics</option>
                      <option value="Government">Government</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-sky-50 to-indigo-50/50 rounded-2xl border border-sky-200 text-xs text-[#0a192f] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0284c7] shrink-0" />
                    <span>
                      Showing <strong>{filteredStudyMaterials.length}</strong> study resource{filteredStudyMaterials.length === 1 ? '' : 's'} ({materialSubjectFilter === 'All' ? 'All Academy Handouts' : materialSubjectFilter === 'My Subjects' ? 'Enrolled Subjects' : materialSubjectFilter})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap text-[10px]">
                    {registeredSubjects.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full font-bold bg-[#0a192f] text-[#FFC600]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {filteredStudyMaterials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredStudyMaterials.map((mat: StudyMaterial) => (
                      <div
                        key={mat.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 space-y-3 text-xs transition-shadow hover:shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#0a192f] text-[#FFC600]">
                            {mat.subject}
                          </span>
                          <span className="font-mono text-slate-400 font-bold">{mat.fileSize}</span>
                        </div>

                        <h3 className="font-extrabold text-[#0a192f] text-sm leading-snug">{mat.title}</h3>
                        <p className="text-slate-500 text-[11px]">
                          Author: {mat.author} • Program: {mat.program}
                        </p>

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">{mat.downloadsCount || 0} downloads</span>
                          <button
                            onClick={() => {
                              showToast('success', 'Download Started', `Downloading "${mat.title}" (${mat.fileSize})`);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0a192f] hover:bg-[#112240] text-[#FFC600] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Handout</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-bold text-slate-700 text-sm">No study materials in this filter yet</p>
                    <p className="text-slate-400 text-xs">Switch to &quot;All Academy Materials&quot; to view all handouts uploaded by the Directorate.</p>
                    <button
                      type="button"
                      onClick={() => setMaterialSubjectFilter('All')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0a192f] text-[#FFC600] font-bold text-xs cursor-pointer inline-flex items-center gap-1 mt-2"
                    >
                      View All Materials
                    </button>
                  </div>
                )}
              </div>
          </div>
          )
        )}

        {/* TAB 10: ANNOUNCEMENTS */}
        {studentTab === 'announcements' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-[#0a192f]">Official Directorate Bulletins</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Announcements, examination schedules, and center directives.
              </p>
            </div>

            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#0a192f] text-[#d97706] uppercase">
                      {ann.category}
                    </span>
                    <span className="text-slate-400 font-medium">{ann.date}</span>
                  </div>
                  <h3 className="font-extrabold text-[#0a192f] text-base">{ann.title}</h3>
                  <p className="text-slate-700 leading-relaxed text-xs">{ann.content}</p>
                  <div className="pt-2 text-[11px] text-slate-400 font-semibold">
                    Issued by: {ann.author}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MY OFFICIAL TUITION RECEIPTS */}
        {(studentTab === 'receipts' || studentTab === 'monthly-payments' || studentTab === 'payment-history') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            {/* Header with Academy Branding */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-[#25166B] text-[#FFC600]">
                    <FileText className="w-5 h-5 text-[#FFC600]" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0284c7] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                    Bursary &amp; Accounts Registry
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0a192f]">
                  My Official Tuition Receipts
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Official verified receipts for all your cleared monthly tuition payments at D Ensured Consult Academy. View, print on A4 paper, or download PDF receipts with digital QR verification.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setStudentTab('finance');
                    setShowFinanceForm(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#028D3B] hover:bg-[#027531] text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-2 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Submit New Tuition Payment</span>
                </button>
              </div>
            </div>

            {/* Status Notifications */}
            {activePendingPayment && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-900" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-200 text-amber-900 border border-amber-300">
                      Pending Clearance
                    </span>
                    <h4 className="font-extrabold text-[#25166B] text-sm mt-0.5">
                      Tuition Submission Awaiting Verification: Ref #{activePendingPayment.reference}
                    </h4>
                    <p className="text-xs text-amber-900/80 mt-0.5">
                      ₦{activePendingPayment.amount.toLocaleString()} submitted on {activePendingPayment.date}. Your official receipt will be generated automatically as soon as an administrator approves your payment.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStudentTab('finance')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs shrink-0 cursor-pointer transition-colors"
                >
                  View Submission Details
                </button>
              </div>
            )}

            {activeRejectedPayment && !activePendingPayment && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-200 text-red-900 border border-red-300">
                      Declined Submission
                    </span>
                    <h4 className="font-extrabold text-red-900 text-sm mt-0.5">
                      Payment Verification Declined
                    </h4>
                    <p className="text-xs text-red-800 mt-0.5">
                      Reason: {activeRejectedPayment.rejectionReason || 'Details could not be matched with bank deposits'}. Please submit corrected payment information.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStudentTab('finance');
                    setShowFinanceForm(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 cursor-pointer"
                >
                  Resubmit Payment
                </button>
              </div>
            )}

            {/* Receipts Summary KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Verified Receipts</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                  {studentApprovedReceipts.length}
                </div>
                <span className="text-[10px] text-emerald-600 font-medium block">Approved &amp; Cleared</span>
              </div>

              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7]">Total Paid to Date</span>
                <div className="text-2xl sm:text-3xl font-black text-[#0284c7] font-mono">
                  ₦{studentApprovedReceipts.reduce((acc, r) => acc + (r.amount || 0), 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-sky-600 font-medium block">Bank Verified</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Clearance Status</span>
                <div className="text-base sm:text-lg font-black text-amber-900 truncate">
                  {isSubscriptionActive ? 'Current Cycle Active' : activePendingPayment ? 'Pending Approval' : 'Payment Due'}
                </div>
                <span className="text-[10px] text-amber-700 font-medium block">{currentStudent.studentShift} Shift</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Student ID / Reg No</span>
                <div className="text-base sm:text-lg font-black text-[#25166B] font-mono truncate">
                  {currentStudent.registrationNumber}
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">{currentStudent.program}</span>
              </div>
            </div>

            {/* List of Approved Receipts */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-[#0a192f] text-base">Authorized Receipts Repository</h3>
                  <p className="text-slate-500 text-xs">Each receipt is generated from saved database records upon administrative approval.</p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {studentApprovedReceipts.length} {studentApprovedReceipts.length === 1 ? 'Approved Receipt' : 'Approved Receipts'}
                </span>
              </div>

              {studentApprovedReceipts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentApprovedReceipts.map((rec) => (
                    <div
                      key={rec.id || rec.receiptNumber}
                      className="bg-slate-50 hover:bg-slate-100/80 transition-all rounded-2xl border-2 border-slate-200 p-5 space-y-4 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#25166B] text-[#FFC600] flex items-center justify-center shrink-0 shadow-xs">
                            <FileText className="w-5 h-5 text-[#FFC600]" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                              Official Receipt
                            </span>
                            <h4 className="font-mono font-black text-[#25166B] text-sm sm:text-base">
                              {rec.receiptNumber}
                            </h4>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          PAID
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Payment Purpose</span>
                          <strong className="text-slate-900 font-bold block">{rec.monthPeriod || 'Monthly Tuition'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Amount Paid</span>
                          <strong className="font-mono text-[#028D3B] font-black block text-sm">
                            ₦{(rec.amount || 20000).toLocaleString()}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Payment Date</span>
                          <span className="font-medium text-slate-800 block">{rec.issueDate || 'Recorded'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Approval Date</span>
                          <span className="font-medium text-slate-800 block">{rec.approvedAt || rec.issueDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Transaction Reference</span>
                          <span className="font-mono text-[#0284c7] truncate block text-[11px]" title={rec.transactionReference}>
                            {rec.transactionReference}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Approved By</span>
                          <span className="text-slate-800 truncate block text-[11px]" title={rec.approvedBy}>
                            {rec.approvedBy || 'Mr Akinjo Rotimi (Directorate Admin)'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 font-mono">
                          ID: {rec.registrationNumber || currentStudent.registrationNumber}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenOfficialReceipt(rec)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#25166B] hover:bg-[#1c1152] text-[#FFC600] font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#FFC600]" />
                            <span>View &amp; Print Receipt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleOpenOfficialReceipt(rec);
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h4 className="font-extrabold text-[#0a192f] text-base">No Approved Receipts Yet</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Official receipts are generated automatically once an administrator reviews and approves your monthly tuition payment. Never generated from sample data.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStudentTab('finance');
                        setShowFinanceForm(true);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#028D3B] hover:bg-[#027531] text-white font-black text-xs cursor-pointer inline-flex items-center gap-2 shadow-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Submit Monthly Tuition Payment</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 11: FINANCE: TUITION & RECEIPTS */}
        {studentTab === 'finance' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0a192f]">Tuition Status &amp; Official Receipts</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  View approved bank payment instructions, submit tuition payment for verification, track payment clearance, and download official receipts.
                </p>
              </div>

              {!isSubscriptionActive && (
                <button
                  type="button"
                  onClick={() => setShowFinanceForm(!showFinanceForm)}
                  className="px-5 py-2.5 rounded-xl bg-[#028D3B] hover:bg-[#027531] text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-2 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{showFinanceForm ? 'Hide Payment Form' : 'Submit Tuition Payment'}</span>
                </button>
              )}
            </div>

            {/* STATUS NOTIFICATION 1: PENDING APPROVAL */}
            {activePendingPayment && !isSubscriptionActive && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3 animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-amber-800" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-900 border border-amber-400">
                          Pending Approval
                        </span>
                        <span className="text-xs text-amber-800 font-bold">Tuition Verification In Progress</span>
                      </div>
                      <h4 className="font-extrabold text-[#25166B] text-base mt-0.5">
                        Payment Awaiting Directorate Verification
                      </h4>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-amber-900/90 leading-relaxed">
                  An administrator is currently reviewing your payment information against our institutional bank records. All tuition-protected portal features (CBT mock examinations, Student ID card printing, study materials, and official payment receipts) remain locked until an administrator approves your payment. Once approved, portal features unlock automatically.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] block font-medium">Payment Reference</span>
                    <span className="font-mono font-bold text-[#0284c7] text-xs truncate block">{activePendingPayment.reference}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] block font-medium">Amount Submitted</span>
                    <span className="font-mono font-bold text-slate-900 text-xs block">₦{activePendingPayment.amount.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] block font-medium">Payment Date</span>
                    <span className="font-bold text-slate-800 text-xs block">{activePendingPayment.date}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] block font-medium">Payment Method</span>
                    <span className="font-bold text-slate-800 text-xs block">{activePendingPayment.method}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200 col-span-2 sm:col-span-1">
                    <span className="text-slate-500 text-[10px] block font-medium">Date &amp; Time Submitted</span>
                    <span className="font-bold text-slate-800 text-xs block">{activePendingPayment.submittedAt}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STATUS NOTIFICATION 2: REJECTED / NEEDS RESUBMISSION */}
            {activeRejectedPayment && !activePendingPayment && !isSubscriptionActive && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-200 text-red-900 border border-red-400">
                      Payment Verification Declined
                    </span>
                    <h4 className="font-extrabold text-red-900 text-base mt-0.5">
                      Previous Payment Submission Could Not Be Verified
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-red-800 leading-relaxed">
                  <strong>Reason:</strong> {activeRejectedPayment.rejectionReason || 'The transaction reference could not be matched with bank deposits.'}. Please verify your payment details with your bank, then resubmit your corrected transfer reference or proof below.
                </p>
                <button
                  type="button"
                  onClick={() => setShowFinanceForm(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Open Resubmission Form</span>
                </button>
              </div>
            )}

            {/* STATUS NOTIFICATION 3: APPROVED & ACTIVE */}
            {isSubscriptionActive && (
              <div className="bg-[#028D3B]/10 border-2 border-[#028D3B]/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#028D3B] text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#25166B] text-sm sm:text-base">
                        Monthly Tuition Pass: {currentStudent.studentShift} Shift
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#028D3B] text-white">
                        Directorate Cleared
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Monthly Fee: <strong className="font-mono text-[#25166B]">₦{(currentStudent.monthlyFee || 20000).toLocaleString()}/month</strong> • Current Cycle: <strong>{currentStudent.subscriptionMonth || currentStudent.paymentMonth || currentMonthPeriod}</strong> • Valid Until: <strong className="text-[#25166B]">{currentStudent.subscriptionExpiryDate || currentStudent.paymentExpiryDate || defaultEndOfMonth}</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenOfficialReceipt()}
                  className="px-4 py-2.5 rounded-xl bg-[#25166B] hover:bg-[#1c1152] text-[#FFC600] font-black text-xs cursor-pointer flex items-center gap-2 shadow-xs shrink-0 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-[#FFC600]" />
                  <span>View Official Receipt (with QR Code)</span>
                </button>
              </div>
            )}

            {/* APPROVED BANK ACCOUNT DETAILS (Retrieved from school settings) */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#25166B]" />
                  <span className="font-black text-[#25166B] uppercase text-xs">Approved Institutional Bank Account Details</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  OPAY MFB Official Account
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank Name</span>
                  <strong className="text-slate-900 font-bold text-sm">OPAY MFB</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Name</span>
                  <strong className="text-slate-900 font-bold text-sm">De Ensured Consult Academy</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Number</span>
                  <strong className="text-[#0284c7] font-mono text-base font-black">8147896930</strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <strong>Payment Instructions:</strong> Transfer your monthly tuition of <strong>₦{(currentStudent.monthlyFee || 20000).toLocaleString()}</strong> to the approved account above using your mobile banking app, USSD, or direct deposit. After successful transfer, complete the submission form below with your transfer reference number.
              </p>
            </div>

            {/* TUITION PAYMENT SUBMISSION FORM */}
            {(!isSubscriptionActive || showFinanceForm) && (
              <div className="bg-white rounded-2xl border-2 border-[#25166B]/30 p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#25166B] text-[#FFC600]">
                      <CreditCard className="w-4 h-4 text-[#FFC600]" />
                    </span>
                    <h3 className="font-extrabold text-[#25166B] text-base">
                      Tuition Payment Submission Form
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Administrative Verification
                  </span>
                </div>

                <form onSubmit={handleFinancePaymentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Candidate Name (read-only) */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Student Full Name</label>
                      <input
                        type="text"
                        value={currentStudent.fullName}
                        readOnly
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 outline-hidden"
                      />
                    </div>

                    {/* Registration Number (read-only) */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Admission Number / Reg No</label>
                      <input
                        type="text"
                        value={currentStudent.registrationNumber}
                        readOnly
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-[#0284c7] outline-hidden"
                      />
                    </div>

                    {/* Shift Selection */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Lecture Shift</label>
                      <select
                        value={financePayShift}
                        onChange={(e) => setFinancePayShift(e.target.value as StudentShift)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 outline-hidden focus:border-[#25166B]"
                      >
                        <option value="Morning">Morning Shift (₦20,000 / month)</option>
                        <option value="Afternoon">Afternoon Shift (₦20,000 / month)</option>
                        <option value="Evening">Evening / Weekend Shift (₦20,000 / month)</option>
                      </select>
                    </div>

                    {/* Amount Paid */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Amount Paid (₦)</label>
                      <input
                        type="number"
                        value={financePayAmount}
                        onChange={(e) => setFinancePayAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-800 outline-hidden focus:border-[#25166B]"
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Payment Method</label>
                      <select
                        value={financePayMethod}
                        onChange={(e) => setFinancePayMethod(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 outline-hidden focus:border-[#25166B]"
                      >
                        <option value="Bank Transfer">Bank Transfer (Mobile App / USSD)</option>
                        <option value="Bank Deposit">Bank Deposit (Teller)</option>
                        <option value="POS / Cash">POS / Cash at Center</option>
                      </select>
                    </div>

                    {/* Payment Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Payment Date</label>
                      <input
                        type="date"
                        value={financePayDate}
                        onChange={(e) => setFinancePayDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800 outline-hidden focus:border-[#25166B]"
                      />
                    </div>

                    {/* Transfer Reference / Teller Number */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Bank Transfer Reference / Teller Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={financePayRef}
                        onChange={(e) => setFinancePayRef(e.target.value)}
                        placeholder="e.g. TRF/MP/98342019482 or Session Teller No."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-[#0284c7] outline-hidden focus:border-[#0284c7]"
                      />
                    </div>

                    {/* Payer / Depositor Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Depositor / Payer Name</label>
                      <input
                        type="text"
                        value={financePayerName}
                        onChange={(e) => setFinancePayerName(e.target.value)}
                        placeholder="Name on bank account"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800 outline-hidden focus:border-[#25166B]"
                      />
                    </div>
                  </div>

                  {/* Proof of Payment Upload */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Attach Proof of Payment (Receipt Screenshot / Teller Image)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleProofFileUpload}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#25166B] file:text-[#FFC600] hover:file:bg-[#1a0f4d] cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Additional Remarks (Optional)</label>
                      <input
                        type="text"
                        value={financeRemarks}
                        onChange={(e) => setFinanceRemarks(e.target.value)}
                        placeholder="e.g. Paid from GTBank account ending 4821"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 outline-hidden focus:border-[#25166B]"
                      />
                    </div>
                  </div>

                  {financeProofUrl && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                      <img src={financeProofUrl} alt="Proof" className="w-12 h-12 rounded object-cover border" />
                      <span className="text-xs text-emerald-700 font-bold">Proof of payment image attached successfully.</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingTuition}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#028D3B] hover:bg-[#027531] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmittingTuition ? 'Submitting Payment...' : 'Submit Tuition Payment for Administrative Verification'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tuition Breakdown Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="text-xs text-slate-500 font-bold uppercase">Total Tuition Fee</span>
                <div className="text-2xl font-black text-[#0a192f] font-mono">
                  ₦{currentStudent.tuitionTotal.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-400 block">{currentStudent.program} Full Session</span>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <span className="text-xs text-emerald-700 font-bold uppercase">Amount Paid</span>
                <div className="text-2xl font-black text-emerald-800 font-mono">
                  ₦{currentStudent.tuitionPaid.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-600 block">Verified by Accounts Desk</span>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
                <span className="text-xs text-amber-700 font-bold uppercase">Balance Outstanding</span>
                <div className="text-2xl font-black text-[#d97706] font-mono">
                  ₦{currentStudent.tuitionBalance.toLocaleString()}
                </div>
                <span className="text-[11px] text-amber-600 block">
                  {currentStudent.tuitionBalance === 0 ? 'Fully Paid' : 'Due Before Exams'}
                </span>
              </div>
            </div>

            {/* 8. MONTHLY TUITION SCHEDULE & ACCESS STATUS TABLE (Prompt Requirement 8) */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-extrabold text-[#0a192f] text-base">Monthly Tuition &amp; Feature Access Schedule</h3>
                  <p className="text-slate-500 text-xs">
                    Tuition is valid strictly for the assigned calendar month. Access to restricted features expires automatically at month-end.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#0284c7] bg-sky-50 px-3 py-1 rounded-full border border-sky-200 self-start sm:self-auto">
                  Configured Rate: ₦{(currentStudent.monthlyFee || 20000).toLocaleString()}/month
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0a192f] text-white font-black uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Tuition Month</th>
                      <th className="py-3 px-4">Configured Fee</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4">Portal Access</th>
                      <th className="py-3 px-4 text-right">Official Receipt / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium bg-white text-slate-700">
                    {(() => {
                      const monthsToDisplay = [
                        { name: 'October 2026', isCurrent: currentMonthPeriod === 'October 2026', isPast: false },
                        { name: 'November 2026', isCurrent: currentMonthPeriod === 'November 2026', isPast: false },
                        { name: 'December 2026', isCurrent: currentMonthPeriod === 'December 2026', isPast: false },
                      ];

                      // Ensure current month is represented
                      if (!monthsToDisplay.some((m) => m.name === currentMonthPeriod)) {
                        monthsToDisplay.unshift({ name: currentMonthPeriod, isCurrent: true, isPast: false });
                      }

                      return monthsToDisplay.map((mPeriod, idx) => {
                        const approvedSub = (monthlyPaymentSubmissions || []).find(
                          (m) =>
                            (m.studentId === currentStudent.id || m.registrationNumber === currentStudent.registrationNumber) &&
                            m.status === 'Approved' &&
                            (m.monthPeriod?.toLowerCase() === mPeriod.name.toLowerCase() || (m as any).tuitionMonth?.toLowerCase() === mPeriod.name.toLowerCase())
                        );

                        const approvedTx = (transactions || []).find(
                          (t) =>
                            (t.studentId === currentStudent.id || t.studentId === currentStudent.registrationNumber) &&
                            (t.status === 'Successful' || (t.status as string) === 'Approved') &&
                            t.monthPeriod?.toLowerCase() === mPeriod.name.toLowerCase()
                        );

                        const pending = (monthlyPaymentSubmissions || []).find(
                          (m) =>
                            (m.studentId === currentStudent.id || m.registrationNumber === currentStudent.registrationNumber) &&
                            m.status === 'Pending' &&
                            (m.monthPeriod?.toLowerCase() === mPeriod.name.toLowerCase() || (m as any).tuitionMonth?.toLowerCase() === mPeriod.name.toLowerCase())
                        ) || (transactions || []).find(
                          (t) =>
                            (t.studentId === currentStudent.id || t.studentId === currentStudent.registrationNumber) &&
                            t.status === 'Pending' &&
                            t.monthPeriod?.toLowerCase() === mPeriod.name.toLowerCase()
                        );

                        const rejected = (monthlyPaymentSubmissions || []).find(
                          (m) =>
                            (m.studentId === currentStudent.id || m.registrationNumber === currentStudent.registrationNumber) &&
                            m.status === 'Rejected' &&
                            (m.monthPeriod?.toLowerCase() === mPeriod.name.toLowerCase() || (m as any).tuitionMonth?.toLowerCase() === mPeriod.name.toLowerCase())
                        );

                        const isApproved = Boolean(approvedSub || approvedTx);
                        const isCurrentActive = isApproved && mPeriod.isCurrent;
                        const isExpired = isApproved && !mPeriod.isCurrent;

                        let statusLabel = 'Payment Required';
                        let statusColor = 'bg-slate-100 text-slate-700 border-slate-300';
                        let accessLabel = 'Locked';
                        let accessColor = 'bg-red-50 text-red-700 border-red-200';

                        if (isCurrentActive) {
                          statusLabel = 'Approved';
                          statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                          accessLabel = `Active for ${mPeriod.name.split(' ')[0]}`;
                          accessColor = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
                        } else if (isExpired) {
                          statusLabel = 'Approved';
                          statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                          accessLabel = `Expired after ${mPeriod.name.split(' ')[0]}`;
                          accessColor = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
                        } else if (pending) {
                          statusLabel = 'Pending Approval';
                          statusColor = 'bg-amber-100 text-amber-800 border-amber-300';
                          accessLabel = 'Locked';
                          accessColor = 'bg-amber-50 text-amber-800 border-amber-200';
                        } else if (rejected) {
                          statusLabel = 'Rejected';
                          statusColor = 'bg-red-100 text-red-800 border-red-300';
                          accessLabel = 'Locked';
                          accessColor = 'bg-red-50 text-red-700 border-red-200';
                        }

                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-bold text-[#0a192f]">
                              <div className="flex items-center gap-2">
                                <span>{mPeriod.name}</span>
                                {mPeriod.isCurrent && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[#25166B] text-white">
                                    Current
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">
                              ₦{(currentStudent.monthlyFee || 20000).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] border ${accessColor}`}>
                                {accessLabel}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {isApproved ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenOfficialReceipt(approvedTx || approvedSub)}
                                  className="px-3 py-1.5 rounded-lg bg-[#25166B] hover:bg-[#1c1152] text-[#FFC600] text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-2xs"
                                >
                                  <FileText className="w-3.5 h-3.5 text-[#FFC600]" />
                                  <span>View Receipt</span>
                                </button>
                              ) : pending ? (
                                <span className="text-[11px] text-amber-700 font-bold italic">
                                  Verification in progress
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setShowFinanceForm(true)}
                                  className="px-3 py-1.5 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1 shadow-2xs"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Pay This Month</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Transactions & Receipts Table */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-[#0a192f] text-base">Payment History &amp; Verified Receipts</h3>
                <span className="text-xs text-slate-500 font-medium">{studentTransactions.length} recorded payments</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Receipt / Reference</th>
                      <th className="py-3 px-4">Date &amp; Time</th>
                      <th className="py-3 px-4">Channel</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {studentTransactions.length > 0 ? (
                      studentTransactions.map((tx) => {
                        const isApproved = tx.status === 'Successful' || tx.rawStatus === 'Approved';
                        const isPending = tx.status === 'Pending' || tx.rawStatus === 'Pending';
                        const isRejected = tx.status === 'Failed' || tx.rawStatus === 'Rejected';

                        return (
                          <tr key={tx.id} className="hover:bg-slate-50">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#0a192f]">
                              {tx.receiptNumber || tx.reference}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">{tx.approvedAt || tx.timestamp}</td>
                            <td className="py-3.5 px-4">{tx.paymentMethod}</td>
                            <td className="py-3.5 px-4 font-bold text-[#0a192f] font-mono">
                              ₦{tx.amount.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isApproved
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : isPending
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-red-100 text-red-800 border border-red-300'
                                }`}
                              >
                                {isApproved
                                  ? 'Approved by Admin'
                                  : isPending
                                  ? 'Pending Approval'
                                  : 'Declined'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {isApproved ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenOfficialReceipt(tx)}
                                  className="px-3.5 py-1.5 rounded-lg bg-[#25166B] hover:bg-[#1c1152] text-[#FFC600] text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-2xs"
                                >
                                  <FileText className="w-3.5 h-3.5 text-[#FFC600]" />
                                  <span>View Receipt (with QR)</span>
                                </button>
                              ) : isRejected ? (
                                <button
                                  type="button"
                                  onClick={() => setShowFinanceForm(true)}
                                  className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-[11px] font-bold cursor-pointer transition-colors"
                                >
                                  Resubmit Payment
                                </button>
                              ) : (
                                <span className="text-[11px] text-amber-700 font-bold italic">
                                  Awaiting Review
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-10 text-center">
                          <div className="max-w-md mx-auto space-y-2">
                            <p className="font-bold text-slate-700 text-sm">No Recorded Payment History Yet</p>
                            <p className="text-slate-400 text-xs">
                              Submit your monthly tuition payment above. Once verified and approved by an administrator, your official receipt with QR code will be generated and available for download.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
