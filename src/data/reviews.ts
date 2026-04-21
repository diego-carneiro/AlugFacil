export interface Review {
  id: string;
  bookingId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  consultoryName: string;
  rating: number;
  comment: string;
  date: string;
  type: "tenant-to-owner" | "owner-to-tenant";
}

export const reviews: Review[] = [
  {
    id: "rv-001",
    bookingId: "bk-005",
    fromUserId: "tenant-2",
    fromUserName: "Dr. Carlos Mendes",
    toUserId: "owner-1",
    consultoryName: "Consultório Jardim Aquarius",
    rating: 5,
    comment:
      "Consultório impecável! Tudo muito limpo, equipamentos em perfeito estado. O Dr. Roberto foi muito atencioso. Recomendo demais.",
    date: "2026-03-21",
    type: "tenant-to-owner",
  },
  {
    id: "rv-002",
    bookingId: "bk-005",
    fromUserId: "owner-1",
    fromUserName: "Dr. Roberto Alves",
    toUserId: "tenant-2",
    consultoryName: "Consultório Jardim Aquarius",
    rating: 5,
    comment:
      "Dr. Carlos é um profissional exemplar. Deixou o consultório em perfeito estado, pontual e muito cuidadoso. Ótima locação!",
    date: "2026-03-21",
    type: "owner-to-tenant",
  },
  {
    id: "rv-003",
    bookingId: "bk-003",
    fromUserId: "owner-2",
    fromUserName: "Clínica Sorria Bem",
    toUserId: "tenant-1",
    consultoryName: "Consultório Parque Residencial Aquarius",
    rating: 5,
    comment:
      "Dra. Ana é super organizada e respeitosa. Deixou tudo exatamente como encontrou. Esperamos tê-la novamente!",
    date: "2026-03-29",
    type: "owner-to-tenant",
  },
];
