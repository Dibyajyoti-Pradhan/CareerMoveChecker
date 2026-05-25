import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import type { Persona } from '../lib/persona';
import { PERSONA_LABEL } from '../lib/persona';

export function SignInPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [reveal, setReveal] = useState(false);
  const [persona, setPersona] = useState<Persona>('candidate');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('canvas');
    return () => document.body.classList.remove('canvas');
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    try { localStorage.setItem('cmc.persona', persona); } catch {}
    navigate('/app/search');
  };

  return (
    <>
      <header className="nav no-print">
        <div className="wrap nav-inner">
          <Link className="logo" to="/">
            <span className="mk">CM</span>
            <span>CareerMoveChecker</span>
          </Link>
          <div className="nav-cta">
            <Link className="btn btn-ghost btn-sm" to="/">Back to home</Link>
          </div>
        </div>
      </header>

      <div className="auth-shell">
        <div className="form-side">
          <div style={{ marginBottom: 28 }}>
            <h2>{mode === 'signin' ? 'Welcome back.' : 'Create your account.'}</h2>
            <p className="sub">
              {mode === 'signin' ? (
                <>New here? <a style={{ color: 'var(--brand)' }} onClick={() => setMode('signup')} role="button">Create an account</a></>
              ) : (
                <>Already have an account? <a style={{ color: 'var(--brand)' }} onClick={() => setMode('signin')} role="button">Sign in</a></>
              )}
            </p>
          </div>

          <div className="sso-row">
            <button type="button" className="sso-btn github" onClick={submit}>
              <Icon name="github" size={18} /> Continue with GitHub
            </button>
            <button type="button" className="sso-btn" onClick={submit}>
              <Icon name="google" size={18} /> Continue with Google
            </button>
          </div>
          <div className="divider"><span className="line" /><span className="txt">or with email</span><span className="line" /></div>

          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" className="input" type="email" placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="reveal">
                <input id="password" className="input" type={reveal ? 'text' : 'password'} placeholder="••••••••" required />
                <button type="button" onClick={() => setReveal(!reveal)} aria-label="Toggle password">
                  <Icon name={reveal ? 'eye-off' : 'eye'} />
                </button>
              </div>
              {mode === 'signup' && <span className="helper">At least 12 characters.</span>}
            </div>

            {mode === 'signup' && (
              <div className="field">
                <label>What are you checking?</label>
                <div className="persona-pick">
                  {(['candidate', 'freelancer', 'agency'] as Persona[]).map((p, i) => (
                    <label key={p}>
                      <input type="radio" name="persona" value={p} checked={persona === p} onChange={() => setPersona(p)} />
                      <span className="ix">{String(i + 1).padStart(2, '0')}</span>
                      <span className="name">{PERSONA_LABEL[p]}</span>
                      <span className="desc">{p === 'candidate' ? 'Free' : p === 'freelancer' ? 'Pro · £19/mo' : 'Agency · £79/mo'}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {mode === 'signin' ? (
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginBottom: 16 }}>
                <input type="checkbox" defaultChecked /> Keep me signed in
              </label>
            ) : (
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginBottom: 16 }}>
                <input type="checkbox" required /> I agree to the <a style={{ color: 'var(--brand)' }} href="#">Terms</a> and <a style={{ color: 'var(--brand)' }} href="#">Privacy Policy</a>
              </label>
            )}

            <button className="submit-btn" type="submit">
              {mode === 'signin' ? 'Sign in' : 'Create account — free'}
            </button>
          </form>

          <div className="foot-row">
            <span>© {new Date().getFullYear()} CareerMoveChecker</span>
            <span><a href="#" style={{ color: 'var(--muted)' }}>Forgot password</a></span>
          </div>
        </div>

        <div className="brand-side">
          <div className="inner">
            <div className="eyebrow">Trust by transparency</div>
            <h2>Know who you're dealing with before you sign, invoice, or place.</h2>
            <div className="quote-card" style={{ background: 'rgba(255,255,255,.7)', border: '1px solid var(--hair)', color: 'var(--ink)' }}>
              <div className="qtag" style={{ color: 'var(--brand)' }}>Why it matters</div>
              <blockquote style={{ color: 'var(--ink)' }}>"Three weeks after my start date, the company was in administration. The signals were on Companies House the whole time."</blockquote>
              <div className="by">
                <div className="av" style={{ background: 'var(--brand)' }}>DP</div>
                <div className="meta" style={{ color: 'var(--muted)' }}><b style={{ color: 'var(--ink)' }}>Dibyajyoti P.</b>Founder</div>
              </div>
            </div>
            <div className="zone-mini">
              <span className="zm"><span className="zone-tag direct">Direct</span></span>
              <span className="zm"><span className="zone-tag deduced">Deduced</span></span>
              <span className="zm"><span className="zone-tag not">Not answerable</span></span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
