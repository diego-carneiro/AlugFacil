import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: {
      required: true,
      mutable: false,
    },
    phoneNumber: {
      required: false,
      mutable: true,
    },
    "custom:role": {
      dataType: "String",
      mutable: true,
    },
    "custom:cro": {
      dataType: "String",
      mutable: true,
    },
    "custom:specialty": {
      dataType: "String",
      mutable: true,
    },
    "custom:verified": {
      dataType: "String",
      mutable: true,
    },
  },
  groups: ["TENANT", "OWNER", "ADMIN"],
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: false,
    requireNumbers: true,
    requireSpecialCharacters: false,
  },
});
