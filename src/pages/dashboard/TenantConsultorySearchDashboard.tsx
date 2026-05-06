import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  X,
  Zap,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import type { Consultory } from "../../types/consultory";
import { listConsultories, searchConsultories, type SearchConsultoriesInput } from "../../lib/api/consultories";

const navItems = [
  { label: "Visão geral", path: "/dashboard/locatario", icon: <CalendarDays size={18} /> },
  { label: "Buscar consultórios", path: "/dashboard/locatario/buscar-consultorios", icon: <Search size={18} /> },
];

const priceRanges = [
  { label: "Todos", min: undefined, max: undefined },
  { label: "Até R$ 200", min: undefined, max: 200 },
  { label: "R$ 200 – R$ 300", min: 200, max: 300 },
  { label: "R$ 300 – R$ 500", min: 300, max: 500 },
  { label: "Acima de R$ 500", min: 500, max: undefined },
];

const defaultEquipment = [
  "Equipo completo",
  "Compressor",
  "Bomba a vácuo",
  "Autoclave",
  "Raio-x",
  "Raio-x digital",
  "Raio-x panorâmico",
  "Scanner intraoral",
  "Ultrassom",
  "Fotopolimerizador",
  "Ar-condicionado",
  "Wi-Fi",
  "Sala de espera",
  "Estacionamento",
  "Recepção equipada",
];

type AvailabilityPeriod = "morning" | "afternoon" | "evening";

