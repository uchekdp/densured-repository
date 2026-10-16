import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Target,
  Compass,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Users,
  Flame,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { setCurrentPage } = useApp();

  const coreValues = [
    {
      title: 'Excellence',
      desc: 'Unrelenting focus on top-tier examination performance, conceptual depth, and mastery of marking rubrics.',
      num: '01',
    },
    {
      title: 'Discipline',
      desc: 'Structured daily attendance, punctual shifts, and regular assessments that instill focused study habits.',
      num: '02',
    },
    {
      title: 'Integrity',
      desc: 'Strict zero-malpractice ethics. We build genuine student ability that stands firm in any national examination.',
      num: '03',
    },
    {
      title: 'Commitment',
      desc: 'Dedicated subject tutors and academic leaders invested in every candidate\'s individual score improvement.',
      num: '04',
    },
    {
      title: 'Accountability',
      desc: 'Transparent score tracking, regular attendance logs, and open progress feedback for parents and sponsors.',
      num: '05',
    },
    {
      title: 'Student Success',
      desc: 'Our ultimate yardstick: university admissions, distinction results, and confident scholarly growth.',
      num: '06',
    },
  ];

  return (
    <div className="w-full bg-[#f8fafc] pb-20 font-['Poppins',sans-serif]">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-sky-50 via-white to-sky-50 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 text-center space-y-4 border-b-2 border-sky-100">
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-[#0284c7] text-xs font-bold border border-sky-200">
            <GraduationCap className="w-4 h-4 text-[#0284c7]" />
            <span>Official 2026/2027 Academic Session • Learn, Emerge and Succeed.</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            About D Ensured Consult Academy
          </h1>
          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A premier academic tutorial centre committed to rigorous student preparation, discipline, and outstanding
            examination results in Lagos, Nigeria.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 mt-12">
        {/* ========================================================================= */}
        {/* 1. WHO WE ARE (Requirement 11)                                            */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full inline-block">
            Who We Are
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            A Leading Academic Preparation &amp; Tutorial Centre
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            D Ensured Consult Academy is an educational tutorial and academic preparation centre focused on helping
            students prepare for examinations and admission opportunities. Located at Doyin Plaza, Igboelerin Bus Stop,
            Okomaiko, Lagos, the academy provides targeted coaching for UTME (JAMB CBT), WAEC (WASSCE), NECO, JUPEB,
            Post-UTME, and Adult Education.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Under the experienced leadership of our directorate, we combine classroom teaching by certified examiners
            with a dedicated 120-seat computer testing laboratory, continuous assessment tracking, and structured morning
            and evening shifts.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* 2. MISSION & VISION (Requirement 11)                                      */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Mission */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-sky-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-100">
                <Target className="w-6 h-6 text-[#0284c7]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Our Mission</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                To provide structured academic preparation, learning resources, assessment and student support that
                enable students to master examination curricula, eliminate cognitive anxiety, and gain direct admission
                into competitive tertiary institutions.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-[#0284c7] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Structured Learning &amp; Mentoring</span>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ea580c] flex items-center justify-center border border-orange-100">
                <Compass className="w-6 h-6 text-[#ea580c]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Our Vision</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                To support students in becoming academically prepared, confident and disciplined learners who embody
                intellectual rigor, ethical excellence, and self-reliance in their higher education pursuits and future
                careers.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-[#ea580c] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Confidence &amp; Academic Discipline</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. OUR CORE VALUES (Requirement 11)                                       */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full inline-block">
              Foundational Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Our Core Values
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              The fundamental standards that guide our instruction, staff conduct, and student engagement daily.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((val, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-sky-300 shadow-xs space-y-3 transition-all hover:translate-y-[-2px]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                    {val.num}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                </div>
                <h4 className="font-extrabold text-base text-slate-900">{val.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="bg-gradient-to-r from-sky-50 via-white to-blue-50 border-2 border-sky-200 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-sm">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Begin Your Academic Journey With Us
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Admissions for the 2026/2027 academic session are active. Secure your seat and join our dedicated tutorial
            community today.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setCurrentPage('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
            >
              <span>Apply for Admission</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
