"use client";
import { useState, useEffect } from "react";

export default function SearchPage() {
  const [fromBlock, setFromBlock] = useState("");
  const [toBlock, setToBlock] = useState("");
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      fromBlock,
      toBlock,
      page,
      limit: 100,
    });
    const res = await fetch(`/api/indexer/search?${params}`);
    const json = await res.json();
    if (res.ok) {
      setLogs(json.data);
      setMeta(json.meta);
    } else {
      alert(json.error);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1);
  };

  useEffect(() => {
    if (page !== 1) {
      fetchLogs(page);
    }
  }, [page, fetchLogs]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Search Transfer Logs</h1>
      <form onSubmit={handleSubmit} className="space-x-2 mb-4">
        <input
          type="number"
          placeholder="From Block"
          value={fromBlock}
          onChange={(e) => setFromBlock(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="number"
          placeholder="To Block"
          value={toBlock}
          onChange={(e) => setToBlock(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
          Search
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {logs.length > 0 ? (
            <>
              <table className="table-auto w-full border mb-4">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-2 py-1 text-black">Block</th>
                    <th className="border px-2 py-1 text-black">Tx Hash</th>
                    <th className="border px-2 py-1 text-black">From</th>
                    <th className="border px-2 py-1 text-black">To</th>
                    <th className="border px-2 py-1 text-black">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.txHash}>
                      <td className="border px-2 py-1">{log.block}</td>
                      <td className="border px-2 py-1">{log.txHash.slice(0, 10)}...</td>
                      <td className="border px-2 py-1">{log.from}</td>
                      <td className="border px-2 py-1">{log.to}</td>
                      <td className="border px-2 py-1">{log.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 border rounded"
                >
                  Prev
                </button>
                <span>
                  Page {meta?.page} of {meta?.totalPages}
                </span>
                <button
                  disabled={page >= meta?.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border rounded"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <p>No results found.</p>
          )}
        </>
      )}
    </div>
  );
}
