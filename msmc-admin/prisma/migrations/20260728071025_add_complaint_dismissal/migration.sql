-- AlterEnum
ALTER TYPE "ComplaintStatus" ADD VALUE 'DISMISSED';

-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "dismissalReason" TEXT;
