import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Building2,
  MapPin,
  Phone,
  Star,
  Clock,
  Camera,
  Sun,
  Sunset,
  Moon,
  ChevronRight,
  Loader2,
  Zap,
  Wrench,
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { uploadAndSaveConsultoryLogo } from "../lib/api/consultories";
import { resolveStorageUrl } from "../lib/storage/media";
import { useOwnerConsultories, useInvalidateOwnerData } from "../lib/queries/ownerQueries";

const navItems = [
  { label: "Visão geral", path: "/dashboard/owner", icon: <Building2 size={18} /> },
  { label: "Minhas salas", path: "/dashboard/owner/rooms", icon: <Building2 size={18} /> },
  {
    label: "Perfil do Consultório",
    path: "/dashboard/owner/profile",
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

const PERIOD_ICONS = {
  morning: <Sun size={15} className="text-accent-500" />,
  afternoon: <Sunset size={15} className="text-primary-400" />,
  evening: <Moon size={15} className="text-neutral-500" />,
};

const PERIOD_LABELS = {
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
};

export default function ConsultoryProfile() {
  const { currentUser, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const { updateConsultoryLogo } = useInvalidateOwnerData();

  const {
    data: consultories = [],
    isLoading,
    error: queryError,
  } = useOwnerConsultories(currentUser?.id);

  const consultory = consultories[0] ?? null;
  const [logoUrl, setLogoUrl] = useState<string | undefined>(consultory?.logoUrl);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthReady && (!currentUser || currentUser.role !== "owner")) {
      navigate("/login", { replace: true });
    }
  }, [isAuthReady, currentUser, navigate]);

  useEffect(() => {
    if (consultory?.logoUrl) {
      setLogoUrl(consultory.logoUrl);
    } else if (consultory?.logoKey) {
      resolveStorageUrl(consultory.logoKey)
        .then(setLogoUrl)
        .catch(() => undefined);
    }
  }, [consultory?.logoUrl, consultory?.logoKey]);

  const error = queryError instanceof Error ? queryError.message : queryError ? "Não foi possível carregar o consultório." : "";

  const handleLogoClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleLogoFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !consultory || !currentUser) return;

      e.target.value = "";
      setUploadingLogo(true);
      setUploadError("");

      try {
        const newKey = await uploadAndSaveConsultoryLogo({
          consultoryId: consultory.id,
          ownerId: currentUser.id,
          file,
          previousLogoKey: consultory.logoKey,
        });

        const url = await resolveStorageUrl(newKey);
        setLogoUrl(url);
        updateConsultoryLogo(currentUser.id, consultory.id, newKey, url);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Erro ao fazer upload da logo.");
      } finally {
        setUploadingLogo(false);
      }
    },
    [consultory, currentUser, updateConsultoryLogo]
  );

  if (!isAuthReady || isLoading) {
    return (
      <DashboardLayout navItems={navItems} title="Perfil do Consultório" defaultSidebarOpen={true} showTitle={false} fixedCenter>
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !consultory) {
    return (
      <DashboardLayout navItems={navItems} title="Perfil do Consultório" defaultSidebarOpen={true} fixedCenter>
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] p-10 text-center">
          <Building2 size={40} className="mx-auto mb-4 text-neutral-300" />
          <p className="text-neutral-500 mb-4">
            {error || "Nenhum consultório cadastrado ainda."}
          </p>
          <Link
            to="/dashboard/owner"
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-display font-semibold hover:bg-primary-600 transition-colors"
          >
            Ir para o painel
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const availablePeriods = (["morning", "afternoon", "evening"] as const).filter(
    (p) => consultory.periods[p]
  );

  const initials = consultory.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <DashboardLayout
      navItems={navItems}
      title="Perfil do Consultório"
      defaultSidebarOpen={true}
      showTitle={false}
      fixedCenter
      profileOverride={{
        name: consultory.name,
        avatarUrl: logoUrl,
        subtitle: "Proprietário",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6 max-w-5xl mx-auto"
      >
        {/* Header card — logo + nome + ações */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] overflow-hidden">
          {/* Cover gradient */}
          <div className="h-32 bg-linear-to-br from-primary-700 via-primary-500 to-primary-400 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
          </div>

          <div className="px-6 pb-7">
            {/* Avatar logo */}
            <div className="-mt-11 mb-8 relative z-10">
              <div className="relative w-[6.5rem] h-[6.5rem] group">
                <button
                  onClick={handleLogoClick}
                  disabled={uploadingLogo}
                  aria-label="Alterar logo do consultório"
                  className="w-full h-full rounded-2xl border-4 border-white shadow-[0_8px_32px_rgba(0,102,204,0.18)] overflow-hidden bg-white flex items-center justify-center relative focus:outline-none"
                >
                  {uploadingLogo ? (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                      <Loader2 size={24} className="text-white animate-spin" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                    </div>
                  )}
                  {logoUrl ? (
                    <img src={logoUrl} alt={consultory.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-display font-bold text-primary-500">{initials}</span>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFileChange}
                />
                <p className="pointer-events-none absolute top-full left-1/2 mt-2.5 -translate-x-1/2 whitespace-nowrap text-xs text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  Clique na logo para alterar
                </p>
              </div>

              {uploadError && (
                <p className="mt-2 text-xs text-red-500">{uploadError}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h1 className="text-2xl font-display font-bold text-neutral-800">
                    {consultory.name}
                  </h1>
                  {consultory.isPremium && (
                    <span className="flex items-center gap-1 bg-accent-50 text-accent-600 text-xs px-2 py-0.5 rounded-full font-medium border border-accent-200">
                      <Zap size={11} />
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-500 flex items-center gap-1">
                  <MapPin size={14} />
                  {consultory.neighborhood}, {consultory.city} — {consultory.state}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start flex-wrap">
                <Link
                  to={`/consultorios/${consultory.id}`}
                  className="inline-flex items-center gap-2 text-sm text-primary-600 border border-primary-200 bg-primary-50 px-3 py-2 rounded-xl hover:bg-primary-100 transition-colors"
                >
                  Ver página pública
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-5 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <Star size={16} className="text-accent-500 fill-accent-500" />
              <span className="font-display font-bold text-xl text-neutral-800">
                {consultory.rating > 0 ? consultory.rating.toFixed(1) : "—"}
              </span>
            </div>
            <p className="text-xs text-neutral-400 text-center">Avaliação média</p>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-5 flex flex-col items-center justify-center gap-1.5">
            <span className="font-display font-bold text-xl text-neutral-800">
              {consultory.totalReviews}
            </span>
            <p className="text-xs text-neutral-400 text-center">Avaliações recebidas</p>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-5 flex flex-col items-center justify-center gap-1.5">
            <span className="font-display font-bold text-xl text-primary-500">
              R$ {consultory.pricePerPeriod}
            </span>
            <p className="text-xs text-neutral-400 text-center">Por período</p>
          </div>
        </div>

        {/* Info + Equipamentos + Períodos em grade 3 colunas no desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Endereço */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={15} className="text-primary-500" />
              </div>
              <h2 className="font-display font-semibold text-neutral-700">Localização</h2>
            </div>
            <p className="text-sm font-medium text-neutral-700 leading-relaxed">
              {[consultory.address, consultory.neighborhood, consultory.city, consultory.state]
                .filter(Boolean)
                .join(", ")}
              {consultory.zipCode && (
                <span className="block text-xs text-neutral-400 mt-1">CEP {consultory.zipCode}</span>
              )}
            </p>
            {consultory.whatsappNumber && (
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2">
                <Phone size={13} className="text-primary-400 shrink-0" />
                <a
                  href={`https://wa.me/${consultory.whatsappNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {consultory.whatsappNumber}
                </a>
              </div>
            )}
          </div>

          {/* Períodos */}
          {availablePeriods.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={15} className="text-primary-500" />
                </div>
                <h2 className="font-display font-semibold text-neutral-700">Períodos</h2>
              </div>
              <div className="flex flex-col gap-2">
                {availablePeriods.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-700 px-3 py-2 rounded-xl font-medium"
                  >
                    {PERIOD_ICONS[p]}
                    {PERIOD_LABELS[p]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Equipamentos */}
          {consultory.equipment.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Wrench size={15} className="text-primary-500" />
                </div>
                <h2 className="font-display font-semibold text-neutral-700">Equipamentos</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {consultory.equipment.map((eq) => (
                  <span
                    key={eq}
                    className="text-xs bg-primary-50 text-primary-700 border border-primary-100 px-3 py-1.5 rounded-full font-medium font-display"
                  >
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Descrição + Fotos lado a lado no desktop */}
        {(consultory.description || (consultory.images.length > 0 && consultory.images[0].startsWith("http"))) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {consultory.description && (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-6">
                <h2 className="font-display font-semibold text-neutral-700 mb-3">Sobre o consultório</h2>
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                  {consultory.description}
                </p>
              </div>
            )}

            {consultory.images.length > 0 && consultory.images[0].startsWith("http") && (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-6">
                <h2 className="font-display font-semibold text-neutral-700 mb-4">Fotos</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {consultory.images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`${consultory.name} — foto ${i + 1}`}
                      className="h-36 sm:h-44 w-56 sm:w-64 shrink-0 object-cover rounded-xl snap-start"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
