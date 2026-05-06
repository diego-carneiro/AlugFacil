import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Users,
  CalendarDays,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  Building2,
  Star,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import { statusColors, statusLabels, periodLabels, type Booking } from "../../types/booking";
import type { User } from "../../types/user";
import type { Consultory } from "../../types/consultory";
import { listUsers } from "../../lib/api/users";
import { listBookings } from "../../lib/api/bookings";
import { listConsultories } from "../../lib/api/consultories";

const navItems = [
  { label: "Visão geral", path: "/dashboard/admin", icon: <TrendingUp size={18} /> },
  { label: "Usuários", path: "/dashboard/admin", icon: <Users size={18} /> },
  { label: "Reservas", path: "/dashboard/admin", icon: <CalendarDays size={18} /> },
  { label: "Consultórios", path: "/dashboard/admin", icon: <Building2 size={18} /> },
];

type TabId = "overview" | "users" | "bookings" | "verifications";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [consultories, setConsultories] = useState<Consultory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [usersData, bookingsData, consultoriesData] = await Promise.all([
          listUsers(),
          listBookings(),
          listConsultories(),
        ]);

        if (!cancelled) {
          setUsers(usersData);
          setBookings(bookingsData);
          setConsultories(consultoriesData);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          const message =
            loadError instanceof Error ? loadError.message : "Não foi possível carregar o painel administrativo.";
          setError(message);
          setUsers([]);
          setBookings([]);
          setConsultories([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalRevenue = useMemo(
    () => bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.price, 0),
    [bookings]
  );

  const alugfacilFee = Math.round(totalRevenue * 0.1);
  const pendingVerifications = users.filter((u) => !u.verified && u.role !== "admin");
  const tenants = users.filter((u) => u.role === "tenant");
  const owners = users.filter((u) => u.role === "owner");

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: "overview", label: "Visão geral" },
    { id: "users", label: "Usuários", badge: users.filter((u) => u.role !== "admin").length },
    { id: "bookings", label: "Reservas", badge: bookings.length },
    { id: "verifications", label: "Verificações", badge: pendingVerifications.length },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Painel Administrativo">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-neutral-900">Painel Admin</h2>
          <p className="text-neutral-500 mt-1">Visão macro da plataforma AlugFácil.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users size={20} />}
            label="Usuários cadastrados"
            value={users.filter((u) => u.role !== "admin").length}
            sub={`${tenants.length} dentistas · ${owners.length} proprietários`}
            color="blue"
          />
          <StatCard
            icon={<CalendarDays size={20} />}
            label="Reservas totais"
            value={bookings.length}
            sub={`${bookings.filter((b) => b.status === "completed").length} concluídas`}
            color="accent"
          />
          <StatCard
            icon={<DollarSign size={20} />}
            label="Volume financeiro"
            value={`R$ ${totalRevenue}`}
            sub={`R$ ${alugfacilFee} de comissão`}
            color="green"
          />
          <StatCard
            icon={<AlertTriangle size={20} />}
            label="Verificações pendentes"
            value={pendingVerifications.length}
            sub="usuários aguardando"
            color="neutral"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-neutral-500">Carregando dados administrativos...</div>
        ) : (
          <div>
            <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl w-fit mb-6 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className="w-5 h-5 bg-neutral-300 text-neutral-700 rounded-full text-xs flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <p className="font-display font-semibold text-neutral-800">Reservas recentes</p>
                    <button onClick={() => setActiveTab("bookings")} className="text-xs text-primary-500 hover:underline">
                      Ver todas
                    </button>
                  </div>
                  <div className="divide-y divide-neutral-50">
                    {bookings.slice(0, 5).map((b) => (
                      <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            b.status === "completed"
                              ? "bg-green-500"
                              : b.status === "confirmed"
                              ? "bg-primary-500"
                              : b.status === "pending"
                              ? "bg-accent-400"
                              : "bg-red-400"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-neutral-800 truncate">{b.consultoryName}</p>
                          <p className="text-xs text-neutral-400">{b.tenantName} · {b.date}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.status]}`}>
                          {statusLabels[b.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-100">
                    <p className="font-display font-semibold text-neutral-800">Performance dos consultórios</p>
                  </div>
                  <div className="divide-y divide-neutral-50">
                    {consultories.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                        <img src={c.images[0]} alt={c.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-neutral-800 truncate">{c.name}</p>
                          <p className="text-xs text-neutral-400">{c.neighborhood}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-xs text-neutral-700">
                            <Star size={11} className="text-accent-400" />
                            {c.rating}
                          </div>
                          <p className="text-xs text-neutral-400">{c.totalReviews} avaliações</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] p-5 lg:col-span-2">
                  <p className="font-display font-semibold text-neutral-800 mb-4">Resumo financeiro</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Volume total", value: `R$ ${totalRevenue}`, color: "text-neutral-900" },
                      { label: "Comissão (10%)", value: `R$ ${alugfacilFee}`, color: "text-green-600" },
                      { label: "Repasse proprietários", value: `R$ ${totalRevenue - alugfacilFee}`, color: "text-primary-600" },
                      {
                        label: "Ticket médio",
                        value: `R$ ${
                          bookings.filter((b) => b.status === "completed").length > 0
                            ? Math.round(totalRevenue / bookings.filter((b) => b.status === "completed").length)
                            : 0
                        }`,
                        color: "text-neutral-700",
                      },
                    ].map((item) => (
                      <div key={item.label} className="bg-neutral-50 rounded-xl p-4">
                        <p className="text-xs text-neutral-400 mb-1">{item.label}</p>
                        <p className={`font-display font-bold text-lg ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100">
                  <p className="font-display font-semibold text-neutral-800">Todos os usuários ({users.filter((u) => u.role !== "admin").length})</p>
                </div>
                <div className="divide-y divide-neutral-50">
                  {users.filter((u) => u.role !== "admin").map((user) => (
                    <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 px-5 py-4">
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0">
                        {user.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">{user.name}</p>
                        <p className="text-xs text-neutral-400">{user.email}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          user.role === "tenant" ? "bg-primary-50 text-primary-600" : "bg-accent-50 text-accent-600"
                        }`}>
                          {user.role === "tenant" ? "Dentista" : "Proprietário"}
                        </span>
                        {user.verified ? (
                          <CheckCircle2 size={16} className="text-green-500" />
                        ) : (
                          <Clock size={16} className="text-accent-400" />
                        )}
                      </div>
                      {user.rating > 0 && (
                        <div className="hidden md:flex items-center gap-1 text-xs text-neutral-500 shrink-0">
                          <Star size={12} className="text-accent-400" />
                          {user.rating}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100">
                  <p className="font-display font-semibold text-neutral-800">Todas as reservas ({bookings.length})</p>
                </div>
                <div className="divide-y divide-neutral-50">
                  {bookings.map((b) => (
                    <div key={b.id} className="flex items-center gap-4 px-5 py-4">
                      <img src={b.consultoryImage} alt={b.consultoryName} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">{b.consultoryName}</p>
                        <p className="text-xs text-neutral-400 truncate">
                          {b.tenantName} → {b.ownerName} · {b.date} · {periodLabels[b.period]}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-display font-bold text-neutral-800">R$ {b.price}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.status]}`}>
                          {statusLabels[b.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "verifications" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-100">
                    <p className="font-display font-semibold text-neutral-800">Verificações pendentes ({pendingVerifications.length})</p>
                  </div>
                  {pendingVerifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
                      <p className="text-neutral-400 text-sm">Nenhuma verificação pendente!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-50">
                      {pendingVerifications.map((user) => (
                        <div key={user.id} className="flex items-center gap-4 px-5 py-4">
                          <div className="w-10 h-10 bg-neutral-100 text-neutral-500 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0">
                            {user.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-800 truncate">{user.name}</p>
                            <p className="text-xs text-neutral-400">{user.email}</p>
                            {user.cro && <p className="text-xs text-primary-500 mt-0.5">{user.cro}</p>}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button className="flex items-center gap-1 text-xs bg-green-50 text-green-600 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-100 transition-colors">
                              <CheckCircle2 size={13} />
                              Aprovar
                            </button>
                            <button className="flex items-center gap-1 text-xs bg-red-50 text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors">
                              <XCircle size={13} />
                              Recusar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-100">
                    <p className="font-display font-semibold text-neutral-800">Usuários verificados ({users.filter((u) => u.verified && u.role !== "admin").length})</p>
                  </div>
                  <div className="divide-y divide-neutral-50">
                    {users.filter((u) => u.verified && u.role !== "admin").map((user) => (
                      <div key={user.id} className="flex items-center gap-3 px-5 py-3">
                        <ShieldCheck size={16} className="text-green-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">{user.name}</p>
                          <p className="text-xs text-neutral-400">{user.role === "tenant" ? "Dentista" : "Proprietário"}</p>
                        </div>
                        <p className="text-xs text-neutral-400 shrink-0">{user.createdAt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
