import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, ArrowRight } from "lucide-react";
import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { consultories } from "../../data/consultories";
import { staggerContainer, fadeInUp, viewportConfig } from "../../hooks/useScrollReveal";

export default function FeaturedListings() {
  const featured = consultories.filter((c) => c.featured).slice(0, 3);

  return (
    <section className="py-20 lg:py-30">
      <Container>
        <SectionTitle
          title="Consultórios em destaque"
          subtitle="Espaços prontos para você atender seus pacientes"
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
                <Card>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={consultory.images[0]}
                      alt={consultory.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-bold text-lg text-neutral-800 mb-2">
                      {consultory.name}
                    </h3>
                    <div className="flex items-center gap-1 text-neutral-500 text-sm mb-4">
                      <MapPin size={14} />
                      {consultory.neighborhood}, {consultory.city}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {consultory.equipment.slice(0, 4).map((eq) => (
                        <Badge key={eq} variant="outline">
                          {eq}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-neutral-400">a partir de</span>
                        <p className="font-display font-bold text-xl text-primary-500">
                          R$ {consultory.pricePerPeriod}
                          <span className="text-sm font-normal text-neutral-400">
                            {" "}/ período
                          </span>
                        </p>
                      </div>
                      <span className="text-primary-500 text-sm font-medium flex items-center gap-1">
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
          <Button href="/consultorios" variant="secondary" size="lg">
            Ver todos os consultórios
            <ArrowRight size={18} />
          </Button>
        </div>
      </Container>
    </section>
  );
}
