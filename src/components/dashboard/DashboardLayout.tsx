import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  titleClassName?: string;
}

export default function DashboardLayout({
  children,
  navItems,
  title,
  titleClassName,
}: DashboardLayoutProps) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = currentUser?.name
    .split(" ")
    .slice(0, 2)
    .map(n => n[0])
    .join("")
    .toUpperCase() ?? "?";

  const roleLabel =
    currentUser?.role === "tenant"
      ? "Dentista"
      : currentUser?.role === "owner"
      ? "Proprietário"
      : "Administrador";

  const profilePath =
    currentUser?.role === "owner" ? "/consultorios" : "/profile";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-100">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🦷</span>
          <span className="font-display font-bold text-lg text-primary-500">AlugFácil</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-50 text-primary-600"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <span className={active ? "text-primary-500" : "text-neutral-400"}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <ChevronRight size={14} className="ml-auto text-primary-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info + Sair */}
      <div className="p-4 border-t border-neutral-100">
        <div className="mb-5 space-y-3">
          <Link
            to={profilePath}
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors group"
          >
            <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-800 truncate group-hover:text-primary-600 transition-colors">
                {currentUser?.name}
              </p>
              <p className="text-xs text-neutral-400">{roleLabel}</p>
            </div>
            <ChevronRight size={14} className="text-neutral-300 shrink-0" />
          </Link>

          <div className="h-px bg-linear-to-r from-transparent via-neutral-200 to-transparent" />
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-neutral-500 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut size={16} />
          Sair da conta
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-neutral-100 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-neutral-100 px-6 h-16 flex items-center gap-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-neutral-500 hover:text-neutral-700"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <h1 className={`font-display text-neutral-900 text-lg ${titleClassName ?? "font-bold"}`}>
            {title}
          </h1>
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <Link
              to={profilePath}
              className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-display font-bold text-xs hover:bg-primary-200 transition-colors"
            >
              {initials}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
