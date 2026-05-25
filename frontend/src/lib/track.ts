import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSessionId, isFirstVisit } from './session';
import { usePersona } from './persona';

function send(path: string, body: any) {
  // Fire and forget — never block UI
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
      navigator.sendBeacon(path, blob);
      return;
    }
  } catch {}
  fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {});
}

export function useTrackPageView() {
  const location = useLocation();
  const { persona } = usePersona();

  useEffect(() => {
    const sessionId = getSessionId();
    const first = isFirstVisit();
    send('/api/track/page-view', {
      path: location.pathname,
      referrer: document.referrer || null,
      persona,
      sessionId,
      firstVisit: first,
    });
  }, [location.pathname]);
}

export function trackCta(ctaId: string, metadata: Record<string, any> = {}) {
  send('/api/track/cta', {
    ctaId,
    path: window.location.pathname,
    persona: document.body.getAttribute('data-persona'),
    sessionId: getSessionId(),
    metadata,
  });
}

export async function submitWaitlist(input: {
  email: string;
  persona?: string;
  tier?: string;
  role?: string;
}): Promise<{ ok: boolean; alreadyOnList: boolean }> {
  const sessionId = getSessionId();
  const res = await fetch('/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...input,
      referrer: document.referrer || null,
      landingPath: window.location.pathname,
      anonymousSessionId: sessionId,
    }),
  });
  if (!res.ok) throw new Error('Signup failed');
  return res.json();
}
