import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { AppNav } from './AppNav';
import { DiscFooter } from './MarketingFooter';

export function CanvasLayout() {
  useEffect(() => {
    document.body.classList.add('canvas');
    return () => document.body.classList.remove('canvas');
  }, []);
  return (
    <>
      <AppNav />
      <Outlet />
      <DiscFooter />
    </>
  );
}
