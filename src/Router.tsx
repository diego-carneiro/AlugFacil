import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const Listings = lazy(() => import("./pages/Listings"));
const ConsultoryDetail = lazy(() => import("./pages/ConsultoryDetail"));
const RegisterConsultory = lazy(() => import("./pages/RegisterConsultory"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ConfirmRegistration = lazy(() => import("./pages/auth/ConfirmRegistration"));
const TenantDashboard = lazy(() => import("./pages/dashboard/TenantDashboard"));
const TenantConsultorySearchDashboard = lazy(
  () => import("./pages/dashboard/TenantConsultorySearchDashboard")
);
const OwnerDashboard = lazy(() => import("./pages/dashboard/OwnerDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

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
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/consultorios" element={<Listings />} />
        <Route path="/consultorios/:id" element={<ConsultoryDetail />} />
        <Route path="/cadastrar" element={<RegisterConsultory />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/contato" element={<Contact />} />

        {/* Auth */}
        <Route path="/entrar" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/confirmar-cadastro" element={<ConfirmRegistration />} />

        {/* Dashboards */}
        <Route path="/dashboard/locatario" element={<TenantDashboard />} />
        <Route
          path="/dashboard/locatario/buscar-consultorios"
          element={<TenantConsultorySearchDashboard />}
        />
        <Route path="/dashboard/proprietario" element={<OwnerDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />

        {/* Perfil */}
        <Route path="/profile" element={<Profile />} />
        {/* /:username deve ser a última rota — captura apenas o que não casou acima */}
        <Route path="/:username" element={<UserProfile />} />
      </Routes>
    </Suspense>
  );
}
