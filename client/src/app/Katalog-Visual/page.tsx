"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useGetProductsQuery } from "@/state/api";
import { 
  Search, 
  Image as ImageIcon, 
  AlertCircle,
  Tag,
  History,
  Clock,
  X,
  Loader2,
  Mic,
  MicOff
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { toast } from "react-hot-toast";

const KatalogVisual = () => {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || ""; 

  // --- STATE ---
  const [searchText, setSearchText] = useState(urlSearch);
  const [debouncedSearch] = useDebounce(searchText, 500);
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { data: products, isLoading, isError } = useGetProductsQuery(debouncedSearch);
  const [hiddenKeys] = useState<string[]>([]);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  // --- FUNGSI HIGHLIGHT TEKS (Multi-Data) ---
  const highlightText = (text: string, query: string) => {
    if (!query.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="text-[#059669] underline decoration-2 underline-offset-2 decoration-emerald-300 font-black bg-emerald-50">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // --- FITUR VOICE SEARCH ---
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Browser Anda tidak mendukung Voice Search");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID"; // Set bahasa Indonesia
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchText(transcript);
      saveToHistory(transcript);
      toast.success(`Mencari: ${transcript}`);
    };

    recognition.onerror = () => {
      toast.error("Gagal mengenali suara");
      setIsListening(false);
    };

    recognition.start();
  };

  // --- LOGIKA HISTORY & CLICK OUTSIDE ---
  useEffect(() => {
    const saved = localStorage.getItem("visual_catalog_history");
    if (saved) setSearchHistory(JSON.parse(saved));

    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    const newHistory = [
      query.trim(),
      ...searchHistory.filter((h) => h !== query.trim()),
    ].slice(0, 6);
    setSearchHistory(newHistory);
    localStorage.setItem("visual_catalog_history", JSON.stringify(newHistory));
  };

  const visualArchive = useMemo(() => {
    if (!products) return [];
    const groups: { [key: string]: any } = {};
    products.forEach((product) => {
      const key = `${product.name}-${product.color || 'no-color'}`;
      if (!groups[key] && !hiddenKeys.includes(key)) {
        groups[key] = { ...product, key: key };
      }
    });
    return Object.values(groups);
  }, [products, hiddenKeys]);

  const getFullImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.replace(/^\/?(uploads|assets)\//, '');
    return `${baseUrl}/assets/${encodeURIComponent(cleanPath)}`;
  };

  return (
    <div className="mx-auto pb-20 w-full p-8 bg-[#fdfdfd] min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-[1000] tracking-tighter italic uppercase flex items-center gap-1">
            <span className="text-[#1a202c]">STOCK</span>
            <span className="text-[#059669]">VISION</span>
          </h1>
          
          <div className="flex items-center gap-2">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]"></span>
            </div>
            <span className="text-slate-500 text-[11px] font-[900] uppercase tracking-[0.15em]">
              {visualArchive.length} SKU TERDAFTAR DI ASSETS
            </span>
          </div>
        </div>

        {/* SEARCH BAR PREMIUM DENGAN VOICE SEARCH */}
        <div className="relative w-full md:w-[450px]" ref={searchContainerRef}>
          <div className={`flex items-center bg-white border rounded-[2rem] p-1.5 transition-all shadow-2xl shadow-indigo-100/50 
            ${isListening ? 'ring-4 ring-rose-500/20 border-rose-300' : 'border-gray-100 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-200'}`}>
            
            <div className="pl-4 text-slate-400">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </div>

            <input 
              type="text"
              placeholder={isListening ? "Mendengarkan..." : "Cari motif atau kain..."}
              className="flex-1 bg-transparent border-none outline-none px-4 font-bold text-slate-700 text-sm placeholder:text-slate-300"
              value={searchText}
              onFocus={() => setShowHistory(true)}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveToHistory(searchText);
                  setShowHistory(false);
                }
              }}
            />

            <div className="flex items-center gap-1 pr-2">
              {searchText && (
                <button onClick={() => setSearchText("")} className="p-2 text-slate-300 hover:text-rose-500">
                  <X size={16} />
                </button>
              )}
              <button 
                onClick={handleVoiceSearch}
                className={`p-2 rounded-full transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
          </div>

          {/* DROPDOWN HISTORY */}
          {showHistory && searchHistory.length > 0 && (
            <div className="absolute top-[115%] left-0 right-0 bg-white rounded-[2rem] shadow-2xl border border-gray-50 z-[50] overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="py-2">
                {searchHistory.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSearchText(query); setShowHistory(false); }}
                    className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-emerald-50 text-left group"
                  >
                    <Clock size={14} className="text-slate-300 group-hover:text-emerald-500" />
                    <span className="flex-1 font-bold text-slate-600 text-xs uppercase tracking-tight group-hover:text-emerald-700">{query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GRID KONTEN */}
      {isError ? (
        <div className="flex flex-col items-center justify-center py-40 text-rose-500">
          <AlertCircle size={40} className="mb-2" />
          <p className="font-black uppercase text-sm tracking-widest italic text-center">Gagal sinkronisasi data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {visualArchive.length > 0 ? (
            visualArchive.map((item: any, index: number) => {
              const fullImageUrl = getFullImageUrl(item.imageUrl);
              return (
                <div key={index} className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl hover:border-emerald-100 transition-all duration-500">
                  
                  {/* Image Container */}
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                    {fullImageUrl ? (
                      <img src={fullImageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" 
                        onError={(e) => (e.currentTarget.src = "https://placehold.co/400x400?text=No+Image")}/>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-200">
                        <ImageIcon size={48} strokeWidth={1} />
                        <span className="text-[9px] font-black mt-3 tracking-[0.3em] uppercase">No Archive</span>
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="p-6 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Tag size={10} className="text-emerald-500" />
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                        {highlightText(item.category || "General", debouncedSearch)}
                      </span>
                    </div>
                    
                    {/* Highlighted Name */}
                    <h3 className="text-sm font-[1000] text-slate-800 uppercase leading-tight line-clamp-1 mb-3 italic tracking-tighter">
                      {highlightText(item.name, debouncedSearch)}
                    </h3>

                    {/* Highlighted Color/Variant */}
                    <div className="inline-block px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                        {highlightText(item.color || "Full Variant", debouncedSearch)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-200 opacity-50">
              <Search size={80} strokeWidth={1} className="mb-4 animate-bounce" />
              <p className="font-black uppercase tracking-[0.5em] text-xs">Arsip Tidak Ditemukan</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KatalogVisual;