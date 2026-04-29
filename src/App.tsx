import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Taxes from "./pages/Taxes.tsx";
import Charts from "./pages/Charts.tsx";
import Projections from "./pages/Projections.tsx";
import DeploymentPlan from "./pages/DeploymentPlan.tsx";
import PortfolioAI from "./pages/PortfolioAI.tsx";
import RollingReturns from "./pages/RollingReturns.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/taxes" element={<Taxes />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/projections" element={<Projections />} />
          <Route path="/deployment-plan" element={<DeploymentPlan />} />
          <Route path="/ai" element={<PortfolioAI />} />
          <Route path="/rolling-return" element={<RollingReturns />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
