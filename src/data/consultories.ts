export interface Consultory {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  pricePerPeriod: number;
  description: string;
  equipment: string[];
  images: string[];
  whatsappNumber: string;
  featured: boolean;
  ownerId: string;
  rating: number;
  totalReviews: number;
  isPremium?: boolean;
  periods: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
}

export const consultories: Consultory[] = [
  {
    id: "jardim-aquarius",
    name: "Consultório Jardim Aquarius",
    neighborhood: "Jardim Aquarius",
    city: "São José dos Campos",
    pricePerPeriod: 300,
    description:
      "Consultório completo em excelente localização no Jardim Aquarius. Equipado com cadeira odontológica moderna, compressor silencioso e autoclave. Ambiente climatizado com sala de espera confortável para seus pacientes. Ideal para dentistas que buscam um espaço premium para atendimentos.",
    equipment: [
      "Equipo completo",
      "Compressor",
      "Bomba a vácuo",
      "Ar-condicionado",
      "Wi-Fi",
      "Sala de espera",
      "Autoclave",
      "Internet",
    ],
    images: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800",
    ],
    whatsappNumber: "5512999999999",
    featured: true,
    ownerId: "owner-1",
    rating: 4.9,
    totalReviews: 38,
    isPremium: true,
    periods: { morning: true, afternoon: true, evening: false },
  },
  {
    id: "vila-adyana",
    name: "Consultório Vila Adyana",
    neighborhood: "Vila Adyana",
    city: "São José dos Campos",
    pricePerPeriod: 250,
    description:
      "Espaço moderno e equipado na Vila Adyana, uma das regiões mais valorizadas da cidade. Conta com raio-x digital, ultrassom e recepção totalmente equipada. Perfeito para profissionais que querem atender em um ambiente sofisticado.",
    equipment: [
      "Raio-x digital",
      "Ultrassom",
      "Ar-condicionado",
      "Recepção equipada",
      "Wi-Fi",
      "Estacionamento",
    ],
    images: [
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
      "https://images.unsplash.com/photo-1629909615032-72eab4eb03c7?w=800",
    ],
    whatsappNumber: "5512999999999",
    featured: true,
    ownerId: "owner-2",
    rating: 4.7,
    totalReviews: 21,
    periods: { morning: false, afternoon: true, evening: true },
  },
  {
    id: "centro-sjc",
    name: "Consultório Centro",
    neighborhood: "Centro",
    city: "São José dos Campos",
    pricePerPeriod: 200,
    description:
      "Consultório prático e bem localizado no centro da cidade. Fácil acesso por transporte público. Equipamentos básicos inclusos, ideal para procedimentos de rotina e avaliações.",
    equipment: [
      "Equipo completo",
      "Compressor",
      "Ar-condicionado",
      "Wi-Fi",
      "Autoclave",
    ],
    images: [
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
    ],
    whatsappNumber: "5512999999999",
    featured: true,
    ownerId: "owner-1",
    rating: 4.5,
    totalReviews: 14,
    periods: { morning: true, afternoon: true, evening: true },
  },
  {
    id: "jardim-satelite",
    name: "Consultório Jardim Satélite",
    neighborhood: "Jardim Satélite",
    city: "São José dos Campos",
    pricePerPeriod: 180,
    description:
      "Consultório acessível no Jardim Satélite, região com grande fluxo de pacientes. Ambiente limpo e organizado, com todos os equipamentos essenciais para atendimento odontológico.",
    equipment: [
      "Equipo completo",
      "Compressor",
      "Bomba a vácuo",
      "Ar-condicionado",
      "Autoclave",
    ],
    images: [
      "https://images.unsplash.com/photo-1629909615032-72eab4eb03c7?w=800",
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800",
    ],
    whatsappNumber: "5512999999999",
    featured: false,
    ownerId: "owner-3",
    rating: 4.3,
    totalReviews: 9,
    periods: { morning: true, afternoon: false, evening: false },
  },
  {
    id: "parque-residencial",
    name: "Consultório Parque Residencial Aquarius",
    neighborhood: "Parque Residencial Aquarius",
    city: "São José dos Campos",
    pricePerPeriod: 350,
    description:
      "Consultório premium no Parque Residencial Aquarius. Duas salas de atendimento, equipamentos de última geração incluindo raio-x panorâmico e scanner intraoral. Estacionamento próprio.",
    equipment: [
      "2 Equipos completos",
      "Raio-x panorâmico",
      "Scanner intraoral",
      "Compressor",
      "Ar-condicionado",
      "Wi-Fi",
      "Estacionamento",
      "Sala de espera premium",
      "Autoclave",
    ],
    images: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800",
      "https://images.unsplash.com/photo-1629909615032-72eab4eb03c7?w=800",
    ],
    whatsappNumber: "5512999999999",
    featured: true,
    ownerId: "owner-2",
    rating: 5.0,
    totalReviews: 52,
    isPremium: true,
    periods: { morning: true, afternoon: true, evening: false },
  },
  {
    id: "urbanova",
    name: "Consultório Urbanova",
    neighborhood: "Urbanova",
    city: "São José dos Campos",
    pricePerPeriod: 280,
    description:
      "Consultório em região nobre de Urbanova, próximo à universidades. Ambiente moderno com decoração clean, perfeito para profissionais que valorizam estética e conforto.",
    equipment: [
      "Equipo completo",
      "Compressor silencioso",
      "Ar-condicionado",
      "Wi-Fi",
      "Sala de espera",
      "Autoclave",
      "Fotopolimerizador",
    ],
    images: [
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
    ],
    whatsappNumber: "5512999999999",
    featured: false,
    ownerId: "owner-3",
    rating: 4.6,
    totalReviews: 17,
    periods: { morning: false, afternoon: true, evening: true },
  },
];
