import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { OfficialReceipt } from '../../types';
import { generateCryptographicReceipt, CryptographicPayload } from '../../utils/cryptoVerification';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Building,
  Smartphone,
  Lock,
  Copy,
  Check,
  Download,
  FileText,
  Sparkles,
  Award,
  Calendar,
  Clock,
  User,
  Hash,
  RefreshCw,
} from 'lucide-react';

export interface ReceiptAndIDCardModalProps {
  receipt: OfficialReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'receipt' | 'id-card' | 'gateway';
  studentAvatar?: string;
  onPaymentSuccess?: (amount: number, description: string, method: string) => void;
}

export const ReceiptAndIDCardVerificationModal: React.FC<ReceiptAndIDCardModalProps> = ({
  receipt,
  isOpen,
  onClose,
  initialTab = 'receipt',
  studentAvatar,
  onPaymentSuccess,
}) => {
  const { studentsList, applications, currentStudent } = useApp();
  const [activeTab, setActiveTab] = useState<'receipt' | 'id-card' | 'gateway'>(initialTab);
  const [idCardScale, setIdCardScale] = useState<number>(1.15);

  // Gateway states
  const [gatewayMethod, setGatewayMethod] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [gatewayAmount, setGatewayAmount] = useState<number>(
    receipt?.amount || 20000
  );
  const [gatewayShift, setGatewayShift] = useState<'Morning' | 'Evening'>(
    receipt?.studentShift || 'Morning'
  );
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'receipt');
      setPaymentDone(false);
      if (receipt) {
        if (receipt.amount) setGatewayAmount(receipt.amount);
        if (receipt.studentShift) {
          const shiftStr = String(receipt.studentShift);
          setGatewayShift(shiftStr.toLowerCase().includes('evening') ? 'Evening' : 'Morning');
        }
      }
    }
  }, [isOpen, initialTab, receipt]);

  // Generate cryptographic signature packet
  const cryptoPayload: CryptographicPayload = receipt
    ? generateCryptographicReceipt({
        reference: receipt.transactionReference,
        registrationNumber: receipt.registrationNumber,
        studentName: receipt.studentName,
        studentShift: receipt.studentShift,
        amount: receipt.amount,
        monthPeriod: receipt.monthPeriod,
        validUntil: receipt.validUntil,
        issuedAt: receipt.issueDate,
      })
    : generateCryptographicReceipt({
        reference: `DEC-REF-${Date.now().toString().slice(-6)}`,
        registrationNumber: 'DEC-2026-8821',
        studentName: 'Candidate Scholar',
        studentShift: gatewayShift,
        amount: gatewayAmount,
        monthPeriod: 'September 2026',
        validUntil: '30 Sep 2026',
      });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (activeTab === 'receipt') {
      const receiptEl = document.getElementById('printable-official-receipt');
      if (receiptEl) {
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>DEC_Official_Receipt_${receipt?.receiptNumber || '2026'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print { 
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; background: #fff; }
      .receipt-card { box-shadow: none !important; border: 1px solid #cbd5e1 !important; }
    }
    body { background: #f8fafc; font-family: 'Poppins', system-ui, sans-serif; margin: 0; padding: 24px; display: flex; justify-content: center; }
  </style>
</head>
<body>
  <div class="max-w-xl w-full">
    ${receiptEl.innerHTML}
  </div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `DEC_Receipt_${receipt?.receiptNumber || '2026'}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        window.print();
      }
    } else if (activeTab === 'id-card') {
      const idEl = document.getElementById('printable-student-id-card-front');
      const idBackEl = document.getElementById('printable-student-id-card-back');
      if (idEl) {
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>DEC_Student_ID_Card_${cryptoPayload.registrationNumber}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: auto; margin: 0.5in; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; background: #fff; }
      .cr80-id-card { page-break-inside: avoid; margin-bottom: 20px; box-shadow: none !important; }
    }
    body { background: #f1f5f9; font-family: 'Poppins', system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 30px; }
  </style>
</head>
<body>
  <div class="cr80-id-card" style="width: 3.375in; height: 2.125in;">${idEl.innerHTML}</div>
  ${idBackEl ? `<div class="cr80-id-card" style="width: 3.375in; height: 2.125in;">${idBackEl.innerHTML}</div>` : ''}
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `DEC_ID_Card_${cryptoPayload.registrationNumber}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        window.print();
      }
    }
  };

  const handleExecutePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentDone(true);
      if (onPaymentSuccess) {
        onPaymentSuccess(
          gatewayAmount,
          `Monthly Tuition Payment - ${gatewayShift} Shift (${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })})`,
          gatewayMethod === 'card' ? 'Online Card Payment' : gatewayMethod === 'transfer' ? 'Direct Bank Transfer' : 'USSD Mobile Banking'
        );
      }
    }, 1200);
  };

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

  const avatarUrl = useMemo(() => {
    // 1. Explicit prop if valid
    if (isValidPhoto(studentAvatar)) {
      return studentAvatar!;
    }

    // 2. Receipt direct fields
    const receiptPic = getStudentPhoto(receipt);
    if (receiptPic) return receiptPic;

    // 3. Current logged in student
    const currentStudentPic = getStudentPhoto(currentStudent);
    if (currentStudentPic) return currentStudentPic;

    // 4. Match from studentsList
    if (receipt) {
      const matchStd = studentsList.find(
        (s) =>
          (receipt.studentId && (s.id === receipt.studentId || s.registrationNumber === receipt.studentId)) ||
          (receipt.registrationNumber && s.registrationNumber === receipt.registrationNumber) ||
          (receipt.studentEmail && (s.email || '').toLowerCase() === receipt.studentEmail.toLowerCase()) ||
          (receipt.studentName && (s.fullName || '').toLowerCase() === receipt.studentName.toLowerCase())
      );
      const matchStdPic = getStudentPhoto(matchStd);
      if (matchStdPic) return matchStdPic;

      // 5. Match from applications
      const matchApp = applications.find(
        (a) =>
          (receipt.studentId && (a.id === receipt.studentId || (a as any).student_id === receipt.studentId)) ||
          (receipt.registrationNumber && (a as any).registrationNumber === receipt.registrationNumber) ||
          (receipt.studentEmail && (a.email || '').toLowerCase() === receipt.studentEmail.toLowerCase()) ||
          (receipt.studentName && (a.fullName || '').toLowerCase() === receipt.studentName.toLowerCase())
      );
      const matchAppPic = getStudentPhoto(matchApp);
      if (matchAppPic) return matchAppPic;

      // 6. Match from localStorage
      const localPhoto =
        (receipt.studentEmail && localStorage.getItem(`dec_photo_${receipt.studentEmail.toLowerCase().trim()}`)) ||
        (receipt.studentId && localStorage.getItem(`dec_photo_${receipt.studentId}`)) ||
        (receipt.registrationNumber && localStorage.getItem(`dec_photo_${receipt.registrationNumber}`));
      if (isValidPhoto(localPhoto)) return localPhoto!;
    }

    // 7. Check current student localStorage
    if (currentStudent) {
      const localPhoto =
        (currentStudent.email && localStorage.getItem(`dec_photo_${currentStudent.email.toLowerCase().trim()}`)) ||
        (currentStudent.id && localStorage.getItem(`dec_photo_${currentStudent.id}`)) ||
        (currentStudent.registrationNumber && localStorage.getItem(`dec_photo_${currentStudent.registrationNumber}`));
      if (isValidPhoto(localPhoto)) return localPhoto!;
    }

    return (
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23e0f2fe"/><circle cx="100" cy="80" r="40" fill="%230284c7"/><path d="M35 175 C35 130 65 118 100 118 C135 118 165 130 165 175 Z" fill="%230369a1"/></svg>'
    );
  }, [studentAvatar, receipt, studentsList, applications, currentStudent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-200 font-['Poppins',sans-serif]">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none">
        {/* Modal Top Header with Website Branding */}
        <div className="bg-gradient-to-r from-[#0a192f] via-[#25166B] to-[#0284c7] text-white px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden border-b-2 border-[#FFC600]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shrink-0 border border-[#FFC600] shadow-xs">
              <img src="/logo.jpg" alt="DEC Logo" className="w-full h-full object-contain rounded" />
            </div>
            <div>
              <span className="font-extrabold text-base block tracking-tight text-white">D Ensured Consult</span>
              <span className="text-[10px] text-[#FFC600] font-bold uppercase tracking-wider">
                Official Bursary &amp; ID Card Desk • 2026/2027
              </span>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1.5 bg-black/25 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('receipt')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'receipt'
                  ? 'bg-white text-[#25166B] shadow-xs font-black'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Official Receipt</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('id-card')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'id-card'
                  ? 'bg-white text-[#25166B] shadow-xs font-black'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-[#FFC600]" />
              <span>Student ID Card</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gateway')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'gateway'
                  ? 'bg-[#FFC600] text-[#25166B] shadow-xs font-black'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Payment Gateway</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold flex items-center gap-1.5 text-white transition-colors cursor-pointer border border-white/20"
            >
              <Printer className="w-4 h-4 text-[#FFC600]" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-[#FFC600] hover:bg-[#e6b300] text-xs font-black flex items-center gap-1.5 text-[#25166B] transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: CLEAN OFFICIAL PAYMENT RECEIPT (REDESIGNED IN WEBSITE COLORS) */}
        {/* ============================================================ */}
        {activeTab === 'receipt' && (
          <div className="p-4 sm:p-6 space-y-4 bg-slate-50">
            <div className="flex justify-center overflow-x-auto py-2">
              <div
                id="printable-official-receipt"
                className="bg-white text-slate-800 shadow-xl rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full receipt-card space-y-5"
              >
                {/* Header with Academy Logo & Official Address */}
                <div className="border-b-2 border-[#FFC600] pb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0a192f] p-1 shrink-0 border-2 border-[#FFC600] shadow-xs">
                      <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <div>
                      <h1 className="text-base font-extrabold text-[#0a192f] tracking-tight leading-tight">
                        D ENSURED CONSULT ACADEMY
                      </h1>
                      <p className="text-[11px] font-bold text-[#0284c7] uppercase tracking-wide">
                        Official 2026/2027 Academic Session
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Doyin Plaza, Igboelerin Bus-Stop, Ojo, Lagos • 08147896930
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-[#028D3B] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>PAID &amp; CLEARED</span>
                    </span>
                  </div>
                </div>

                {/* Receipt Meta & Numbers Banner */}
                <div className="bg-gradient-to-r from-slate-50 via-sky-50/50 to-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Receipt Number</span>
                    <strong className="font-mono text-xs text-[#25166B] font-extrabold">
                      {receipt?.receiptNumber || 'DEC-REC-2026-0041'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Transaction Reference</span>
                    <strong className="font-mono text-xs text-slate-700 font-bold truncate block">
                      {cryptoPayload.reference}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Issue Date</span>
                    <span className="font-semibold text-slate-700">
                      {receipt?.approvedAt || receipt?.issueDate || new Date().toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Method</span>
                    <span className="font-semibold text-slate-700">
                      {receipt?.paymentMethod || 'Direct Bank Transfer'}
                    </span>
                  </div>
                </div>

                {/* Candidate Particulars */}
                <div className="space-y-2 text-xs">
                  <h3 className="text-[11px] font-extrabold uppercase text-[#0a192f] tracking-wider border-b border-slate-100 pb-1">
                    Candidate Particulars
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Candidate Full Name</span>
                      <strong className="text-slate-900 font-bold block text-xs">
                        {receipt?.studentName || cryptoPayload.studentName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Registration Number / Student ID</span>
                      <strong className="text-[#0284c7] font-mono font-bold block text-xs">
                        {receipt?.registrationNumber || receipt?.studentId || cryptoPayload.registrationNumber}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Registered Email</span>
                      <span className="font-mono text-slate-800 text-[11px] truncate block" title={receipt?.studentEmail || ''}>
                        {receipt?.studentEmail || `${((receipt?.registrationNumber || receipt?.studentId || 'student').toLowerCase())}@student.dec.ng`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Academic Programme</span>
                      <span className="font-semibold text-slate-800">{receipt?.program || 'UTME (JAMB)'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Enrolled Shift</span>
                      <span className="font-semibold text-slate-800">
                        {cryptoPayload.studentShift} ({cryptoPayload.studentShift === 'Morning' ? '9am-1:30pm' : '2pm-6:30pm'})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Payment Purpose</span>
                      <span className="font-semibold text-emerald-800">Monthly Tuition Fee</span>
                    </div>
                  </div>
                </div>

                {/* Itemized Payment Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0a192f] text-white text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3">Period</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#0a192f] block">Tuition &amp; CBT Laboratory Access</span>
                          <span className="text-[10px] text-slate-400">Lectures, practice tests &amp; library</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">{cryptoPayload.monthPeriod}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                          ₦{cryptoPayload.amount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <td colSpan={2} className="py-2.5 px-3 font-extrabold text-[#0a192f] uppercase text-xs">
                          Total Paid &amp; Approved:
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-sm text-[#028D3B] font-mono">
                          ₦{cryptoPayload.amount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* QR Code Verification & Authorized Seal */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                      <QRCodeSVG
                        value={cryptoPayload.verificationUrl}
                        size={64}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-[#0284c7] uppercase tracking-wider block">
                        Official Digital Verification
                      </span>
                      <p className="text-[9px] text-slate-400 max-w-[140px] leading-tight">
                        Scan QR code to verify bursary clearance on official academy portal.
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="font-serif italic font-bold text-sm text-[#0a192f]">
                      Mr. Akinjo Rotimi
                    </div>
                    <div className="text-[9px] text-[#0284c7] font-bold uppercase tracking-wider">
                      Founder &amp; Directorate Admin
                    </div>
                    <div className="text-[8px] text-slate-400">
                      D Ensured Consult Registry
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: CANDIDATE STUDENT ID CARD (REDESIGNED IN WEBSITE COLORS) */}
        {/* ============================================================ */}
        {activeTab === 'id-card' && (
          <div className="p-6 sm:p-8 space-y-6 text-[#1D1918] bg-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs print:hidden text-xs">
              <div>
                <span className="font-extrabold text-[#0a192f] block">
                  Official Candidate Student ID Card
                </span>
                <span className="text-[11px] text-slate-500">
                  Standard CR80 format with individual candidate photo and verification barcode.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIdCardScale((prev) => Math.max(0.9, prev - 0.1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  - Zoom
                </button>
                <button
                  type="button"
                  onClick={() => setIdCardScale((prev) => Math.min(1.5, prev + 0.1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  + Zoom
                </button>
              </div>
            </div>

            {/* Scaled ID Cards Container */}
            <div className="overflow-x-auto py-2 flex flex-col items-center gap-6">
              {/* Front of ID Card (3.375in x 2.125in) */}
              <div
                style={{
                  transform: idCardScale !== 1 ? `scale(${idCardScale})` : undefined,
                  transformOrigin: 'top center',
                  marginBottom: idCardScale > 1 ? `${(idCardScale - 1) * 204}px` : '0',
                }}
                className="transition-transform duration-150"
              >
                <div
                  id="printable-student-id-card-front"
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
                        {cryptoPayload.studentShift}
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
                        src={avatarUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23e0f2fe"/><circle cx="100" cy="80" r="40" fill="%230284c7"/><path d="M35 175 C35 130 65 118 100 118 C135 118 165 130 165 175 Z" fill="%230369a1"/></svg>'}
                        alt={cryptoPayload.studentName}
                        style={{ width: '0.72in', height: '0.90in' }}
                        className="rounded-lg object-cover border-2 border-[#FFC600] ring-1 ring-[#0a192f]/20 shadow-xs bg-slate-100"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23e0f2fe"/><circle cx="100" cy="80" r="40" fill="%230284c7"/><path d="M35 175 C35 130 65 118 100 118 C135 118 165 130 165 175 Z" fill="%230369a1"/></svg>';
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
                          {cryptoPayload.studentName}
                        </h3>
                      </div>

                      <div>
                        <span className="text-[6.5px] text-slate-400 uppercase font-bold tracking-wider block">Reg Number</span>
                        <strong className="font-mono text-[9.5px] font-black text-[#0284c7]">
                          {cryptoPayload.registrationNumber}
                        </strong>
                      </div>

                      <div className="grid grid-cols-2 gap-1 pt-0.5 border-t border-slate-200 text-[7px]">
                        <div>
                          <span className="text-slate-400 block">Shift</span>
                          <strong className="text-[#0a192f]">{cryptoPayload.studentShift}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Session</span>
                          <strong className="text-[#0a192f]">2026/2027</strong>
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
                        EXPIRES: {cryptoPayload.validUntil}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="text-right leading-none">
                        <span className="text-[6px] text-[#0284c7] font-black block">DIRECTORATE</span>
                        <span className="text-[5.5px] text-slate-500">Mr. Akinjo Rotimi</span>
                      </div>
                      <div className="bg-white p-0.5 rounded border border-[#0284c7]/30 shadow-2xs shrink-0">
                        <QRCodeSVG
                          value={cryptoPayload.verificationUrl}
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
                  transform: idCardScale !== 1 ? `scale(${idCardScale})` : undefined,
                  transformOrigin: 'top center',
                  marginBottom: idCardScale > 1 ? `${(idCardScale - 1) * 204}px` : '0',
                }}
                className="transition-transform duration-150"
              >
                <div
                  id="printable-student-id-card-back"
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
        )}

        {/* ============================================================ */}
        {/* VIEW 3: PAYMENT GATEWAY (CARD, TRANSFER, USSD)               */}
        {/* ============================================================ */}
        {activeTab === 'gateway' && (
          <div className="p-6 sm:p-8 space-y-6 text-[#1D1918]">
            <div className="text-center max-w-lg mx-auto space-y-1">
              <span className="text-[11px] font-extrabold text-[#0284c7] uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
                Secure Tuition Checkout Gateway
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0a192f]">
                Make Monthly Tuition Payment
              </h2>
              <p className="text-xs text-slate-500">
                Select your student shift and payment channel. Generating an approved receipt clears your e-portal account.
              </p>
            </div>

            {paymentDone ? (
              <div className="p-8 text-center bg-emerald-50 rounded-3xl border border-emerald-200 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#028D3B] text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-900">Payment Completed!</h3>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your monthly tuition has been received. The official receipt and student ID card have been generated.
                  </p>
                </div>
                <div className="flex gap-2 justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('receipt')}
                    className="px-4 py-2.5 rounded-xl bg-[#0a192f] hover:bg-[#112240] text-[#FFC600] font-bold text-xs cursor-pointer shadow-xs"
                  >
                    View Official Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('id-card')}
                    className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-[#0a192f] font-bold text-xs cursor-pointer"
                  >
                    View ID Card
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto space-y-5">
                {/* Shift Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setGatewayShift('Morning');
                      setGatewayAmount(20000);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      gatewayShift === 'Morning'
                        ? 'border-[#0284c7] bg-sky-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-[#0a192f]">Morning Shift</span>
                      <span className="text-[10px] font-black text-[#028D3B] bg-emerald-100 px-2 py-0.5 rounded-full">
                        09:00 AM – 01:30 PM
                      </span>
                    </div>
                    <div className="text-xl font-black text-[#0a192f] font-mono">₦20,000</div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Per Calendar Month</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGatewayShift('Evening');
                      setGatewayAmount(15000);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      gatewayShift === 'Evening'
                        ? 'border-[#0284c7] bg-sky-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-[#0a192f]">Evening Shift</span>
                      <span className="text-[10px] font-black text-[#0284c7] bg-sky-100 px-2 py-0.5 rounded-full">
                        02:00 PM – 06:30 PM
                      </span>
                    </div>
                    <div className="text-xl font-black text-[#0a192f] font-mono">₦15,000</div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Per Calendar Month</span>
                  </button>
                </div>

                {/* Method Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setGatewayMethod('card')}
                    className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      gatewayMethod === 'card'
                        ? 'bg-white text-[#0a192f] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#028D3B]" />
                    <span>Card Checkout</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGatewayMethod('transfer')}
                    className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      gatewayMethod === 'transfer'
                        ? 'bg-white text-[#0a192f] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Direct Bank Transfer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGatewayMethod('ussd')}
                    className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      gatewayMethod === 'ussd'
                        ? 'bg-white text-[#0a192f] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                    <span>USSD Code</span>
                  </button>
                </div>

                {/* Method Content */}
                {gatewayMethod === 'card' && (
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        defaultValue="5399 •••• •••• 4821"
                        readOnly
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          defaultValue="08/28"
                          readOnly
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">CVV</label>
                        <input
                          type="text"
                          defaultValue="823"
                          readOnly
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {gatewayMethod === 'transfer' && (
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Account Number</span>
                        <strong className="font-mono text-base font-bold text-[#0a192f]">6111753209</strong>
                        <span className="text-[11px] text-slate-600 block">Bank: OPAY</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('6111753209');
                          setCopiedAccount(true);
                          setTimeout(() => setCopiedAccount(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0a192f] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-[#028D3B]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Account Name: <strong>D Ensured Consult Enterprise</strong>
                    </p>
                  </div>
                )}

                {gatewayMethod === 'ussd' && (
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs text-center">
                    <span className="text-[11px] text-slate-600 block font-medium">
                      Dial this USSD sequence on your registered phone:
                    </span>
                    <div className="font-mono text-lg font-black text-[#0a192f] bg-white p-3 rounded-xl border border-slate-200">
                      *737*2*₦{gatewayAmount}*6111753209#
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleExecutePayment}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-sm shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Processing Payment Transaction...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#FFC600]" />
                      <span>
                        Pay ₦{gatewayAmount.toLocaleString()} &amp; Generate Official Receipt
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#028D3B]" />
            <span>256-Bit SSL Encrypted • Directorate Registrar Certified</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-[#028D3B] hover:bg-[#027531] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download {activeTab === 'receipt' ? 'Official Receipt' : activeTab === 'id-card' ? 'ID Card' : 'Slip'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#0a192f] hover:bg-[#112240] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-[#FFC600]" />
              <span>Print {activeTab === 'receipt' ? 'Receipt' : activeTab === 'id-card' ? 'ID Card' : 'Slip'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 font-bold text-xs text-slate-700 cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
