import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { autoConfirmUser } from "./functions/auto-confirm-user/resource";
import { storage } from "./storage/resource";

defineBackend({
  auth,
  autoConfirmUser,
  data,
  storage,
});
