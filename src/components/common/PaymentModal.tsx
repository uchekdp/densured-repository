import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OfficialReceipt } from '../../types';
import {
  X,
  CreditCard,
  Building,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Printer,
  Download,
  ArrowRight,
  AlertCircle,
  FileText,
  Clock,
} from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const { activePaymentModal, closePaymentModal, processPayment, currentStudent, openReceiptModal } = useApp();

  const [activeTab, setActiveTab] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [cardNumber, setCardNumber] = useState('5399 •••• •••• 4821');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('823');
  const [cardHolder, setCardHolder] = useState(currentStudent?.fullName || 'Olawale Adebayo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<{
    reference: string;
    amount: number;
    date: string;
  } | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  if (!activePaymentModal || !activePaymentModal.isOpen) return null;

  const amount = activePaymentModal.amount;
  const description = activePaymentModal.description;

  const handlePay = (method: 'Paystack Card' | 'Bank Transfer' | 'USSD') => {
    setIsProcessing(true);
    setTimeout(() => {
      const ref = processPayment(amount, description, method);
      setIsProcessing(false);
      setCompletedReceipt({
        reference: ref,
        amount,
        date: new Date().toLocaleString(),
      });
    }, 1200);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleOpenGeneratedReceipt = () => {
    if (!completedReceipt) return;
    const shift = currentStudent.studentShift || 'Morning';
    const officialReceipt: OfficialReceipt = {
      id: `rec-${Date.now()}`,
      receiptNumber: `DEC-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      transactionReference: completedReceipt.reference,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      studentEmail: currentStudent.email,
      studentPhone: currentStudent.phone,
      registrationNumber: currentStudent.registrationNumber,
      program: currentStudent.program,
      studentShift: shift,
      amount: completedReceipt.amount,
      amountInWords: completedReceipt.amount === 20000 ? 'TWENTY THOUSAND NAIRA ONLY' : 'FIFTEEN THOUSAND NAIRA ONLY',
      currency: 'NGN',
      monthPeriod: 'September 2026',
      validUntil: '30 Sep 2026',
      issueDate: completedReceipt.date,
      approvedBy: 'Mr. Akinjo Rotimi (Founder)',
      approvedAt: 'Immediate Verification',
      qrPayload: `https://densuredconsult.edu.ng/verify?ref=${completedReceipt.reference}&reg=${currentStudent.registrationNumber}&student=${encodeURIComponent(currentStudent.fullName)}`,
      status: 'Approved',
      paymentMethod: activeTab === 'card' ? 'Paystack Card' : activeTab === 'transfer' ? 'Bank Transfer' : 'USSD *737*',
    };
    closePaymentModal();
    openReceiptModal(officialReceipt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-6 relative">
          <button
            onClick={closePaymentModal}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950 uppercase">
              Secure Gateway
            </span>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              256-Bit SSL Encrypted
            </span>
          </div>
          <h3 className="text-xl font-bold">D Ensured Consult Payment</h3>
          <p className="text-xs text-slate-300 mt-1">{description}</p>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Total Payable:</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              ₦{amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {completedReceipt ? (
            /* Submitted for Approval View */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-50">
                <Clock className="w-9 h-9 animate-pulse" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Awaiting Admin Clearance
                </span>
                <h4 className="text-xl font-black text-[#25166B] mt-2">Payment Submitted for Approval</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Your tuition payment has been logged. In accordance with academy regulations, the Admin Directorate (Mr. Akinjo Rotimi) will verify and approve your payment before full features, ID cards, and receipts are released.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Transaction Reference:</span>
                  <span className="font-mono font-bold text-[#098CD0]">
                    {completedReceipt.reference}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Candidate:</span>
                  <span className="font-semibold text-slate-800">{currentStudent.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Program:</span>
                  <span className="font-semibold text-slate-800">{currentStudent.program}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Amount Submitted:</span>
                  <span className="font-black text-[#D5241B] font-mono">
                    ₦{completedReceipt.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Official Account:</span>
                  <span className="font-bold text-slate-800">OPAY • 6111753209</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                    Pending Admin Approval
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  className="w-full py-3 px-4 rounded-xl bg-[#25166B] hover:bg-[#1b104d] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border border-[#FFC600]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#FFC600]" />
                  <span>Return to Portal &amp; Await Clearance</span>
                </button>
                <p className="text-[10px] text-slate-500 mt-2">
                  Once approved by the Directorate on the admin dashboard, this payment will be automatically reflected in your Payment History.
                </p>
              </div>
            </div>
          ) : (
            /* Payment Methods Selection */
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('card')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'card'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  Pay with Card
                </button>
                <button
                  onClick={() => setActiveTab('transfer')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'transfer'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  Bank Transfer
                </button>
                <button
                  onClick={() => setActiveTab('ussd')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'ussd'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                  USSD Code
                </button>
              </div>

              {/* Tab 1: Card Form */}
              {activeTab === 'card' && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="5399 0000 0000 0000"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden"
                      />
                      <span className="absolute right-3 top-3 text-[10px] font-bold text-slate-400">
                        VERVE / MASTERCARD / VISA
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        CVV / Security Code
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 outline-hidden"
                    />
                  </div>

                  <button
                    onClick={() => handlePay('Paystack Card')}
                    disabled={isProcessing}
                    className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying with Paystack...</span>
                      </div>
                    ) : (
                      <>
                        <span>Pay ₦{amount.toLocaleString()} Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Tab 2: Bank Transfer */}
              {activeTab === 'transfer' && (
                <div className="space-y-4 pt-1">
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                    <p className="text-xs text-blue-900 font-medium">
                      Transfer exact amount to the dedicated D Ensured Consult dynamic account below.
                    </p>
                    <div className="bg-white p-3 rounded-lg border border-blue-200 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">
                          Bank: OPAY
                        </p>
                        <p className="font-mono text-base font-bold text-slate-900 tracking-wider">
                          6111753209
                        </p>
                        <p className="text-[11px] text-slate-600 font-bold">
                          D Ensured Consult Enterprise
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard('6111753209')}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        {copiedAccount ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Instant automatic credit confirmation upon interbank settlement.</span>
                  </div>

                  <button
                    onClick={() => handlePay('Bank Transfer')}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Confirming Bank Inflow...</span>
                      </div>
                    ) : (
                      <span>I Have Completed the Transfer</span>
                    )}
                  </button>
                </div>
              )}

              {/* Tab 3: USSD */}
              {activeTab === 'ussd' && (
                <div className="space-y-4 pt-1">
                  <p className="text-xs text-slate-600">
                    Dial any of the USSD strings below from your registered bank phone line to authenticate the payment of ₦{amount.toLocaleString()}:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg col-span-2">
                      <p className="font-bold text-emerald-900">OPAY (Official Academy Account)</p>
                      <p className="text-emerald-700 font-semibold mt-0.5">*955# • Transfer to 6111753209</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="font-bold text-slate-800">GTBank</p>
                      <p className="text-emerald-700 font-semibold mt-0.5">*737*50*014#</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="font-bold text-slate-800">Zenith Bank</p>
                      <p className="text-emerald-700 font-semibold mt-0.5">*966*00*014#</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="font-bold text-slate-800">Access Bank</p>
                      <p className="text-emerald-700 font-semibold mt-0.5">*901*00*014#</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="font-bold text-slate-800">UBA</p>
                      <p className="text-emerald-700 font-semibold mt-0.5">*919*00*014#</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePay('USSD')}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Authorizing USSD PIN...</span>
                      </div>
                    ) : (
                      <span>Verify USSD Payment</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official D Ensured Consult Billing Account</span>
          </div>
          <span className="font-medium text-slate-600">Secure Verified Payment</span>
        </div>
      </div>
    </div>
  );
};
