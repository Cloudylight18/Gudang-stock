/*
  Warnings:

  - The `unit` column on the `Products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('POLOSAN', 'PRINTING');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('METER', 'YARD');

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "category" "CategoryType" NOT NULL DEFAULT 'POLOSAN',
ALTER COLUMN "quality" SET DEFAULT 'L1',
DROP COLUMN "unit",
ADD COLUMN     "unit" "UnitType" NOT NULL DEFAULT 'YARD';

-- CreateTable
CREATE TABLE "Layouts" (
    "layoutId" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "baris" TEXT NOT NULL,
    "kolom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Layouts_pkey" PRIMARY KEY ("layoutId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Layouts_baris_kolom_key" ON "Layouts"("baris", "kolom");

-- CreateIndex
CREATE INDEX "Products_location_idx" ON "Products"("location");

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_location_fkey" FOREIGN KEY ("location") REFERENCES "Layouts"("layoutId") ON DELETE SET NULL ON UPDATE CASCADE;
