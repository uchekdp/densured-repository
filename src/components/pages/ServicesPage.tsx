import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamProgram } from '../../types';
import {
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { setCurrentPage } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'utme' | 'waec_neco' | 'ielts' | 'atswa' | 'toefl_sat'
  >('all');

  const services = [
    {
      id: 'utme',
      category: 'utme',
      programTag: 'UTME',
      badge: 'Most Popular',
      badgeColor: 'bg-[#d97706] text-white font-bold',
      title: 'UTME (JAMB CBT) Intensive Preparation',
      targetAudience: 'Candidates targeting 280–350+ for Medicine, Law, Engineering, Computer Science',
      duration: '3 to 6 Months (Weekday & Weekend Batches)',
      schedule: 'Morning (09:00 AM) & Evening (02:00 PM) Batches',
      description:
        'A rigorous program centered in our modern 120-seat CBT laboratory at our Lagos center. We dismantle past JAMB questions, teach rapid calculation heuristics for Physics and Chemistry, and run 40 computer-timed mock exams.',
      features: [
        '120-seat computer testing laboratory with authentic JAMB UI software',
        'Speed & accuracy coaching (40 seconds per question rule)',
        'Use of English: concord, idioms, register, and novel review mastery',
        'High-yield science and commercial subject combinations',
        'Weekly Grand Mock rankings with detailed score diagnostics',
        'Free official JAMB syllabus and past question companion texts',
      ],
    },
    {
      id: 'waec',
      category: 'waec_neco',
      programTag: 'WAEC',
      badge: 'Distinction Track',
      badgeColor: 'bg-[#0a192f] text-white font-bold',
      title: 'WAEC / WASSCE Theory & Practical Mastery',
      targetAudience: 'Senior secondary students (SS3) and private GCE candidates targeting 7+ A1s',
      duration: '4 to 8 Months (Comprehensive Revision)',
      schedule: 'Physical Weekday Morning & Evening Batches',
      description:
        'Focused on mastering Section B theory questions and hands-on laboratory practicals. Taught by certified WAEC examiners who demonstrate exact rubric marking points for Mathematics, English essays, Physics, Chemistry, Biology, Economics, and Government.',
      features: [
        'Hands-on laboratory practicals (Acid-base titrations, optics, mechanics)',
        'Examiner-guided step marking for Section B theory papers',
        'Standard essay and letter writing structural templates',
        'Comprehensive coverage of WAEC 2026 prescribed literature texts',
        'Past questions deep-dive (25 years of solved examinations)',
        'Specialized clinics for students with Mathematics anxiety',
      ],
    },
    {
      id: 'neco',
      category: 'waec_neco',
      programTag: 'NECO',
      badge: 'Complete Syllabus',
      badgeColor: 'bg-slate-100 text-[#0a192f] font-bold border border-slate-300',
      title: 'NECO Senior School Certificate Examination',
      targetAudience: 'SSCE internal and external private candidates seeking complete qualification',
      duration: '3 to 5 Months (Targeted Drills)',
      schedule: 'Dedicated Science & Arts Exam Sessions',
      description:
        'A dedicated curriculum built around NECO testing conventions. Incorporates audio laboratory sessions for Oral English vowels, stress, and intonation, as well as intensive problem-solving workshops for core sciences and humanities.',
      features: [
        'Dedicated Oral English sound laboratory practice',
        'Circle geometry, trigonometry, and calculus problem workshops',
        'Hands-on apparatus handling for qualitative analysis',
        'Bi-weekly diagnostic progress evaluation and report cards',
        'Targeted mnemonic revision sheets for rapid recall',
      ],
    },
    {
      id: 'ielts',
      category: 'ielts',
      programTag: 'IELTS',
      badge: 'Band 8.0+ Target',
      badgeColor: 'bg-[#d97706] text-white font-bold',
      title: 'IELTS Academic & General Training Masterclass',
      targetAudience: 'Study abroad applicants, postgraduates, nurses, doctors & immigration candidates',
      duration: '6 to 10 Weeks (Flexible Evening & Weekend Batches)',
      schedule: 'Flexible Weekend & Evening Practice Suites',
      description:
        'Certified British Council attached program covering all 4 core components: Listening, Reading, Writing, and Speaking. Each candidate receives individual 1-on-1 mock speaking interviews with recorded critiques and line-by-line essay corrections.',
      features: [
        'Individual 1-on-1 speaking interview simulations with British Council examiners',
        'Band 9 lexical and grammatical templates for Writing Tasks 1 & 2',
        'High-speed skimming and scanning techniques for dense Academic Reading passages',
        'High-fidelity audio listening headsets with British, Aussie & US accents',
        'Access to 40+ authentic Cambridge practice test papers',
        'Guidance on UKVI, Canadian Express Entry, and Australian PR requirements',
      ],
    },
    {
      id: 'atswa',
      category: 'atswa',
      programTag: 'ATSWA',
      badge: 'Professional Accounting',
      badgeColor: 'bg-[#0a192f] text-white font-bold',
      title: 'ATSWA (ICAN Accounting Technicians Scheme)',
      targetAudience: 'Aspiring Chartered Accountants, OND/NCE holders, and Secondary School Graduates',
      duration: '4 to 6 Months per Part (Parts I, II & III)',
      schedule: 'Executive Weekend & Part-Time Batches',
      description:
        'Comprehensive ICAN-aligned lectures for Parts I, II, and III. Taught by practicing Chartered Accountants and ICAN examiners focusing on Financial Accounting, Business Law, Quantitative Analysis, and Taxation.',
      features: [
        'Lectures delivered by qualified FCA and ACA chartered accountants',
        'Exhaustive ICAN study pack topic breakdown and revision packs',
        'Regular weekend mock examinations following ICAN standard grading',
        'Dedicated tutorials for non-accounting backgrounds',
        'Direct registration assistance for ICAN student membership',
      ],
    },
    {
      id: 'toefl_sat',
      category: 'toefl_sat',
      programTag: 'SAT',
      badge: 'Global Ivy Track',
      badgeColor: 'bg-[#d97706] text-white font-bold',
      title: 'TOEFL & Digital SAT American University Track',
      targetAudience: 'Undergraduate and graduate applicants targeting US, Canadian & European scholarships',
      duration: '8 to 12 Weeks Intensive',
      schedule: 'Digital Bluebook Adaptive Software Suites',
      description:
        'Master the Digital SAT adaptive testing modules (Math & Reading/Writing) and TOEFL iBT standardized formats. Focused on scholarship-level target scores (1450+ SAT, 105+ TOEFL).',
      features: [
        'Full software simulation of the College Board Bluebook Digital SAT testing system',
        'Desmos graphing calculator mastery and timing shortcuts',
        'TOEFL iBT integrated speaking and writing rubric workshops',
        'College application essay guidance and scholarship strategy',
      ],
    },
  ];

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category === selectedCategory);

  const handleEnrollClick = (_program: ExamProgram | string) => {
    setCurrentPage('admission');
  };

  return (
    <div className="space-y-16 pb-16 bg-slate-50/60">
      {/* Header Banner - Attractive Light Colors */}
      <section className="bg-gradient-to-b from-sky-50 via-white to-sky-50 py-14 sm:py-16 px-4 sm:px-6 lg:px-8 text-center space-y-4 border-b-2 border-sky-200">
        <div className="max-w-7xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 text-sky-700 text-xs font-black uppercase tracking-wider border border-sky-300">
            <GraduationCap className="w-4 h-4 text-sky-600" />
            Official 2026/2027 academic session
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-sky-600">
            Academic Services &amp; Examination Programs
          </h1>
          <p className="text-sky-800 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-semibold">
            Discover our comprehensive tutorial programs, CBT laboratory practicals, and test preparation masterclasses at our Lagos center.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2.5 pb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-sky-200 hover:border-sky-400'
            }`}
          >
            All Programs ({services.length})
          </button>
          <button
            onClick={() => setSelectedCategory('utme')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedCategory === 'utme'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-sky-200 hover:border-sky-400'
            }`}
          >
            UTME (JAMB CBT)
          </button>
          <button
            onClick={() => setSelectedCategory('waec_neco')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedCategory === 'waec_neco'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-sky-200 hover:border-sky-400'
            }`}
          >
            WAEC &amp; NECO SSCE
          </button>
          <button
            onClick={() => setSelectedCategory('ielts')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedCategory === 'ielts'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-sky-200 hover:border-sky-400'
            }`}
          >
            IELTS Academic / General
          </button>
          <button
            onClick={() => setSelectedCategory('atswa')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedCategory === 'atswa'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-sky-200 hover:border-sky-400'
            }`}
          >
            ATSWA (ICAN)
          </button>
          <button
            onClick={() => setSelectedCategory('toefl_sat')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedCategory === 'toefl_sat'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-sky-200 hover:border-sky-400'
            }`}
          >
            TOEFL &amp; SAT
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-3xl border-2 border-sky-100 hover:border-sky-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Header card banner */}
                <div className="p-6 border-b border-sky-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase bg-sky-50 text-sky-700 border border-sky-200">
                      {srv.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      {srv.duration}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-sky-600 group-hover:text-sky-700 transition-colors">
                    {srv.title}
                  </h3>

                  <p className="text-xs text-sky-800 italic font-semibold">
                    {srv.targetAudience}
                  </p>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {srv.description}
                  </p>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600">
                      Key Program Features:
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-800 font-medium">
                      {srv.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#028D3B] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card Footer with Enrollment Action (Prices removed as requested) */}
              <div className="p-6 bg-sky-50/50 border-t border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-[#028D3B] block">Admissions Open</span>
                  <span className="text-xs font-bold text-sky-700">Morning &amp; Evening Batches</span>
                </div>
                <button
                  onClick={() => handleEnrollClick(srv.programTag)}
                  className="px-5 py-2.5 rounded-xl bg-[#D5241B] hover:bg-[#b81d15] text-white font-black text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-[#FFC600]"
                >
                  <span>Enroll Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Program Comparison Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-sky-100 shadow-xs space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-100 border border-sky-300 px-3.5 py-1 rounded-full">
              Overview Matrix
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-sky-600 tracking-tight">
              Program Comparison at a Glance
            </h3>
            <p className="text-sky-800 text-xs sm:text-sm font-semibold">
              Compare schedules, laboratory practical access, and mock examination frequencies for the Official 2026/2027 academic session.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-sky-200 bg-sky-600 text-white font-black uppercase tracking-wider">
                  <th className="p-3.5 rounded-tl-xl">Examination Track</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Study Mode</th>
                  <th className="p-3.5">Laboratory Access</th>
                  <th className="p-3.5">Mock Tests Count</th>
                  <th className="p-3.5 text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 text-slate-800 font-semibold">
                <tr className="hover:bg-sky-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-sky-700">UTME (JAMB CBT)</td>
                  <td className="p-3.5">3 – 6 Months</td>
                  <td className="p-3.5">Physical / Virtual</td>
                  <td className="p-3.5 font-medium">120-Seat CBT Lab</td>
                  <td className="p-3.5 font-bold text-[#D5241B]">40 Full Mocks</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleEnrollClick('UTME')}
                      className="px-3.5 py-1.5 rounded-lg bg-[#D5241B] hover:bg-[#b81d15] text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Apply
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-sky-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-sky-700">WAEC / WASSCE</td>
                  <td className="p-3.5">4 – 8 Months</td>
                  <td className="p-3.5">Physical Weekday</td>
                  <td className="p-3.5 font-medium">Chemistry &amp; Physics Lab</td>
                  <td className="p-3.5 font-bold text-[#D5241B]">24 Past Paper Mocks</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleEnrollClick('WAEC')}
                      className="px-3.5 py-1.5 rounded-lg bg-[#D5241B] hover:bg-[#b81d15] text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Apply
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-sky-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-sky-700">NECO SSCE</td>
                  <td className="p-3.5">3 – 5 Months</td>
                  <td className="p-3.5">Physical Weekday</td>
                  <td className="p-3.5 font-medium">Oral Audio + Science Lab</td>
                  <td className="p-3.5 font-bold text-[#D5241B]">18 Full Mocks</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleEnrollClick('NECO')}
                      className="px-3.5 py-1.5 rounded-lg bg-[#D5241B] hover:bg-[#b81d15] text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Apply
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-sky-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-sky-700">IELTS Academic/General</td>
                  <td className="p-3.5">6 – 10 Weeks</td>
                  <td className="p-3.5">Weekend / Evening</td>
                  <td className="p-3.5 font-medium">Audio Studio + 1-on-1 Suite</td>
                  <td className="p-3.5 font-bold text-[#D5241B]">16 Full Simulation Sets</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleEnrollClick('IELTS')}
                      className="px-3.5 py-1.5 rounded-lg bg-[#D5241B] hover:bg-[#b81d15] text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Apply
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-sky-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-sky-700">ATSWA (ICAN Technicians)</td>
                  <td className="p-3.5">4 – 6 Months</td>
                  <td className="p-3.5">Weekend / Executive</td>
                  <td className="p-3.5 font-medium">Financial Accounting Suite</td>
                  <td className="p-3.5 font-bold text-[#D5241B]">12 Full Mocks</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleEnrollClick('ATSWA')}
                      className="px-3.5 py-1.5 rounded-lg bg-[#D5241B] hover:bg-[#b81d15] text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Apply
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-sky-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-sky-700">TOEFL &amp; SAT Track</td>
                  <td className="p-3.5">8 – 12 Weeks</td>
                  <td className="p-3.5">Physical / Hybrid</td>
                  <td className="p-3.5 font-medium">Digital SAT Bluebook Suite</td>
                  <td className="p-3.5 font-bold text-[#D5241B]">20 Adaptive Mocks</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleEnrollClick('SAT')}
                      className="px-3.5 py-1.5 rounded-lg bg-[#D5241B] hover:bg-[#b81d15] text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Apply
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bottom Contact Help */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <p className="text-xs text-slate-500 font-semibold">
          Need a custom installment plan or private home tutorial arrangement?
        </p>
        <button
          onClick={() => setCurrentPage('contact')}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0284c7] hover:text-[#ea580c] hover:underline cursor-pointer transition-colors"
        >
          <span>Speak directly with our Chief Academic Counselor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
