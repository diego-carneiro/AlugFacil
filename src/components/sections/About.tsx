import { motion } from "motion/react";
import { MapPin, Building2, Users } from "lucide-react";
import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";
import { fadeInUp, staggerContainer, viewportConfig } from "../../hooks/useScrollReveal";

const stats = [
  { icon: Building2, value: "12+", label: "Consultórios cadastrados" },
  { icon: MapPin, value: "SJC", label: "São José dos Campos" },
  { icon: Users, value: "50+", label: "Profissionais conectados" },
];

export default function About() {
  return (
    <section className="py-20 lg:py-30">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <SectionTitle title="Sobre a AlugFácil" centered={false} />
            <p className="text-neutral-500 text-lg leading-relaxed mb-6">
              A AlugFácil nasceu da necessidade real de conectar profissionais
              da odontologia. Sabemos que muitos dentistas precisam de um
              consultório equipado para atender, mas nem sempre possuem espaço
              próprio.
            </p>
            <p className="text-neutral-500 text-lg leading-relaxed">
              Ao mesmo tempo, diversos consultórios possuem horários ociosos que
              poderiam ser aproveitados. A AlugFácil Consultórios faz essa
              ponte, facilitando a conexão entre quem tem espaço e quem precisa
              dele.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="bg-primary-50 rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="text-primary-500" size={24} />
                </div>
                <p className="font-display font-bold text-3xl text-primary-500 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
