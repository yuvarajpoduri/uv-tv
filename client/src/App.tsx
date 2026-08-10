import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import DynamicIsland from "./components/DynamicIsland";
import LoadingScreen from "./components/LoadingScreen";
import OfflineBanner from "./components/OfflineBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Search from "./pages/Search";
import ShowDetails from "./pages/ShowDetails";
import Watchlist from "./pages/Watchlist";
import History from "./pages/History";
import Stats from "./pages/Stats";
import Subscriptions from "./pages/Subscriptions";
import PersonFilmography from "./pages/PersonFilmography";
import NotFound from "./pages/NotFound";

function AnimatedRoutes() {
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  if (loading) return <LoadingScreen />;

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="w-full flex-1"
    >
      <Routes location={location}>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/show/:tmdbId"
          element={
            <ProtectedRoute>
              <ShowDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/person/:personId"
          element={
            <ProtectedRoute>
              <PersonFilmography />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/streaming"
          element={
            <ProtectedRoute>
              <Subscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <Stats />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </motion.div>
  );
}

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const showNav = user && location.pathname !== "/login";

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-base-950 flex flex-col selection:bg-accent-orange/30 text-white">
        <OfflineBanner />
        {showNav && <Navbar />}
        <main className={`flex-1 flex flex-col w-full ${showNav ? "pt-20 sm:pt-24" : ""}`}>
          <AnimatedRoutes />
        </main>
        {showNav && <Footer />}
        {showNav && <DynamicIsland />}
      </div>
    </ErrorBoundary>
  );
}
