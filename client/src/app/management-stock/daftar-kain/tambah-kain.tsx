"use client";

import React, { ChangeEvent, FormEvent, useState, useRef, useEffect } from "react";
import { X, CheckCircle2, Loader2, UploadCloud, Info, AlignLeft, Hash, Ruler, Layers } from "lucide-react";
import { useCreateProductMutation, useUpdateProductMutation } from "@/state/api";
import { toast } from "react-hot-toast";

type TambahKainProps = {
  isOpen: boolean;
  onClose: () => void;
  isInline?: boolean;
  initialData?: any;
};

const TambahKain = ({ isOpen, onClose, isInline = false, initialData }: TambahKainProps) => {
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!initialData;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  // --- STATE DATA LENGKAP ---
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    stockQuantity: 0,
    unit: "YARD",
    color: "",
    category: "", 
    quality: "L1",
    kombinasi: "",
    location: "", 
    description: "", 
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // --- SINKRONISASI DATA EDIT/TAMBAH ---
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({ 
        productId: initialData.productId || "",
        name: initialData.name || "",
        stockQuantity: initialData.stockQuantity || 0,
        unit: initialData.unit || "YARD",
        color: initialData.color || "",
        category: initialData.category || "",
        quality: initialData.quality || "L1",
        kombinasi: initialData.kombinasi || "",
        location: initialData.location || "",
        description: initialData.description || "", 
      });

      if (initialData.imageUrl) {
        const cleanFileName = initialData.imageUrl.replace(/^\/?(assets|uploads)\//, '');
        setImagePreview(`${baseUrl}/assets/${cleanFileName}`);
      }
    } else {
      setFormData({ 
        productId: "", 
        name: "", 
        stockQuantity: 0, 
        unit: "YARD", 
        color: "", 
        category: "", 
        quality: "L1",
        kombinasi: "", 
        location: "",
        description: "",
      });
      setImagePreview(null);
      setSelectedImage(null);
    }
  }, [initialData, isOpen, baseUrl]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { 
        ...prev, 
        [name]: name === "stockQuantity" ? parseFloat(value) : value 
      };
      // Reset kombinasi jika bukan PRINTING
      if (name === "category" && value !== "PRINTING") {
        newData.kombinasi = "";
      }
      return newData;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) return toast.error("Pilih Kategori Produk!");
    if (formData.category === "PRINTING" && !formData.kombinasi) {
        return toast.error("Kain Printing wajib memilih tipe Kombinasi!");
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      // Jangan kirim productId jika mode Tambah (biar Backend generate 26A201...)
      if (key === "productId" && !isEditMode) return; 
      data.append(key, value !== null && value !== undefined ? value.toString() : "");
    });
    
    if (selectedImage) {
        data.append("image", selectedImage);
    }

    try {
      if (isEditMode) {
        await updateProduct({ productId: initialData.productId, formData: data }).unwrap();
        toast.success("Data Berhasil Diperbarui!");
      } else {
        await createProduct(data).unwrap();
        toast.success("Produk Berhasil Didaftarkan!");
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal simpan ke database.");
    }
  };

  if (!isOpen && !isInline) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-4xl relative overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors">
            <X size={28}/>
        </button>
        
        <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-800 uppercase italic">
            {isEditMode ? "Modifikasi" : "Registrasi"} <span className="text-emerald-600">Produk</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">
                Sistem Barcode: 26A201XXXX (Otomatis)
            </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* PHOTO SECTION */}
          <div className="md:col-span-1">
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full h-80 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all overflow-hidden group relative"
            >
              {imagePreview ? (
                <>
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <UploadCloud className="text-white" size={32} />
                    </div>
                </>
              ) : (
                <>
                  <UploadCloud className="text-slate-300 group-hover:text-emerald-400 mb-2" size={48} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4">Upload Foto Produk</p>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) { 
                setSelectedImage(file); 
                setImagePreview(URL.createObjectURL(file)); 
              }
            }} />
          </div>

          {/* FORM FIELDS SECTION */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            
            {/* Barcode ID */}
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-1">
                <Hash size={10}/> Barcode ID
              </label>
              <input 
                name="productId" 
                value={isEditMode ? formData.productId : "OTOMATIS OLEH SISTEM"} 
                className={`w-full p-4 rounded-2xl font-bold border-2 outline-none transition-all ${isEditMode ? 'bg-slate-100 text-slate-500 border-transparent' : 'bg-emerald-50 text-emerald-600 italic border-emerald-100'}`} 
                disabled 
              />
            </div>

            {/* Nama Produk */}
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nama Kain / Produk</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all" placeholder="Input nama produk..." required />
            </div>

            {/* Kategori */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Kategori</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all cursor-pointer" required>
                <option value="">-- PILIH --</option>
                <option value="POLOSAN">POLOSAN</option>
                <option value="PRINTING">PRINTING</option>
              </select>
            </div>

            {/* Kombinasi */}
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-2 tracking-widest flex items-center gap-1 ${formData.category === 'PRINTING' ? 'text-emerald-600' : 'text-slate-300'}`}>
                <Layers size={10}/> Kombinasi
              </label>
              <select 
                name="kombinasi" 
                value={formData.kombinasi} 
                onChange={handleChange} 
                disabled={formData.category !== 'PRINTING'}
                className={`w-full p-4 rounded-2xl font-bold outline-none border-2 transition-all ${
                  formData.category === 'PRINTING' 
                  ? 'bg-emerald-50 border-emerald-100 focus:border-emerald-500 text-emerald-700' 
                  : 'bg-slate-100 border-transparent text-slate-300 cursor-not-allowed'
                }`}
              >
                <option value="">-- PILIH --</option>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((item) => (
                  <option key={item} value={item}>Kombinasi {item}</option>
                ))}
              </select>
            </div>

            {/* Stock Quantity */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Jumlah Stock</label>
              <input type="number" name="stockQuantity" value={formData.stockQuantity || ""} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all" placeholder="0" required />
            </div>

            {/* Unit */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-1">
                <Ruler size={10}/> Satuan
              </label>
              <select name="unit" value={formData.unit} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all cursor-pointer">
                <option value="YARD">YARD</option>
                <option value="METER">METER</option>
                <option value="PCS">PCS</option>
              </select>
            </div>

            {/* Quality Grade */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Grade</label>
              <select name="quality" value={formData.quality} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all cursor-pointer">
                <option value="L1">L1 (Grade A)</option>
                <option value="L2">L2 (Grade B)</option>
                <option value="L3">L3 (Grade C)</option>
                <option value="L4">L4 (Grade D)</option>
              </select>
            </div>

            {/* Warna */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Desain warna/motif</label>
              <input name="color" value={formData.color} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all" placeholder="Warna dominan..." />
            </div>

            {/* Deskripsi (Full Width) */}
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-1">
                <AlignLeft size={10} /> Deskripsi Detail Motif (Untuk AI Search)
              </label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={3}
                className="w-full p-4 bg-slate-50 rounded-2xl font-medium text-slate-700 border-2 border-transparent focus:border-emerald-500 outline-none transition-all resize-none" 
                placeholder="Contoh: Motif bunga mawar kecil, dasar warna navy, tekstur kain jatuh dan licin..."
              />
            </div>
          </div>

          {/* AI Info Panel */}
          <div className="md:col-span-3 bg-slate-900 p-5 rounded-3xl flex gap-4 items-center">
            <div className="p-2 bg-emerald-500 rounded-lg">
                <Info className="text-white" size={20} />
            </div>
            <div>
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Optimasi Pencarian AI</p>
                <p className="text-[11px] font-bold text-slate-300 leading-tight mt-0.5">
                    Isi deskripsi secara detail. AI Groq akan mencocokkan teks deskripsi Anda dengan gambar saat melakukan Smart Search.
                </p>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isCreating || isUpdating} 
            className="md:col-span-3 bg-emerald-500 text-white p-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[12px] hover:bg-slate-900 active:scale-[0.97] transition-all flex justify-center items-center gap-3 shadow-xl shadow-emerald-500/10"
          >
            {isCreating || isUpdating ? (
              <Loader2 className="animate-spin" /> 
            ) : (
              <CheckCircle2 size={20} />
            )}
            {isEditMode ? "Perbarui Data Asset" : "Daftarkan Ke Gudang"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TambahKain;