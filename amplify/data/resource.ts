import { a, defineData, defineFunction, type ClientSchema } from "@aws-amplify/backend";

const submitBookingReview = defineFunction({
  name: "submit-booking-review",
  entry: "./submit-booking-review/handler.ts",
  runtime: 20,
});

const schema = a.schema({
  BookingPeriod: a.enum(["morning", "afternoon", "evening"]),
  BookingStatus: a.enum(["pending", "confirmed", "completed", "cancelled"]),
  AvailabilityStatus: a.enum(["available", "blocked", "booked"]),
  InspectionType: a.enum(["check_in", "check_out"]),
  ReviewType: a.enum(["tenant_to_consultory", "owner_to_tenant"]),
  ReviewSubmissionResult: a.customType({
    id: a.id().required(),
    bookingId: a.id().required(),
    consultoryId: a.id().required(),
    fromUserId: a.string().required(),
    fromUserName: a.string().required(),
    toUserId: a.string().required(),
    toUserName: a.string(),
    rating: a.integer().required(),
    comment: a.string(),
    reviewDate: a.date().required(),
    type: a.ref("ReviewType").required(),
  }),

  submitBookingReview: a
    .mutation()
    .arguments({
      bookingId: a.id().required(),
      rating: a.integer().required(),
      comment: a.string(),
    })
    .returns(a.ref("ReviewSubmissionResult"))
    .handler(a.handler.function(submitBookingReview))
    .authorization((allow) => [allow.authenticated()]),

  User: a
    .model({
      owner: a
        .string()
        .authorization((allow) => [
          allow.owner().to(["read", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      cognitoId: a
        .string()
        .required()
        .authorization((allow) => [
          allow.owner().to(["create", "read", "delete"]),
          allow.groups(["ADMIN"]),
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read"]),
        ]),
      name: a
        .string()
        .required()
        .authorization((allow) => [
          allow.owner().to(["create", "read", "update", "delete"]),
          allow.groups(["ADMIN"]),
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read"]),
        ]),
      publicSlug: a.string(),
      email: a
        .email()
        .required()
        .authorization((allow) => [
          allow.owner().to(["create", "read", "update", "delete"]),
          allow.groups(["ADMIN"]),
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read"]),
        ]),
      phone: a.phone(),
      role: a.enum(["TENANT", "OWNER", "ADMIN"]),
      avatarKey: a.string(),
      taxId: a.string(),
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
      allow.publicApiKey().to(["read"]),
      allow.authenticated().to(["read"]),
    ]),

  Consultory: a
    .model({
      name: a
        .string()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      publicSlug: a.string(),
      description: a.string(),
      neighborhood: a
        .string()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      city: a
        .string()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      state: a
        .string()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      address: a.string(),
      zipCode: a.string(),
      latitude: a.float(),
      longitude: a.float(),
      pricePerPeriod: a
        .float()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      equipment: a.string().array(),
      imageKeys: a.string().array(),
      logoKey: a.string(),
      periodMorning: a.boolean().default(false),
      periodAfternoon: a.boolean().default(false),
      periodEvening: a.boolean().default(false),
      featured: a.boolean().default(false),
      isPremium: a.boolean().default(false),
      premiumUntil: a.datetime(),
      rating: a.float().default(0),
      totalReviews: a.integer().default(0),
      whatsappNumber: a.string(),
      ownerId: a
        .string()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["create", "read", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      ownerProfile: a.belongsTo("User", "ownerId"),
      bookings: a.hasMany("Booking", "consultoryId"),
      availabilities: a.hasMany("Availability", "consultoryId"),
      inspections: a.hasMany("Inspection", "consultoryId"),
      reviews: a.hasMany("Review", "consultoryId"),
      rooms: a.hasMany("Room", "consultoryId"),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["create", "read", "update", "delete"]),
      allow.groups(["ADMIN"]),
    ]),

  Booking: a
    .model({
      consultoryId: a
        .id()
        .required()
        .authorization((allow) => [
          allow.ownerDefinedIn("tenantId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["read", "update", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      consultory: a.belongsTo("Consultory", "consultoryId"),
      consultoryName: a
        .string()
        .required()
        .authorization((allow) => [
          allow.ownerDefinedIn("tenantId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["read", "update", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      consultoryImage: a.url(),
      tenantId: a
        .string()
        .required()
        .authorization((allow) => [
          allow.ownerDefinedIn("tenantId").identityClaim("sub").to(["create", "read", "delete"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["read", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      tenantName: a
        .string()
        .required()
        .authorization((allow) => [
          allow.ownerDefinedIn("tenantId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["read", "update", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      ownerId: a
        .string()
        .required()
        .authorization((allow) => [
          allow.ownerDefinedIn("tenantId").identityClaim("sub").to(["create", "read", "delete"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["read", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      ownerName: a
        .string()
        .required()
        .authorization((allow) => [
          allow.ownerDefinedIn("tenantId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["read", "update", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      date: a
        .date()
        .required()
        .authorization((allow) => [
          allow.ownerDefinedIn("tenantId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["read", "update", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      period: a
        .ref("BookingPeriod")
        .required()
        .authorization((allow) => [
          allow.ownerDefinedIn("tenantId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["read", "update", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      status: a
        .ref("BookingStatus")
        .required()
        .authorization((allow) => [
          allow.ownerDefinedIn("tenantId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["read", "update", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      price: a
        .float()
        .required()
        .authorization((allow) => [
          allow.ownerDefinedIn("tenantId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["read", "update", "delete"]),
          allow.groups(["ADMIN"]),
        ]),
      completedAt: a.datetime(),
      reviewedByTenant: a.boolean().default(false),
      reviewedByOwner: a.boolean().default(false),
      inspectedCheckIn: a.boolean().default(false),
      inspectedCheckOut: a.boolean().default(false),
      inspections: a.hasMany("Inspection", "bookingId"),
      reviews: a.hasMany("Review", "bookingId"),
    })
    .authorization((allow) => [
      allow.ownerDefinedIn("tenantId").identityClaim("sub").to(["create", "read", "update"]),
      allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["read", "update"]),
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

  Room: a
    .model({
      consultoryId: a
        .id()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.authenticated().to(["read"]),
          allow.groups(["ADMIN"]),
        ]),
      consultory: a.belongsTo("Consultory", "consultoryId"),
      ownerId: a
        .string()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["create", "read", "delete"]),
          allow.authenticated().to(["read"]),
          allow.groups(["ADMIN"]),
        ]),
      name: a
        .string()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.authenticated().to(["read"]),
          allow.groups(["ADMIN"]),
        ]),
      description: a.string(),
      pricePerPeriod: a
        .float()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["create", "read", "update", "delete"]),
          allow.authenticated().to(["read"]),
          allow.groups(["ADMIN"]),
        ]),
      equipment: a.string().array(),
      imageKeys: a.string().array(),
      periodMorning: a.boolean().default(false),
      periodAfternoon: a.boolean().default(false),
      periodEvening: a.boolean().default(false),
      available: a.boolean().default(true),
      rating: a.float().default(0),
      totalReviews: a.integer().default(0),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.ownerDefinedIn("ownerId").identityClaim("sub").to(["create", "read", "update", "delete"]),
      allow.authenticated().to(["read"]),
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
      allow.authenticated().to(["read"]),
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
