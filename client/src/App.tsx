import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { isAuthenticated } from "@/lib/auth";
import { useVisitorTracker } from "@/hooks/useVisitorTracker";

import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import BukuTamuPage from "@/pages/BukuTamuPage";
import BukuTamuPublicPage from "@/pages/BukuTamuPublicPage";
import ArsipSuratPage from "@/pages/ArsipSuratPage";
import KontenSliderPage from "@/pages/KontenSliderPage";
import PengaturanPage from "@/pages/PengaturanPage";
import PengaduanMasyarakatPage from "@/pages/PengaduanMasyarakatPage";
import WhistleBlowingPage from "@/pages/WhistleBlowingPage";
import PengaduanMasyarakatAdminPage from "@/pages/PengaduanMasyarakatAdminPage";
import WhistleBlowingAdminPage from "@/pages/WhistleBlowingAdminPage";
import StatistikLayananPage from "@/pages/StatistikLayananPage";
import StatistikPengunjungPage from "@/pages/StatistikPengunjungPage";
import PelaporanGratifikasiPage from "@/pages/PelaporanGratifikasiPage";
import GratifikasiAdminPage from "@/pages/GratifikasiAdminPage";
import KontakPage from "@/pages/KontakPage";
import ProfilePage from "@/pages/ProfilePage";
import VotingEOMPage from "@/pages/VotingEOMPage";
import VotingEOMAdminPage from "@/pages/VotingEOMAdminPage";
import SkmPage from "@/pages/SkmPage";
import SkmAdminPage from "@/pages/SkmAdminPage";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "https://fabulous-lemur-912.convex.cloud";
const convex = new ConvexReactClient(CONVEX_URL);

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const [, setLocation] = useLocation();
  if (!isAuthenticated()) {
    setLocation("/admin/login");
    return null;
  }
  return <Component />;
}

function Router() {
  useVisitorTracker();
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/buku-tamu" component={BukuTamuPublicPage} />
      <Route path="/admin/login" component={LoginPage} />
      <Route path="/admin" component={() => <ProtectedRoute component={DashboardPage} />} />
      <Route path="/admin/buku-tamu" component={() => <ProtectedRoute component={BukuTamuPage} />} />
      <Route path="/admin/arsip-surat" component={() => <ProtectedRoute component={ArsipSuratPage} />} />
      <Route path="/admin/konten-slider" component={() => <ProtectedRoute component={KontenSliderPage} />} />
      <Route path="/admin/statistik-layanan" component={() => <ProtectedRoute component={StatistikLayananPage} />} />
      <Route path="/admin/statistik-pengunjung" component={() => <ProtectedRoute component={StatistikPengunjungPage} />} />
      <Route path="/admin/pengaturan" component={() => <ProtectedRoute component={PengaturanPage} />} />
      <Route path="/admin/pengaduan-masyarakat" component={() => <ProtectedRoute component={PengaduanMasyarakatAdminPage} />} />
      <Route path="/admin/whistle-blowing" component={() => <ProtectedRoute component={WhistleBlowingAdminPage} />} />
      <Route path="/pengaduan-masyarakat" component={PengaduanMasyarakatPage} />
      <Route path="/whistle-blowing" component={WhistleBlowingPage} />
      <Route path="/pelaporan-gratifikasi" component={PelaporanGratifikasiPage} />
      <Route path="/kontak" component={KontakPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/skm/:slug" component={SkmPage} />
      <Route path="/voting-eom" component={VotingEOMPage} />
      <Route path="/admin/voting-eom" component={() => <ProtectedRoute component={VotingEOMAdminPage} />} />
      <Route path="/admin/skm" component={() => <ProtectedRoute component={SkmAdminPage} />} />
      <Route path="/admin/pelaporan-gratifikasi" component={() => <ProtectedRoute component={GratifikasiAdminPage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ConvexProvider>
  );
}

export default App;
