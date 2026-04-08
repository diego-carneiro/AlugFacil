import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Phone } from "lucide-react";
import Container from "../ui/Container";
import { buildWhatsAppLink, WHATSAPP_DEFAULT } from "../../data/consultories";

const navLinks = [
  { to: "/", label: "Início" },
  { to: "/consultorios", label: "Consultórios" },
  { to: "/cadastrar", label: "Cadastrar Consultório" },
  { to: "/contato", label: "Contato" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

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

        <div className="hidden md:flex items-center gap-3">
          <a
            href={buildWhatsAppLink(
              WHATSAPP_DEFAULT,
              "Olá! Vim pelo site AlugFácil e gostaria de mais informações."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-display font-semibold hover:bg-primary-600 transition-colors"
          >
            <Phone size={16} />
            Fale conosco
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-neutral-700"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>

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
              <a
                href={buildWhatsAppLink(
                  WHATSAPP_DEFAULT,
                  "Olá! Vim pelo site AlugFácil e gostaria de mais informações."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-4 py-3 rounded-xl text-sm font-display font-semibold"
              >
                <Phone size={16} />
                Fale conosco
              </a>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
