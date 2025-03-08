import React, { useEffect, useState } from "react";

const TerminalLog = () => {
  const [logs, setLogs] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Create a WebSocket connection
    const ws = new WebSocket("wss://locker-silk.vercel.app"); // Replace with your WebSocket server URL

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      try {
        const logMessage = JSON.parse(event.data);
        setLogs((prevLogs) => [...prevLogs, logMessage]);
      } catch (error) {
        console.error("Error parsing log message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        console.log("Reconnecting to WebSocket...");
        setSocket(new WebSocket("wss://locker-silk.vercel.app")); // Reconnect
      }, 3000);
    };

    // Save the WebSocket instance to state
    setSocket(ws);

    // Clean up on component unmount
    return () => {
      if (ws) {
        ws.close();
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