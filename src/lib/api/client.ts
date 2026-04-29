import { generateClient } from "aws-amplify/data";
import outputs from "../../../amplify_outputs.json";
import type { Schema } from "../../../amplify/data/resource";

export const hasAmplifyBackend = Object.keys(outputs).length > 0;

export const client = hasAmplifyBackend ? generateClient<Schema>() : null;
