import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { navigateTo, loginAdmin } = useApp();

  const [email, setEmail] = useState('Densuredconsult@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your directorate email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginAdmin(email.trim(), password);
      if (res.success) {
        navigateTo('admin-portal');
      } else {
        setErrorMsg(res.message || 'Invalid administrator credentials. Access denied.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('Densuredconsult@gmail.com');
    setPassword('Blessing0147$$');
    setErrorMsg('');
  };

  return (
    <div className="w-full bg-[#0f172a] min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border-2 border-slate-200 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center mx-auto border-2 border-sky-200 shadow-xs">
            <ShieldCheck className="w-7 h-7 text-[#0284c7]" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Admin Portal</h2>
          <p className="text-xs text-slate-500">
            D Ensured Consult Directorate • Confidential Terminal
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-mono text-slate-600 border border-slate-200">
            <Lock className="w-3 h-3 text-[#0284c7]" />
            <span>https://www.densuredconsultacademy.com.ng/admin</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Directorate Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Directorate Master Password *</label>
              <button
                type="button"
                onClick={handleFillDemoCredentials}
                className="text-[11px] font-bold text-[#0284c7] hover:text-[#0369a1] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <KeyRound className="w-3 h-3" />
                <span>Fill Credentials</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter directorate password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-4 h-4 text-amber-300" />
            <span>{loading ? 'Verifying Directorate Token...' : 'Authorize Directorate Access'}</span>
          </button>
        </form>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed text-center">
          Directorate clearance required. All administrative sessions are logged and auditable.
        </div>

        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="text-xs text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Return to Homepage</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
