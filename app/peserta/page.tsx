"use client";

import { useEffect, useState, useCallback } from "react";
import QrCard from "@/components/QrCard";
import QRCode from "qrcode";
import JSZip from "jszip";
import {
  Search,
  Download,
  PackageOpen,
  Loader2,
  Users,
  RefreshCw,
} from "lucide-react";

interface Participant {
  id_peserta: string;
  nama_peserta: string;
  asal_sekolah: string;
  kategori_lomba: string;
}

export default function PesertaPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(false);

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch("/api/peserta");
      const data = await res.json();
      if (data.success) {
        setParticipants(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch participants:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const filtered = participants.filter(
    (p) =>
      p.id_peserta.toLowerCase().includes(search.toLowerCase()) ||
      p.nama_peserta.toLowerCase().includes(search.toLowerCase()) ||
      p.asal_sekolah.toLowerCase().includes(search.toLowerCase()) ||
      p.kategori_lomba.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadAll = async () => {
    if (downloading || participants.length === 0) return;
    setDownloading(true);

    try {
      const zip = new JSZip();

      for (const p of participants) {
        const dataUrl = await QRCode.toDataURL(p.id_peserta, {
          width: 400,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
          errorCorrectionLevel: "H",
        });

        // Convert data URL to blob
        const base64 = dataUrl.split(",")[1];
        zip.file(`qr-${p.id_peserta}.png`, base64, { base64: true });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "qr-codes-peserta.zip";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate ZIP:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Peserta & QR Code
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Kelola QR Code untuk {participants.length} peserta
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
            onClick={handleDownloadAll}
            disabled={downloading || participants.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengunduh...
              </>
            ) : (
              <>
                <PackageOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Download Semua (ZIP)</span>
                <span className="sm:hidden">ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari peserta (nama, ID, sekolah, kategori)..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 backdrop-blur-xl"
        />
        {search && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {filtered.length} hasil
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-3 sm:p-4 animate-pulse"
            >
              <div className="flex flex-col items-center">
                <div className="w-full max-w-[140px] sm:max-w-[180px] aspect-square bg-slate-700/30 rounded-xl mb-3" />
                <div className="w-16 h-3 bg-slate-700/30 rounded mb-2" />
                <div className="w-24 h-4 bg-slate-700/30 rounded mb-1" />
                <div className="w-20 h-3 bg-slate-700/30 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-16 h-16 text-slate-600 mb-4" />
          <p className="text-lg text-slate-400">
            {search ? "Peserta tidak ditemukan" : "Belum ada data peserta"}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {search
              ? "Coba kata kunci lain"
              : 'Pastikan sheet "Peserta" sudah berisi data'}
          </p>
        </div>
      )}

      {/* QR Grid */}
      {!loading && filtered.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Download className="w-4 h-4" />
            <span>
              Menampilkan {filtered.length} dari {participants.length} peserta
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filtered.map((p) => (
              <QrCard key={p.id_peserta} {...p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
