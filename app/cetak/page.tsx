"use client";

import { useEffect, useState, useCallback } from "react";
import QRCode from "qrcode";
import { Printer, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Participant {
  id_peserta: string;
  email: string;
  nama_peserta: string;
  asal_sekolah: string;
  no_hp: string;
  username: string;
  password: string;
  waktu_absen: string;
  status: string;
}

// ─── ID Card Component ────────────────────────────────────────────────

function IdCard({ participant }: { participant: Participant }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(participant.id_peserta, {
      width: 400,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "H",
    })
      .then(setQrDataUrl)
      .catch((err) => console.error("QR error:", err));
  }, [participant.id_peserta]);

  return (
    <div
      className="id-card relative overflow-hidden bg-white"
      style={{ width: "7.5cm", height: "10.5cm", flexShrink: 0 }}
    >
      {/* Background card template */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/card.png"
        alt="card background"
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "fill" }}
        draggable={false}
      />

      {/* ── Nama — kotak putih pertama ── */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: "35%",
          left: "9%",
          width: "82%",
          height: "5%",
        }}
      >
        <span
          className="font-bold text-gray-900 w-full text-center leading-none uppercase"
          style={{ fontSize: "0.25cm", wordBreak: "break-word" }}
        >
          {participant.nama_peserta}
        </span>
      </div>

      {/* ── Username — kotak putih kedua ── */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: "45%",
          left: "9%",
          width: "82%",
          height: "5%",
        }}
      >
        <span
          className="font-bold text-gray-900 w-full text-center leading-none"
          style={{ fontSize: "0.32cm", wordBreak: "break-word" }}
        >
          {participant.username}
        </span>
      </div>

      {/* ── Password — kotak putih ketiga ── */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: "55%",
          left: "9%",
          width: "82%",
          height: "5%",
        }}
      >
        <span
          className="font-bold text-gray-900 w-full text-center leading-none"
          style={{ fontSize: "0.32cm", wordBreak: "break-word" }}
        >
          {participant.password}
        </span>
      </div>

      {/* ── QR Code — kotak emas ── */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: "63%",
          left: "20%",
          width: "60%",
          height: "27%",
        }}
      >
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt={`QR ${participant.id_peserta}`}
            style={{ width: "90%", height: "90%", objectFit: "contain" }}
          />
        ) : (
          <div className="w-full h-full bg-blue-900/30 animate-pulse rounded" />
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-dark animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* ── Print CSS ─────────────────────────────────────────────── */}
      <style>{`
        @media print {
          @page {
            size: 7.5cm 10.5cm;
            margin: 0;
          }
          body > * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .no-print { display: none !important; }
          .print-area .id-card {
            page-break-after: always;
            break-after: page;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 7.5cm !important;
            height: 10.5cm !important;
          }
        }
      `}</style>

      {/* ── No-print UI ───────────────────────────────────────────── */}
      <div className="no-print space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Cetak ID Card
            </h1>
            <p className="text-muted-foreground font-medium mt-1 text-sm">
              Preview dan cetak ID Card untuk {participants.length} peserta (7.5 × 10.5 cm)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true);
                fetchParticipants();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold bg-card text-foreground border-2 border-border shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="brand"
              onClick={() => window.print()}
              disabled={participants.length === 0}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Cetak Semua
            </Button>
          </div>
        </div>

        {/* Info */}
        <Card className="rounded-3xl border-2 border-border bg-card p-4 shadow-hard">
          <p className="text-sm font-medium text-muted-foreground">
            💡 ID Card dicetak dalam ukuran <strong>7.5 × 10.5 cm</strong>.
            Pastikan setting printer menggunakan ukuran kertas sesuai, skala 100%, dan margin 0.
          </p>
        </Card>

        {/* Preview Grid */}
        {participants.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-bold">
            <p className="text-lg">Belum ada data peserta</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {participants.map((p) => (
              <IdCard key={p.id_peserta} participant={p} />
            ))}
          </div>
        )}
      </div>

      {/* ── Print area ────────────────────────────────────────────── */}
      <div className="print-area" style={{ display: "none" }}>
        {participants.map((p) => (
          <IdCard key={`print-${p.id_peserta}`} participant={p} />
        ))}
      </div>
    </>
  );
}
