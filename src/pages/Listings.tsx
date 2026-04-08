import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, ArrowRight, Search } from "lucide-react";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { consultories } from "../data/consultories";
import { staggerContainer, fadeInUp, viewportConfig } from "../hooks/useScrollReveal";

const neighborhoods = ["Todos", ...new Set(consultories.map((c) => c.neighborhood))];
const priceRanges = [
  { label: "Todos", min: 0, max: Infinity },
  { label: "Até R$ 200", min: 0, max: 200 },
  { label: "R$ 200 - R$ 300", min: 200, max: 300 },
  { label: "Acima de R$ 300", min: 300, max: Infinity },
];

export default function Listings() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Todos");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);

  const filtered = consultories.filter((c) => {
    const matchNeighborhood =
      selectedNeighborhood === "Todos" || c.neighborhood === selectedNeighborhood;
    const range = priceRanges[selectedPriceRange];
    const matchPrice =
      c.pricePerPeriod >= range.min && c.pricePerPeriod <= range.max;
    return matchNeighborhood && matchPrice;
  });

  return (
    <section className="pt-28 pb-20 lg:pt-36 lg:pb-30">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Consultórios disponíveis
          </h1>
          <p className="text-lg text-neutral-500">
            Encontre o espaço ideal para atender seus pacientes
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-10 bg-neutral-50 rounded-2xl p-4"
        >
          <div className="flex-1">
            <label
              htmlFor="filter-region"
              className="block text-xs font-medium text-neutral-500 mb-1"
            >
              Região
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <select
                id="filter-region"
                value={selectedNeighborhood}
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex-1">
            <label
              htmlFor="filter-price"
              className="block text-xs font-medium text-neutral-500 mb-1"
            >
              Faixa de preço
            </label>
            <select
              id="filter-price"
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              {priceRanges.map((range, index) => (
                <option key={range.label} value={index}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filtered.map((consultory) => (
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
                      {consultory.equipment.slice(0, 3).map((eq) => (
                        <Badge key={eq} variant="outline">
                          {eq}
                        </Badge>
                      ))}
                      {consultory.equipment.length > 3 && (
                        <Badge variant="outline">
                          +{consultory.equipment.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-display font-bold text-xl text-primary-500">
                        R$ {consultory.pricePerPeriod}
                        <span className="text-sm font-normal text-neutral-400">
                          {" "}/ período
                        </span>
                      </p>
                      <span className="text-primary-500 text-sm font-medium flex items-center gap-1">
                        Detalhes <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">
              Nenhum consultório encontrado com os filtros selecionados.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
