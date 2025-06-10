/*
  Warnings:

  - You are about to drop the `Log` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Log";

-- CreateTable
CREATE TABLE "TransferLog" (
    "id" SERIAL NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "block" INTEGER NOT NULL,

    CONSTRAINT "TransferLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransferLog_txHash_key" ON "TransferLog"("txHash");
