import { createBrowserRouter } from 'react-router-dom';
import { PersonaProvider } from '../lib/persona';
import { MarketingLayout } from '../layout/MarketingLayout';
import { AppLayout } from '../layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { ForCandidatesPage } from '../pages/ForCandidatesPage';
import { ForFreelancersPage } from '../pages/ForFreelancersPage';
import { ForAgenciesPage } from '../pages/ForAgenciesPage';
import { PricingPage } from '../pages/PricingPage';
import { MethodologyPage } from '../pages/MethodologyPage';
import { SignInPage } from '../pages/SignInPage';
import { SearchPage } from '../pages/SearchPage';
import { CompanyReportPage } from '../pages/CompanyReportPage';
import { SavedPage } from '../pages/SavedPage';
import { ComparePage } from '../pages/ComparePage';
import { AlertsPage } from '../pages/AlertsPage';
import { BulkCheckPage } from '../pages/BulkCheckPage';
import { AccountPage } from '../pages/AccountPage';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { AdminOverview } from '../pages/admin/AdminOverview';
import { AdminApiHealth } from '../pages/admin/AdminApiHealth';
import { AdminDataFreshness } from '../pages/admin/AdminDataFreshness';
import { AdminAlertsQueue } from '../pages/admin/AdminAlertsQueue';
import { AdminWatchAlerts } from '../pages/admin/AdminWatchAlerts';
import { AdminActivity } from '../pages/admin/AdminActivity';
import { AdminCompanies } from '../pages/admin/AdminCompanies';
import { AdminLogs } from '../pages/admin/AdminLogs';
import { AdminSettings } from '../pages/admin/AdminSettings';
import { AdminKillSwitches } from '../pages/admin/AdminKillSwitches';
import { AdminAudit } from '../pages/admin/AdminAudit';

function withPersona(node: React.ReactNode) {
  return <PersonaProvider>{node}</PersonaProvider>;
}

export const router = createBrowserRouter([
  // Marketing
  {
    path: '/',
    element: withPersona(<MarketingLayout />),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'methodology', element: <MethodologyPage /> },
    ],
  },
  // Persona-locked landings (each forces a persona)
  { path: '/for-candidates', element: <ForCandidatesPage /> },
  { path: '/for-freelancers', element: <ForFreelancersPage /> },
  { path: '/for-agencies', element: <ForAgenciesPage /> },
  // Auth
  { path: '/sign-in', element: withPersona(<SignInPage />) },
  // App
  {
    path: '/app',
    element: withPersona(<AppLayout />),
    children: [
      { path: 'search', element: <SearchPage /> },
      { path: 'company/:id', element: <CompanyReportPage /> },
      { path: 'saved', element: <SavedPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'bulk', element: <BulkCheckPage /> },
    ],
  },
  // Account (separate so layout can use canvas bg)
  { path: '/account', element: withPersona(<AppLayout />), children: [{ index: true, element: <AccountPage /> }] },
  // Admin (dark ops layout + persistent left rail)
  {
    path: '/admin',
    element: withPersona(<AdminLayout />),
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'api-health', element: <AdminApiHealth /> },
      { path: 'data-freshness', element: <AdminDataFreshness /> },
      { path: 'alerts', element: <AdminAlertsQueue /> },
      { path: 'watch-alerts', element: <AdminWatchAlerts /> },
      { path: 'activity', element: <AdminActivity /> },
      { path: 'companies', element: <AdminCompanies /> },
      { path: 'logs', element: <AdminLogs /> },
      { path: 'settings', element: <AdminSettings /> },
      { path: 'kill-switches', element: <AdminKillSwitches /> },
      { path: 'audit', element: <AdminAudit /> },
    ],
  },
]);
