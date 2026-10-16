import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Award,
  BookCheck,
  Lock,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, isAdminLoggedIn } = useApp();
  return (
    <footer className="bg-[#0f172a] text-slate-300 border-t-4 border-[#0284c7] font-['Poppins',sans-serif]">
      {/* Upper CTA Banner - Deep Academic Navy with Orange & Yellow */}
      <div className="bg-gradient-to-r from-[#0b1424] via-[#0f1f38] to-[#0b1424] border-b border-sky-900/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-950 text-sky-300 border border-sky-700/60 shadow-xs mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
              Official 2026/2027 Academic Session • 98.4% Pass Rate
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ready to Secure Your High Score &amp; University Admission?
            </h3>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl font-medium">
              Join thousands of scholars at D Ensured Consult Academy. Intensive CBT lab drills, past question breakdowns, and masterclasses for UTME, WAEC, NECO, IELTS &amp; Adult Education.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <a
              href="https://wa.me/2348147896930?text=Hello%20D%20Ensured%20Consult%20Academy,%20I%20would%20like%20to%20enroll%20for%20classes."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-extrabold bg-[#ea580c] hover:bg-[#c2410c] text-white border border-[#f59e0b] transition-all shadow-md active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Chat on WhatsApp: 08147896930</span>
            </a>
            <a
              href="tel:08147896930"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-[#1e293b] hover:bg-[#334155] text-sky-300 border border-sky-700/50 transition-colors shadow-xs"
            >
              <Phone className="w-4 h-4 text-sky-400" />
              <span>Call Helpline: 08147896930</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Col 1: School Identity */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="D Ensured Consult Logo"
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-md"
              />
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  <span className="text-[#38bdf8]">D ENSURED</span>{' '}
                  <span className="text-[#ea580c]">CONSULT</span>{' '}
                  <span className="text-white text-base">ACADEMY</span>
                </span>
                <p className="text-xs text-[#f59e0b] font-bold uppercase tracking-wider">
                  Learn, Emerge and Succeed.
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed pr-4 font-medium">
              D Ensured Consult Academy is a premier educational tutorial center dedicated to rigorous student preparation for UTME (JAMB CBT), WAEC, NECO, IELTS, and Adult Education with an undisputed track record of high scores and direct university admissions.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] border border-slate-700 text-slate-200 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                120-Seat JAMB CBT Lab
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] border border-slate-700 text-slate-200 font-medium">
                <Award className="w-3.5 h-3.5 text-[#f59e0b]" />
                Certified Marking Examiners
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] border border-slate-700 text-slate-200 font-medium">
                <BookCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                98.4% Proven Pass Rate
              </span>
            </div>
          </div>

          {/* Col 2: Coaching Tracks */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              Coaching Specializations
            </h4>
            <ul className="space-y-2 text-sm text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]"></span>
                <span>UTME (JAMB) CBT Coaching</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]"></span>
                <span>WAEC / WASSCE Science &amp; Arts</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                <span>NECO Senior School Certificate</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]"></span>
                <span>IELTS Academic &amp; General</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]"></span>
                <span>Adult &amp; Executive Education</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                <span>Post-UTME Screening Drills</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Campus Headquarters */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              Campus Headquarters
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <p className="font-bold text-[#38bdf8] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
                  Office Address:
                </p>
                <p className="mt-1 pl-5 text-slate-200 font-medium leading-relaxed">
                  DOYIN PLAZA, IGBOELERIN BUSSTOP<br />
                  BESIDE PRIME-MART, OKOMAIKO, LAGOS
                </p>
              </div>

              <div>
                <p className="font-bold text-[#38bdf8] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                  Office Hours:
                </p>
                <p className="mt-1 pl-5 font-medium text-slate-300">
                  Mon – Fri: 8:00 AM – 6:30 PM
                  <br />
                  Saturday: 8:30 AM – 5:00 PM
                </p>
              </div>

              <div>
                <p className="font-bold text-[#38bdf8] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  Phone &amp; WhatsApp:
                </p>
                <p className="mt-1 pl-5 font-mono font-bold text-amber-300 text-sm">
                  <a href="tel:08147896930" className="hover:text-white transition-colors">
                    08147896930
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Directorate Notice */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p>© {new Date().getFullYear()} D Ensured Consult Academy. Directorate &amp; Super Admin: Mr Akinjo Rotimi.</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800/60 text-[10px] font-mono text-sky-300 font-semibold" title="Active Live Build Version">
              <span>Build v2026.10.14-v2.1</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-400">
              Doyin Plaza, Okomaiko, Lagos State, Nigeria.
            </span>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => navigateTo('student-login')}
              className="text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              Student Portal
            </button>
            <span className="text-slate-700">•</span>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                navigateTo(isAdminLoggedIn ? 'admin-portal' : 'admin-login');
              }}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="Admin Dashboard (https://www.densuredconsultacademy.com.ng/admin)"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Admin Dashboard</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
