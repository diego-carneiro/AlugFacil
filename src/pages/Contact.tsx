import { useState } from "react";
import { motion } from "motion/react";
import { MessageCircle, AtSign, Mail, Send } from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import { buildWhatsAppLink, WHATSAPP_DEFAULT } from "../config/contact";
import { fadeInUp, staggerContainer, viewportConfig } from "../hooks/useScrollReveal";

const contactChannels = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Atendimento rápido pelo WhatsApp",
    detail: "(12) 99999-9999",
    href: buildWhatsAppLink(WHATSAPP_DEFAULT, "Olá! Vim pelo site AlugFácil."),
    color: "bg-success/10 text-success",
  },
  {
    icon: AtSign,
    title: "Instagram",
    description: "Siga-nos e envie um DM",
    detail: "@alugfacilconsultorios",
    href: "https://instagram.com/alugfacilconsultorios",
    color: "bg-pink-50 text-pink-500",
  },
  {
    icon: Mail,
    title: "Email",
    description: "Envie um email para nós",
    detail: "contato@alugfacil.com.br",
    href: "mailto:contato@alugfacil.com.br",
    color: "bg-primary-50 text-primary-500",
  },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMsg = `Olá! Meu nome é ${name} (${email}).
Assunto: ${subject}
Mensagem: ${message}`;
    window.open(buildWhatsAppLink(WHATSAPP_DEFAULT, whatsappMsg), "_blank");
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-sm";

  return (
    <section className="pt-28 pb-20 lg:pt-36 lg:pb-30">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Fale conosco
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto">
            Tem dúvidas ou quer saber mais sobre a AlugFácil? Entre em contato
            por qualquer um dos nossos canais.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="space-y-4"
          >
            {contactChannels.map((channel) => (
              <motion.a
                key={channel.title}
                variants={fadeInUp}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,102,204,0.08)] hover:shadow-[0_12px_48px_rgba(0,102,204,0.15)] transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${channel.color}`}
                >
                  <channel.icon size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-neutral-800">
                    {channel.title}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {channel.description}
                  </p>
                  <p className="text-sm font-medium text-primary-500 mt-1">
                    {channel.detail}
                  </p>
                </div>
              </motion.a>
            ))}
          </motion.div>

          <motion.form
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,102,204,0.08)] space-y-4"
          >
            <h3 className="font-display font-bold text-xl text-neutral-800 mb-2">
              Envie uma mensagem
            </h3>
            <div>
              <label htmlFor="c-name" className="block text-sm font-medium text-neutral-700 mb-1">
                Nome
              </label>
              <input
                id="c-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label htmlFor="c-email" className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                id="c-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label htmlFor="c-subject" className="block text-sm font-medium text-neutral-700 mb-1">
                Assunto
              </label>
              <input
                id="c-subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
                placeholder="Ex: Dúvida sobre aluguel"
              />
            </div>
            <div>
              <label htmlFor="c-message" className="block text-sm font-medium text-neutral-700 mb-1">
                Mensagem
              </label>
              <textarea
                id="c-message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputClass} resize-none`}
                rows={4}
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
          </motion.form>
        </div>
      </Container>
    </section>
  );
}
