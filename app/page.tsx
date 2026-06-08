"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardStats from "@/components/DashboardStats";
import AttendanceTable from "@/components/AttendanceTable";
import { RefreshCw } from "lucide-react";

interface Stats {
  totalPeserta: number;
  totalHadir: number;
  totalBelumHadir: number;
  persentaseKehadiran: number;
}

interface AttendanceRecord {
  id_peserta: string;
  nama_peserta: string;
  waktu_absen: string;
  status: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalPeserta: 0,
    totalHadir: 0,
    totalBelumHadir: 0,
    persentaseKehadiran: 0,
  });
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/absensi");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setAttendances(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Monitoring absensi peserta secara real-time
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50 hover:text-white transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <DashboardStats {...stats} loading={loading} />

      {/* Attendance Table */}
      <AttendanceTable data={attendances} loading={loading} maxRows={20} />
    </div>
  );
}
