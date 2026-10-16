import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mediaApi } from '../../services/api';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Laptop,
  BookOpen,
  Award,
  Users,
  Calendar,
  MapPin,
  Phone,
  FileCheck,
  TrendingUp,
  Image as ImageIcon,
  HelpCircle,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setCurrentPage } = useApp();
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  // Hero background images sliding every 30 seconds
  const heroBackgrounds = [
    {
      id: 'bg-1',
      url: 'https://i.ibb.co/KxHVgnDF/achiever.webp',
      fallback: '/hero-bg-1.webp',
      alt: 'D Ensured Consult Academic Students',
    },
    {
      id: 'bg-2',
      url: 'https://i.ibb.co/JW1wWXHd/087811c5-668f-448a-9ec8-54abdf8f0a6e.jpg',
      fallback: '/hero-bg-2.jpg',
      alt: 'D Ensured Consult Excellence',
    },
  ];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroBackgrounds.length);
    }, 30000); // Slides every 30 seconds
    return () => clearInterval(slideTimer);
  }, [heroBackgrounds.length]);

  useEffect(() => {
    mediaApi.getGallery().then((res) => {
      if (res.ok && res.data && Array.isArray(res.data.gallery)) {
        setGalleryImages(res.data.gallery.filter((g: any) => g.image_url));
      }
    });
  }, []);

  const examPrepCards = [
    {
      title: 'UTME / JAMB CBT',
      tag: 'Tertiary Entrance',
      desc: 'Speed and calculation heuristics for 300+ targets. 120-seat computer testing laboratory running authentic JAMB 8-key interface drills.',
      highlight: '40 Timed CBT Mock Exams',
      color: 'border-sky-200 hover:border-[#0284c7]',
      badgeBg: 'bg-sky-50 text-[#0284c7]',
    },
    {
      title: 'WAEC / WASSCE',
      tag: 'Senior Secondary',
      desc: 'Section B theory step-by-step marking rubrics, science apparatus laboratory practicals, and past questions heuristic deep-dives.',
      highlight: 'Examiner-Guided Marking Schemes',
      color: 'border-orange-200 hover:border-[#ea580c]',
      badgeBg: 'bg-orange-50 text-[#ea580c]',
    },
    {
      title: 'NECO Senior School',
      tag: 'National O-Level',
      desc: 'Exhaustive syllabus coverage with formula breakdowns, practical calibrations, and continuous assessment tracking.',
      highlight: 'Full Curriculum Mastery',
      color: 'border-amber-200 hover:border-[#f59e0b]',
      badgeBg: 'bg-amber-50 text-[#b45309]',
    },
    {
      title: 'JUPEB Direct Entry',
      tag: '200-Level Admission',
      desc: 'Advanced level foundational training allowing candidates to bypass UTME and gain direct admission into 200-level university degree courses.',
      highlight: 'Direct University Entry',
      color: 'border-blue-200 hover:border-[#0369a1]',
      badgeBg: 'bg-blue-50 text-[#0369a1]',
    },
    {
      title: 'Post-UTME Screening',
      tag: 'Institutional Screening',
      desc: 'Targeted preparation for federal, state, and private university screening examinations with high-yield past questions.',
      highlight: 'University Specific Drills',
      color: 'border-slate-200 hover:border-[#0284c7]',
      badgeBg: 'bg-slate-100 text-slate-700',
    },
  ];

  const whyChoosePillars = [
    {
      title: 'Qualified Academic Support',
      desc: 'Lectures led by verified secondary school examiners and subject specialists.',
      icon: <Award className="w-5 h-5 text-[#0284c7]" />,
    },
    {
      title: 'Structured Learning',
      desc: 'Organized daily morning and evening lecture schedules covering 100% of syllabi.',
      icon: <BookOpen className="w-5 h-5 text-[#ea580c]" />,
    },
    {
      title: 'Regular Assessment',
      desc: 'Weekly diagnostic class tests, assignments, and mock examinations.',
      icon: <TrendingUp className="w-5 h-5 text-[#0284c7]" />,
    },
    {
      title: 'CBT Practice',
      desc: '120-seat computer testing laboratory simulating timed examination pressure.',
      icon: <Laptop className="w-5 h-5 text-[#f59e0b]" />,
    },
    {
      title: 'Study Materials',
      desc: 'Downloadable syllabus notes, formula sheets, and 25 years of solved past questions.',
      icon: <FileCheck className="w-5 h-5 text-[#0284c7]" />,
    },
    {
      title: 'Attendance Monitoring',
      desc: 'Daily session roll calls preventing absenteeism and keeping students disciplined.',
      icon: <Calendar className="w-5 h-5 text-[#ea580c]" />,
    },
    {
      title: 'Academic Progress Tracking',
      desc: 'Continuous score monitoring with individualized performance metrics.',
      icon: <CheckCircle2 className="w-5 h-5 text-[#0284c7]" />,
    },
    {
      title: 'Student Portal',
      desc: 'Dedicated individual candidate e-portal for study materials, CBT, ID cards, and receipts.',
      icon: <Users className="w-5 h-5 text-[#f59e0b]" />,
    },
  ];

  return (
    <div className="w-full bg-white text-slate-800 font-['Poppins',sans-serif]">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH 30-SECOND DUAL IMAGE SLIDER                          */}
      {/* ========================================================================= */}
      <section
        aria-label="Hero Section"
        className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center justify-center overflow-hidden border-b border-slate-900 shadow-xl"
      >
        {/* Full Background Slider (Slides every 30 seconds) */}
        {heroBackgrounds.map((bg, idx) => (
          <div
            key={bg.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              activeSlide === idx ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none -z-10'
            }`}
          >
            <img
              src={bg.url || bg.fallback}
              onError={(e) => {
                (e.target as HTMLImageElement).src = bg.fallback;
              }}
              alt={bg.alt}
              className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-[30000ms] ease-linear"
              style={{
                transform: activeSlide === idx ? 'scale(1.06)' : 'scale(1.0)',
              }}
            />
          </div>
        ))}

        {/* Cinematic Backdrop Gradient Overlay for Maximum Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/70 z-10" />
        <div className="absolute inset-0 bg-sky-950/25 mix-blend-multiply z-10" />

        <div className="relative z-20 max-w-5xl mx-auto text-center space-y-7 sm:space-y-8 px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          {/* Main Hero Heading */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12] drop-shadow-md">
              Prepare Today.{' '}
              <span className="text-[#38bdf8]">Succeed</span>{' '}
              <span className="text-[#ea580c]">Tomorrow.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-lg md:text-xl text-slate-100 font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
              D Ensured Consult provides structured academic preparation and examination support designed to help
              students build confidence, improve their performance and prepare effectively for major examinations.
            </p>
          </div>

          {/* Buttons: Apply Now & Student Portal */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setCurrentPage('register')}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-4.5 rounded-2xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-base sm:text-lg shadow-xl shadow-orange-600/30 hover:shadow-orange-600/40 border border-amber-300/80 transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-95"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage('student-login')}
              className="w-full sm:w-auto px-7 py-4 sm:py-4.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md font-bold text-base border-2 border-white/40 hover:border-white shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
            >
              <Laptop className="w-5 h-5 text-sky-300" />
              <span>Student Portal</span>
            </button>
          </div>

          {/* 30-Second Slide Indicators & Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            {heroBackgrounds.map((bg, idx) => (
              <button
                key={bg.id}
                onClick={() => setActiveSlide(idx)}
                className={`transition-all duration-500 rounded-full cursor-pointer ${
                  activeSlide === idx
                    ? 'w-10 h-2.5 bg-amber-400 shadow-md shadow-amber-400/50'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                }`}
                title={`Switch to background slide ${idx + 1}`}
                aria-label={`Background slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ABOUT D ENSURED CONSULT ACADEMY (Requirement 10)                       */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-10 border-2 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full inline-block">
              About D Ensured Consult Academy
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dedicated to Academic Discipline &amp; High Examination Pass Rates
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Founded and directed by seasoned academic consultant Mr. Akinjo Rotimi, D Ensured Consult Academy is a
              premier tutorial centre based at Doyin Plaza, Okomaiko, Lagos. We bridge the critical gap between secondary
              curriculum and competitive university entrance criteria through disciplined lectures, computer-based testing,
              and continuous student mentoring. Learn, Emerge and Succeed.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setCurrentPage('about')}
              className="w-full md:w-auto px-7 py-3.5 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Learn More</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. EXAMINATION PREPARATION CARDS (Requirement 10)                         */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c] bg-orange-50 border border-orange-200 px-3.5 py-1.5 rounded-full inline-block">
            Examination Preparation
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Coaching Programs
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Targeted curricula designed to deliver authentic distinction grades and competitive university placement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examPrepCards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl p-6 border-2 ${card.color} shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${card.badgeBg}`}>
                  {card.tag}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0284c7]">{card.highlight}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage('register')}
                  className="text-xs font-bold text-[#ea580c] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHY CHOOSE D ENSURED CONSULT ACADEMY (Requirement 10)                  */}
      {/* ========================================================================= */}
      <section className="bg-slate-50/70 border-y border-slate-200/80 py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full inline-block">
              Why Choose D Ensured Consult Academy
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Institutional Standards Built on Results
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Eight cornerstone features that ensure every registered student achieves their academic potential.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoosePillars.map((p, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 hover:border-sky-300 shadow-xs space-y-3 transition-all hover:translate-y-[-2px]"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                  {p.icon}
                </div>
                <h3 className="font-bold text-sm text-slate-900 leading-snug">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. LEARNING SYSTEM & STUDENT SUPPORT (Requirement 10)                     */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Learning System Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-sky-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-100">
              <ShieldCheck className="w-6 h-6 text-[#0284c7]" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Learning System</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Registered students receive access to an individual student portal after their monthly tuition payment has
              been verified and approved by the directorate. Each approved payment grants a 30-day validity period,
              securing access to laboratory mock tests, lecture resources, and attendance tracking.
            </p>
            <div className="pt-2 text-xs font-bold text-[#0284c7] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Automatic activation upon admin approval</span>
            </div>
          </div>

          {/* Student Support Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ea580c] flex items-center justify-center border border-orange-100">
              <BookOpen className="w-6 h-6 text-[#ea580c]" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Student Support</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Inside their dedicated candidate e-portal, students can access:
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]"></span>
                <span><strong>Study Materials:</strong> Downloadable syllabus notes, formula sheets, and past questions.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]"></span>
                <span><strong>CBT Practice:</strong> Real-time timed tests with instant grading and reviews.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                <span><strong>Announcements:</strong> Real-time academic notices and timetable updates.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]"></span>
                <span><strong>Academic Progress &amp; Attendance:</strong> Continuous scorecards and attendance tracking.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]"></span>
                <span><strong>Payment History:</strong> Official receipts and verified ID card generation.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. GALLERY PREVIEW (Requirement 10)                                       */}
      {/* ========================================================================= */}
      <section className="bg-slate-50/70 border-t border-slate-200/80 py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full inline-block">
                Campus Activities
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Gallery Preview
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage('gallery')}
              className="text-xs font-bold text-[#0284c7] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View Complete Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden border-2 border-slate-200 shadow-xs flex flex-col"
                >
                  <div className="aspect-16/10 bg-slate-100 overflow-hidden">
                    <img
                      src={item.image_url || 'https://i.ibb.co/WNYJfXGK/de-ensured-3.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-[10px] font-bold text-[#0284c7] uppercase">{item.category}</span>
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-slate-400 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600">
                Academy gallery images will appear here.
              </p>
              <p className="text-[11px] text-slate-400">
                Administrator can upload campus photographs via the Admin Gallery dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CALL TO ACTION (Requirement 10)                                        */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#0369a1] text-white p-8 sm:p-14 shadow-xl border-2 border-amber-300/40 text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/20">
            <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>2026/2027 Admissions Open</span>
          </span>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
            Start Your Academic Preparation Today
          </h2>

          <p className="text-sky-100 text-xs sm:text-sm max-w-xl mx-auto font-normal leading-relaxed">
            Take the definitive step towards exam distinction and university admission. Morning and evening batches are
            currently registering at our Okomaiko, Lagos center.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setCurrentPage('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-sm shadow-md border border-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage('contact')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-amber-300" />
              <span>Contact Us</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
