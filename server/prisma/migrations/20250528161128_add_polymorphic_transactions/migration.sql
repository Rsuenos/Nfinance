/*
  Warnings:

  - You are about to drop the column `bankAccountId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `creditCardId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `loanId` on the `Transaction` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `category` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_bankAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_creditCardId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_loanId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "bankAccountId",
DROP COLUMN "creditCardId",
DROP COLUMN "loanId",
ADD COLUMN     "destinationBankAccountId" TEXT,
ADD COLUMN     "destinationCreditCardId" TEXT,
ADD COLUMN     "destinationLoanId" TEXT,
ADD COLUMN     "sourceBankAccountId" TEXT,
ADD COLUMN     "sourceCreditCardId" TEXT,
ADD COLUMN     "sourceLoanId" TEXT,
ADD COLUMN     "transferType" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "category" SET NOT NULL;

-- DropEnum
DROP TYPE "TransactionType";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sourceBankAccountId_fkey" FOREIGN KEY ("sourceBankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sourceCreditCardId_fkey" FOREIGN KEY ("sourceCreditCardId") REFERENCES "CreditCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sourceLoanId_fkey" FOREIGN KEY ("sourceLoanId") REFERENCES "Loan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_destinationBankAccountId_fkey" FOREIGN KEY ("destinationBankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_destinationCreditCardId_fkey" FOREIGN KEY ("destinationCreditCardId") REFERENCES "CreditCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_destinationLoanId_fkey" FOREIGN KEY ("destinationLoanId") REFERENCES "Loan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
