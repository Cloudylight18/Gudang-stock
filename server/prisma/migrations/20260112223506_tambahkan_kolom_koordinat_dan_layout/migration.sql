/*
  Warnings:

  - You are about to drop the column `price` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the `PurchaseSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Purchases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesSummary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Purchases" DROP CONSTRAINT "Purchases_productId_fkey";

-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_productId_fkey";

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "price",
DROP COLUMN "rating",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "coordinateX" INTEGER,
ADD COLUMN     "coordinateY" INTEGER,
ADD COLUMN     "design" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "quality" TEXT,
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'Meter',
ALTER COLUMN "stockQuantity" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "PurchaseSummary";

-- DropTable
DROP TABLE "Purchases";

-- DropTable
DROP TABLE "Sales";

-- DropTable
DROP TABLE "SalesSummary";

-- CreateTable
CREATE TABLE "BarangMasuk" (
    "masukId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jumlah" DOUBLE PRECISION NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "BarangMasuk_pkey" PRIMARY KEY ("masukId")
);

-- CreateTable
CREATE TABLE "BarangKeluar" (
    "keluarId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jumlah" DOUBLE PRECISION NOT NULL,
    "penerima" TEXT,

    CONSTRAINT "BarangKeluar_pkey" PRIMARY KEY ("keluarId")
);

-- CreateTable
CREATE TABLE "OperasionalSummary" (
    "summaryId" TEXT NOT NULL,
    "totalMasuk" DOUBLE PRECISION NOT NULL,
    "totalKeluar" DOUBLE PRECISION NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperasionalSummary_pkey" PRIMARY KEY ("summaryId")
);

-- AddForeignKey
ALTER TABLE "BarangMasuk" ADD CONSTRAINT "BarangMasuk_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarangKeluar" ADD CONSTRAINT "BarangKeluar_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;
