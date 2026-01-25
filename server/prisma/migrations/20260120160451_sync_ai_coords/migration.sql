-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "coordinateX" SET DEFAULT 0,
ALTER COLUMN "coordinateY" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Products_name_idx" ON "Products"("name");
