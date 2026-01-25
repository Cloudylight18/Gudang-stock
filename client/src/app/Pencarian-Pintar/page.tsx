"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, X, Search, Upload, 
  Sparkles, BrainCircuit, Footprints,
  Image as ImageIcon, History, Mic, MicOff,
  MapPin, Hash, Palette, Package, Loader2,
  Trash2, Clock
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const SmartInventoryAI = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [aiMetadata, setAiMetadata] = useState<any>(null);
  const [command, setCommand] = useState(""); 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lastSearchedImage, setLastSearchedImage] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  // --- FUNGSI HIGHLIGHT (FITUR BARU) ---
  const highlightText = (text: string, highlightWords: string[]) => {
    if (!highlightWords || highlightWords.length === 0) return text;
    
    // Gabungkan keywords menjadi regex (case-insensitive)
    const regex = new RegExp(`(${highlightWords.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="text-indigo-600 underline decoration-2 underline-offset-4">{part}</span>
      ) : part
    );
  };

  // --- LOGIKA VOICE RECOGNITION ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "id-ID";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCommand(transcript);
        setIsListening(false);
        handleExecuteSearch(transcript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return toast.error("Voice Search tidak didukung browser ini");
    isListening ? recognitionRef.current.stop() : (setIsListening(true), recognitionRef.current.start());
  };

  // --- LOGIKA HISTORY ---
  useEffect(() => {
    const savedHistory = localStorage.getItem("search_history");
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
    
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 6);
    setSearchHistory(newHistory);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  const removeHistoryItem = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== itemToRemove);
    setSearchHistory(newHistory);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  const clearAllHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("search_history");
    toast.success("Riwayat pencarian dihapus");
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://placehold.co/400x600?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    const fileName = imagePath.split('/').pop();
    return `${baseUrl}/assets/${fileName}`;
  };

  // --- LOGIKA EXECUTE SEARCH ---
  const handleExecuteSearch = async (overrideQuery?: string) => {
    const queryText = overrideQuery || instruction || command;
    if (!selectedFile && !queryText.trim()) return toast.error("Masukkan teks atau gambar");
    
    setLoading(true);
    setAiMetadata(null);
    setShowUploadPanel(false);
    setIsFocused(false);

    try {
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("message", queryText); 
        setLastSearchedImage(preview);
        response = await axios.post(`${baseUrl}/vision/search-image`, formData);
      } else {
        setLastSearchedImage(null);
        response = await axios.post(`${baseUrl}/vision/search-text`, { query: queryText });
      }

      if (response.data.success) {
        setItems(response.data.results);
        setAiMetadata({
          detectedType: response.data.phrasesFound?.[0] || response.data.metadata?.detectedKeywords?.[0] || "Kain Terdeteksi",
          keywords: response.data.extractedKeywords || response.data.metadata?.detectedKeywords || [],
          matchConfidence: "98.5%"
        });
        saveToHistory(queryText);
        toast.success(`Ditemukan ${response.data.results.length} SKU`);
      }
    } catch (err: any) {
      toast.error("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
      setSelectedFile(null);
      setPreview(null);
      setInstruction("");
      setCommand("");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-6 max-w-[1400px] mx-auto min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col items-center my-6 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-2 mb-2">
           <div className="h-[1px] w-8 bg-slate-300"></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">AI-Powered Inventory</span>
           <div className="h-[1px] w-8 bg-slate-300"></div>
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter text-[#1A2238] flex items-center gap-3">
          STOCK <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-600">VISION</span>
          <span className="not-italic bg-[#1A2238] text-white text-[10px] px-3 py-1 rounded-full font-black shadow-lg shadow-indigo-200">PRO v2</span>
        </h1>
      </div>

      {/* SEARCH BAR & HISTORY DROPDOWN */}
      <div className="max-w-2xl mx-auto w-full mb-8 relative z-[100]" ref={historyRef}>
        <div className={`bg-white/80 backdrop-blur-md p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 flex items-center gap-2 transition-all duration-500 ${isFocused ? 'border-indigo-500 ring-8 ring-indigo-500/5' : 'border-white'}`}>
          <Search className={`ml-4 transition-colors ${isFocused ? 'text-indigo-500' : 'text-slate-400'}`} size={20} />
          <input 
            className="flex-1 bg-transparent outline-none font-bold text-slate-700 px-2 placeholder:text-slate-300 text-lg"
            placeholder={isListening ? "Mendengarkan suara Anda..." : "Cari kain, motif, atau barcode..."}
            value={command}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch()}
          />
          <button onClick={toggleListening} className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse scale-110 shadow-lg shadow-red-200' : 'text-slate-400 hover:bg-slate-100'}`}>
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button onClick={() => setShowUploadPanel(true)} className="p-3 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Camera size={20} />
          </button>
          <button onClick={() => handleExecuteSearch()} className="bg-gradient-to-br from-[#1A2238] to-[#2A334D] text-white px-10 py-4 rounded-full font-black text-xs tracking-widest hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-95">
            SEARCH
          </button>
        </div>

        {/* DROPDOWN HISTORY */}
        {isFocused && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-4">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-50 mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Pencarian Terakhir</span>
              </div>
              <button onClick={clearAllHistory} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors">
                Clear All
              </button>
            </div>
            <div className="space-y-1">
              {searchHistory.map((item, index) => (
                <div key={index} onClick={() => { setCommand(item); handleExecuteSearch(item); }} className="group flex items-center justify-between px-6 py-4 hover:bg-indigo-50 rounded-2xl cursor-pointer transition-all">
                  <div className="flex items-center gap-4">
                    <History size={16} className="text-slate-300 group-hover:text-indigo-500" />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-900 uppercase tracking-tight">{item}</span>
                  </div>
                  <button onClick={(e) => removeHistoryItem(e, item)} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-400 rounded-xl transition-all">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-500">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute w-16 h-16 border-[3px] border-emerald-100 border-b-emerald-500 rounded-full animate-spin-slow"></div>
            <div className="absolute">
              <Sparkles className="text-indigo-600 animate-pulse" size={28} />
            </div>
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-lg font-black text-[#1A2238] italic tracking-tighter">MENGANALISIS RADAR STOK</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-4">Artificial Intelligence Engine Running</p>
          </div>
        </div>
      )}

      {/* RESULTS AREA */}
      {!loading && items.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white rounded-[2.5rem] p-8 mb-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <BrainCircuit size={120} />
            </div>
            {lastSearchedImage && (
              <div className="relative">
                <img src={lastSearchedImage} className="w-32 h-32 rounded-[2rem] object-cover ring-8 ring-slate-50 shadow-2xl z-10 relative" alt="Target" />
                <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-emerald-500 rounded-[2.2rem] blur opacity-20"></div>
              </div>
            )}
            <div className="flex-1 relative z-10 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <div className="bg-emerald-100 p-1 rounded-md">
                  <Sparkles size={14} className="text-emerald-600" />
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Vision Match Accuracy 98.5%</span>
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Kategori: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 uppercase italic">{aiMetadata?.detectedType}</span></h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                {aiMetadata?.keywords.map((k: string, i: number) => (
                  <span key={i} className="px-4 py-1.5 bg-indigo-50/50 rounded-xl text-[10px] font-black text-indigo-600 border border-indigo-100/50 uppercase tracking-tighter">#{k}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item: any) => (
              <div key={item.productId} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500">
                <div className="h-64 bg-slate-100 relative overflow-hidden">
                  <img src={getImageUrl(item.imageUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.name} />
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Hash size={14} className="text-indigo-500" />
                      <span className="text-[10px] font-black tracking-widest uppercase">SKU-{item.productId}</span>
                    </div>
                  </div>

                  {/* NAMA DENGAN HIGHLIGHT (FITUR BARU) */}
                  <h3 className="text-xl font-black text-[#1A2238] uppercase leading-[1.1] mb-6 line-clamp-2 h-12 group-hover:text-indigo-600 transition-colors">
                    {highlightText(item.name, aiMetadata?.keywords || [])}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Warna/Motif</p>
                        <p className="text-[11px] font-black text-indigo-900 uppercase truncate">
                          {highlightText(item.motif || item.color || "Printing", aiMetadata?.keywords || [])}
                        </p>
                    </div>
                    <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100/50">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Lokasi Rak</p>
                        <p className="text-[11px] font-black text-orange-900 uppercase truncate">{item.location || item.layout?.rackCode || "RAK-B2"}</p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Current Stock</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-[#1A2238] italic tracking-tighter">{item.stockQuantity}</span>
                        <span className="text-xs font-black text-slate-400 uppercase">Yards</span>
                      </div>
                    </div>
                    <button className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-indigo-600 transition-all shadow-lg">
                       <Package size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL SCANNER */}
      {showUploadPanel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1A2238]/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-lg shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <button onClick={() => setShowUploadPanel(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <X size={24}/>
            </button>
            <div className="mb-10 text-center">
              <div className="inline-block p-5 bg-indigo-50 rounded-[2rem] mb-5 text-indigo-600">
                <BrainCircuit size={40} />
              </div>
              <h2 className="text-3xl font-black italic text-[#1A2238] uppercase tracking-tighter">Visual AI Scanner</h2>
            </div>
            
            <div onClick={() => fileInputRef.current?.click()} className={`group border-4 border-dashed rounded-[3rem] p-12 text-center cursor-pointer transition-all ${preview ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
              {preview ? (
                <img src={preview} className="h-56 w-56 object-cover mx-auto rounded-[2.5rem] shadow-2xl border-4 border-white" alt="Preview"/>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload size={32} className="text-indigo-600 mb-4" />
                  <p className="font-black text-indigo-600 uppercase text-xs">Klik atau Seret Gambar</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if(file) { setSelectedFile(file); setPreview(URL.createObjectURL(file)); }
              }} />
            </div>

            <div className="mt-10 space-y-4">
              <input className="w-full p-6 bg-slate-50 rounded-[2rem] outline-none font-bold text-slate-700 border-2 border-transparent focus:border-indigo-500 text-sm shadow-inner" placeholder="Tambahkan instruksi (opsional)..." value={instruction} onChange={(e) => setInstruction(e.target.value)} />
              <button onClick={() => handleExecuteSearch()} disabled={!selectedFile} className="w-full bg-gradient-to-r from-[#1A2238] to-[#3B4664] text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:shadow-2xl disabled:opacity-30 transition-all">
                JALANKAN ANALISIS PINTAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartInventoryAI;