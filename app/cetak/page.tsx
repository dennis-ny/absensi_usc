"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import QRCode from "qrcode";
import { Printer, RefreshCw, Loader2 } from "lucide-react";

interface Participant {
  id_peserta: string;
  nama_peserta: string;
  asal_sekolah: string;
  kategori_lomba: string;
}

function IdCard({ participant }: { participant: Participant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        participant.id_peserta,
        {
          width: 120,
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" },
          errorCorrectionLevel: "H",
        },
        (error) => {
          if (error) console.error("QR error:", error);
        }
      );
    }
  }, [participant.id_peserta]);

  return (
    <div className="id-card w-[85.6mm] h-[54mm] bg-white rounded-xl border border-slate-200 p-3 flex flex-row gap-3 shadow-sm print:shadow-none print:rounded-none">
      {/* Left: QR Code */}
      <div className="flex-shrink-0 flex items-center justify-center">
        <canvas ref={canvasRef} className="block" />
      </div>

      {/* Right: Info */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <p className="text-[8px] text-gray-400 uppercase tracking-wider mb-1 font-medium">
          {process.env.NEXT_PUBLIC_APP_NAME || "Absensi Lomba"}
        </p>
        <p className="text-sm font-bold text-gray-900 leading-tight truncate">
          {participant.nama_peserta}
        </p>
        {participant.asal_sekolah && (
          <p className="text-[10px] text-gray-600 mt-0.5 truncate">
            {participant.asal_sekolah}
          </p>
        )}
        {participant.kategori_lomba && (
          <p className="text-[10px] text-gray-500 truncate">
            {participant.kategori_lomba}
          </p>
        )}
        <div className="mt-auto pt-1">
          <p className="text-[9px] font-mono text-gray-400 bg-gray-50 inline-block px-1.5 py-0.5 rounded">
            {participant.id_peserta}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CetakPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch("/api/peserta");
      const data = await res.json();
      if (data.success) {
        setParticipants(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header (hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Cetak ID Card
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Preview dan cetak ID Card untuk {participants.length} peserta
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setLoading(true);
              fetchParticipants();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            disabled={participants.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <Printer className="w-4 h-4" />
            Cetak Semua
          </button>
        </div>
      </div>

      {/* Info (hidden in print) */}
      <div className="no-print rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-4">
        <p className="text-sm text-slate-400">
          💡 ID Card dicetak dalam ukuran standar kartu (85.6 × 54 mm). 
          Pastikan setting printer menggunakan ukuran kertas A4 dan skala 100%.
          QR Code menggunakan error correction level High agar tetap terbaca meski tercetak kurang sempurna.
        </p>
      </div>

      {/* Cards Grid */}
      {participants.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg">Belum ada data peserta</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {participants.map((p) => (
            <IdCard key={p.id_peserta} participant={p} />
          ))}
        </div>
      )}
    </div>
  );
}
