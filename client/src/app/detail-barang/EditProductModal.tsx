"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

type ProductFormData = {
  productId: string;
  name: string;
  Quantity: number;
  jenisKain: string;
  warna: string;
  Desain: string;
  width: number;
  location: string;
};

type EditProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ProductFormData) => void;
  initialData?: ProductFormData | null;
  isEditMode: boolean;
};

const EditProductModal = ({ isOpen, onClose, onSave, initialData, isEditMode }: EditProductModalProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    productId: "",
    name: "",
    Quantity: 0,
    jenisKain: "",
    warna: "",
    Desain: "",
    width: 0,
    location: "",
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ productId: "", name: "", Quantity: 0, jenisKain: "", warna: "", Desain: "", width: 0, location: "" });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? "Edit Data Kain" : "Tambah Kain Baru"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Barcode / ID Produk</label>
              <input
                disabled={isEditMode}
                type="text"
                className={`w-full rounded-lg border p-2 mt-1 ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
              <input
                type="text"
                className="w-full rounded-lg border p-2 mt-1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jenis Kain</label>
              <input
                type="text"
                placeholder="Contoh: Katun"
                className="w-full rounded-lg border p-2 mt-1"
                value={formData.jenisKain}
                onChange={(e) => setFormData({ ...formData, jenisKain: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stok (Roll)</label>
              <input
                type="number"
                className="w-full rounded-lg border p-2 mt-1"
                value={formData.Quantity}
                onChange={(e) => setFormData({ ...formData, Quantity: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Warna</label>
              <input
                type="text"
                className="w-full rounded-lg border p-2 mt-1"
                value={formData.warna}
                onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Desain</label>
              <input
                type="text"
                className="w-full rounded-lg border p-2 mt-1"
                value={formData.Desain}
                onChange={(e) => setFormData({ ...formData, Desain: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lebar (cm)</label>
              <input
                type="number"
                className="w-full rounded-lg border p-2 mt-1"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lokasi Rak</label>
              <input
                type="text"
                placeholder="A-01"
                className="w-full rounded-lg border p-2 mt-1"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg px-6 py-2 text-gray-600 hover:bg-gray-100 transition-all">Batal</button>
            <button type="submit" className="rounded-lg bg-indigo-600 px-6 py-2 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">Simpan Data</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;