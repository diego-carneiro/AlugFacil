import { Link } from "react-router-dom";
import { AtSign, MessageCircle } from "lucide-react";
import Container from "../ui/Container";
import { buildWhatsAppLink, WHATSAPP_DEFAULT } from "../../config/contact";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🦷</span>
              <span className="font-display font-bold text-xl text-white">
                AlugFácil
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Conectamos dentistas que precisam de espaço com consultórios
              odontológicos que possuem horários disponíveis em São José dos
              Campos.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4">
              Navegação
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/consultorios" className="hover:text-white transition-colors">
                  Consultórios
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="hover:text-white transition-colors">
                  Criar conta de proprietário
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4">
              Conta
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/entrar" className="hover:text-white transition-colors">
                  Entrar
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="hover:text-white transition-colors">
                  Criar conta
                </Link>
              </li>
              <li>
                <Link to="/dashboard/locatario" className="hover:text-white transition-colors">
                  Painel do Dentista
                </Link>
              </li>
              <li>
                <Link to="/dashboard/proprietario" className="hover:text-white transition-colors">
                  Painel do Proprietário
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4">
              Contato
            </h3>
            <div className="space-y-3 text-sm">
              <a
                href={buildWhatsAppLink(
                  WHATSAPP_DEFAULT,
                  "Olá! Vim pelo site AlugFácil."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <a
                href="https://instagram.com/alugfacilconsultorios"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <AtSign size={16} />
                @alugfacilconsultorios
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-12 pt-8 text-center text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} AlugFácil Consultórios. Todos os
          direitos reservados.
        </div>
      </Container>
    </footer>
  );
}