export default function TenantConsultorySearchDashboard() {
  const [allConsultories, setAllConsultories] = useState<Consultory[]>([]);
  const [results, setResults] = useState<Consultory[]>([]);
  const [query, setQuery] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Todos");
  const [selectedCity, setSelectedCity] = useState("Todos");
  const [selectedState, setSelectedState] = useState("Todos");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<AvailabilityPeriod[]>([]);
  const [onlyPremium, setOnlyPremium] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        const items = await listConsultories();
        if (!cancelled) {
          setAllConsultories(items);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar os consultórios.";
          setError(message);
          setAllConsultories([]);
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    let cancelled = false;
    const range = priceRanges[selectedPriceRange];

    const filters: SearchConsultoriesInput = {
      query,
      neighborhood: selectedNeighborhood,
      city: selectedCity,
      state: selectedState,
      minPrice: range.min,
      maxPrice: range.max,
      equipment: selectedEquipment,
      periods: selectedPeriods,
      featured: onlyFeatured ? true : undefined,
      isPremium: onlyPremium ? true : undefined,
    };

    async function runSearch() {
      setIsSearching(true);

      try {
        const items = await searchConsultories(filters);
        if (!cancelled) {
          setResults(items);
          setError("");
        }
      } catch (searchError) {
        if (!cancelled) {
          const message =
            searchError instanceof Error
              ? searchError.message
              : "Não foi possível buscar consultórios com os filtros selecionados.";
          setError(message);
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }

    void runSearch();

    return () => {
      cancelled = true;
    };
  }, [
    query,
    selectedNeighborhood,
    selectedCity,
    selectedState,
    selectedPriceRange,
    selectedEquipment,
    selectedPeriods,
    onlyFeatured,
    onlyPremium,
    isBootstrapping,
  ]);

  const neighborhoods = useMemo(() => {
    return ["Todos", ...new Set(allConsultories.map((item) => item.neighborhood).filter(Boolean))];
  }, [allConsultories]);

  const cities = useMemo(() => {
    return ["Todos", ...new Set(allConsultories.map((item) => item.city).filter(Boolean))];
  }, [allConsultories]);

  const states = useMemo(() => {
    return ["Todos", ...new Set(allConsultories.map((item) => item.state).filter(Boolean))];
  }, [allConsultories]);

  const availableEquipment = useMemo(() => {
    const fromApi = allConsultories.flatMap((item) => item.equipment).filter(Boolean);
    return Array.from(new Set([...defaultEquipment, ...fromApi]));
  }, [allConsultories]);

  const toggleEquipment = (value: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const togglePeriod = (period: AvailabilityPeriod) => {
    setSelectedPeriods((prev) =>
      prev.includes(period) ? prev.filter((item) => item !== period) : [...prev, period]
    );
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedNeighborhood("Todos");
    setSelectedCity("Todos");
    setSelectedState("Todos");
    setSelectedPriceRange(0);
    setSelectedEquipment([]);
    setSelectedPeriods([]);
    setOnlyFeatured(false);
    setOnlyPremium(false);
  };

  const activeFilterCount =
    (query.trim().length > 0 ? 1 : 0) +
    (selectedNeighborhood !== "Todos" ? 1 : 0) +
    (selectedCity !== "Todos" ? 1 : 0) +
    (selectedState !== "Todos" ? 1 : 0) +
    (selectedPriceRange !== 0 ? 1 : 0) +
    selectedEquipment.length +
    selectedPeriods.length +
    (onlyFeatured ? 1 : 0) +
    (onlyPremium ? 1 : 0);

  const hasResults = results.length > 0;

  return (
    <DashboardLayout navItems={navItems} title="Buscar consultórios">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-neutral-900">Buscar consultórios</h2>
          <p className="text-neutral-500 mt-1">
            Filtre por localidade, preço, equipamentos, períodos e destaque para encontrar o espaço ideal.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-4 md:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            <div className="xl:col-span-2">
              <label htmlFor="dashboard-search-query" className="block text-xs font-medium text-neutral-500 mb-1">
                Busca textual
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="dashboard-search-query"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nome, bairro, cidade, estado..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dashboard-filter-state" className="block text-xs font-medium text-neutral-500 mb-1">
                Estado
              </label>
              <select
                id="dashboard-filter-state"
                value={selectedState}
                onChange={(event) => setSelectedState(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dashboard-filter-city" className="block text-xs font-medium text-neutral-500 mb-1">
                Cidade
              </label>
              <select
                id="dashboard-filter-city"
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dashboard-filter-neighborhood" className="block text-xs font-medium text-neutral-500 mb-1">
                Bairro
              </label>
              <select
                id="dashboard-filter-neighborhood"
                value={selectedNeighborhood}
                onChange={(event) => setSelectedNeighborhood(event.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {neighborhoods.map((neighborhood) => (
                  <option key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters((value) => !value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "border-primary-500 bg-primary-50 text-primary-600"
                  : "border-neutral-200 text-neutral-600 hover:border-primary-300"
              }`}
            >
              <SlidersHorizontal size={15} />
              Mais filtros
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                <X size={12} />
                Limpar filtros
              </button>
            )}
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-neutral-200 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="dashboard-filter-price" className="block text-xs font-medium text-neutral-500 mb-1">
                    Faixa de preço
                  </label>
                  <select
                    id="dashboard-filter-price"
                    value={selectedPriceRange}
                    onChange={(event) => setSelectedPriceRange(Number(event.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  >
                    {priceRanges.map((range, index) => (
                      <option key={range.label} value={index}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs font-medium text-neutral-500 mb-1">Períodos disponíveis</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => togglePeriod("morning")}
                      className={`px-3 py-2 rounded-xl text-xs border transition-colors ${
                        selectedPeriods.includes("morning")
                          ? "bg-primary-500 text-white border-primary-500"
                          : "border-neutral-200 text-neutral-600 hover:border-primary-300"
                      }`}
                    >
                      Manhã
                    </button>
                    <button
                      onClick={() => togglePeriod("afternoon")}
                      className={`px-3 py-2 rounded-xl text-xs border transition-colors ${
                        selectedPeriods.includes("afternoon")
                          ? "bg-primary-500 text-white border-primary-500"
                          : "border-neutral-200 text-neutral-600 hover:border-primary-300"
                      }`}
                    >
                      Tarde
                    </button>
                    <button
                      onClick={() => togglePeriod("evening")}
                      className={`px-3 py-2 rounded-xl text-xs border transition-colors ${
                        selectedPeriods.includes("evening")
                          ? "bg-primary-500 text-white border-primary-500"
                          : "border-neutral-200 text-neutral-600 hover:border-primary-300"
                      }`}
                    >
                      Noite
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">Destaque</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setOnlyFeatured((value) => !value)}
                    className={`px-3 py-2 rounded-xl text-xs border transition-colors ${
                      onlyFeatured
                        ? "bg-primary-500 text-white border-primary-500"
                        : "border-neutral-200 text-neutral-600 hover:border-primary-300"
                    }`}
                  >
                    Somente em destaque
                  </button>
                  <button
                    onClick={() => setOnlyPremium((value) => !value)}
                    className={`px-3 py-2 rounded-xl text-xs border transition-colors ${
                      onlyPremium
                        ? "bg-primary-500 text-white border-primary-500"
                        : "border-neutral-200 text-neutral-600 hover:border-primary-300"
                    }`}
                  >
                    Somente premium
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">Equipamentos</p>
                <div className="flex flex-wrap gap-2">
                  {availableEquipment.map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleEquipment(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${
                        selectedEquipment.includes(item)
                          ? "bg-primary-500 text-white border-primary-500"
                          : "border-neutral-200 text-neutral-600 hover:border-primary-300"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            {isBootstrapping || isSearching ? "Buscando consultórios..." : `${results.length} resultado(s)`}
          </p>
        </div>

        {!isBootstrapping && !isSearching && !hasResults && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.06)]">
            <p className="text-neutral-400 mb-2">Nenhum consultório encontrado com os filtros atuais.</p>
            <p className="text-sm text-neutral-400">Tente remover alguns filtros para ampliar os resultados.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {results.map((consultory) => (
            <motion.div key={consultory.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Link to={`/consultorios/${consultory.id}`}>
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
                        Premium
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display font-bold text-lg text-neutral-800 leading-snug">
                        {consultory.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-neutral-500 shrink-0">
                        <Star size={12} className="text-accent-400 fill-accent-400" />
                        {consultory.rating}
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-neutral-500 mb-3">
                      <p className="flex items-center gap-1">
                        <MapPin size={14} />
                        {consultory.neighborhood}, {consultory.city} - {consultory.state}
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock3 size={14} />
                        {consultory.periods.morning ? "Manhã" : ""}
                        {consultory.periods.morning && consultory.periods.afternoon ? " · " : ""}
                        {consultory.periods.afternoon ? "Tarde" : ""}
                        {(consultory.periods.morning || consultory.periods.afternoon) && consultory.periods.evening
                          ? " · "
                          : ""}
                        {consultory.periods.evening ? "Noite" : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {consultory.equipment.slice(0, 3).map((item) => (
                        <Badge key={item} variant={selectedEquipment.includes(item) ? "default" : "outline"}>
                          {item}
                        </Badge>
                      ))}
                      {consultory.equipment.length > 3 && <Badge variant="outline">+{consultory.equipment.length - 3}</Badge>}
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
        </div>
      </div>
    </DashboardLayout>
  );
}
