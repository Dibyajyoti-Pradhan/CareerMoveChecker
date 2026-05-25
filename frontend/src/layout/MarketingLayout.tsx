import { Outlet } from 'react-router-dom';
import { MarketingNav } from './MarketingNav';
import { MarketingFooter } from './MarketingFooter';
import { useEffect } from 'react';

export function MarketingLayout() {
  useEffect(() => {
    document.body.classList.remove('canvas');
  }, []);
  return (
    <>
      <MarketingNav />
      <Outlet />
      <MarketingFooter />
    </>
  );
}
