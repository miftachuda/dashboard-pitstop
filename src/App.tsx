import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainPage from "./pages/MainPage.tsx";
import RestrokePage from "./pages/RestrokePage.tsx";
import StrainerPage from "./pages/StrainerPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import DailyActivity from "./components/DailyActivityPage.tsx";
import PhotoGallery from "./pages/ImageGallery.tsx";
import AdditionalPage from "./pages/Additional.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/additionals" element={<AdditionalPage />} />

          <Route path="/restroke" element={<RestrokePage />} />
          <Route path="/strainer" element={<StrainerPage />} />
          <Route path="/daily" element={<DailyActivity />} />

          <Route path="/photos" element={<PhotoGallery />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
