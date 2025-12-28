"use client";

import { useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit, Trash2, PlusCircle } from "lucide-react";
import { useState } from "react";
import EditProductModal from "./EditProductModal";

const DetailBarang = () => {
  const { data: products, isLoading, isError } = useGetProductsQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kain ini secara permanen?")) {
      await deleteProduct(productId);
    }
  };

  const handleSave = async (formData: any) => {
    if (isEditMode) {
      await updateProduct({ productId: formData.productId, updatedProduct: formData });
    } else {
      await createProduct(formData);
    }
    setIsModalOpen(false);
  };

  if (isLoading) return <div className="p-8 text-center font-bold">Mengsinkronkan data gudang AI...</div>;

  const columns: GridColDef[] = [
    { field: "productId", headerName: "Barcode", width: 130 },
    { field: "name", headerName: "Nama Kain", width: 180 },
    { field: "jenisKain", headerName: "Jenis", width: 110 },
    { field: "Quantity", headerName: "Stok (Roll)", width: 100, type: "number" },
    { field: "warna", headerName: "Warna", width: 130 },
    { field: "Desain", headerName: "Desain", width: 130 },
    { field: "location", headerName: "Lokasi", width: 100 },
    {
      field: "actions",
      headerName: "Aksi",
      width: 120,
      renderCell: (params) => (
        <div className="flex gap-2 items-center h-full">
          <button onClick={() => handleEdit(params.row)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-full transition-colors">
            <Edit size={18} />
          </button>
          <button onClick={() => handleDelete(params.row.productId)} className="text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <Header name="Manajemen Detail Barang" />
        <button onClick={handleAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-200 transition-all">
          <PlusCircle size={20} />
          Tambah Kain
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <DataGrid
          rows={products || []}
          columns={columns}
          getRowId={(row) => row.productId}
          className="min-h-[500px] border-none"
          sx={{
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f8fafc", color: "#475569", fontWeight: "bold" },
            "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9" },
          }}
        />
      </div>

      <EditProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedProduct}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default DetailBarang;