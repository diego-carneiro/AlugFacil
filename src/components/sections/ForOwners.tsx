import { motion } from "motion/react";
import { ArrowRight, TrendingUp, Shield, Clock } from "lucide-react";
import Container from "../ui/Container";
import Button from "../ui/Button";
import { buildWhatsAppLink, WHATSAPP_DEFAULT } from "../../data/consultories";
import { fadeInUp, staggerContainer, viewportConfig } from "../../hooks/useScrollReveal";

const benefits = [
  {
    icon: TrendingUp,
    title: "Renda extra",
    description: "Monetize os horários em que seu consultório fica ocioso.",
  },
  {
    icon: Shield,
    title: "Sem risco",
    description: "Você controla os horários e escolhe quem usa o espaço.",
  },
  {
    icon: Clock,
    title: "Flexibilidade",
    description: "Disponibilize apenas os períodos que desejar.",
  },
];

export default function ForOwners() {
  return (
    <section className="py-20 lg:py-30 bg-primary-800 text-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Tem um consultório com horários vagos?
            </h2>
            <p className="text-primary-200 text-lg mb-8 leading-relaxed">
              Cadastre seu espaço na AlugFácil e transforme períodos ociosos em
              uma nova fonte de renda. É simples, seguro e você mantém o
              controle total.
            </p>
            <Button
              href={buildWhatsAppLink(
                WHATSAPP_DEFAULT,
                "Olá! Quero cadastrar meu consultório na AlugFácil. Como funciona?"
              )}
              target="_blank"
              rel="noopener noreferrer"
              variant="accent"
              size="lg"
            >
              Cadastrar meu consultório
              <ArrowRight size={20} />
            </Button>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="space-y-6"
          >
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={fadeInUp}
                className="flex gap-4 bg-primary-700/50 rounded-2xl p-6 border border-primary-600/30"
              >
                <div className="w-12 h-12 bg-accent-300/20 rounded-xl flex items-center justify-center shrink-0">
                  <benefit.icon className="text-accent-300" size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-primary-200 text-sm">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
