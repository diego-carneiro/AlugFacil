import { notifyFetchStart, notifyFetchEnd } from "../context/LoadingContext";

const original = window.fetch.bind(window);

window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
  const url =
    typeof args[0] === "string"
      ? args[0]
      : args[0] instanceof URL
        ? args[0].href
        : (args[0] as Request).url;

  // Skip Vite HMR and internal dev-server requests
  if (url.startsWith("/@") || url.includes("__vite") || url.startsWith("/@fs")) {
    return original(...args);
  }

  notifyFetchStart();
  try {
    return await original(...args);
  } finally {
    notifyFetchEnd();
  }
};
