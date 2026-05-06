import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Star,
  Calendar,
  FileText,
  BadgeCheck,
  Edit3,
  LayoutDashboard,
  Phone,
} from "lucide-react";
import Container from "../components/ui/Container";
import { useAuth } from "../context/AuthContext";

const ROLE_LABELS: Record<string, string> = {
  tenant: "Dentista",
  owner: "Proprietário de Consultório",
  admin: "Administrador",
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  tenant: "bg-primary-50 text-primary-600 border-primary-100",
  owner: "bg-accent-50 text-accent-600 border-accent-100",
  admin: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

function StatCard({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-4 bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,102,204,0.06)]">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="font-display font-bold text-lg text-neutral-800">{value}</span>
      </div>
      <p className="text-xs text-neutral-400 text-center">{label}</p>
    </div>
  );
}

export default function Profile() {
  const { currentUser, isAuthReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthReady && !currentUser) {
      navigate("/entrar");
    }
  }, [isAuthReady, currentUser, navigate]);

  if (!isAuthReady || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 lg:pt-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const initials = currentUser.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const memberSince = new Date(currentUser.createdAt).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const ratingDisplay =
    currentUser.rating > 0 ? currentUser.rating.toFixed(1) : "—";

  return (
    <div className="min-h-screen bg-neutral-50 pt-16 lg:pt-20">
      {/* Cover */}
      <div className="h-44 md:h-52 lg:h-60 bg-linear-to-br from-primary-700 via-primary-500 to-primary-400 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute top-6 left-1/2 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute bottom-4 right-1/4 w-24 h-24 bg-white/5 rounded-full" />
      </div>

      <Container>
        {/* Avatar sobrepondo cover */}
        <div className="-mt-14 md:-mt-16 mb-4 relative z-10">
          <div className="w-28 h-28 md:w-32 md:h-32 bg-white rounded-full border-4 border-white shadow-[0_8px_32px_rgba(0,102,204,0.18)] flex items-center justify-center">
            <span className="text-4xl md:text-5xl font-display font-bold text-primary-500">
              {initials}
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="pb-16"
        >
          {/* Nome, badges e botão de editar */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-neutral-800">
                  {currentUser.name}
                </h1>
                {currentUser.verified && (
                  <BadgeCheck size={22} className="text-primary-500 shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    ROLE_BADGE_COLORS[currentUser.role]
                  }`}
                >
                  {ROLE_LABELS[currentUser.role]}
                </span>
                {currentUser.specialty && (
                  <span className="text-sm text-neutral-500">{currentUser.specialty}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start">
              <Link
                to="/dashboard/locatario"
                className="inline-flex items-center gap-2 text-sm text-neutral-600 border border-neutral-200 px-3 py-2 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <LayoutDashboard size={15} />
                <span className="hidden sm:inline">Painel</span>
              </Link>
              <button className="inline-flex items-center gap-2 border border-neutral-200 text-neutral-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors">
                <Edit3 size={15} />
                Editar perfil
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8 max-w-sm">
            <StatCard
              value={ratingDisplay}
              label="Avaliação"
              icon={<Star size={15} className="text-accent-500 fill-accent-500" />}
            />
            <StatCard
              value={String(currentUser.totalReviews)}
              label="Avaliações"
              icon={<FileText size={15} className="text-neutral-400" />}
            />
            <StatCard
              value={new Date(currentUser.createdAt).getFullYear().toString()}
              label="Desde"
              icon={<Calendar size={15} className="text-neutral-400" />}
            />
          </div>

          {/* Card de informações */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-6 max-w-lg">
            <h2 className="font-display font-semibold text-neutral-700 mb-5">Informações</h2>
            <div className="space-y-4">
              {currentUser.cro && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={15} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">CRO</p>
                    <p className="text-sm font-medium text-neutral-700">{currentUser.cro}</p>
                  </div>
                </div>
              )}

              {currentUser.specialty && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-base">🦷</span>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Especialidade</p>
                    <p className="text-sm font-medium text-neutral-700">{currentUser.specialty}</p>
                  </div>
                </div>
              )}

              {currentUser.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={15} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Telefone</p>
                    <p className="text-sm font-medium text-neutral-700">{currentUser.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar size={15} className="text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Membro desde</p>
                  <p className="text-sm font-medium text-neutral-700 capitalize">{memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
