import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const Home = lazy(() => import("./pages/Home"));
const Listings = lazy(() => import("./pages/Listings"));
const ConsultoryDetail = lazy(() => import("./pages/ConsultoryDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ConfirmRegistration = lazy(
  () => import("./pages/auth/ConfirmRegistration"),
);
const TenantDashboard = lazy(() => import("./pages/dashboard/TenantDashboard"));
const TenantConsultorySearchDashboard = lazy(
  () => import("./pages/dashboard/TenantConsultorySearchDashboard"),
);
const OwnerDashboard = lazy(() => import("./pages/dashboard/OwnerDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const ConsultoryProfile = lazy(() => import("./pages/ConsultoryProfile"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );
}

function OwnerOnlyRoute({ children }: { children: ReactNode }) {
  const { currentUser, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return <Loading />;
  }

  if (!currentUser) {
    return <Navigate to="/entrar" replace />;
  }

  if (currentUser.role !== "owner") {
    if (currentUser.role === "admin") {
      return <Navigate to="/dashboard/admin" replace />;
    }

    return <Navigate to="/dashboard/locatario" replace />;
  }

  return <>{children}</>;
}

export default function Router() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/consultorios" element={<Listings />} />
        <Route path="/consultorios/:id" element={<ConsultoryDetail />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/contato" element={<Contact />} />

        <Route path="/entrar" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/confirmar-cadastro" element={<ConfirmRegistration />} />

        <Route path="/dashboard/locatario" element={<TenantDashboard />} />
        <Route
          path="/dashboard/locatario/buscar-consultorios"
          element={<TenantConsultorySearchDashboard />}
        />
        <Route
          path="/dashboard/proprietario"
          element={
            <OwnerOnlyRoute>
              <OwnerDashboard />
            </OwnerOnlyRoute>
          }
        />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />

        <Route path="/profile" element={<Profile />} />
        <Route
          path="/dashboard/proprietario/perfil"
          element={
            <OwnerOnlyRoute>
              <ConsultoryProfile />
            </OwnerOnlyRoute>
          }
        />
        <Route path="/:slug" element={<UserProfile />} />
      </Routes>
    </Suspense>
  );
}
