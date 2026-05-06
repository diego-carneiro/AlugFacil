import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, ArrowRight, Star, Zap } from "lucide-react";
import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import {
  listFeaturedConsultories,
} from "../../lib/api/consultories";
import type { Consultory } from "../../types/consultory";
import { staggerContainer, fadeInUp, viewportConfig } from "../../hooks/useScrollReveal";

type FeaturedListingsProps = {
  className?: string;
};

export default function FeaturedListings({ className = "" }: FeaturedListingsProps) {
  const [featured, setFeatured] = useState<Consultory[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadConsultories() {
      const items = await listFeaturedConsultories();
      if (!cancelled) {
        setFeatured(items);
      }
    }

    void loadConsultories();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className={`py-20 lg:py-30 bg-primary-800 text-white ${className}`.trim()}
    >
      <Container>
        <SectionTitle
          title="Consultórios em destaque"
          subtitle="Espaços prontos para você atender seus pacientes"
          titleClassName="text-white"
          subtitleClassName="text-primary-200"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featured.map((consultory) => (
            <motion.div key={consultory.id} variants={fadeInUp}>
              <Link to={`/consultorios/${consultory.id}`}>
                <Card className="border border-primary-600/40 bg-primary-700/50 shadow-[0_6px_28px_rgba(0,0,0,0.22)]">
                  <div className="aspect-4/3 overflow-hidden relative">
                    <img
                      src={consultory.images[0]}
                      alt={consultory.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    {consultory.isPremium && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-accent-400 text-neutral-900 text-xs font-display font-bold px-2.5 py-1 rounded-full">
                        <Zap size={11} />
                        Destaque
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display font-bold text-lg text-white leading-snug">
                        {consultory.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-primary-100 shrink-0">
                        <Star size={12} className="text-accent-400 fill-accent-400" />
                        {consultory.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-primary-200 text-sm mb-4">
                      <MapPin size={14} />
                      {consultory.neighborhood}, {consultory.city}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {consultory.equipment.slice(0, 4).map((eq) => (
                        <Badge
                          key={eq}
                          variant="outline"
                          className="border-primary-500/50 text-primary-100 bg-primary-700/60"
                        >
                          {eq}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-primary-200">a partir de</span>
                        <p className="font-display font-bold text-xl text-white">
                          R$ {consultory.pricePerPeriod}
                          <span className="text-sm font-normal text-primary-200">
                            {" "}/ período
                          </span>
                        </p>
                      </div>
                      <span className="text-accent-300 text-sm font-medium flex items-center gap-1">
                        Ver detalhes <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Button href="/consultorios" variant="accent" size="lg">
            Ver todos os consultórios
            <ArrowRight size={18} />
          </Button>
        </div>
      </Container>
    </section>
  );
}
