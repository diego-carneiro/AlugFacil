import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import Container from "../components/ui/Container";

/**
 * Perfil público de outro usuário (dentista).
 * Rota: /:username
 *
 * TODO: implementar lookup de User por username no AppSync quando o campo
 * `username` for adicionado ao model User. Até lá exibe estado de "não encontrado".
 */
export default function UserProfile() {
  const { username } = useParams<{ username: string }>();

  return (
    <div className="min-h-screen bg-neutral-50 pt-16 lg:pt-20">
      {/* Cover */}
      <div className="h-44 md:h-52 lg:h-60 bg-linear-to-br from-primary-700 via-primary-500 to-primary-400 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute top-6 left-1/2 w-40 h-40 bg-white/5 rounded-full" />
      </div>

      <Container>
        {/* Avatar placeholder */}
        <div className="-mt-14 md:-mt-16 mb-4 relative z-10">
          <div className="w-28 h-28 md:w-32 md:h-32 bg-white rounded-full border-4 border-white shadow-[0_8px_32px_rgba(0,102,204,0.18)] flex items-center justify-center">
            <span className="text-4xl md:text-5xl font-display font-bold text-neutral-300">
              ?
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="pb-16"
        >
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-neutral-800 mb-1">
              @{username}
            </h1>
            <p className="text-neutral-400 text-sm">
              Perfil de dentista não encontrado ou ainda não disponível.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-8 max-w-md">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🦷</span>
              </div>
              <div>
                <h2 className="font-display font-semibold text-neutral-700 mb-1">
                  Perfil em breve
                </h2>
                <p className="text-sm text-neutral-400 max-w-xs">
                  A busca de perfis públicos por nome de usuário estará disponível em breve.
                </p>
              </div>
              <Link
                to="/consultorios"
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-display font-semibold hover:bg-primary-600 transition-colors"
              >
                Ver consultórios disponíveis
              </Link>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
