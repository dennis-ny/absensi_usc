"use client";

import PinGuard from "@/components/PinGuard";
import QrScanner from "@/components/QrScanner";
import { ScanLine } from "lucide-react";

export default function ScanPage() {
  return (
    <PinGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <ScanLine className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Scan Absensi
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Arahkan kamera ke QR Code peserta untuk melakukan absensi
          </p>
        </div>

        {/* Scanner */}
        <QrScanner />

        {/* Tips */}
        <div className="max-w-lg mx-auto rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            💡 Tips Scanning
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              Pastikan QR Code terlihat jelas dan tidak terlipat
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              Jaga jarak kamera 15-25 cm dari QR Code
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              Pastikan pencahayaan cukup, hindari backlight
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              Scanner akan otomatis melanjutkan setelah 3 detik
            </li>
          </ul>
        </div>
      </div>
    </PinGuard>
  );
}
