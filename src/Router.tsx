import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const Listings = lazy(() => import("./pages/Listings"));
const ConsultoryDetail = lazy(() => import("./pages/ConsultoryDetail"));
const RegisterConsultory = lazy(() => import("./pages/RegisterConsultory"));
const Contact = lazy(() => import("./pages/Contact"));

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );
}

export default function Router() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/consultorios" element={<Listings />} />
        <Route path="/consultorios/:id" element={<ConsultoryDetail />} />
        <Route path="/cadastrar" element={<RegisterConsultory />} />
        <Route path="/contato" element={<Contact />} />
      </Routes>
    </Suspense>
  );
}
