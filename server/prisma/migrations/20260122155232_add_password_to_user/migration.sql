/*
  Warnings:

  - Added the required column `password` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'ADMIN';

-- CreateIndex
CREATE INDEX "Products_description_idx" ON "Products"("description");
