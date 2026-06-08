"use client";

import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  totalPeserta: number;
  totalHadir: number;
  totalBelumHadir: number;
  persentaseKehadiran: number;
  loading?: boolean;
}

const statCards = [
  {
    key: "total",
    label: "Total Peserta",
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
    bgGlow: "bg-blue-500/10",
    field: "totalPeserta" as const,
  },
  {
    key: "hadir",
    label: "Hadir",
    icon: UserCheck,
    gradient: "from-emerald-500 to-emerald-600",
    bgGlow: "bg-emerald-500/10",
    field: "totalHadir" as const,
  },
  {
    key: "belum",
    label: "Belum Hadir",
    icon: UserX,
    gradient: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500/10",
    field: "totalBelumHadir" as const,
  },
  {
    key: "persen",
    label: "Kehadiran",
    icon: TrendingUp,
    gradient: "from-cyan-400 to-blue-500",
    bgGlow: "bg-cyan-500/10",
    field: "persentaseKehadiran" as const,
  },
];

export default function DashboardStats({
  totalPeserta,
  totalHadir,
  totalBelumHadir,
  persentaseKehadiran,
  loading,
}: DashboardStatsProps) {
  const values = { totalPeserta, totalHadir, totalBelumHadir, persentaseKehadiran };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div
          key={card.key}
          className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl p-5 transition-all duration-300 hover:border-slate-600/50 hover:bg-slate-800/70 animate-slide-up"
          style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
        >
          {/* Background glow */}
          <div
            className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${card.bgGlow} blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500`}
          />

          <div className="relative">
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} mb-3 shadow-lg`}
            >
              <card.icon className="w-5 h-5 text-white" />
            </div>

            <p className="text-sm text-slate-400 mb-1">{card.label}</p>

            {loading ? (
              <div className="h-8 w-20 bg-slate-700/50 rounded-lg animate-pulse" />
            ) : (
              <p className="text-2xl lg:text-3xl font-bold text-white">
                {values[card.field]}
                {card.field === "persentaseKehadiran" && (
                  <span className="text-lg text-slate-400 ml-0.5">%</span>
                )}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
