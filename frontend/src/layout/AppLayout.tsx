import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { AppNav } from './AppNav';
import { DiscFooter } from './MarketingFooter';
import { useTrackPageView } from '../lib/track';

export function AppLayout() {
  useEffect(() => { document.body.classList.remove('canvas'); }, []);
  useTrackPageView();
  return (
    <>
      <AppNav />
      <Outlet />
      <DiscFooter />
    </>
  );
}
