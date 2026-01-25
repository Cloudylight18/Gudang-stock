/*
  Warnings:

  - The `category` column on the `Products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `unit` column on the `Products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `Layouts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Layouts" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "quality" DROP DEFAULT,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT,
DROP COLUMN "unit",
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'YARD';

-- DropEnum
DROP TYPE "CategoryType";

-- DropEnum
DROP TYPE "UnitType";
