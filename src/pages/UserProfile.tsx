import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { BadgeCheck, Calendar, FileText } from "lucide-react";
import Container from "../components/ui/Container";
import { getTenantByPublicSlug } from "../lib/api/users";
import { getConsultoryByPublicSlug } from "../lib/api/consultories";
import type { User } from "../types/user";

type ProfileStatus = "loading" | "tenant" | "not-found";

function buildInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function UserProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<ProfileStatus>("loading");
  const [tenant, setTenant] = useState<User | null>(null);

  useEffect(() => {
    let active = true;

    async function resolvePublicProfile() {
      if (!slug) {
        if (active) {
          setStatus("not-found");
        }
        return;
      }

      setStatus("loading");

      try {
        const consultory = await getConsultoryByPublicSlug(slug);
        if (!active) {
          return;
        }

        if (consultory) {
          navigate(`/consultorios/${consultory.id}`, { replace: true });
          return;
        }

        const tenantProfile = await getTenantByPublicSlug(slug);
        if (!active) {
          return;
        }

        if (tenantProfile) {
          setTenant(tenantProfile);
          setStatus("tenant");
          return;
        }

        setTenant(null);
        setStatus("not-found");
      } catch {
        if (active) {
          setTenant(null);
          setStatus("not-found");
        }
      }
    }

    void resolvePublicProfile();

    return () => {
      active = false;
    };
  }, [slug, navigate]);

  const initials = useMemo(() => buildInitials(tenant?.name ?? "?"), [tenant?.name]);

  if (status === "loading") {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "not-found" || !tenant) {
    return (
      <div className="min-h-[100dvh] bg-neutral-50 overflow-x-hidden">
        <div className="h-44 md:h-52 lg:h-60 bg-linear-to-br from-primary-700 via-primary-500 to-primary-400 relative overflow-hidden" />

        <Container>
          <div className="-mt-14 md:-mt-16 mb-4 relative z-10">
            <div className="w-28 h-28 md:w-32 md:h-32 bg-white rounded-full border-4 border-white shadow-[0_8px_32px_rgba(0,102,204,0.18)] flex items-center justify-center">
              <span className="text-4xl md:text-5xl font-display font-bold text-neutral-300">?</span>
            </div>
          </div>

          <div className="pb-16">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-neutral-800 mb-1">
                Perfil não encontrado
              </h1>
              <p className="text-neutral-400 text-sm">
                O usuário ou consultório informado não existe ou não está público.
              </p>
            </div>

            <Link
              to="/consultorios"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-display font-semibold hover:bg-primary-600 transition-colors"
            >
              Ver consultórios disponíveis
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const memberSince = new Date(tenant.createdAt).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-[100dvh] bg-neutral-50 overflow-x-hidden">
      <div className="h-44 md:h-52 lg:h-60 bg-linear-to-br from-primary-700 via-primary-500 to-primary-400 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute top-6 left-1/2 w-40 h-40 bg-white/5 rounded-full" />
      </div>

      <Container>
        <div className="-mt-14 md:-mt-16 mb-4 relative z-10">
          <div className="w-28 h-28 md:w-32 md:h-32 bg-white rounded-full border-4 border-white shadow-[0_8px_32px_rgba(0,102,204,0.18)] flex items-center justify-center">
            <span className="text-4xl md:text-5xl font-display font-bold text-primary-500">{initials}</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="pb-16"
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-neutral-800">{tenant.name}</h1>
              {tenant.verified && <BadgeCheck size={22} className="text-primary-500 shrink-0" />}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-primary-50 text-primary-600 border-primary-100">
                Dentista
              </span>
              {tenant.specialty && <span className="text-sm text-neutral-500">{tenant.specialty}</span>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-6 max-w-lg">
            <h2 className="font-display font-semibold text-neutral-700 mb-5">Informações públicas</h2>
            <div className="space-y-4">
              {tenant.cro && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={15} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">CRO</p>
                    <p className="text-sm font-medium text-neutral-700">{tenant.cro}</p>
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
