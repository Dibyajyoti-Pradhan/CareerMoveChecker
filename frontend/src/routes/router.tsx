import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ToastProvider } from '../components/ui/Toast';
import { LandingPage } from '../pages/LandingPage';
import { PricingPage } from '../pages/PricingPage';
import { SearchPage } from '../pages/SearchPage';
import { CompanyReportPage } from '../pages/CompanyReportPage';
import { CompanyPrintPage } from '../pages/CompanyPrintPage';
import { ComparePage } from '../pages/ComparePage';
import { DashboardPage } from '../pages/DashboardPage';
import { AdminGate } from '../pages/AdminGate';
import { AdminPage } from '../pages/AdminPage';
import { AdminAlertsPage } from '../pages/AdminAlertsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ReactNode } from 'react';

function Shell({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell><MainLayout /></Shell>,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'app/search', element: <SearchPage /> },
      { path: 'app/company/:id', element: <CompanyReportPage /> },
      { path: 'app/compare', element: <ComparePage /> },
      { path: 'app/dashboard', element: <DashboardPage /> },
      { path: 'admin', element: <AdminGate><AdminPage /></AdminGate> },
      { path: 'admin/alerts', element: <AdminGate><AdminAlertsPage /></AdminGate> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/app/company/:id/print',
    element: <Shell><CompanyPrintPage /></Shell>,
  },
]);
