import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  User: a
    .model({
      cognitoId: a.string().required(),
      name: a.string().required(),
      email: a.email().required(),
      phone: a.phone(),
      role: a.enum(["TENANT", "OWNER", "ADMIN"]),
      avatarKey: a.string(),
      cro: a.string(),
      specialty: a.string(),
      verified: a.boolean().default(false),
      rating: a.float().default(0),
      totalReviews: a.integer().default(0),
      ownedConsultories: a.hasMany("Consultory", "ownerId"),
    })
    .identifier(["cognitoId"])
    .authorization((allow) => [
      allow.owner(),
      allow.groups(["ADMIN"]),
      allow.authenticated().to(["read"]),
    ]),

  Consultory: a
    .model({
      name: a.string().required(),
      description: a.string(),
      neighborhood: a.string().required(),
      city: a.string().required(),
      state: a.string().required(),
      address: a.string(),
      zipCode: a.string(),
      latitude: a.float(),
      longitude: a.float(),
      pricePerPeriod: a.float().required(),
      equipment: a.string().array(),
      periodMorning: a.boolean().default(false),
      periodAfternoon: a.boolean().default(false),
      periodEvening: a.boolean().default(false),
      featured: a.boolean().default(false),
      isPremium: a.boolean().default(false),
      premiumUntil: a.datetime(),
      rating: a.float().default(0),
      totalReviews: a.integer().default(0),
      whatsappNumber: a.string(),
      ownerId: a.id().required(),
      ownerProfile: a.belongsTo("User", "ownerId"),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.owner().to(["create", "update", "delete"]),
      allow.groups(["ADMIN"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});
