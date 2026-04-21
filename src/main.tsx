import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Amplify } from "aws-amplify";
import App from "./App";
import outputs from "../amplify_outputs.json";
import "./styles/index.css";

if (Object.keys(outputs).length > 0) {
  Amplify.configure(outputs);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
