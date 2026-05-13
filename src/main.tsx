import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Amplify } from "aws-amplify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import outputs from "../amplify_outputs.json";
import "./styles/index.css";
import "./lib/fetchInterceptor";

if (Object.keys(outputs).length > 0) {
  Amplify.configure(outputs);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
