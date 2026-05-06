import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  BookingPeriod: a.enum(["morning", "afternoon", "evening"]),
  BookingStatus: a.enum(["pending", "confirmed", "completed", "cancelled"]),
  AvailabilityStatus: a.enum(["available", "blocked", "booked"]),
  InspectionType: a.enum(["check_in", "check_out"]),
  ReviewType: a.enum(["tenant_to_owner", "owner_to_tenant"]),

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
      imageKeys: a.string().array(),
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
      bookings: a.hasMany("Booking", "consultoryId"),
      availabilities: a.hasMany("Availability", "consultoryId"),
      inspections: a.hasMany("Inspection", "consultoryId"),
      reviews: a.hasMany("Review", "consultoryId"),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.owner().to(["create", "update", "delete"]),
      allow.groups(["ADMIN"]),
    ]),

  Booking: a
    .model({
      consultoryId: a.id().required(),
      consultory: a.belongsTo("Consultory", "consultoryId"),
      consultoryName: a.string().required(),
      consultoryImage: a.url(),
      tenantId: a.string().required(),
      tenantName: a.string().required(),
      ownerId: a.string().required(),
      ownerName: a.string().required(),
      date: a.date().required(),
      period: a.ref("BookingPeriod").required(),
      status: a.ref("BookingStatus").required(),
      price: a.float().required(),
      reviewedByTenant: a.boolean().default(false),
      reviewedByOwner: a.boolean().default(false),
      inspectedCheckIn: a.boolean().default(false),
      inspectedCheckOut: a.boolean().default(false),
      inspections: a.hasMany("Inspection", "bookingId"),
      reviews: a.hasMany("Review", "bookingId"),
    })
    .authorization((allow) => [
      allow.authenticated(),
      allow.groups(["ADMIN"]),
    ]),

  Availability: a
    .model({
      consultoryId: a.id().required(),
      consultory: a.belongsTo("Consultory", "consultoryId"),
      date: a.date().required(),
      period: a.ref("BookingPeriod").required(),
      status: a.ref("AvailabilityStatus").required(),
      blockedByBookingId: a.id(),
      blockedReason: a.string(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.authenticated().to(["create", "read", "update", "delete"]),
      allow.groups(["ADMIN"]),
    ]),

  Inspection: a
    .model({
      bookingId: a.id().required(),
      booking: a.belongsTo("Booking", "bookingId"),
      consultoryId: a.id().required(),
      consultory: a.belongsTo("Consultory", "consultoryId"),
      createdById: a.string().required(),
      createdByName: a.string().required(),
      type: a.ref("InspectionType").required(),
      findingsJson: a.string().required(),
      issueCount: a.integer().default(0),
      photoKeys: a.string().array(),
      inspectedAt: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.authenticated(),
      allow.groups(["ADMIN"]),
    ]),

  Review: a
    .model({
      bookingId: a.id().required(),
      booking: a.belongsTo("Booking", "bookingId"),
      consultoryId: a.id().required(),
      consultory: a.belongsTo("Consultory", "consultoryId"),
      fromUserId: a.string().required(),
      fromUserName: a.string().required(),
      toUserId: a.string().required(),
      toUserName: a.string(),
      rating: a.integer().required(),
      comment: a.string(),
      reviewDate: a.date().required(),
      type: a.ref("ReviewType").required(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.authenticated().to(["create", "read", "update"]),
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
