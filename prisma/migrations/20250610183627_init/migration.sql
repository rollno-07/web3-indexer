-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "txHash" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);
