import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fromBlock = parseInt(searchParams.get("fromBlock"));
  const toBlock = parseInt(searchParams.get("toBlock"));
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  if (isNaN(fromBlock) || isNaN(toBlock)) {
    return Response.json({ error: "Invalid block range" }, { status: 400 });
  }

  try {
    const total = await prisma.transferLog.count({
      where: {
        block: {
          gte: fromBlock,
          lte: toBlock,
        },
      },
    });

    const logs = await prisma.transferLog.findMany({
      where: {
        block: {
          gte: fromBlock,
          lte: toBlock,
        },
      },
      orderBy: { block: "desc" },
      skip,
      take: limit,
    });

    return Response.json({
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Search error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
