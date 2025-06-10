//api/indexer/route.js
import { ethers } from "ethers";
import abi from "../../../abi/erc20.json";
import provider from "../../../utils/web3";

const contractAddress = process.env.CONTRACT_ADDRESS;
const startBlock = Number(process.env.START_BLOCK || "0");
const MAX_RETRIES = 10; // Increase max retries
const INITIAL_STEP = 500; // Start with a smaller step for active contracts

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper to recursively fetch logs if too many results
async function getLogsInChunks(contract, fromBlock, toBlock, currentAttempt = 0) {
    if (currentAttempt >= MAX_RETRIES) {
        console.error(`Max retries reached for block range ${fromBlock}-${toBlock}. Skipping this range.`);
        return [];
    }

    try {
        console.log(`Attempt ${currentAttempt + 1}: Querying blocks ${fromBlock} to ${toBlock}...`);
        const logs = await contract.queryFilter("Transfer", fromBlock, toBlock);
        console.log(`Successfully fetched ${logs.length} logs for range ${fromBlock}-${toBlock}.`);
        return logs;
    } catch (err) {
        const message = err?.error?.message || err?.message;
        console.error(`Error fetching logs for ${fromBlock}-${toBlock}:`, message);

        if (message.includes("more than 10000 results")) {
            console.warn(`"More than 10000 results" for ${fromBlock}-${toBlock}. Splitting range.`);
            const mid = Math.floor((fromBlock + toBlock) / 2);
            if (mid === fromBlock) { // Avoid infinite loop if range becomes too small
                console.warn(`Range ${fromBlock}-${toBlock} is too small to split further and still hitting 10000+ results. Skipping.`);
                return [];
            }
            const logs1 = await getLogsInChunks(contract, fromBlock, mid, currentAttempt + 1);
            const logs2 = await getLogsInChunks(contract, mid + 1, toBlock, currentAttempt + 1);
            return [...logs1, ...logs2];
        } else if (message.includes("Too Many Requests") || message.includes("missing response for request")) {
            const sleepTime = 1000 * (currentAttempt + 1);   //Exponential backoff in seconds
            console.warn(`"Too Many Requests" or "missing response". Sleeping for ${sleepTime}ms...`);
            await sleep(sleepTime);
            return getLogsInChunks(contract, fromBlock, toBlock, currentAttempt + 1); // Retry same range
        } else {
            console.error(`❌ Unexpected error for ${fromBlock}-${toBlock}:`, message);
            console.error("Full error object:", err);
            return []; // Return empty array on unhandled error
        }
    }
}


export async function GET(req) {
  try {
    const contract = new ethers.Contract(contractAddress, abi, provider);
    console.log("Contract initialized.");

    const latestBlock = await provider.getBlockNumber();
    console.log("Latest block:", latestBlock);

    const results = [];
    let fromBlock = startBlock;

    if (isNaN(startBlock) || startBlock < 0) {
        console.error("Invalid START_BLOCK:", process.env.START_BLOCK);
        return new Response(JSON.stringify({ error: "Invalid START_BLOCK environment variable" }), { status: 500 });
    }

    while (fromBlock <= 19006025) {
      let toBlock = Math.min(fromBlock + INITIAL_STEP, latestBlock);
      console.log(`Starting main loop query for ${fromBlock} to ${toBlock}...`);

      // Use the recursive helper function
      const logs = await getLogsInChunks(contract, fromBlock, toBlock);

      results.push(
        ...logs.map((event) => {
            // Add robust checks for event.args
            if (!event.args || !Array.isArray(event.args) || event.args.length < 3) {
                console.warn("Skipping malformed event due to missing/incomplete args:", event);
                return null;
            }
            // Ensure args[2] is a BigInt before calling toString()
            if (typeof event.args[2] !== 'bigint') {
                 console.warn(`Value is not BigInt for event ${event.transactionHash}. Type: ${typeof event.args[2]}. Value: ${event.args[2]}`);
                 // Attempt to convert if it's already a string, or set to a default
                 try {
                     return {
                         from: event.args[0],
                         to: event.args[1],
                         value: String(event.args[2]), // Try converting to string
                         txHash: event.transactionHash,
                         block: event.blockNumber,
                     };
                 } catch (e) {
                     console.error("Failed to convert event.args[2] to string:", e);
                     return null;
                 }
            }
            return {
                from: event.args[0],
                to: event.args[1],
                value: event.args[2].toString(),
                txHash: event.transactionHash,
                block: event.blockNumber,
            };
        }).filter(Boolean) // Filter out any nulls from malformed events
      );

      

      fromBlock = toBlock + 1;
      // Add a longer sleep between main query steps to respect Infura limits
      await sleep(1000); // Sleep for 1 second between main steps
    }
    console.log(results,"results-----------------------------------------");

    console.log(`✅ Finished indexing. Total logs found: ${results.length}`);
    return new Response(JSON.stringify({ count: results.length, logs: results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (overallError) {
    console.error("🚨 Uncaught error in GET /api/indexer:", overallError);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: overallError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}