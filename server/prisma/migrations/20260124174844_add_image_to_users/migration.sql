-- DropForeignKey
ALTER TABLE "ExpenseByCategory" DROP CONSTRAINT "ExpenseByCategory_expenseSummaryId_fkey";

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "image" TEXT;

-- CreateIndex
CREATE INDEX "ExpenseByCategory_expenseSummaryId_idx" ON "ExpenseByCategory"("expenseSummaryId");

-- AddForeignKey
ALTER TABLE "ExpenseByCategory" ADD CONSTRAINT "ExpenseByCategory_expenseSummaryId_fkey" FOREIGN KEY ("expenseSummaryId") REFERENCES "ExpenseSummary"("expenseSummaryId") ON DELETE CASCADE ON UPDATE CASCADE;
