import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../data/users";

const DEMO_ACCOUNTS: { label: string; role: UserRole; email: string }[] = [
  { label: "Entrar como Dentista", role: "tenant", email: "ana.lima@email.com" },
  { label: "Entrar como Proprietário", role: "owner", email: "roberto.alves@email.com" },
  { label: "Entrar como Admin", role: "admin", email: "admin@alugfacil.com.br" },
];

const DASHBOARD_BY_ROLE: Record<UserRole, string> = {
  tenant: "/dashboard/locatario",
  owner: "/dashboard/proprietario",
  admin: "/dashboard/admin",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleDemo = (role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo1234");
    login(role);
    navigate(DASHBOARD_BY_ROLE[role]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: detect role by email pattern
    const found = DEMO_ACCOUNTS.find(a => a.email === email);
    if (found) {
      login(found.role);
      navigate(DASHBOARD_BY_ROLE[found.role]);
    } else {
      login("tenant");
      navigate(DASHBOARD_BY_ROLE["tenant"]);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm transition-shadow";

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-10">
            <span className="text-2xl">🦷</span>
            <span className="font-display font-bold text-xl text-primary-500">AlugFácil</span>
          </Link>

          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-neutral-500 mb-8">
            Entre na sua conta para gerenciar suas reservas.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="text-right mt-1">
                <a href="#" className="text-xs text-primary-500 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-primary-500 text-white rounded-xl py-3 font-display font-semibold flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors"
            >
              <LogIn size={18} />
              Entrar
            </motion.button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-neutral-50 px-3 text-xs text-neutral-400">
                ou acesse uma conta demo
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map(a => (
              <motion.button
                key={a.role}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleDemo(a.role, a.email)}
                className="w-full border border-neutral-200 text-neutral-700 rounded-xl py-2.5 text-sm font-medium hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                {a.label}
              </motion.button>
            ))}
          </div>

          <p className="text-center text-sm text-neutral-500 mt-8">
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-primary-500 font-medium hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right: Illustration */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 to-primary-700/60" />
        </div>
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <p className="text-3xl font-display font-bold mb-3 leading-snug">
            Gerencie suas locações<br />com total tranquilidade.
          </p>
          <p className="text-primary-200 text-base">
            Calendário de agendamentos, vistoria digital e pagamentos — tudo em um só lugar.
          </p>
        </div>
      </div>
    </div>
  );
}
