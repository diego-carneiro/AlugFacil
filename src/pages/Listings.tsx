import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, ArrowRight, Search, Star, SlidersHorizontal, X, Zap } from "lucide-react";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import type { Consultory } from "../types/consultory";
import { listConsultories } from "../lib/api/consultories";
import { staggerContainer, fadeInUp, viewportConfig } from "../hooks/useScrollReveal";

const priceRanges = [
  { label: "Todos", min: 0, max: Infinity },
  { label: "Até R$ 200", min: 0, max: 200 },
  { label: "R$ 200 – R$ 300", min: 200, max: 300 },
  { label: "Acima de R$ 300", min: 300, max: Infinity },
];

const ALL_EQUIPMENT = [
  "Equipo completo",
  "Autoclave",
  "Compressor",
  "Raio-x digital",
  "Raio-x panorâmico",
  "Scanner intraoral",
  "Ultrassom",
  "Fotopolimerizador",
  "Ar-condicionado",
  "Wi-Fi",
  "Estacionamento",
  "Sala de espera",
];

export default function Listings() {
  const [consultories, setConsultories] = useState<Consultory[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Todos");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadConsultories() {
      const items = await listConsultories();
      if (!cancelled) {
        setConsultories(items);
        setIsLoading(false);
      }
    }

    void loadConsultories();

    return () => {
      cancelled = true;
    };
  }, []);

  const neighborhoods = ["Todos", ...new Set(consultories.map((c) => c.neighborhood))];

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment(prev =>
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
  };

  const clearFilters = () => {
    setSelectedNeighborhood("Todos");
    setSelectedPriceRange(0);
    setSelectedEquipment([]);
  };

  const activeFilterCount =
    (selectedNeighborhood !== "Todos" ? 1 : 0) +
    (selectedPriceRange !== 0 ? 1 : 0) +
    selectedEquipment.length;

  const filtered = consultories.filter((c) => {
    const matchNeighborhood =
      selectedNeighborhood === "Todos" || c.neighborhood === selectedNeighborhood;
    const range = priceRanges[selectedPriceRange];
    const matchPrice = c.pricePerPeriod >= range.min && c.pricePerPeriod <= range.max;
    const matchEquipment =
      selectedEquipment.length === 0 ||
      selectedEquipment.every(eq => c.equipment.includes(eq));
    return matchNeighborhood && matchPrice && matchEquipment;
  });

  return (
    <section className="pt-28 pb-20 lg:pt-36 lg:pb-30">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Consultórios disponíveis
          </h1>
          <p className="text-lg text-neutral-500">
            {isLoading
              ? "Carregando consultórios..."
              : "Encontre o espaço ideal para atender seus pacientes"}
          </p>
        </motion.div>

        {/* Search + filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-50 rounded-2xl p-4 mb-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="filter-region" className="block text-xs font-medium text-neutral-500 mb-1">
                Região
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <select
                  id="filter-region"
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  {neighborhoods.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1">
              <label htmlFor="filter-price" className="block text-xs font-medium text-neutral-500 mb-1">
                Faixa de preço
              </label>
              <select
                id="filter-price"
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {priceRanges.map((range, index) => (
                  <option key={range.label} value={index}>{range.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  showFilters || selectedEquipment.length > 0
                    ? "border-primary-500 bg-primary-50 text-primary-600"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-primary-300"
                }`}
              >
                <SlidersHorizontal size={15} />
                Equipamentos
                {selectedEquipment.length > 0 && (
                  <span className="w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center">
                    {selectedEquipment.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Equipment chips */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-neutral-200"
            >
              <p className="text-xs font-medium text-neutral-500 mb-3">
                Filtrar por equipamentos disponíveis
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_EQUIPMENT.map(eq => (
                  <button
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      selectedEquipment.includes(eq)
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-primary-300 hover:text-primary-600"
                    }`}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Active filters summary */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-neutral-500">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors ml-2"
            >
              <X size={12} />
              Limpar filtros
            </button>
          </div>
        )}

        {/* Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filtered.map((consultory) => (
            <motion.div key={consultory.id} variants={fadeInUp}>
              <Link to={`/clinics/${consultory.id}`}>
                <Card>
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
                      <h3 className="font-display font-bold text-lg text-neutral-800 leading-snug">
                        {consultory.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-neutral-500 shrink-0">
                        <Star size={12} className="text-accent-400 fill-accent-400" />
                        {consultory.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-500 text-sm mb-4">
                      <MapPin size={14} />
                      {consultory.neighborhood}, {consultory.city}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {consultory.equipment.slice(0, 3).map((eq) => (
                        <Badge
                          key={eq}
                          variant={selectedEquipment.includes(eq) ? "default" : "outline"}
                        >
                          {eq}
                        </Badge>
                      ))}
                      {consultory.equipment.length > 3 && (
                        <Badge variant="outline">+{consultory.equipment.length - 3}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-display font-bold text-xl text-primary-500">
                        R$ {consultory.pricePerPeriod}
                        <span className="text-sm font-normal text-neutral-400"> / período</span>
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
            <p className="text-neutral-500 text-lg mb-4">
              Nenhum consultório encontrado com os filtros selecionados.
            </p>
            <button
              onClick={clearFilters}
              className="text-primary-500 text-sm font-medium hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </Container>
    </section>
  );
}
