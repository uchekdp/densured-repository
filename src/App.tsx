/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { PaymentModal } from './components/common/PaymentModal';
import { ToastContainer } from './components/common/ToastContainer';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { ServicesPage } from './components/pages/ServicesPage';
import { GalleryPage } from './components/pages/GalleryPage';
import { AdmissionPage } from './components/pages/AdmissionPage';
import { ContactPage } from './components/pages/ContactPage';
import { StudentPortal } from './components/portal/StudentPortal';
import { AdminPortal } from './components/portal/AdminPortal';
import { StudentRegistrationPage } from './components/pages/StudentRegistrationPage';
import { StudentLoginPage } from './components/pages/StudentLoginPage';
import { AdminLoginPage } from './components/pages/AdminLoginPage';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';

const MainContent: React.FC = () => {
  const { currentPage } = useApp();

  return (
    <main className="min-h-screen flex flex-col bg-white text-[#0f172a] selection:bg-[#0284c7] selection:text-white font-['Poppins',sans-serif]">
      <Navbar />

      <div className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'services' && <ServicesPage />}
        {currentPage === 'gallery' && <GalleryPage />}
        {currentPage === 'admission' && <AdmissionPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'register' && <StudentRegistrationPage />}
        {currentPage === 'student-login' && <StudentLoginPage />}
        {currentPage === 'admin-login' && <AdminLoginPage />}
        {currentPage === 'student-portal' && <StudentPortal />}
        {currentPage === 'admin-portal' && <AdminPortal />}
      </div>

      <Footer />
      <PaymentModal />
      <ToastContainer />
      <FloatingWhatsApp />
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

