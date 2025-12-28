/*
  Warnings:

  - You are about to drop the column `price` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `stockQuantity` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `warnaDesain` on the `Products` table. All the data in the column will be lost.
  - Added the required column `Desain` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Quantity` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warna` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Products" DROP COLUMN "price",
DROP COLUMN "rating",
DROP COLUMN "stockQuantity",
DROP COLUMN "warnaDesain",
ADD COLUMN     "Desain" TEXT NOT NULL,
ADD COLUMN     "Quantity" INTEGER NOT NULL,
ADD COLUMN     "warna" TEXT NOT NULL;
