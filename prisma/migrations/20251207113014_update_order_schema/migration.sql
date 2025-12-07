-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ALIPAY', 'WECHAT', 'MANUAL');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "amount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "paymentMethod" "PaymentMethod" DEFAULT 'ALIPAY';
