import React, { useState } from "react";

const KeyManagement = () => {
  const [rfid, setRfid] = useState("");
  const [keyNumber, setKeyNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isTakingKey, setIsTakingKey] = useState(true); // Toggle between take and return key forms

  const handleTakeKey = async () => {
    if (!rfid) {
      setMessage("RFID is required");
      return;
    }

    try {
      const response = await fetch("https://locker-backend-swart.vercel.app/api/key/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfid })
      });

      const data = await response.json();
      setMessage(data.message);
      setRfid(""); // Clear the RFID input after taking the key
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  const handleReturnKey = async () => {
    if (!rfid && !keyNumber) {
      setMessage("Please provide either RFID or Key Number");
      return;
    }

    try {
      const response = await fetch("https://locker-backend-swart.vercel.app/api/key/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfid, keyNumber })
      });

      const data = await response.json();
      setMessage(data.message);
      setRfid(""); // Clear the RFID input
      setKeyNumber(""); // Clear the Key Number input
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-4 text-cayn-500">
      <div className="bg-gray-950 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {isTakingKey ? "Take a Key" : "Return a Key"}
        </h2>

        <div className="mb-4">
          <label htmlFor="rfid" className="block text-sm font-medium text-cyan-700">RFID</label>
          <input
            type="text"
            id="rfid"
            value={rfid}
            onChange={(e) => setRfid(e.target.value)}
            className="mt-2 block w-full p-3 border border-gray-300 text-cyan-600 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your RFID"
          />
        </div>

        {!isTakingKey && (
          <div className="mb-4">
            <label htmlFor="keyNumber" className="block text-sm font-medium text-cyan-700">Key Number</label>
            <input
              type="text"
              id="keyNumber"
              value={keyNumber}
              onChange={(e) => setKeyNumber(e.target.value)}
              className="mt-2 block w-full p-3 border border-gray-300 rounded-md text-cyan-600  text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter Key Number (if returning)"
            />
          </div>
        )}

        <div className="mb-4">
          {isTakingKey ? (
            <button
              onClick={handleTakeKey}
              className="w-full py-3 bg-blue-500 text-cyan-500 rounded-md text-sm font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Take Key
            </button>
          ) : (
            <button
              onClick={handleReturnKey}
              className="w-full py-3 bg-green-500 text-cyan-500 rounded-md text-sm font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Return Key
            </button>
          )}
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsTakingKey(!isTakingKey)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            {isTakingKey ? "Go to Return Key" : "Go to Take Key"}
          </button>
        </div>

        {message && (
          <div className="mt-4 text-center text-sm text-red-500">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyManagement;
