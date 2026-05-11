import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Building2,
  CalendarDays,
  TrendingUp,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  UserCircle,
  Plus,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import ReviewModal from "../../components/modals/ReviewModal";
import InspectionModal from "../../components/modals/InspectionModal";
import PremiumModal from "../../components/modals/PremiumModal";
import CreateRoomModal from "../../components/modals/CreateRoomModal";
import {
  periodLabels,
  statusColors,
  statusLabels,
  type Booking,
} from "../../types/booking";
import type { Consultory } from "../../types/consultory";
import type { Room } from "../../types/room";
import { useAuth } from "../../context/AuthContext";
import { listBookingsByOwner } from "../../lib/api/bookings";
import { listConsultoriesByOwner } from "../../lib/api/consultories";
import { listRoomsByConsultory } from "../../lib/api/rooms";

const navItems = [
  { label: "Visão geral", path: "/dashboard/proprietario", icon: <Building2 size={18} /> },
  { label: "Minhas salas", path: "/consultorios", icon: <Building2 size={18} /> },
  { label: "Perfil do Consultório", path: "/dashboard/proprietario/perfil", icon: <UserCircle size={18} /> },
];

type TabId = "agenda" | "salas" | "extrato";

export default function OwnerDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("agenda");
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [inspectionBooking, setInspectionBooking] = useState<Booking | null>(null);
  const [inspectionType, setInspectionType] = useState<"check-in" | "check-out">("check-in");
  const [premiumConsultory, setPremiumConsultory] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [consultories, setConsultories] = useState<Consultory[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ownerId = currentUser?.id;
    if (!ownerId) {
      setBookings([]);
      setConsultories([]);
      setIsLoading(false);
      return;
    }
    const safeOwnerId = ownerId;

    let cancelled = false;

    async function loadData() {
      try {
        const [bookingsData, consultoriesData] = await Promise.all([
          listBookingsByOwner(safeOwnerId),
          listConsultoriesByOwner(safeOwnerId),
        ]);

        if (!cancelled) {
          setBookings(bookingsData);
          setConsultories(consultoriesData);
          setError("");
        }

        if (!cancelled && consultoriesData.length > 0) {
          const roomsData = await listRoomsByConsultory(consultoriesData[0].id);
          if (!cancelled) setRooms(roomsData);
        }
      } catch (loadError) {
        if (!cancelled) {
          const message =
            loadError instanceof Error ? loadError.message : "Não foi possível carregar o painel.";
          setError(message);
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
  }, [currentUser?.id, refreshTick]);

  const upcomingBookings = useMemo(
    () => bookings.filter((b) => b.status === "confirmed" || b.status === "pending"),
    [bookings]
  );

  const completedBookings = useMemo(
    () => bookings.filter((b) => b.status === "completed"),
    [bookings]
  );

  const monthRevenue = useMemo(
    () => completedBookings.reduce((sum, b) => sum + b.price, 0),
    [completedBookings]
  );

  const pendingReview = useMemo(
    () => bookings.filter((b) => b.status === "completed" && !b.reviewedByOwner),
    [bookings]
  );

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "agenda", label: "Agenda", count: upcomingBookings.length },
    { id: "salas", label: "Minhas salas", count: rooms.length },
    {
      id: "extrato",
      label: "Extrato",
      count: pendingReview.length > 0 ? pendingReview.length : undefined,
    },
  ];

  const primaryConsultory = consultories[0];

  return (
    <DashboardLayout
      navItems={navItems}
      title="Painel do Proprietário"
      titleClassName="!font-normal"
      profileOverride={
        primaryConsultory
          ? {
              name: primaryConsultory.name,
              avatarUrl: primaryConsultory.logoUrl,
              subtitle: "Proprietário",
            }
          : undefined
      }
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-neutral-900">
            Olá, {currentUser?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-neutral-500 mt-1">
            Gerencie suas salas e acompanhe seus ganhos.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Building2 size={20} />}
            label="Salas cadastradas"
            value={rooms.length}
            color="blue"
          />
          <StatCard
            icon={<CalendarDays size={20} />}
            label="Reservas este mês"
            value={bookings.length}
            color="accent"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Ganhos recebidos"
            value={`R$ ${monthRevenue}`}
            sub="locações concluídas"
            color="green"
          />
          <StatCard
            icon={<Star size={20} />}
            label="Sua avaliação"
            value={currentUser?.rating ?? "—"}
            sub={`${currentUser?.totalReviews ?? 0} avaliações`}
            color="neutral"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

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
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {isLoading ? (
            <EmptyState message="Carregando painel..." />
          ) : (
            <>
              {activeTab === "agenda" && (
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <EmptyState message="Nenhuma reserva para seus consultórios ainda." />
                  ) : (
                    bookings.map((booking) => (
                      <OwnerBookingCard
                        key={booking.id}
                        booking={booking}
                        onReview={() => setReviewBooking(booking)}
                        onInspection={(type) => {
                          setInspectionBooking(booking);
                          setInspectionType(type);
                        }}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === "salas" && (
                <div className="space-y-4">
                  {primaryConsultory && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-neutral-500">
                        Salas de{" "}
                        <span className="font-medium text-neutral-700">{primaryConsultory.name}</span>
                      </p>
                      <button
                        onClick={() => setShowCreateRoom(true)}
                        className="flex items-center gap-1.5 text-sm bg-primary-500 text-white rounded-xl px-4 py-2 hover:bg-primary-600 transition-colors font-medium"
                      >
                        <Plus size={15} />
                        Adicionar sala
                      </button>
                    </div>
                  )}
                  {rooms.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] p-10 text-center">
                      <Building2 size={36} className="mx-auto mb-3 text-neutral-300" />
                      <p className="text-neutral-500 text-sm mb-1">Nenhuma sala cadastrada ainda.</p>
                      <p className="text-neutral-400 text-xs">
                        Adicione salas ao seu consultório para receber reservas.
                      </p>
                    </div>
                  ) : (
                    rooms.map((room) => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] p-5 flex flex-col sm:flex-row gap-4"
                      >
                        <img
                          src={room.images[0]}
                          alt={room.name}
                          className="w-full sm:w-24 h-36 sm:h-24 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <p className="font-display font-bold text-neutral-800">{room.name}</p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                room.available
                                  ? "bg-green-50 text-green-600"
                                  : "bg-neutral-100 text-neutral-500"
                              }`}
                            >
                              {room.available ? "Disponível" : "Indisponível"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500 mb-2">
                            <span className="font-display font-bold text-primary-500">
                              R$ {room.pricePerPeriod}/período
                            </span>
                            <span className="flex items-center gap-1.5">
                              {room.periods.morning && <Sun size={13} className="text-accent-400" />}
                              {room.periods.afternoon && <Sunset size={13} className="text-accent-400" />}
                              {room.periods.evening && <Moon size={13} className="text-primary-400" />}
                              {[
                                room.periods.morning && "Manhã",
                                room.periods.afternoon && "Tarde",
                                room.periods.evening && "Noite",
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </div>
                          {room.equipment.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {room.equipment.slice(0, 3).map((eq) => (
                                <span
                                  key={eq}
                                  className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full"
                                >
                                  {eq}
                                </span>
                              ))}
                              {room.equipment.length > 3 && (
                                <span className="text-xs text-neutral-400">
                                  +{room.equipment.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button className="flex items-center gap-1.5 text-xs border border-neutral-200 text-neutral-600 rounded-lg px-3 py-1.5 hover:bg-neutral-50 transition-colors">
                              <Edit3 size={13} />
                              Editar
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "extrato" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-5 shadow-[0_4px_24px_rgba(0,102,204,0.08)]">
                      <p className="text-xs text-neutral-400 mb-1">Total bruto</p>
                      <p className="font-display font-bold text-xl text-neutral-900">R$ {monthRevenue}</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-[0_4px_24px_rgba(0,102,204,0.08)]">
                      <p className="text-xs text-neutral-400 mb-1">Comissão AlugFácil (10%)</p>
                      <p className="font-display font-bold text-xl text-red-500">– R$ {Math.round(monthRevenue * 0.1)}</p>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-5">
                      <p className="text-xs text-primary-500 mb-1">Valor líquido</p>
                      <p className="font-display font-bold text-xl text-primary-600">R$ {Math.round(monthRevenue * 0.9)}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] overflow-hidden">
                    <div className="px-5 py-4 border-b border-neutral-100">
                      <p className="font-display font-semibold text-neutral-800">Transações</p>
                    </div>
                    {completedBookings.length === 0 ? (
                      <div className="p-8 text-center text-neutral-400 text-sm">
                        Nenhuma transação concluída ainda.
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-50">
                        {bookings.filter((b) => b.status !== "pending").map((b) => (
                          <div key={b.id} className="flex items-center gap-4 px-5 py-4">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                b.status === "completed"
                                  ? "bg-green-50"
                                  : b.status === "cancelled"
                                  ? "bg-red-50"
                                  : "bg-primary-50"
                              }`}
                            >
                              {b.status === "completed" ? (
                                <CheckCircle2 size={18} className="text-green-500" />
                              ) : b.status === "cancelled" ? (
                                <XCircle size={18} className="text-red-400" />
                              ) : (
                                <Clock size={18} className="text-primary-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-800 truncate">{b.consultoryName}</p>
                              <p className="text-xs text-neutral-400">
                                {b.tenantName} · {b.date} · {periodLabels[b.period]}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              {b.status === "completed" ? (
                                <>
                                  <p className="text-sm font-display font-bold text-green-600">+ R$ {Math.round(b.price * 0.9)}</p>
                                  <p className="text-xs text-neutral-400">– R$ {Math.round(b.price * 0.1)} taxa</p>
                                </>
                              ) : (
                                <p className={`text-sm font-medium ${statusColors[b.status]} px-2 py-0.5 rounded-full`}>
                                  {statusLabels[b.status]}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {pendingReview.length > 0 && (
                    <div>
                      <p className="font-display font-semibold text-neutral-800 mb-3">Avaliações pendentes</p>
                      <div className="space-y-3">
                        {pendingReview.map((booking) => (
                          <div
                            key={booking.id}
                            className="bg-white rounded-xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] p-4 flex items-center gap-4"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-800 truncate">{booking.tenantName}</p>
                              <p className="text-xs text-neutral-400">
                                {booking.consultoryName} · {booking.date}
                              </p>
                            </div>
                            <button
                              onClick={() => setReviewBooking(booking)}
                              className="flex items-center gap-1.5 text-xs bg-accent-50 text-accent-600 border border-accent-200 rounded-lg px-3 py-2 hover:bg-accent-100 transition-colors shrink-0"
                            >
                              <Star size={13} />
                              Avaliar locatário
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {reviewBooking && (
        <ReviewModal
          isOpen={true}
          onClose={() => setReviewBooking(null)}
          booking={reviewBooking}
          reviewerRole="owner"
          onSubmitted={() => setRefreshTick((value) => value + 1)}
        />
      )}

      {inspectionBooking && (
        <InspectionModal
          isOpen={true}
          onClose={() => setInspectionBooking(null)}
          booking={inspectionBooking}
          type={inspectionType}
          onSubmitted={() => setRefreshTick((value) => value + 1)}
        />
      )}

      {premiumConsultory && (
        <PremiumModal
          isOpen={true}
          onClose={() => setPremiumConsultory(null)}
          consultoryName={premiumConsultory}
        />
      )}

      {showCreateRoom && primaryConsultory && currentUser && (
        <CreateRoomModal
          consultoryId={primaryConsultory.id}
          ownerId={currentUser.id}
          onClose={() => setShowCreateRoom(false)}
          onCreated={(room) => {
            setRooms((prev) => [...prev, room]);
            setShowCreateRoom(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}

function OwnerBookingCard({
  booking,
  onReview,
  onInspection,
}: {
  booking: Booking;
  onReview: () => void;
  onInspection: (type: "check-in" | "check-out") => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] p-5 flex flex-col sm:flex-row gap-4"
    >
      <img
        src={booking.consultoryImage}
        alt={booking.consultoryName}
        className="w-full sm:w-20 h-32 sm:h-20 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <p className="font-display font-bold text-neutral-800">{booking.consultoryName}</p>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
            {statusLabels[booking.status]}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500 mb-3">
          <span className="flex items-center gap-1">
            <CalendarDays size={14} />
            {booking.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {periodLabels[booking.period]}
          </span>
          <span className="text-neutral-700 font-medium">{booking.tenantName}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-display font-bold text-primary-500">R$ {booking.price}</span>
          <div className="flex gap-2">
            {booking.status === "confirmed" && (
              <>
                <button
                  onClick={() => onInspection("check-in")}
                  className="flex items-center gap-1.5 text-xs border border-primary-300 text-primary-600 rounded-lg px-3 py-1.5 hover:bg-primary-50 transition-colors"
                >
                  <CheckCircle2 size={14} />
                  Confirmar check-in
                </button>
                <button
                  onClick={() => onInspection("check-out")}
                  className="flex items-center gap-1.5 text-xs border border-neutral-300 text-neutral-600 rounded-lg px-3 py-1.5 hover:bg-neutral-50 transition-colors"
                >
                  <CheckCircle2 size={14} />
                  Confirmar check-out
                </button>
              </>
            )}
            {booking.status === "completed" && !booking.reviewedByOwner && (
              <button
                onClick={onReview}
                className="flex items-center gap-1.5 text-xs bg-accent-50 text-accent-600 border border-accent-200 rounded-lg px-3 py-1.5 hover:bg-accent-100 transition-colors"
              >
                <Star size={14} />
                Avaliar locatário
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({
  message,
  cta,
  href,
}: {
  message: string;
  cta?: string;
  href?: string;
}) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.06)]">
      <p className="text-neutral-400 mb-4">{message}</p>
      {cta && href && (
        <Link
          to={href}
          className="inline-flex items-center gap-2 bg-primary-500 text-white rounded-xl px-5 py-2.5 text-sm font-display font-semibold hover:bg-primary-600 transition-colors"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}
