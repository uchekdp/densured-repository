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
  Sparkles,
  Briefcase,
  Theater,
  Mic,
  Heart,
  Quote,
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
        {/* ABOUT THE FOUNDER & DIRECTOR OF STUDIES                                   */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border-2 border-slate-200 shadow-sm space-y-8 overflow-hidden relative">
          {/* Header & title */}
          <div className="border-b border-slate-100 pb-6 space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              About the Founder &amp; Director of Studies
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#0284c7]">
              AKINJO ROTIMI GEORGE • M.Sc., B.Ed. English (LASU), NCE Dist.
            </p>
          </div>

          {/* Main Grid: Portrait Card + Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Portrait, Credentials & Core Pillars */}
            <div className="lg:col-span-5 space-y-6">
              {/* Portrait card */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 shadow-lg bg-gradient-to-b from-sky-50 to-slate-100 group">
                <img
                  src="/founder.jpg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://i.ibb.co/XkNjZCry/IMG-20261016-WA0010.jpg';
                  }}
                  alt="Akinjo Rotimi George - Founder and Director of Studies, D Ensured Consult Academy"
                  className="w-full h-auto object-cover max-h-[560px] transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent p-6 text-white space-y-1">
                  <div className="text-[11px] font-bold tracking-widest uppercase text-amber-300">
                    Founder &amp; Director of Studies
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                    AKINJO ROTIMI GEORGE
                  </h3>
                  <p className="text-xs text-slate-300">
                    D Ensured Consult Academy • Educational Consultant &amp; Language Coach
                  </p>
                </div>
              </div>

              {/* Academic Highlights Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#0284c7] font-bold">
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span>M.Sc. &amp; B.Ed.</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    English Language • Lagos State University (LASU)
                  </p>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Award className="w-4 h-4 shrink-0" />
                    <span>NCE Distinction</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Theatre Arts &amp; English • AOCOED
                  </p>
                </div>

                <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#ea580c] font-bold">
                    <Award className="w-4 h-4 shrink-0" />
                    <span>UTME 290</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Distinction score achieved on first sitting
                  </p>
                </div>

                <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-700 font-bold">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Language Coach</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    IELTS, TOEFL, Duolingo &amp; ITE
                  </p>
                </div>
              </div>

              {/* Key Roles Badges */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Professional Versatility &amp; Calling
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200 font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs">
                    <Briefcase className="w-3.5 h-3.5 text-[#0284c7]" />
                    Educational Consultant
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200 font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    Language Coach
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200 font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs">
                    <Theater className="w-3.5 h-3.5 text-purple-600" />
                    Passionate Thespian
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200 font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs">
                    <Mic className="w-3.5 h-3.5 text-orange-600" />
                    Master of Ceremonies (MC)
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200 font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Family Man by Grace
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Narrative */}
            <div className="lg:col-span-7 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
              {/* Intro Highlight Quote */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-sky-50 via-white to-orange-50 border-l-4 border-[#0284c7] rounded-2xl shadow-xs space-y-2">
                <Quote className="w-6 h-6 text-[#0284c7]/40" />
                <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed italic">
                  &ldquo;AKINJO ROTIMI GEORGE is a distinguished educationist, professional educational consultant, language coach, entrepreneur, event planner, Master of Ceremonies, and passionate thespian whose life reflects a remarkable blend of academic excellence, professional versatility, creativity, and an unwavering commitment to human development.&rdquo;
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  Born on April 19, 1990, Akinjo Rotimi George has consistently demonstrated a strong passion for learning, leadership, communication, and the performing arts. His academic journey is a testament to his determination, intellectual capacity, and commitment to excellence.
                </p>

                <p>
                  He completed his Senior Secondary School Certificate Examination (SSCE) in 2010 with outstanding grades. Shortly afterward, he proceeded to sit for the Unified Tertiary Matriculation Examination (UTME), where he achieved an impressive score of <strong>290 at his first sitting</strong>—an accomplishment that marked the beginning of an exceptional academic journey.
                </p>

                <p>
                  Driven by his passion for education and the English language, he gained admission into Adeniran Ogunsanya College of Education, where he studied <strong>Theatre Arts and English Language</strong>, graduating with <strong>Distinction</strong> in his NCE programme. His quest for greater academic and professional advancement subsequently led him to <strong>Lagos State University (LASU)</strong>, where he earned a Bachelor of Education (B.Ed.) degree in English Language. In his continued pursuit of academic excellence, he furthered his studies at the same institution, earning a Master of Science (M.Sc.) degree in English Language.
                </p>
              </div>

              {/* D Ensured Academy & Coaching Callout */}
              <div className="p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#ea580c]" />
                  <span>Founding D Ensured Academy &amp; Educational Consultancy</span>
                </h4>
                <p>
                  Beyond his academic achievements, Akinjo Rotimi George is the founder of <strong>D ENSURED ACADEMY</strong>, an educational institution established to provide quality tutorial services, professional coaching, and educational guidance. Through his work as an educationist and consultant, he is committed to empowering learners, helping individuals achieve their academic ambitions, and providing professional guidance in education and other aspects of life.
                </p>
                <p>
                  He is also a skilled language and communication coach, specialising in speaking and writing preparation for international proficiency examinations, including <strong>IELTS, TOEFL, Duolingo English Test, and ITE</strong>, among others. His passion for language development, effective communication, and student success continues to inspire his approach to coaching and mentorship.
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  In addition to his contributions to education, Akinjo is a versatile event planner and accomplished Master of Ceremonies, recognised for his enthusiasm, confidence, stage presence, and ability to create memorable experiences. His background in Theatre Arts has further strengthened his passion for performance, expression, and entertainment. As a committed thespian, he derives immense joy from the performing arts and embraces every opportunity to showcase creativity and talent.
                </p>

                <p>
                  At the heart of his professional accomplishments is a deep appreciation for family. He is happily married and blessed with a beautiful daughter, whose presence adds meaning and inspiration to his personal journey.
                </p>

                <p>
                  Akinjo Rotimi George embodies the qualities of a lifelong learner, dedicated educator, creative professional, and purposeful entrepreneur. His journey from academic distinction to educational leadership and artistic expression reflects his belief in the power of knowledge, discipline, creativity, and continuous self-development.
                </p>

                <p>
                  Through <strong>D ENSURED ACADEMY</strong> and his diverse professional engagements, he continues to pursue a vision of empowering individuals, nurturing potential, promoting academic excellence, and inspiring others to learn, emerge, and succeed.
                </p>
              </div>

              {/* Founder's Motto Footer Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#1c1152] to-slate-900 text-white flex items-center gap-3.5 shadow-md border border-slate-800">
                <Sparkles className="w-6 h-6 text-[#FFC600] shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-[#FFC600]">
                    The Founder&apos;s Motto
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold tracking-tight text-white mt-0.5">
                    AKINJO ROTIMI GEORGE — An educationist by calling, a consultant by profession, a thespian by passion, and a family man by grace.
                  </p>
                </div>
              </div>
            </div>
          </div>
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
