import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  const handleClick = () => {
    const waUrl = 'https://wa.me/2348147896930?text=Hello%20D%20Ensured%20Consult,%20I%20would%20like%20to%20make%20an%20inquiry%20regarding%20the%202026/2027%20academic%20session.';
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 print:hidden">
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-[#0284c7] px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200 text-xs font-bold animate-bounce">
          <span>Chat on WhatsApp</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <button
        onClick={handleClick}
        aria-label="Chat with D Ensured Consult on WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white cursor-pointer"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#ea580c] text-[9px] font-black text-white items-center justify-center">
            1
          </span>
        </span>
        <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
      </button>
    </div>
  );
};
