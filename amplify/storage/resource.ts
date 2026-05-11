import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "alugfacilStorage",
  access: (allow) => ({
    "public/*": [allow.guest.to(["read"]), allow.authenticated.to(["read"])],
    "public/consultories/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read", "write"]),
    ],
    "public/users/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read", "write"]),
    ],
    "inspections/{entity_id}/*": [allow.entity("identity").to(["read", "write", "delete"])],
  }),
});
