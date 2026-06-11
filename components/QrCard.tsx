"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

interface QrCardProps {
  id_peserta: string;
  nama_peserta: string;
  asal_sekolah?: string;
  kategori_lomba?: string;
}

export default function QrCard({
  id_peserta,
  nama_peserta,
  asal_sekolah,
  kategori_lomba,
}: QrCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        id_peserta,
        {
          width: 300,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
          errorCorrectionLevel: "H",
        },
        (error) => {
          if (error) console.error("QR generation error:", error);
        }
      );

      QRCode.toDataURL(id_peserta, {
        width: 400,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "H",
      }).then(setDataUrl);
    }
  }, [id_peserta]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qr-${id_peserta}.png`;
    link.click();
  };

  return (
    <div className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl p-3 sm:p-4 transition-all duration-300 hover:border-slate-600/50 hover:bg-slate-800/70">
      <div className="flex flex-col items-center">
        {/* QR Code */}
        <div className="bg-white rounded-xl p-2 sm:p-3 mb-3 shadow-lg w-full max-w-[140px] sm:max-w-[180px] aspect-square flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-105">
          <canvas ref={canvasRef} className="w-full h-auto block" />
        </div>

        {/* Info */}
        <div className="text-center mb-3 w-full">
          <p className="text-xs font-mono text-cyan-400 mb-1">{id_peserta}</p>
          <p className="text-sm font-semibold text-white truncate">
            {nama_peserta}
          </p>
          {asal_sekolah && (
            <p className="text-xs text-slate-400 truncate">{asal_sekolah}</p>
          )}
          {kategori_lomba && (
            <p className="text-xs text-slate-500 mt-0.5">{kategori_lomba}</p>
          )}
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/25 transition-all duration-200"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
      </div>
    </div>
  );
}
