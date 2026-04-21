import { useState } from "react";
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
  bookings,
  periodLabels,
  statusColors,
  statusLabels,
  type Booking,
} from "../../data/bookings";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Visão geral", path: "/dashboard/locatario", icon: <CalendarDays size={18} /> },
  { label: "Buscar consultórios", path: "/consultorios", icon: <Search size={18} /> },
];

type TabId = "active" | "history" | "reviews";

export default function TenantDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("active");
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [inspectionBooking, setInspectionBooking] = useState<Booking | null>(null);
  const [inspectionType, setInspectionType] = useState<"check-in" | "check-out">("check-in");

  const myBookings = bookings.filter(b => b.tenantId === (currentUser?.id ?? "tenant-1"));

  const activeBookings = myBookings.filter(b => b.status === "confirmed" || b.status === "pending");
  const historyBookings = myBookings.filter(b => b.status === "completed" || b.status === "cancelled");
  const pendingReview = myBookings.filter(b => b.status === "completed" && !b.reviewedByTenant);

  const totalSpent = myBookings
    .filter(b => b.status === "completed")
    .reduce((sum, b) => sum + b.price, 0);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "active", label: "Reservas ativas", count: activeBookings.length },
    { id: "history", label: "Histórico" },
    { id: "reviews", label: "Avaliações pendentes", count: pendingReview.length },
  ];

  const openInspection = (booking: Booking, type: "check-in" | "check-out") => {
    setInspectionBooking(booking);
    setInspectionType(type);
  };

  return (
    <DashboardLayout navItems={navItems} title="Meu Painel">
      <div className="space-y-8">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-display font-bold text-neutral-900">
            Olá, {currentUser?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-neutral-500 mt-1">
            Aqui está um resumo das suas atividades.
          </p>
        </div>

        {/* Stats */}
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
            value={activeBookings[0]?.date ?? "—"}
            sub={activeBookings[0] ? periodLabels[activeBookings[0].period] : undefined}
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

        {/* Tabs */}
        <div>
          <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl w-fit mb-6">
            {tabs.map(tab => (
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

          {/* Active bookings */}
          {activeTab === "active" && (
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <EmptyState
                  message="Nenhuma reserva ativa no momento."
                  cta="Buscar consultórios"
                  href="/consultorios"
                />
              ) : (
                activeBookings.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onInspection={openInspection}
                  />
                ))
              )}
            </div>
          )}

          {/* History */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {historyBookings.length === 0 ? (
                <EmptyState message="Nenhuma locação no histórico ainda." />
              ) : (
                historyBookings.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onReview={() => setReviewBooking(booking)}
                  />
                ))
              )}
            </div>
          )}

          {/* Pending reviews */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {pendingReview.length === 0 ? (
                <EmptyState message="Nenhuma avaliação pendente. Obrigado!" />
              ) : (
                pendingReview.map(booking => (
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
        </div>
      </div>

      {reviewBooking && (
        <ReviewModal
          isOpen={true}
          onClose={() => setReviewBooking(null)}
          booking={reviewBooking}
          reviewerRole="tenant"
        />
      )}

      {inspectionBooking && (
        <InspectionModal
          isOpen={true}
          onClose={() => setInspectionBooking(null)}
          booking={inspectionBooking}
          type={inspectionType}
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
            {booking.status === "completed" && !booking.reviewedByTenant && onReview && (
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
