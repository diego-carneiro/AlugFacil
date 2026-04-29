import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Container from "../ui/Container";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { buildWhatsAppLink, WHATSAPP_DEFAULT } from "../../config/contact";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/70" />
      </div>

      <Container className="relative z-10 py-32 lg:py-40">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="accent" className="mb-6 text-sm">
              🦷 Marketplace de consultórios odontológicos
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
          >
            Encontre consultórios odontológicos para alugar por período
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-100 mb-10 max-w-xl"
          >
            Conectamos dentistas que precisam de espaço com consultórios que
            possuem horários disponíveis.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              href={buildWhatsAppLink(
                WHATSAPP_DEFAULT,
                "Olá! Vi o site AlugFácil e tenho interesse em alugar um consultório. Podemos conversar?"
              )}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              Quero alugar um consultório
              <ArrowRight size={20} />
            </Button>
            <Button
              href={buildWhatsAppLink(
                WHATSAPP_DEFAULT,
                "Olá! Quero cadastrar meu consultório na AlugFácil. Como funciona?"
              )}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="lg"
              className="border-accent-300 text-accent-300 hover:bg-accent-300/10"
            >
              Quero disponibilizar meu consultório
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute bottom-12 right-6 lg:right-20 hidden md:flex flex-col gap-3"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-white border border-white/20">
            <span className="font-display font-bold text-2xl">12+</span>
            <span className="block text-sm text-primary-200">consultórios</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-white border border-white/20">
            <span className="font-display font-bold text-sm">📍 São José dos Campos</span>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
