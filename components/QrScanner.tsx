"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface ScanResult {
  success: boolean;
  message: string;
  type: "success" | "already" | "not_found" | "error";
  participant?: {
    id_peserta: string;
    nama_peserta: string;
    asal_sekolah: string;
    kategori_lomba: string;
  };
}

export default function QrScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (
          state === Html5QrcodeScannerState.SCANNING ||
          state === Html5QrcodeScannerState.PAUSED
        ) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.warn("Scanner stop warning:", e);
      }
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const handleScan = useCallback(
    async (decodedText: string) => {
      // Prevent concurrent processing
      if (processingRef.current) return;
      processingRef.current = true;
      setProcessing(true);

      try {
        // Pause scanner while processing
        if (scannerRef.current) {
          try {
            await scannerRef.current.pause(true);
          } catch {
            // Scanner might already be paused
          }
        }

        const res = await fetch("/api/absensi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_peserta: decodedText }),
        });

        const data: ScanResult = await res.json();
        setResult(data);

        // Auto-clear result and resume scanning after 3 seconds
        setTimeout(async () => {
          setResult(null);
          processingRef.current = false;
          if (scannerRef.current) {
            try {
              await scannerRef.current.resume();
            } catch {
              // If resume fails, restart scanner
              await stopScanner();
              // Don't auto-restart, let user click the button
            }
          }
        }, 3000);
      } catch (error) {
        console.error("Scan error:", error);
        setResult({
          success: false,
          message: "Gagal menghubungi server",
          type: "error",
        });
        setTimeout(() => {
          setResult(null);
          processingRef.current = false;
          if (scannerRef.current) {
            try {
              scannerRef.current.resume();
            } catch {
              // ignore
            }
          }
        }, 3000);
      } finally {
        setProcessing(false);
      }
    },
    [stopScanner]
  );

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return;

    setResult(null);
    processingRef.current = false;

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        handleScan,
        () => {} // Ignore decode failures (normal when no QR in view)
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Camera error:", err);
      setResult({
        success: false,
        message:
          "Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.",
        type: "error",
      });
    }
  }, [handleScan]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (
            state === Html5QrcodeScannerState.SCANNING ||
            state === Html5QrcodeScannerState.PAUSED
          ) {
            scannerRef.current.stop().then(() => {
              scannerRef.current?.clear();
            });
          } else {
            scannerRef.current.clear();
          }
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const getResultStyle = () => {
    if (!result) return {};
    switch (result.type) {
      case "success":
        return {
          bg: "bg-emerald-500/15 border-emerald-500/30",
          icon: <CheckCircle2 className="w-10 h-10 text-emerald-400" />,
          titleColor: "text-emerald-400",
        };
      case "already":
        return {
          bg: "bg-amber-500/15 border-amber-500/30",
          icon: <AlertTriangle className="w-10 h-10 text-amber-400" />,
          titleColor: "text-amber-400",
        };
      case "not_found":
        return {
          bg: "bg-red-500/15 border-red-500/30",
          icon: <XCircle className="w-10 h-10 text-red-400" />,
          titleColor: "text-red-400",
        };
      default:
        return {
          bg: "bg-red-500/15 border-red-500/30",
          icon: <XCircle className="w-10 h-10 text-red-400" />,
          titleColor: "text-red-400",
        };
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      {/* Scanner viewport */}
      <div className="relative w-full aspect-square max-w-sm rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900">
        <div id="qr-reader" ref={containerRef} className="w-full h-full" />

        {!isScanning && !result && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95">
            <Camera className="w-16 h-16 text-slate-600 mb-4" />
            <p className="text-slate-400 text-center px-6">
              Tekan tombol di bawah untuk memulai scanner
            </p>
          </div>
        )}

        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              <p className="text-slate-300 text-sm">Memproses...</p>
            </div>
          </div>
        )}
      </div>

      {/* Scanner controls */}
      <button
        onClick={isScanning ? stopScanner : startScanner}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
          isScanning
            ? "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
            : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
        }`}
      >
        {isScanning ? (
          <>
            <CameraOff className="w-5 h-5" />
            Stop Scanner
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            Mulai Scanner
          </>
        )}
      </button>

      {/* Result display */}
      {result && (
        <div
          className={`w-full rounded-2xl border p-5 animate-scale-in ${getResultStyle().bg}`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{getResultStyle().icon}</div>
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold text-lg ${getResultStyle().titleColor}`}
              >
                {result.type === "success"
                  ? "Berhasil!"
                  : result.type === "already"
                    ? "Sudah Absen"
                    : result.type === "not_found"
                      ? "Tidak Terdaftar"
                      : "Error"}
              </p>
              <p className="text-slate-300 text-sm mt-1">{result.message}</p>

              {result.participant && (
                <div className="mt-3 space-y-1">
                  <p className="text-white font-medium">
                    {result.participant.nama_peserta}
                  </p>
                  {result.participant.asal_sekolah && (
                    <p className="text-slate-400 text-sm">
                      {result.participant.asal_sekolah}
                    </p>
                  )}
                  {result.participant.kategori_lomba && (
                    <p className="text-slate-500 text-sm">
                      {result.participant.kategori_lomba}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
