import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserMatchesProvider } from "@/contexts/UserMatchesContext";
import { MatchFeedProvider } from "@/contexts/MatchFeedContext";
import Index from "./pages/Index";
import Matches from "./pages/Matches";
import MatchDetails from "./pages/MatchDetails";
import MyMatches from "./pages/MyMatches";
import Feed from "./pages/Feed";
import Teams from "./pages/Teams";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserMatchesProvider>
        <MatchFeedProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/matches/:id" element={<MatchDetails />} />
              <Route path="/my-matches" element={<MyMatches />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MatchFeedProvider>
      </UserMatchesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
