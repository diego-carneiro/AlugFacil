import { useState } from "react";
import { motion } from "motion/react";
import { MessageCircle, AtSign, Send } from "lucide-react";
import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";
import Button from "../ui/Button";
import { buildWhatsAppLink, WHATSAPP_DEFAULT } from "../../data/consultories";
import { fadeInUp, viewportConfig } from "../../hooks/useScrollReveal";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMsg = `Olá! Meu nome é ${name} (${email}). ${message}`;
    window.open(
      buildWhatsAppLink(WHATSAPP_DEFAULT, whatsappMsg),
      "_blank"
    );
  };

  return (
    <section className="py-20 lg:py-30 bg-neutral-50">
      <Container>
        <SectionTitle
          title="Entre em contato"
          subtitle="Estamos prontos para ajudar você"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="space-y-6"
          >
            <a
              href={buildWhatsAppLink(
                WHATSAPP_DEFAULT,
                "Olá! Vim pelo site AlugFácil."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,102,204,0.08)] hover:shadow-[0_12px_48px_rgba(0,102,204,0.15)] transition-shadow"
            >
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <MessageCircle className="text-success" size={24} />
              </div>
              <div>
                <h3 className="font-display font-bold text-neutral-800">
                  WhatsApp
                </h3>
                <p className="text-sm text-neutral-500">
                  Resposta rápida pelo WhatsApp
                </p>
              </div>
            </a>

            <a
              href="https://instagram.com/alugfacilconsultorios"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,102,204,0.08)] hover:shadow-[0_12px_48px_rgba(0,102,204,0.15)] transition-shadow"
            >
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center">
                <AtSign className="text-pink-500" size={24} />
              </div>
              <div>
                <h3 className="font-display font-bold text-neutral-800">
                  Instagram
                </h3>
                <p className="text-sm text-neutral-500">
                  @alugfacilconsultorios
                </p>
              </div>
            </a>
          </motion.div>

          <motion.form
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,102,204,0.08)]"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Nome
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-sm"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-sm"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Mensagem
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-sm resize-none"
                  placeholder="Como podemos ajudar?"
                />
              </div>
              <Button
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                className="w-full"
                size="lg"
              >
                <Send size={18} />
                Enviar via WhatsApp
              </Button>
            </div>
          </motion.form>
        </div>
      </Container>
    </section>
  );
}
