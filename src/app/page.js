//app/page.jsx
'use client';

import { useEffect, useState } from 'react';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/indexer');
        const data = await res.json();
        console.log(data,"data");
        setLogs(data.logs || []);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">🧾 Ethereum Transfer Logs</h1> {/* Changed to text-black */}

      {loading ? (
        <p className="text-white">Loading...</p> // Changed to text-black
      ) : logs.length === 0 ? (
        <p className="text-red">No logs found.</p> // Changed from text-red-500 to text-black
      ) : (
        <div className="space-y-4">
          {/* Limiting to 300 logs for display */}
          {logs.slice(0, 30).map((log, i) => (
            <div
              key={i}
              className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition"
            >
              <p className="text-black"><span className="font-medium">Tx Hash:</span> <code>{log.txHash}</code></p> {/* Changed to text-black */}
              <p className="text-black"><span className="font-medium">Block:</span> {log.block}</p> {/* Changed to text-black */}
              <p className="text-black"><span className="font-medium">From:</span> {log.from}</p> {/* Changed to text-black */}
              <p className="text-black"><span className="font-medium">To:</span> {log.to}</p> {/* Changed to text-black */}
              <p className="text-black"><span className="font-medium">Value:</span> {log.value} (in tokens smallest unit)</p> {/* Changed to text-black */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}