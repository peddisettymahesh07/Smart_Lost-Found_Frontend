import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { ReportLostPage } from './pages/ReportLostPage';
import { ReportFoundPage } from './pages/ReportFoundPage';
import { LostListingPage } from './pages/LostListingPage';
import { FoundListingPage } from './pages/FoundListingPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { MatchingResultsPage } from './pages/MatchingResultsPage';
import { NearbyMapPage } from './pages/NearbyMapPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="app-root">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/lost-items" element={<LostListingPage />} />
                <Route path="/found-items" element={<FoundListingPage />} />
                <Route path="/items/:type/:id" element={<ItemDetailPage />} />
                <Route path="/matches" element={<MatchingResultsPage />} />
                <Route path="/nearby-map" element={<NearbyMapPage />} />

                {/* Authenticated User Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report-lost"
                  element={
                    <ProtectedRoute>
                      <ReportLostPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report-found"
                  element={
                    <ProtectedRoute>
                      <ReportFoundPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/claims"
                  element={
                    <ProtectedRoute>
                      <ClaimsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/claim-item/:foundId"
                  element={
                    <ProtectedRoute>
                      <ClaimsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Only Route */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all fallback to Home */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
