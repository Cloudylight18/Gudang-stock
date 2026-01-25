/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "stockQuantity" SET DEFAULT 0,
ALTER COLUMN "quality" SET DEFAULT 'L1';

-- CreateIndex
CREATE INDEX "BarangKeluar_productId_idx" ON "BarangKeluar"("productId");

-- CreateIndex
CREATE INDEX "BarangMasuk_productId_idx" ON "BarangMasuk"("productId");

-- CreateIndex
CREATE INDEX "Products_category_idx" ON "Products"("category");

-- CreateIndex
CREATE INDEX "Products_kombinasi_idx" ON "Products"("kombinasi");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
