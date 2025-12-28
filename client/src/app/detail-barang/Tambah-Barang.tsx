"use client";

import React, { useState } from "react";
import { X, Barcode, Save, TextCursorInput, ruler, Palette, MapPin, BadgeDollarSign, Layers } from "lucide-react";

type BarangFormData = {
  productId: string; // Barcode manual
  name: string;
  price: number;
  stockQuantity: number;
  jenisKain: string;
  warnaDesain: string;
  width: number;
  location: string;
};

type TambahBarangProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: BarangFormData) => void;
};

const TambahBarang = ({ isOpen, onClose, onCreate }: TambahBarangProps) => {
  const [formData, setFormData] = useState<BarangFormData>({
    productId: "",
    name: "",
    price: 0,
    stockQuantity: 0,
    jenisKain: "",
    warnaDesain: "",
    width: 0,
    location: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
    // Reset form setelah simpan
    setFormData({
      productId: "", name: "", price: 0, stockQuantity: 0,
      jenisKain: "", warnaDesain: "", width: 0, location: ""
    });
  };

  const labelCss = "block text-sm font-semibold text-gray-700 mb-1";
  const inputCss = "block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 border transition-all";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-white w-full max-w-lg shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Tambah Stok Kain</h2>
            <p className="text-indigo-100 text-xs">Masukkan data barcode dan spesifikasi kain secara manual.</p>
          </div>
          <button onClick={onClose} className="hover:bg-indigo-500 p-2 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* BARCODE & NAMA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCss}>Nomor Barcode</label>