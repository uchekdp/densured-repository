import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WebsitePageTarget, GalleryItem } from '../../types';
import { Image, ChevronRight, Maximize2, Sparkles, X } from 'lucide-react';

interface PageImageShowcaseProps {
  page: WebsitePageTarget;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const PageImageShowcase: React.FC<PageImageShowcaseProps> = ({
  page,
  title,
  subtitle,
  compact = false,
}) => {
  const { galleryItems } = useApp();
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Filter images assigned to this page or sitewide 'all'
  const pageImages = galleryItems.filter(
    (item) => item.page === page || item.page === 'all'
  );

  if (pageImages.length === 0) return null;

  const defaultTitle =
    page === 'about'
      ? 'Campus & Academic Life at D Ensured'
      : page === 'services'
      ? 'Facilities & Program Learning Environments'
      : page === 'admission'
      ? 'Our Learning Center & CBT Testing Facilities'
      : page === 'contact'
      ? 'Visit Our Lagos Learning Hub'
      : 'Campus Facilities & Photo Highlights';

  const defaultSubtitle =
    'Real photos from our accredited CBT centers, lecture suites, and student achievement ceremonies.';

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-2 border-sky-100 pb-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-[10px] font-black uppercase tracking-wider border border-sky-300">
            <Sparkles className="w-3 h-3 text-sky-600" />
            <span>Campus Media</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-sky-600">
            {title || defaultTitle}
          </h3>
          <p className="text-sky-800 text-xs sm:text-sm font-semibold">
            {subtitle || defaultSubtitle}
          </p>
        </div>
        <span className="text-xs font-bold text-sky-700 self-start sm:self-auto bg-sky-100 px-3 py-1 rounded-full">
          {pageImages.length} {pageImages.length === 1 ? 'Photo' : 'Photos'}
        </span>
      </div>

      {/* Grid Display */}
      <div
        className={`grid gap-4 ${
          compact
            ? 'grid-cols-2 sm:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {pageImages.map((img) => (
          <div
            key={img.id}
            onClick={() => setSelectedImage(img)}
            className="group relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 hover:border-[#D5241B] shadow-xs hover:shadow-lg transition-all cursor-pointer aspect-4/3 flex flex-col justify-end"
          >
            <img
              src={img.imageUrl || 'https://i.ibb.co/WNYJfXGK/de-ensured-3.jpg'}
              alt={img.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://i.ibb.co/WNYJfXGK/de-ensured-3.jpg';
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-colors" />

            {/* Badge top-left */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-[#D5241B] text-white text-[9.5px] font-black uppercase tracking-wider shadow-xs">
                {img.category}
              </span>
              {img.year && (
                <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold backdrop-blur-xs">
                  {img.year}
                </span>
              )}
            </div>

            {/* Expand icon top-right */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs text-white flex items-center justify-center">
                <Maximize2 className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Bottom Info */}
            <div className="relative p-3.5 space-y-1 text-white z-10">
              <h4 className="font-bold text-xs sm:text-sm leading-tight text-white drop-shadow-xs line-clamp-1">
                {img.title}
              </h4>
              {img.caption && (
                <p className="text-[11px] text-white/80 line-clamp-1 font-medium">
                  {img.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Zoom Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/10 bg-black">
              <img
                src={selectedImage.imageUrl || 'https://i.ibb.co/WNYJfXGK/de-ensured-3.jpg'}
                alt={selectedImage.title}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center font-black hover:bg-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-white space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#25166B] text-white text-[10px] font-black uppercase">
                  {selectedImage.category}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {selectedImage.year || '2026/2027 Academic Session'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#25166B]">
                {selectedImage.title}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {selectedImage.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
