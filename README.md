# 🧠 Web3 Transfer Logs Indexer

A fullstack Ethereum event indexer built using **Next.js (App Router)**, **Ethers.js**, **Prisma ORM**, and **PostgreSQL**. This app indexes `Transfer` events from an ERC20 contract and stores them in a database, with a searchable and paginated frontend UI.

---

## 🔧 Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS  
- **Backend:** Ethers.js, Prisma ORM  
- **Database:** PostgreSQL  
- **Environment Management:** `.env`  

---

## 📦 Features

- Fetch historical `Transfer` events using Ethers.js  
- Store logs into PostgreSQL using Prisma  
- Paginated API for retrieving logs  
- Frontend UI to search logs by block range with pagination  

---

## 📁 Project Structure

web3-indexer/
├── prisma/
│ └── schema.prisma # Prisma DB schema
├── src/
│ ├── app/
│ │ ├── api/
│ │ │ └── indexer/
│ │ │ ├── route.js # Indexer logic (fetch + store)
│ │ │ └── search/route.js # Search logs with pagination
│ │ └── search/page.jsx # Search frontend UI
│ └── lib/
│ └── prisma.js (optional) # Prisma client init
├── .env.local
├── package.json
└── README.md

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/eth_logs"
RPC_URL="https://mainnet.infura.io/v3/YOUR_INFURA_KEY"
CONTRACT_ADDRESS="0xYourERC20Address"

🚀 Getting Started

npm install

Start PostgreSQL via Homebrew
brew services start postgresql@14

if you haven’t created the PostgreSQL role or DB:
createuser postgres -s
createdb eth_logs

Run DB migration
npx prisma migrate dev --name init


Start Next.js dev server
npm run dev

🔍 API Endpoints
GET /api/indexer
Fetches Transfer logs from the configured Ethereum contract using Ethers.js

Stores logs into PostgreSQL with deduplication (upsert)

Trigger this endpoint manually or via a cron job.

GET /api/indexer/search
Query indexed transfer logs from the DB.

Query Parameters:
Param	      Type	   Required	   Description
fromBlock	  number	  ✅	     Starting block number
toBlock	      number	  ✅	     Ending block number
page	      number	  ❌	     Page number (default: 1)
limit	      number	  ❌	     Items per page (default: 100)

Example:
GET /api/indexer/search?fromBlock=19000000&toBlock=19000050&page=2&limit=5


💻 Frontend UI
Visit /search route to:

Input block range (fromBlock, toBlock)

Submit search and fetch logs

View paginated results

UI is styled with Tailwind CSS.

✅ To Do Next
Add auto-syncing background job (e.g. cron + queue)

Filter logs by from, to, or value

Add debounce or real-time search

Display charts (top addresses, volume)

Export to CSV or Excel

