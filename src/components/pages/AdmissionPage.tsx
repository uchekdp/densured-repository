import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Clock,
  CreditCard,
  UserCheck,
  ShieldCheck,
  BookOpen,
  Calendar,
  Laptop,
} from 'lucide-react';

export const AdmissionPage: React.FC = () => {
  const { setCurrentPage } = useApp();

  const steps = [
    {
      step: 'Step 1',
      title: 'Complete Registration Form',
      desc: 'Fill out your personal, parent/guardian, and academic details, and select your exam subjects.',
      icon: <BookOpen className="w-5 h-5 text-[#0284c7]" />,
      color: 'border-sky-200',
    },
    {
      step: 'Step 2',
      title: 'Submit Tuition Payment',
      desc: 'Make tuition payment via bank transfer or POS and submit your transaction deposit reference.',
      icon: <CreditCard className="w-5 h-5 text-[#ea580c]" />,
      color: 'border-orange-200',
    },
    {
      step: 'Step 3',
      title: 'Admin Verifies Payment',
      desc: 'Our administrative directorate confirms bank transfer clearance and cross-checks transaction evidence.',
      icon: <ShieldCheck className="w-5 h-5 text-[#0284c7]" />,
      color: 'border-sky-200',
    },
    {
      step: 'Step 4',
      title: 'Admin Approves Payment',
      desc: 'The payment status is approved in the institutional database, establishing your 30-day validity period.',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      color: 'border-emerald-200',
    },
    {
      step: 'Step 5',
      title: 'Student Account Becomes Active',
      desc: 'Your candidate account status transitions to Active, assigning full clearance in the academy database.',
      icon: <UserCheck className="w-5 h-5 text-[#ea580c]" />,
      color: 'border-orange-200',
    },
    {
      step: 'Step 6',
      title: 'Receive Student Portal Access',
      desc: 'Log in to access CBT mocks, downloadable study materials, ID card generation, and tuition receipts.',
      icon: <Laptop className="w-5 h-5 text-[#0284c7]" />,
      color: 'border-sky-200',
    },
  ];

  const programmes = [
    {
      name: 'UTME / JAMB CBT Accelerator',
      exam: 'UTME/JAMB',
      audience: 'Secondary graduates & SS3 students preparing for university admission.',
      fee: '₦20,000 / month',
      shifts: 'Morning (09:00 AM) & Evening (02:00 PM)',
    },
    {
      name: 'WAEC & NECO Theory & Practical Mastery',
      exam: 'WAEC / NECO / GCE',
      audience: 'Students targeting straight A1s in Science, Commercial, or Arts tracks.',
      fee: '₦20,000 / month',
      shifts: 'Morning & Evening Batches',
    },
    {
      name: 'JUPEB Direct Entry Track',
      exam: 'JUPEB',
      audience: 'Candidates seeking direct entry into 200-level university programs.',
      fee: 'Contact Directorate',
      shifts: 'Intensive Full-Day Sessions',
    },
    {
      name: 'Post-UTME Screening Drills',
      exam: 'Post-UTME',
      audience: 'Candidates preparing for university-specific entrance examinations.',
      fee: '₦20,000 / month',
      shifts: 'Weekday & Saturday Clinics',
    },
    {
      name: 'IELTS Academic & General Masterclass',
      exam: 'IELTS',
      audience: 'Scholars and professionals targeting overseas university study.',
      fee: '₦70,000 / month',
      shifts: 'Flexible Evening & Weekend Batches',
    },
    {
      name: 'Adult & Executive Education',
      exam: 'Foundational Literacy & GCE',
      audience: 'Adult learners desiring accelerated secondary qualifications.',
      fee: '₦60,000 / month',
      shifts: 'Evening & Saturday Modules',
    },
  ];

  return (
    <div className="w-full bg-[#f8fafc] pb-20 font-['Poppins',sans-serif]">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-sky-50 via-white to-sky-50 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 text-center space-y-4 border-b-2 border-sky-100">
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-[#0284c7] text-xs font-bold border border-sky-200">
            <GraduationCap className="w-4 h-4 text-[#0284c7]" />
            <span>2026/2027 Academic Session Enrolment</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Admission &amp; Enrolment Procedure
          </h1>
          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Transparent admissions guidance, program options, tuition breakdown, and step-by-step student portal
            activation.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setCurrentPage('register')}
              className="px-8 py-3.5 rounded-2xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-sm shadow-md border border-amber-300 transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 mt-12">
        {/* ========================================================================= */}
        {/* STEP-BY-STEP PROCESS (Requirement 12)                                     */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full inline-block">
              Registration to Portal Activation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Step-by-Step Enrolment Procedure
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Follow these simple steps to complete your registration and activate your candidate account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-3xl p-6 border-2 ${st.color} shadow-xs space-y-3 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                      {st.step}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
                      {st.icon}
                    </div>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">{st.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WHO CAN REGISTER & AVAILABLE PROGRAMMES (Requirement 12)                  */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c] bg-orange-50 border border-orange-200 px-3.5 py-1.5 rounded-full inline-block mb-2">
              Candidate Eligibility
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">Who Can Register</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              D Ensured Consult Academy admits candidates based on dedication to academic growth:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Secondary school students (SS1 – SS3) preparing for internal and external examinations.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Secondary school graduates targeting high scores in national UTME (JAMB CBT).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Remedial and private candidates sitting for WAEC and NECO GCE series.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Mature candidates and working executives seeking foundational literacy or diplomas.</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-4">Available Academic Programmes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programmes.map((p, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[#0284c7] uppercase">{p.exam}</span>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{p.name}</h4>
                    <p className="text-xs text-slate-600">{p.audience}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-500">Tuition Fee:</span>
                      <span className="text-[#0284c7] font-bold">{p.fee}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#ea580c]" />
                      <span>{p.shifts}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tuition / Payment Process */}
        <section className="bg-slate-50 rounded-3xl p-6 sm:p-10 border-2 border-sky-200 shadow-xs space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] bg-sky-100 border border-sky-200 px-3.5 py-1.5 rounded-full inline-block">
              Tuition &amp; Activation
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Tuition Payment &amp; Portal Activation Details
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tuition is payable monthly and covers classroom lectures, continuous diagnostic assessments, and full access
              to our 120-seat computer testing laboratory. Payments can be submitted via direct bank transfer or at our
              center POS terminal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Bank</span>
              <span className="font-bold text-slate-900 text-sm">OPAY</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Account Name</span>
              <span className="font-bold text-slate-900 text-sm">D Ensured Consult Enterprise</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Account Number</span>
              <span className="font-mono font-bold text-[#0284c7] text-sm">6111753209</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Standard Monthly Fee</span>
              <span className="font-bold text-[#0284c7] text-sm font-mono">₦20,000 / month</span>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setCurrentPage('register')}
              className="px-8 py-3.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-xs uppercase tracking-wider shadow-md border border-amber-300 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Begin Application Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdmissionPage;
