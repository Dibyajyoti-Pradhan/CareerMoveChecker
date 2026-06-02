import { createBrowserRouter } from 'react-router-dom';
import { PersonaProvider } from '../lib/persona';
import { MarketingLayout } from '../layout/MarketingLayout';
import { AppLayout } from '../layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { MethodologyPage } from '../pages/MethodologyPage';
import { PricingPage } from '../pages/PricingPage';
import { SearchPage } from '../pages/SearchPage';
import { CompanyReportPage } from '../pages/CompanyReportPage';
import { SavedPage } from '../pages/SavedPage';
import { ComparePage } from '../pages/ComparePage';
import { BulkCheckPage } from '../pages/BulkCheckPage';
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
import { AdminFunnel } from '../pages/admin/AdminFunnel';
import { AdminWaitlist } from '../pages/admin/AdminWaitlist';
import { AdminVisitors } from '../pages/admin/AdminVisitors';

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
      { path: 'methodology', element: <MethodologyPage /> },
      { path: 'pricing', element: <PricingPage /> },
    ],
  },
  // Auth
  // App
  {
    path: '/app',
    element: withPersona(<AppLayout />),
    children: [
      { path: 'search', element: <SearchPage /> },
      { path: 'company/:id', element: <CompanyReportPage /> },
      { path: 'saved', element: <SavedPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'bulk', element: <BulkCheckPage /> },
    ],
  },
  // Admin (dark ops layout + persistent left rail)
  {
    path: '/admin',
    element: withPersona(<AdminLayout />),
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'visitors', element: <AdminVisitors /> },
      { path: 'funnel', element: <AdminFunnel /> },
      { path: 'waitlist', element: <AdminWaitlist /> },
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
