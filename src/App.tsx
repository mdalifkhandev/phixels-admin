import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from
  'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
// Dashboard Layout & Auth
import { LoginPage } from './pages/dashboard/LoginPage';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
// Analytics Pages
import { AnalyticsDashboard } from './pages/dashboard/AnalyticsDashboard';
import { ConversionFunnel } from './pages/dashboard/ConversionFunnel';
import { CampaignAnalytics } from './pages/dashboard/CampaignAnalytics';
import { GeographicAnalytics } from './pages/dashboard/GeographicAnalytics';
import { TrafficSources } from './pages/dashboard/TrafficSources';
import { RealtimeMonitor } from './pages/dashboard/RealtimeMonitor';
// Content Management Pages
import { BlogManagement } from './pages/dashboard/BlogManagement';
import { CaseStudiesManagement } from './pages/dashboard/CaseStudiesManagement';
import { PortfolioManagement } from './pages/dashboard/PortfolioManagement';
import { ProductsManagement } from './pages/dashboard/ProductsManagement';
import { ServicesManagement } from './pages/dashboard/ServicesManagement';
import { ReviewsManagement } from './pages/dashboard/ReviewsManagement';
import { CareersManagement } from './pages/dashboard/CareersManagement';
// Marketing Pages
import { LeadManagement } from './pages/dashboard/LeadManagement';
import { CampaignIntegration } from './pages/dashboard/CampaignIntegration';
// Settings
import { SettingsPage } from './pages/dashboard/SettingsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
export function App() {
  return (
    // Context Provider
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />


          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* Analytics */}
              <Route index element={<AnalyticsDashboard />} />
              <Route path="funnel" element={<ConversionFunnel />} />
              <Route path="geographic" element={<GeographicAnalytics />} />
              <Route path="traffic" element={<TrafficSources />} />
              <Route path="realtime" element={<RealtimeMonitor />} />

              {/* Content Management */}
              <Route path="blog" element={<BlogManagement />} />
              <Route path="case-studies" element={<CaseStudiesManagement />} />
              <Route path="portfolio" element={<PortfolioManagement />} />
              <Route path="products" element={<ProductsManagement />} />
              <Route path="services" element={<ServicesManagement />} />
              <Route path="reviews" element={<ReviewsManagement />} />
              <Route path="careers" element={<CareersManagement />} />

              {/* Marketing */}
              <Route path="leads" element={<LeadManagement />} />
              <Route path="campaigns" element={<CampaignAnalytics />} />
              <Route
                path="campaigns/integration"
                element={<CampaignIntegration />} />


              {/* Settings */}
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>);

}
