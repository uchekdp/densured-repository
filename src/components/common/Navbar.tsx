import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types';
import {
  GraduationCap,
  Menu,
  X,
  Phone,
  BookOpen,
  UserCheck,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  MessageCircle,
  MapPin,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentPage, navigateTo, isStudentLoggedIn } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exact Main Navigation (Requirement 8): Home, About Us, Admission, Gallery, Contact
  const navLinks: { id: PageId; label: string; href: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', href: '/', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'about', label: 'About Us', href: '/about', icon: <Award className="w-4 h-4" /> },
    { id: 'admission', label: 'Admission', href: '/admission', icon: <Calendar className="w-4 h-4" /> },
    { id: 'gallery', label: 'Gallery', href: '/gallery', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact', href: '/contact', icon: <Phone className="w-4 h-4" /> },
  ];

  const handleNavClick = (e: React.MouseEvent, page: PageId) => {
    e.preventDefault();
    navigateTo(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs font-['Poppins',sans-serif]">
      {/* Top Academic Ribbon (Zero Emojis, Clean School Blue with Yellow/Orange Badges) */}
      <div className="bg-[#0369a1] text-white text-xs py-2 px-4 shadow-inner border-b border-sky-800/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="relative flex-1 overflow-hidden whitespace-nowrap py-0.5">
            <div className="animate-move-ltr flex items-center gap-6">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f59e0b] text-[#0f172a] uppercase tracking-wider">
                <GraduationCap className="w-3 h-3 text-[#0f172a]" />
                <span>2026/2027 Admissions Open</span>
              </span>
              <span className="text-white font-medium text-xs sm:text-[13px] tracking-wide">
                D Ensured Consult: UTME (JAMB CBT), WAEC, NECO, JUPEB, Post-UTME &amp; Adult Education. Morning &amp; Evening Batches.
              </span>
              <span className="inline-flex items-center gap-1 text-amber-300 font-semibold text-xs">
                <MapPin className="w-3 h-3 text-amber-300" />
                <span>Doyin Plaza, Igboelerin Bus Stop, Okomaiko, Lagos</span>
              </span>
              <span className="text-white/90 text-xs">
                Helpline: <strong className="text-white font-mono">08147896930</strong>
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-white/90 shrink-0 text-xs">
            <a
              href="tel:08147896930"
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors font-semibold"
            >
              <Phone className="w-3 h-3 text-amber-300" />
              <span className="font-mono">08147896930</span>
            </a>
            <span className="text-white/40">|</span>
            <a
              href="https://wa.me/2348147896930?text=Hello%20D%20Ensured%20Consult,%20I%20want%20to%20inquire%20about%20admission%20and%20programs."
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-amber-300 hover:text-white transition-colors font-bold"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>WhatsApp Desk</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Title */}
          <a
            href="/"
            onClick={(e) => handleNavClick(e, 'home')}
            className="flex items-center gap-3 text-left group focus:outline-hidden cursor-pointer"
          >
            <img
              src="/logo.jpg"
              alt="D Ensured Consult Logo"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-amber-400 shadow-xs group-hover:scale-105 transition-transform shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-lg sm:text-xl tracking-tight text-[#0284c7]">
                  D ENSURED
                </span>
                <span className="font-black text-lg sm:text-xl tracking-tight text-[#ea580c]">
                  CONSULT
                </span>
              </div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Learn, Emerge and Succeed.
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-50 text-[#0284c7] font-bold border-b-2 border-[#0284c7]'
                      : 'text-slate-600 hover:text-[#0284c7] hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Portals & Prominent "Apply Now" (Requirement 8) */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Student Portal Access */}
            <a
              href="/student-login"
              onClick={(e) => handleNavClick(e, isStudentLoggedIn ? 'student-portal' : 'student-login')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                currentPage === 'student-portal' || currentPage === 'student-login'
                  ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#0284c7] hover:text-[#0284c7]'
              }`}
              title="Candidate E-Portal"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Student Portal</span>
            </a>

            {/* Prominent "Apply Now" Button */}
            <a
              href="/register"
              onClick={(e) => handleNavClick(e, 'register')}
              className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-extrabold bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-sm border border-amber-300/80 transition-all hover:translate-y-[-1px] cursor-pointer"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </a>
          </div>

          {/* Mobile Hamburger Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-hidden cursor-pointer border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          {/* Student Portal Access on Mobile */}
          <div className="pb-3 border-b border-slate-100">
            <a
              href="/student-login"
              onClick={(e) => handleNavClick(e, isStudentLoggedIn ? 'student-portal' : 'student-login')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-[#0284c7] text-white cursor-pointer shadow-xs"
            >
              <UserCheck className="w-4 h-4 text-white" />
              <span>Student Portal Access</span>
            </a>
          </div>

          {/* Nav Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-sky-50 text-[#0284c7] font-bold border-l-4 border-[#0284c7]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {link.icon}
                    {link.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </a>
              );
            })}
          </div>

          {/* Prominent Apply Now on Mobile */}
          <div className="pt-2">
            <a
              href="/register"
              onClick={(e) => handleNavClick(e, 'register')}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-extrabold bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-md transition-colors cursor-pointer border border-amber-300"
            >
              <span>Apply Now • 2026/2027 Admissions</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
