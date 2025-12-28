import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Fungsi untuk konversi tipe data BigInt/Decimal jika diperlukan (khusus PostgreSQL/Prisma)
const formatData = (modelKey: string, item: any) => {
  if (modelKey === "Products") {
    return {
      productId: item.productId,
      name: item.name,
      Quantity: Number(item.Quantity),
      image: item.image || null,
      jenisKain: item.jenisKain || "Lainnya",
      warna: item.warna || "N/A",
      Desain: item.Desain || "-",
      width: Number(item.width) || 0,
      location: item.location || null,
    };
  }
  // Untuk model lain yang memiliki field 'amount' (misal Expense)
  if (item.amount) {
    return { ...item, amount: item.amount.toString() };
  }
  return item;
};

async function deleteAllData(orderedFileNames: string[]) {
  // Balik urutan: Hapus tabel anak (Sales) dulu baru tabel bapak (Products)
  const reversedFileNames = [...orderedFileNames].reverse();

  console.log("🗑️ Membersihkan database...");

  for (const fileName of reversedFileNames) {
    const modelBaseName = path.basename(fileName, path.extname(fileName));
    const modelKey =
      modelBaseName.charAt(0).toUpperCase() + modelBaseName.slice(1);

    const model: any = prisma[modelKey as keyof typeof prisma];
    if (model) {
      try {
        await model.deleteMany({});
        console.log(`   - Data ${modelKey} dibersihkan.`);
      } catch (error) {
        console.error(`❌ Gagal menghapus ${modelKey}:`, error);
      }
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  // URUTAN SANGAT PENTING: Master data (Users, Products) harus di atas Transaksi (Sales, Purchases)
  const orderedFileNames = [
    "users.json",
    "products.json",
    "expenseSummary.json",
    "salesSummary.json",
    "purchaseSummary.json",
    "expenses.json",
    "expenseByCategory.json",
    "sales.json", // Sales bergantung pada Products & Users
    "purchases.json", // Purchases bergantung pada Products
  ];

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File tidak ditemukan: ${fileName}, dilewati.`);
      continue;
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelBaseName = path.basename(fileName, path.extname(fileName));
    const modelKey =
      modelBaseName.charAt(0).toUpperCase() + modelBaseName.slice(1);
    const model: any = prisma[modelKey as keyof typeof prisma];

    if (!model) {
      console.error(`❌ Model ${modelKey} tidak ditemukan di Prisma Client.`);
      continue;
    }

    console.log(`📦 Mengimpor ${jsonData.length} data ke ${modelKey}...`);

    // Gunakan createMany untuk performa lebih cepat (Jika DB mendukung, misal PostgreSQL)
    // Jika SQLite, gunakan loop create biasa
    try {
      for (const item of jsonData) {
        await model.create({
          data: formatData(modelKey, item),
        });
      }
      console.log(`✅ ${modelKey} selesai.`);
    } catch (error) {
      console.error(`❌ Error saat seed ${modelKey}:`, error);
    }
  }
}

main()
  .catch((e) => {
    console.error("🔴 Proses Seeding Gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🏁 Koneksi database ditutup.");
  });
