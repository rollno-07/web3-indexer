import { ethers } from "ethers";
import abi from "../../../abi/erc20.json";
import provider from "../../../utils/web3";
import prisma from '../../../utils/db';





const contractAddress = process.env.CONTRACT_ADDRESS;
const startBlock = Number(process.env.START_BLOCK || "0");
const MAX_RETRIES = 10;
const INITIAL_STEP = 500;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getLogsInChunks(contract, fromBlock, toBlock, currentAttempt = 0) {
  if (currentAttempt >= MAX_RETRIES) {
    console.error(`Max retries reached for block range ${fromBlock}-${toBlock}`);
    return [];
  }

  try {
    const logs = await contract.queryFilter("Transfer", fromBlock, toBlock);
    return logs;
  } catch (err) {
    const message = err?.error?.message || err?.message || "";

    if (message.includes("more than 10000 results")) {
      const mid = Math.floor((fromBlock + toBlock) / 2);
      if (mid === fromBlock) return [];
      const [left, right] = await Promise.all([
        getLogsInChunks(contract, fromBlock, mid, currentAttempt + 1),
        getLogsInChunks(contract, mid + 1, toBlock, currentAttempt + 1),
      ]);
      return [...left, ...right];
    } else if (message.includes("Too Many Requests")) {
      await sleep(1000 * (currentAttempt + 1));
      return getLogsInChunks(contract, fromBlock, toBlock, currentAttempt + 1);
    } else {
      console.error(`Unhandled error fetching logs:`, message);
      return [];
    }
  }
}

export async function GET() {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const latestBlock = await provider.getBlockNumber();

  const results = [];
  let fromBlock = startBlock;

  while (fromBlock <= latestBlock) {
    const toBlock = Math.min(fromBlock + INITIAL_STEP, latestBlock);
    const logs = await getLogsInChunks(contract, fromBlock, toBlock);

    for (const event of logs) {
      if (!event.args || event.args.length < 3) continue;

      const logData = {
        from: event.args[0],
        to: event.args[1],
        value: event.args[2].toString(),
        txHash: event.transactionHash,
        block: event.blockNumber,
      };

      results.push(logData);

      // 🔥 Insert into PostgreSQL
      await prisma.transferLog.upsert({
        where: { txHash: logData.txHash },
        update: {}, // Skip update if already inserted
        create: logData,
      });
    }

    fromBlock = toBlock + 1;
    await sleep(1000);
  }

  return new Response(JSON.stringify({ count: results.length, logs: results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
