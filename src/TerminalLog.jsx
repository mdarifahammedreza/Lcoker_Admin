
import React, { useEffect, useState } from "react";

const TerminalLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let eventSource;

    const connectToSSE = () => {
      eventSource = new EventSource("https://locker-silk.vercel.app/api/logs");

      eventSource.onopen = () => {
        console.log("SSE Connection opened");
      };

      eventSource.onmessage = (event) => {
        try {
          const logMessage = JSON.parse(event.data);
          setLogs((prevLogs) => [...prevLogs, logMessage]);
        } catch (error) {
          console.error("Error parsing log message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource.close(); // Close the connection

        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          console.log("Reconnecting to SSE...");
          connectToSSE();
        }, 3000);
      };
    };

    // Initial connection
    connectToSSE();

    // Clean up on component unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono h-64 overflow-auto border border-gray-700 shadow-lg relative">
        <h2 className="text-xl bg-gray-950 px-1 py-1 font-semibold text-cyan-500 sticky top-0 left-0">
          Terminal - Vendor Log
        </h2>
        <div className="h-full w-full p-2">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <p key={index} className="whitespace-pre">
                {`> ${log.timestamp} - ${log.message}`}
              </p>
            ))
          ) : (
            <p>:-- No logs available...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalLog;