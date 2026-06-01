import { FormEvent, useEffect, useState } from 'react';
import { Icon } from './Icon';
import { trackCta, submitWaitlist } from '../lib/track';
import type { Persona } from '../lib/persona';
import { PERSONA_LABEL, usePersona } from '../lib/persona';

interface Props {
  open: boolean;
  onClose: () => void;
  tier: 'Pro' | 'Agency';
  ctaId: string;
}

export function WaitlistModal({ open, onClose, tier, ctaId }: Props) {
  const { persona } = usePersona();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [pickedPersona, setPickedPersona] = useState<Persona>(persona);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<'new' | 'already' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDone(null);
    setError(null);
    trackCta(ctaId + '.open', { tier });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, ctaId, tier]); // eslint-disable-line

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await submitWaitlist({ email: email.trim(), persona: pickedPersona, tier, role: role || undefined });
      setDone(r.alreadyOnList ? 'already' : 'new');
      trackCta(ctaId + '.submit', { tier, alreadyOnList: r.alreadyOnList });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(11,18,32,0.5)', zIndex: 100, display: 'grid', placeItems: 'center', padding: 20 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{ background: '#fff', borderRadius: 22, padding: 32, maxWidth: 520, width: '100%', boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {!done && (
          <>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <span className="persona-tag" style={{ marginBottom: 0 }}>
                <span className="dot" />
                {tier} · waitlist
              </span>
              <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 600, margin: '12px 0 8px', letterSpacing: '-.02em' }}>
              {tier === 'Pro' ? 'Be first in line for Pro.' : 'Talk to us about Agency.'}
            </h2>
            <p className="sub" style={{ margin: '0 0 22px' }}>
              {tier === 'Pro'
                ? "Drop your email. We'll let you know when Pro is live — and you'll get the launch discount."
                : "Drop your email. We'll set up a 15-minute call to understand your team's workflow."}
            </p>

            <form onSubmit={submit}>
              <div className="field">
                <label>Email</label>
                <input className="input" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </div>

              <div className="field">
                <label>You are a…</label>
                <div className="persona-pick">
                  {(['candidate', 'freelancer', 'agency'] as Persona[]).map((p, i) => (
                    <label key={p}>
                      <input type="radio" name="modal-persona" value={p} checked={pickedPersona === p} onChange={() => setPickedPersona(p)} />
                      <span className="ix">{String(i + 1).padStart(2, '0')}</span>
                      <span className="name">{PERSONA_LABEL[p]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Role / company <span className="muted small">(optional)</span></label>
                <input className="input" placeholder="e.g. Freelance product designer, London" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>

              {error && <div className="alert danger" style={{ marginBottom: 12 }}>{error}</div>}

              <button className="submit-btn" type="submit" disabled={busy || !email.trim()}>
                {busy ? 'Sending…' : tier === 'Pro' ? 'Notify me when Pro launches' : 'Get on the call list'}
              </button>
              <p className="small muted" style={{ marginTop: 12, textAlign: 'center' }}>
                We only email about CareerMove. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}

        {done && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--ok-bg)', color: 'var(--ok)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
              <Icon name="check" size={24} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 8px' }}>
              {done === 'new' ? "You're on the list." : "You're already on the list."}
            </h2>
            <p className="sub" style={{ margin: '0 0 22px' }}>
              {done === 'new'
                ? "We'll email you the moment " + tier + " launches."
                : "We've still got your email — we'll be in touch when " + tier + " is live."}
            </p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
