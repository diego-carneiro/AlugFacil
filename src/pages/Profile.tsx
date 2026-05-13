import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Star,
  Calendar,
  FileText,
  BadgeCheck,
  Phone,
  Camera,
  Loader2,
  UserCircle,
  Search,
  CalendarDays,
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getUserById, uploadAndSaveUserIdentityImage } from "../lib/api/users";
import { resolveStorageUrl } from "../lib/storage/media";
import type { UserRole } from "../types/user";

const navItems = [
  { label: "Visão geral", path: "/dashboard/tenant", icon: <CalendarDays size={18} /> },
  {
    label: "Buscar consultórios",
    path: "/dashboard/tenant/search",
    icon: <Search size={18} />,
  },
  {
    label: "Meu perfil",
    path: "/profile",
    icon: <UserCircle size={18} />,
  },
];

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
    <div className="flex flex-col items-center justify-center gap-1 p-4 bg-neutral-50 rounded-2xl">
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

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [avatarKey, setAvatarKey] = useState<string | undefined>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthReady && !currentUser) {
      navigate("/login", { replace: true });
      return;
    }
    if (isAuthReady && currentUser?.role === "owner") {
      navigate("/dashboard/owner/profile", { replace: true });
    }
  }, [isAuthReady, currentUser, navigate]);

  useEffect(() => {
    const userId = currentUser?.id;
    if (!userId) return;

    let cancelled = false;

    async function loadAvatar() {
      try {
        const profile = await getUserById(userId!);
        if (cancelled || !profile?.avatar) return;
        setAvatarKey(profile.avatar);
        const url = await resolveStorageUrl(profile.avatar);
        if (!cancelled) setAvatarUrl(url);
      } catch {
        // noop — avatar is optional
      }
    }

    void loadAvatar();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !currentUser) return;

      e.target.value = "";
      setUploadingAvatar(true);
      setUploadError("");

      try {
        const newKey = await uploadAndSaveUserIdentityImage({
          userId: currentUser.id,
          role: currentUser.role as Exclude<UserRole, "admin">,
          file,
          previousAvatarKey: avatarKey,
        });
        setAvatarKey(newKey);
        const url = await resolveStorageUrl(newKey);
        setAvatarUrl(url);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Erro ao fazer upload da foto.");
      } finally {
        setUploadingAvatar(false);
      }
    },
    [currentUser, avatarKey]
  );

  if (!isAuthReady || !currentUser || currentUser.role === "owner") {
    return (
      <div className="min-h-dvh flex items-center justify-center">
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
    <DashboardLayout
      navItems={navItems}
      title="Meu Perfil"
      defaultSidebarOpen={false}
      showTitle={false}
      fixedCenter
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6 max-w-5xl mx-auto"
      >
        {/* Header card — cover + avatar */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-linear-to-br from-primary-700 via-primary-500 to-primary-400 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute top-4 left-1/3 w-24 h-24 bg-white/5 rounded-full" />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="-mt-12 mb-4 relative z-10">
              <div className="relative w-24 h-24 group">
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  aria-label="Alterar foto de perfil"
                  className="w-full h-full bg-white rounded-full border-4 border-white shadow-[0_8px_32px_rgba(0,102,204,0.18)] overflow-hidden flex items-center justify-center relative focus:outline-none"
                >
                  {uploadingAvatar ? (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 size={24} className="text-white animate-spin" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                    </div>
                  )}
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-display font-bold text-primary-500">
                      {initials}
                    </span>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
              </div>

              {uploadError && (
                <p className="mt-2 text-xs text-red-500">{uploadError}</p>
              )}
              <p className="mt-1.5 text-xs text-neutral-400">Clique na foto para alterar</p>
            </div>

            {/* Nome e badges */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h1 className="text-2xl font-display font-bold text-neutral-800">
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
            </div>
          </div>
        </div>

        {/* Stats + Informações lado a lado no desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Stats — coluna esquerda */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
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

          {/* Informações — coluna direita (ocupa 2/3) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-6">
            <h2 className="font-display font-semibold text-neutral-700 mb-5">Informações</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
