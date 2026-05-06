import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Container from "../ui/Container";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { to: "/", label: "Início" },
  { to: "/consultorios", label: "Consultórios" },
  { to: "/cadastrar", label: "Cadastrar Consultório" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
];

const DASHBOARD_BY_ROLE = {
  tenant: "/dashboard/locatario",
  owner: "/dashboard/proprietario",
  admin: "/dashboard/admin",
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const dashboardPath = currentUser
    ? DASHBOARD_BY_ROLE[currentUser.role]
    : "/entrar";

  const initials =
    currentUser?.name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100">
      <Container className="flex items-center justify-between h-16 lg:h-20">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🦷</span>
          <span className="font-display font-bold text-xl text-primary-500">
            AlugFácil
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                location.pathname === link.to
                  ? "text-primary-500"
                  : "text-neutral-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth area */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn && currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 border border-neutral-200 rounded-xl px-3 py-2 hover:bg-neutral-50 transition-colors"
              >
                <div className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-display font-bold text-xs">
                  {initials}
                </div>
                <span className="text-sm font-medium text-neutral-700 max-w-30 truncate">
                  {currentUser.name.split(" ")[0]}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-neutral-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 4 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-[0_12px_48px_rgba(0,102,204,0.15)] border border-neutral-100 overflow-hidden"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors group"
                    >
                      <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-800 truncate group-hover:text-primary-600 transition-colors">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-neutral-300 flex-shrink-0"
                      />
                    </Link>

                    <div className="h-px bg-linear-to-r from-transparent via-neutral-200 to-transparent" />

                    <div className="p-1.5">
                      <Link
                        to={dashboardPath}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                      >
                        <LayoutDashboard
                          size={15}
                          className="text-neutral-200"
                        />
                        Meu painel
                      </Link>
                    </div>

                    <div className="h-px bg-linear-to-r from-transparent via-neutral-200 to-transparent" />

                    <div className="p-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={15} />
                        Sair da conta
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/entrar"
                className="text-sm font-medium text-neutral-600 hover:text-primary-500 transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-display font-semibold hover:bg-primary-600 transition-colors"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-neutral-700"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-neutral-100 overflow-hidden"
          >
            <Container className="py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`text-base font-medium py-2 ${
                    location.pathname === link.to
                      ? "text-primary-500"
                      : "text-neutral-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-neutral-100 pt-4 flex flex-col gap-2">
                {isLoggedIn && currentUser ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-1 py-2"
                    >
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                    </Link>
                    <Link
                      to={dashboardPath}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 border border-neutral-200 text-neutral-700 px-4 py-3 rounded-xl text-sm font-medium"
                    >
                      <LayoutDashboard size={16} />
                      Meu painel
                    </Link>
                    <div className="h-px bg-linear-to-r from-transparent via-neutral-200 to-transparent my-1" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-red-500 px-4 py-3 rounded-xl text-sm font-medium"
                    >
                      <LogOut size={16} />
                      Sair da conta
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/entrar"
                      onClick={() => setMenuOpen(false)}
                      className="border border-neutral-200 text-neutral-700 px-4 py-3 rounded-xl text-sm font-medium text-center"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/cadastro"
                      onClick={() => setMenuOpen(false)}
                      className="bg-primary-500 text-white px-4 py-3 rounded-xl text-sm font-display font-semibold text-center"
                    >
                      Criar conta
                    </Link>
                  </>
                )}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
