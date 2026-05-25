import { Outlet } from 'react-router-dom';
import { MarketingNav } from './MarketingNav';
import { MarketingFooter } from './MarketingFooter';
import { useEffect } from 'react';
import { useTrackPageView } from '../lib/track';

export function MarketingLayout() {
  useEffect(() => { document.body.classList.remove('canvas'); }, []);
  useTrackPageView();
  return (
    <>
      <MarketingNav />
      <Outlet />
      <MarketingFooter />
    </>
  );
}
