import React, { useState, useEffect } from 'react';
import { mediaApi } from '../../services/api';
import { Image as ImageIcon, Sparkles, Maximize2, X, Filter } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const categories = [
    'All',
    'Classroom',
    'Students',
    'Academic Activities',
    'CBT',
    'Events',
    'Learning Sessions',
  ];

  useEffect(() => {
    setLoading(true);
    mediaApi.getGallery().then((res) => {
      if (res.ok && res.data && Array.isArray(res.data.gallery)) {
        setItems(res.data.gallery.filter((g: any) => g.image_url));
      }
      setLoading(false);
    });
  }, []);

  const filteredItems =
    activeCategory === 'All'
      ? items
      : items.filter((item) => item.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="w-full bg-[#f8fafc] pb-20 font-['Poppins',sans-serif]">
      {/* Header */}
      <section className="bg-gradient-to-b from-sky-50 via-white to-sky-50 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 text-center space-y-4 border-b-2 border-sky-100">
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-[#0284c7] text-xs font-bold border border-sky-200">
            <Sparkles className="w-4 h-4 text-[#0284c7]" />
            <span>Campus Activities &amp; Academic Learning Suites</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Academy Gallery
          </h1>
          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Photographs and media documentation from our lecture halls, 120-seat computer testing laboratory, and
            academic achievement ceremonies.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#0284c7] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-sky-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading academy gallery...</div>
        ) : filteredItems.length > 0 ? (
          /* Gallery Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group bg-white rounded-3xl overflow-hidden border-2 border-slate-200 hover:border-[#0284c7] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  <img
                    src={item.image_url || 'https://i.ibb.co/WNYJfXGK/de-ensured-3.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#0284c7] text-white shadow-xs">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-xs">
                      <Maximize2 className="w-5 h-5 text-white" />
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-1">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#0284c7] transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Exact Empty State (Requirement 13) */
          <div className="p-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center space-y-3 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-slate-400 flex items-center justify-center mx-auto">
              <ImageIcon className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              Academy gallery images will appear here.
            </h3>
            <p className="text-xs text-slate-500">
              Photographs uploaded and published by the directorate will be displayed dynamically in this section.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-16/10 w-full bg-black">
              <img
                src={selectedItem.image_url || 'https://i.ibb.co/WNYJfXGK/de-ensured-3.jpg'}
                alt={selectedItem.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6 space-y-2 bg-white">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-[#0284c7] uppercase">
                {selectedItem.category}
              </span>
              <h3 className="text-lg font-bold text-slate-900">{selectedItem.title}</h3>
              {selectedItem.description && (
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {selectedItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
