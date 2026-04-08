import { useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  CalendarDays,
  Handshake,
  Stethoscope,
  ClipboardPlus,
  Clock,
  Users,
  DollarSign,
} from "lucide-react";
import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";
import { fadeInUp, staggerContainer, viewportConfig } from "../../hooks/useScrollReveal";

const tabs = [
  {
    label: "Para quem quer alugar",
    steps: [
      {
        icon: Search,
        title: "Escolha um consultório",
        description: "Navegue pelos consultórios disponíveis e encontre o ideal para você.",
      },
      {
        icon: CalendarDays,
        title: "Informe o período desejado",
        description: "Selecione os dias e horários que precisa utilizar o espaço.",
      },
      {
        icon: Handshake,
        title: "A AlugFácil faz a conexão",
        description: "Conectamos você diretamente com o proprietário do consultório.",
      },
      {
        icon: Stethoscope,
        title: "Agende e atenda",
        description: "Tudo certo! É só agendar seus pacientes e realizar os atendimentos.",
      },
    ],
  },
  {
    label: "Para quem quer disponibilizar",
    steps: [
      {
        icon: ClipboardPlus,
        title: "Cadastre seu consultório",
        description: "Informe os detalhes, equipamentos e fotos do seu espaço.",
      },
      {
        icon: Clock,
        title: "Defina a disponibilidade",
        description: "Cadastre os dias e horários em que o consultório está disponível.",
      },
      {
        icon: Users,
        title: "Receba interessados",
        description: "Dentistas entrarão em contato para utilizar seu espaço.",
      },
      {
        icon: DollarSign,
        title: "Gere renda extra",
        description: "Monetize os horários ociosos do seu consultório.",
      },
    ],
  },
];

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-20 lg:py-30 bg-neutral-50">
      <Container>
        <SectionTitle
          title="Como funciona"
          subtitle="Simples, rápido e sem burocracia"
        />

        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-[0_4px_24px_rgba(0,102,204,0.08)]">
            {tabs.map((tab, index) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
                  activeTab === index
                    ? "bg-primary-500 text-white shadow-md"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={activeTab}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {tabs[activeTab].steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={fadeInUp}
              className="relative bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,102,204,0.08)]"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                <step.icon className="text-primary-500" size={24} />
              </div>
              <span className="absolute top-6 right-6 font-display font-bold text-4xl text-primary-50">
                {index + 1}
              </span>
              <h3 className="font-display font-bold text-lg text-neutral-800 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
