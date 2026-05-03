import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import NotFound from "@/pages/not-found";

import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import BukuTamuPage from "@/pages/BukuTamuPage";
import ArsipSuratPage from "@/pages/ArsipSuratPage";
import KontenSliderPage from "@/pages/KontenSliderPage";
import PengaturanPage from "@/pages/PengaturanPage";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/admin" component={DashboardPage} />
      <Route path="/admin/buku-tamu" component={BukuTamuPage} />
      <Route path="/admin/arsip-surat" component={ArsipSuratPage} />
      <Route path="/admin/konten-slider" component={KontenSliderPage} />
      <Route path="/admin/pengaturan" component={PengaturanPage} />
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
