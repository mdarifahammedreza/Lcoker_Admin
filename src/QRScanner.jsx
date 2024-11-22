import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { setkeys} from "./handle"; // Import the function to set the key value
const QRCodeScanner = () => {
    const videoRef = useRef(null);
    const [scannedValue, setScannedValue] = useState("0");
    const [error, setError] = useState("");

    // Effect to handle scanning and state updates
    useEffect(() => {
        const codeReader = new BrowserQRCodeReader();
        let stopScanner;

        const startScanner = async () => {
            try {
                const videoElement = videoRef.current;
                if (!videoElement) return;

                // Request camera access and start scanning
                const result = await codeReader.decodeOnceFromVideoDevice(
                    undefined,
                    videoElement
                );
                setScannedValue(result.text); // Set the scanned value
                
            } catch (err) {
                setError("Error accessing camera or scanning QR code.");
                console.error(err);
            } finally {
                // Stop the scanner
                stopScanner = () => codeReader.reset();
            }
        };

        startScanner();

        return () => {
            if (stopScanner) stopScanner();
        };
    }, []); // Only run on component mount

    // Effect to make API call after scannedValue is updated
    useEffect(() => {
        if (scannedValue && scannedValue !== "0") {
            console.log("Scanned Value:", scannedValue); 
             // Log the value
            const sendQRValueToAPI = async () => {
                try {
                    const response = await fetch("http://localhost:3000/api/get-qr", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ qrValue: scannedValue }),  // Ensure this matches the back-end key
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setError(data.message || "QR value sent successfully!");
                        setkeys(scannedValue);  // Set the key value
                    } else {
                        setError("Failed to send QR value to API.");
                    }
                } catch (err) {
                    setError("Error while connecting to API.");
                    console.error(err);
                }
            };
            
            sendQRValueToAPI();  // Call the function to send data
        }
    }, [scannedValue]); // Only trigger when scannedValue changes

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <h1>QR Code Scanner</h1>
            <video ref={videoRef} style={{ width: "100%", maxHeight: "300px" }} />
            <div>
                {scannedValue && (
                    <p>
                        <strong>Scanned Value:</strong> {scannedValue}
                    </p>
                )}
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        </div>
    );
};

export default QRCodeScanner;
