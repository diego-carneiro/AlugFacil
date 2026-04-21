export type UserRole = "tenant" | "owner" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone: string;
  cro?: string;
  specialty?: string;
  verified: boolean;
  rating: number;
  totalReviews: number;
  createdAt: string;
}

export const users: User[] = [
  {
    id: "tenant-1",
    name: "Dra. Ana Lima",
    email: "ana.lima@email.com",
    role: "tenant",
    phone: "(12) 99111-2233",
    cro: "CRO-SP 12345",
    specialty: "Ortodontia",
    verified: true,
    rating: 4.9,
    totalReviews: 24,
    createdAt: "2024-03-10",
  },
  {
    id: "tenant-2",
    name: "Dr. Carlos Mendes",
    email: "carlos.mendes@email.com",
    role: "tenant",
    phone: "(12) 98222-3344",
    cro: "CRO-SP 67890",
    specialty: "Implantodontia",
    verified: true,
    rating: 4.7,
    totalReviews: 12,
    createdAt: "2024-05-22",
  },
  {
    id: "tenant-3",
    name: "Dra. Fernanda Costa",
    email: "fernanda.costa@email.com",
    role: "tenant",
    phone: "(12) 97333-4455",
    cro: "CRO-SP 11223",
    specialty: "Endodontia",
    verified: false,
    rating: 0,
    totalReviews: 0,
    createdAt: "2026-01-15",
  },
  {
    id: "owner-1",
    name: "Dr. Roberto Alves",
    email: "roberto.alves@email.com",
    role: "owner",
    phone: "(12) 99444-5566",
    verified: true,
    rating: 4.8,
    totalReviews: 31,
    createdAt: "2023-11-05",
  },
  {
    id: "owner-2",
    name: "Clínica Sorria Bem",
    email: "contato@sorriabem.com.br",
    role: "owner",
    phone: "(12) 3322-4455",
    verified: true,
    rating: 4.9,
    totalReviews: 48,
    createdAt: "2023-08-18",
  },
  {
    id: "owner-3",
    name: "Dra. Mariana Souza",
    email: "mariana.souza@email.com",
    role: "owner",
    phone: "(12) 98555-6677",
    verified: true,
    rating: 4.5,
    totalReviews: 19,
    createdAt: "2024-02-07",
  },
  {
    id: "admin-1",
    name: "Diego Admin",
    email: "admin@alugfacil.com.br",
    role: "admin",
    phone: "(12) 3000-0001",
    verified: true,
    rating: 0,
    totalReviews: 0,
    createdAt: "2023-01-01",
  },
];

export const getMockUser = (role: UserRole): User => {
  if (role === "tenant") return users[0];
  if (role === "owner") return users[3];
  return users[6];
};
