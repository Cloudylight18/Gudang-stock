"use client";

import { useGetProductsQuery } from "@/state/api";
import { MapPin, Loader2, Hash, Clock, Sparkles, ScanEye, Package, ArrowRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const CardPopularProducts = () => {
  const { data: products, isLoading } = useGetProductsQuery();
  const [isMounted, setIsMounted] = useState(false);
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  // Mencegah hydration error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayProducts = React.useMemo(() => {
    if (!products) return [];
    
    return [...products]
      .sort((a, b) => {
        // Sortir berdasarkan waktu pembuatan terbaru
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 6);
  }, [products]);

  const getImageUrl = (path: string) => {
    if (!path) return "/android-chrome-512x512.png";
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\/?(assets|uploads)\//, '');
    return `${baseUrl}/assets/${cleanPath}`;
  };

  if (!isMounted) return null;

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-xl rounded-[2.5rem] flex flex-col overflow-hidden border border-slate-100 h-full">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-10">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Syncing AI Assets...</p>
        </div>
      ) : (
        <>
          {/* HEADER SECTION */}
          <div className="px-7 pt-6 pb-4 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                Daftar <span className="text-emerald-600">Kain</span>
              </h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                <Clock size={10} /> 6 Input Terupdate
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md text-[8px] font-black uppercase">
                <Sparkles size={10} /> AI Active
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                Live
              </div>
            </div>
          </div>

          {/* LIST SECTION */}
          <div className="overflow-auto flex-1 custom-scrollbar">
            {displayProducts.length > 0 ? (
              displayProducts.map((product, index) => (
                <div 
                  key={product.productId} 
                  className="flex items-center justify-between gap-3 px-6 py-5 border-b border-slate-50 hover:bg-slate-50/80 transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    {/* ASSET IMAGE WITH AI BADGE */}
                    <div className="relative w-14 h-14 flex-shrink-0 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                      <Image
                        src={getImageUrl(product.imageUrl || "")}
                        alt={product.name}
                        fill
                        sizes="56px"
                        priority={index < 2} // Optimasi LCP untuk item teratas
                        className="object-cover transition-transform group-hover:scale-110 duration-500"
                        unoptimized
                      />
                      {product.imageVector && (
                        <div className="absolute top-1 right-1 bg-indigo-500 text-white p-0.5 rounded-full shadow-lg z-10">
                          <ScanEye size={8} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                      <div className="flex items-center gap-1">
                         <Hash size={10} className="text-emerald-500" />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                           {product.productId}
                         </span>
                      </div>
                      <div className="font-black text-slate-800 uppercase italic text-sm truncate">
                        {product.name}
                      </div>
                      
                      {product.description && (
                        <p className="text-[10px] text-slate-400 line-clamp-1 italic font-medium leading-tight mb-1">
                          "{product.description}"
                        </p>
                      )}

                      <div className="flex text-[9px] items-center text-slate-500 font-bold uppercase tracking-tight">
                        <MapPin className="w-3 h-3 mr-1 text-orange-500" />
                        <span className="truncate">{product.location || "No Layout"}</span>
                        <span className="mx-2 text-slate-200">|</span>
                        <span className="text-indigo-600 font-black">{product.quality || "L1"}</span>
                      </div>
                    </div>
                  </div>

                  {/* STOCK INFO */}
                  <div className="text-right flex flex-col items-end flex-shrink-0 ml-2">
                    <div className="flex items-center text-slate-900 font-black text-base italic leading-none mb-1">
                      {(product.stockQuantity ?? 0).toLocaleString()}
                      <span className="ml-1 text-[9px] uppercase not-italic text-slate-400">{product.unit || "Yd"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-10 opacity-50">
                <Package size={40} className="text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase italic">Belum ada data kain</p>
              </div>
            )}
          </div>
          
          {/* FOOTER */}
          <div className="p-4 bg-slate-50/30 border-t border-slate-50">
             <button className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 hover:gap-3 transition-all">
                Lihat Semua Inventori <ArrowRight size={12} />
             </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CardPopularProducts;