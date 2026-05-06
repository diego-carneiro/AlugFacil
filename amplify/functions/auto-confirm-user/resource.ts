import { defineFunction } from "@aws-amplify/backend";

export const autoConfirmUser = defineFunction({
  name: "auto-confirm-user",
  entry: "./handler.ts",
  resourceGroupName: "auth",
  runtime: 20,
});
