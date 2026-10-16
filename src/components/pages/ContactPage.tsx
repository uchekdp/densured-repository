import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GoogleMapSection } from '../common/GoogleMapSection';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast } = useApp();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.message.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setSubmitted(true);
    showToast('Your inquiry has been received. Our counselor will contact you shortly.', 'success');
    setForm({
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="w-full bg-[#f8fafc] pb-20 font-['Poppins',sans-serif]">
      {/* Header */}
      <section className="bg-gradient-to-b from-sky-50 via-white to-sky-50 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 text-center space-y-4 border-b-2 border-sky-100">
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-[#0284c7] text-xs font-bold border border-sky-200">
            <Phone className="w-4 h-4 text-[#0284c7]" />
            <span>Admissions Desk &amp; Academic Counselors</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Contact D Ensured Consult Academy
          </h1>
          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Reach out to our administrative directorate for inquiries regarding registrations, batch schedules, CBT mock
            examinations, or fee structures.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] bg-sky-50 border border-sky-200 px-3 py-1 rounded-full inline-block mb-2">
                Campus Headquarters
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">D Ensured Consult Academy</h2>
              <p className="text-xs text-slate-500 mt-1">Official Educational Consultancy &amp; Tutorial Centre</p>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <MapPin className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-slate-900 mb-0.5">Address:</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Doyin Plaza, Igboelerin Bus Stop, Beside Prime-Mart, Okomaiko, Lagos State, Nigeria.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <Phone className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-slate-900 mb-0.5">Direct Helpline &amp; WhatsApp:</strong>
                  <a href="tel:08147896930" className="text-[#0284c7] font-mono font-bold hover:underline block text-sm">
                    08147896930
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <Mail className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-slate-900 mb-0.5">Official Directorate Email:</strong>
                  <a href="mailto:Densuredconsult@gmail.com" className="text-slate-700 hover:text-[#0284c7] hover:underline block">
                    Densuredconsult@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <Clock className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-slate-900 mb-0.5">Office &amp; Consultation Hours:</strong>
                  <p className="text-slate-600">Monday – Friday: 08:00 AM – 06:30 PM</p>
                  <p className="text-slate-600">Saturday: 08:30 AM – 05:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Send an Inquiry</h3>
              <p className="text-xs text-slate-500 mt-1">
                Have a question regarding course placement, subjects, or batch schedules? Send us a message.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-900">Message Received</h4>
                <p className="text-xs text-emerald-700">
                  Thank you for reaching out. An academic counselor will review your inquiry and contact you via phone or email.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-bold text-[#0284c7] hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Samuel Adekunle"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#0284c7]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 08147896930"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#0284c7]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g. samuel@gmail.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#0284c7]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Admission Inquiry / CBT Drill"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#0284c7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message *</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your inquiry, intended examination or questions..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#0284c7]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Map Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <MapPin className="w-4 h-4 text-[#ea580c]" />
            <span>Interactive Campus Location</span>
          </div>
          <GoogleMapSection />
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
