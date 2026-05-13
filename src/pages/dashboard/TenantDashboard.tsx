import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  CalendarDays,
  CreditCard,
  Star,
  Clock,
  MapPin,
  ClipboardCheck,
  MessageSquarePlus,
  Search,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import Badge from "../../components/ui/Badge";
import ReviewModal from "../../components/modals/ReviewModal";
import InspectionModal from "../../components/modals/InspectionModal";
import {
  ACTIVE_BOOKING_STATUSES,
  periodLabels,
  statusColors,
  statusLabels,
  type Booking,
} from "../../types/booking";
import { useAuth } from "../../context/AuthContext";
import { listBookingsByTenant } from "../../lib/api/bookings";

const navItems = [
  {
    label: "Visão geral",
    path: "/dashboard/tenant",
    icon: <CalendarDays size={18} />,
  },
  {
    label: "Buscar consultórios",
    path: "/dashboard/tenant/search",
    icon: <Search size={18} />,
  },
];

type TabId = "active" | "history" | "reviews";

export default function TenantDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("active");
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [inspectionBooking, setInspectionBooking] = useState<Booking | null>(
    null,
  );
  const [inspectionType, setInspectionType] = useState<
    "check-in" | "check-out"
  >("check-in");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const tenantId = currentUser?.id;
    if (!tenantId) {
      setBookings([]);
      setIsLoading(false);
      return;
    }
    const safeTenantId = tenantId;

    let cancelled = false;

    async function loadBookings() {
      try {
        const items = await listBookingsByTenant(safeTenantId);
        if (!cancelled) {
          setBookings(items);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar as reservas.";
          setError(message);
          setBookings([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, refreshTick]);

  const activeBookings = useMemo(
    () =>
      bookings
        .filter((b) => ACTIVE_BOOKING_STATUSES.includes(b.status))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [bookings],
  );

  const historyBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.status === "completed" || b.status === "cancelled",
      ),
    [bookings],
  );

  const pendingReview = useMemo(
    () =>
      bookings.filter((b) => b.status === "completed" && !b.reviewedByTenant),
    [bookings],
  );

  const totalSpent = useMemo(
    () =>
      bookings
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + b.price, 0),
    [bookings],
  );

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "active", label: "Reservas ativas", count: activeBookings.length },
    { id: "history", label: "Histórico" },
    {
      id: "reviews",
      label: "Avaliações pendentes",
      count: pendingReview.length,
    },
  ];

  const openInspection = (booking: Booking, type: "check-in" | "check-out") => {
    setInspectionBooking(booking);
    setInspectionType(type);
  };

  return (
    <DashboardLayout
      navItems={navItems}
      title="Meu Painel"
      titleClassName="font-normal"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-neutral-900">
            Olá, {currentUser?.name?.split(" ")[0]}
          </h2>
          <p className="text-neutral-500 mt-1">
            Aqui está um resumo das suas atividades.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<CalendarDays size={20} />}
            label="Reservas ativas"
            value={activeBookings.length}
            color="blue"
          />
          <StatCard
            icon={<Clock size={20} />}
            label="Próxima reserva"
            value={activeBookings[0]?.consultoryName ?? "—"}
            sub={activeBookings[0]?.date}
            color="accent"
          />
          <StatCard
            icon={<CreditCard size={20} />}
            label="Total investido"
            value={`R$ ${totalSpent}`}
            sub="em locações concluídas"
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
          <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl w-fit mb-6">
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
            <EmptyState message="Carregando suas reservas..." />
          ) : (
            <>
              {activeTab === "active" && (
                <div className="space-y-4">
                  {activeBookings.length === 0 ? (
                    <EmptyState
                      message="Nenhuma reserva ativa no momento."
                      cta="Buscar consultórios"
                      href="/dashboard/tenant/search"
                    />
                  ) : (
                    activeBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onInspection={openInspection}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-4">
                  {historyBookings.length === 0 ? (
                    <EmptyState message="Nenhuma locação no histórico ainda." />
                  ) : (
                    historyBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onReview={() => setReviewBooking(booking)}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-4">
                  {pendingReview.length === 0 ? (
                    <EmptyState message="Nenhuma avaliação pendente. Obrigado!" />
                  ) : (
                    pendingReview.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                      >
                        <img
                          src={booking.consultoryImage}
                          alt={booking.consultoryName}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-neutral-800 truncate">
                            {booking.consultoryName}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {booking.date} · {periodLabels[booking.period]}
                          </p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setReviewBooking(booking)}
                          className="flex items-center gap-2 bg-accent-300 text-neutral-900 rounded-xl px-4 py-2.5 text-sm font-display font-semibold hover:bg-accent-400 transition-colors shrink-0"
                        >
                          <MessageSquarePlus size={16} />
                          Avaliar
                        </motion.button>
                      </div>
                    ))
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
          reviewerRole="tenant"
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
    </DashboardLayout>
  );
}

function BookingCard({
  booking,
  onReview,
  onInspection,
}: {
  booking: Booking;
  onReview?: () => void;
  onInspection?: (booking: Booking, type: "check-in" | "check-out") => void;
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
        className="w-full sm:w-20 h-40 sm:h-20 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <Link
            to={`/consultorios/${booking.consultoryId}`}
            className="font-display font-bold text-neutral-800 hover:text-primary-500 transition-colors truncate"
          >
            {booking.consultoryName}
          </Link>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}
          >
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
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {booking.ownerName}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-display font-bold text-primary-500">
            R$ {booking.price}
          </span>
          <div className="flex gap-2">
            {booking.status === "confirmed" && onInspection && (
              <>
                {!booking.inspectedCheckIn && (
                  <button
                    onClick={() => onInspection(booking, "check-in")}
                    className="flex items-center gap-1.5 text-xs border border-primary-300 text-primary-600 rounded-lg px-3 py-1.5 hover:bg-primary-50 transition-colors"
                  >
                    <ClipboardCheck size={14} />
                    Check-in
                  </button>
                )}
                {booking.inspectedCheckIn && !booking.inspectedCheckOut && (
                  <button
                    onClick={() => onInspection(booking, "check-out")}
                    className="flex items-center gap-1.5 text-xs border border-neutral-300 text-neutral-600 rounded-lg px-3 py-1.5 hover:bg-neutral-50 transition-colors"
                  >
                    <ClipboardCheck size={14} />
                    Check-out
                  </button>
                )}
              </>
            )}
            {booking.status === "completed" &&
              !booking.reviewedByTenant &&
              onReview && (
                <button
                  onClick={onReview}
                  className="flex items-center gap-1.5 text-xs bg-accent-50 text-accent-600 border border-accent-200 rounded-lg px-3 py-1.5 hover:bg-accent-100 transition-colors"
                >
                  <Star size={14} />
                  Avaliar
                </button>
              )}
            {booking.status === "completed" && booking.reviewedByTenant && (
              <Badge variant="default">Avaliado</Badge>
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
