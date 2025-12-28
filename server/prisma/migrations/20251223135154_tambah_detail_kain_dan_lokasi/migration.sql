/*
  Warnings:

  - Added the required column `jenisKain` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warnaDesain` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "image" TEXT,
ADD COLUMN     "jenisKain" TEXT NOT NULL,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "warnaDesain" TEXT NOT NULL,
ADD COLUMN     "width" DOUBLE PRECISION NOT NULL;
