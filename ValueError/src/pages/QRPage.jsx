import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";

const QRPage = () => {
  const [data, setData] = useState("No result");
  // States: 'idle' | 'processing' | 'complete'
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const navigate = useNavigate();

  const handleScan = (detectedCodes) => {
    // 1. Safety check: If we are already processing, ignore new scans
    if (paymentStatus !== "idle") return;

    if (detectedCodes && detectedCodes.length > 0) {
      const rawValue = detectedCodes[0].rawValue;
      setData(rawValue);

      // 2. Start the dummy payment process
      startPaymentProcess(rawValue);
    }
  };

  const startPaymentProcess = (scannedData) => {
    // Step A: Show "Payment in progress"
    setPaymentStatus("processing");

    // Step B: Wait 2 seconds to simulate API call
    setTimeout(() => {
      // Step C: Show "Payment Complete"
      setPaymentStatus("complete");

      // Step D: Wait 1.5 seconds so user sees the success message, then go back
      setTimeout(() => {
        navigate(-1, { state: { scannedWallet: scannedData } });
      }, 1500);
    }, 2000);
  };

  const handleError = (error) => {
    // Only log real errors, ignore minor scanning noise
    if (error?.message) console.log(error.message);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col relative">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <button
          onClick={() => navigate(-1)}
          // Disable back button if processing
          disabled={paymentStatus !== "idle"}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center shadow-md ${
            paymentStatus !== "idle"
              ? "bg-slate-800/50 text-slate-500 cursor-not-allowed"
              : "bg-slate-800 hover:bg-slate-700 text-white"
          }`}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <h3 className="text-xl font-bold tracking-wide text-slate-200">
          Scan QR Code
        </h3>
      </div>

      {/* --- CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-20 relative z-0">
        {/* CAMERA AREA */}
        <div className="relative w-full max-w-sm aspect-square overflow-hidden rounded-2xl border-2 border-slate-700 shadow-2xl shadow-blue-900/20 bg-black">
          {/* If payment is processing/complete, we can hide or pause the scanner visual if desired, 
              but keeping it running behind the overlay looks cooler. */}
          <Scanner
            onScan={handleScan}
            onError={handleError}
            styles={{
              container: { width: "100%", height: "100%" },
              video: { width: "100%", height: "100%", objectFit: "cover" },
            }}
            constraints={{ facingMode: "environment" }}
            // Optional: Disable scanning logic internally when not idle
            enabled={paymentStatus === "idle"}
          />

          {/* --- OVERLAY: PROCESSING / SUCCESS --- */}
          {paymentStatus !== "idle" && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
              {/* STATE: PROCESSING */}
              {paymentStatus === "processing" && (
                <div className="text-center flex flex-col items-center">
                  <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">
                    Processing Payment...
                  </h4>
                  <p className="text-slate-400 text-sm">Please wait a moment</p>
                </div>
              )}

              {/* STATE: COMPLETE */}
              {paymentStatus === "complete" && (
                <div className="text-center flex flex-col items-center animate-in zoom-in duration-300">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">
                    Payment Complete!
                  </h4>
                  <p className="text-slate-400 text-sm">Redirecting...</p>
                </div>
              )}
            </div>
          )}

          {/* --- OVERLAY: SCANNER LINES (Only show when IDLE) --- */}
          {paymentStatus === "idle" && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
              <div className="w-48 h-48 border-2 border-blue-500/50 rounded-lg relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
              </div>
            </div>
          )}
        </div>

        {/* INSTRUCTION TEXT */}
        <p
          className={`mt-6 text-center text-sm transition-all duration-300 ${
            paymentStatus === "idle"
              ? "text-slate-400 animate-pulse"
              : "text-slate-600"
          }`}
        >
          {paymentStatus === "idle"
            ? "Point camera at QR Code Wallet"
            : "Transaction in progress..."}
        </p>
      </div>
    </div>
  );
};

export default QRPage;
