-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'CREDIT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SaleStatus" ADD VALUE 'PARTIAL';
ALTER TYPE "SaleStatus" ADD VALUE 'CREDIT';

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "balance" DECIMAL(10,2) NOT NULL DEFAULT 0;
