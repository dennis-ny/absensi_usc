"use client";

import { Clock } from "lucide-react";

interface AttendanceRecord {
  id_peserta: string;
  nama_peserta: string;
  waktu_absen: string;
  status: string;
}

interface AttendanceTableProps {
  data: AttendanceRecord[];
  loading?: boolean;
  maxRows?: number;
}

export default function AttendanceTable({
  data,
  loading,
  maxRows,
}: AttendanceTableProps) {
  const displayData = maxRows ? data.slice(-maxRows).reverse() : [...data].reverse();

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl overflow-hidden">
        <div className="p-5 border-b border-slate-700/50">
          <div className="h-6 w-48 bg-slate-700/50 rounded-lg animate-pulse" />
        </div>
        <div className="p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-slate-700/30 rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-slate-700/50 flex items-center gap-2">
        <Clock className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Absensi Terbaru</h3>
        <span className="ml-auto text-sm text-slate-400">
          {data.length} data
        </span>
      </div>

      {displayData.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <p className="text-lg">Belum ada data absensi</p>
          <p className="text-sm mt-1">
            Scan QR Code peserta untuk memulai absensi
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-5 text-slate-400 font-medium">
                  ID
                </th>
                <th className="text-left py-3 px-5 text-slate-400 font-medium">
                  Nama
                </th>
                <th className="text-left py-3 px-5 text-slate-400 font-medium hidden sm:table-cell">
                  Waktu
                </th>
                <th className="text-left py-3 px-5 text-slate-400 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((record, index) => (
                <tr
                  key={`${record.id_peserta}-${index}`}
                  className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-150"
                >
                  <td className="py-3 px-5 text-slate-300 font-mono text-xs">
                    {record.id_peserta}
                  </td>
                  <td className="py-3 px-5 text-white font-medium">
                    {record.nama_peserta}
                  </td>
                  <td className="py-3 px-5 text-slate-400 hidden sm:table-cell">
                    {record.waktu_absen}
                  </td>
                  <td className="py-3 px-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
