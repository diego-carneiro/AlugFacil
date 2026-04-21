import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Router from "./Router";
import { AuthProvider } from "./context/AuthContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const FULLSCREEN_ROUTES = ["/entrar", "/cadastro", "/dashboard"];

function AppShell() {
  const { pathname } = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.some(r => pathname.startsWith(r));

  if (isFullscreen) {
    return <Router />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Router />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
