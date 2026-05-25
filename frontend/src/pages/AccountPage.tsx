import { useState } from 'react';
import { Icon } from '../components/Icon';
import { PERSONA_LABEL, usePersona } from '../lib/persona';
import type { Persona } from '../lib/persona';
import { cn } from '../lib/cn';

type Section = 'profile' | 'notifications' | 'billing' | 'team' | 'security' | 'danger';

const SECTIONS: { id: Section; ix: string; label: string; icon: any }[] = [
  { id: 'profile', ix: '01', label: 'Profile', icon: 'user' },
  { id: 'notifications', ix: '02', label: 'Notifications', icon: 'bell' },
  { id: 'billing', ix: '03', label: 'Plan & billing', icon: 'star' },
  { id: 'team', ix: '04', label: 'Team', icon: 'users' },
  { id: 'security', ix: '05', label: 'Security', icon: 'lock' },
];

export function AccountPage() {
  const [section, setSection] = useState<Section>('profile');
  const { persona, setPersona } = usePersona();

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <p className="small muted">Account</p>
          <h1>Account settings</h1>
          <p className="sub">Profile, notifications, billing, team, security.</p>
        </div>
      </div>

      <div className="account-shell">
        <aside className="rail-nav">
          {SECTIONS.map((s) => (
            <a key={s.id} className={cn(section === s.id && 'active')} onClick={() => setSection(s.id)}>
              <span className="ix">{s.ix}</span>
              <Icon name={s.icon} />
              {s.label}
            </a>
          ))}
          <hr />
          <a className={cn('danger', section === 'danger' && 'active')} onClick={() => setSection('danger')}>
            <Icon name="trash" />
            Danger zone
          </a>
        </aside>

        <div>
          {section === 'profile' && (
            <div className="panel">
              <div className="panel-card">
                <h3>Identity</h3>
                <p className="sub">How we identify you across the app and on PDF exports.</p>
                <div className="field"><label>Full name</label><input className="input" defaultValue="Dibyajyoti Pradhan" /></div>
                <div className="field"><label>Email</label><input className="input" type="email" defaultValue="dibyojyotipradhan@gmail.com" /></div>
                <div className="field"><label>Job title (optional)</label><input className="input" placeholder="e.g. Freelance product designer" /></div>
                <div className="save-st"><Icon name="check" size={12} /> Saved automatically</div>
              </div>
              <div className="panel-card">
                <h3>Default persona</h3>
                <p className="sub">Shown above-the-fold across the app. You can still switch per-page.</p>
                <div className="persona-pick">
                  {(['candidate', 'freelancer', 'agency'] as Persona[]).map((p, i) => (
                    <label key={p}>
                      <input type="radio" name="default-persona" value={p} checked={persona === p} onChange={() => setPersona(p)} />
                      <span className="ix">{String(i + 1).padStart(2, '0')}</span>
                      <span className="name">{PERSONA_LABEL[p]}</span>
                      <span className="desc">{p === 'candidate' ? 'Free' : p === 'freelancer' ? 'Pro · £19' : 'Agency · £79'}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="panel-card">
                <h3>Preferences</h3>
                <p className="sub">Display and formatting.</p>
                <div className="field"><label>Date format</label><select className="select"><option>02 Mar 2026 (UK)</option><option>2026-03-02 (ISO)</option><option>Mar 02 2026 (US)</option></select></div>
                <div className="field"><label>Currency</label><select className="select"><option>GBP (£)</option><option>EUR (€)</option><option>USD ($)</option></select></div>
                <div className="toggle-row">
                  <div className="left"><h5>Show Direct / Deduced tags</h5><p>Tag every claim with where it came from.</p></div>
                  <label className="toggle"><input type="checkbox" defaultChecked /><span className="slider" /></label>
                </div>
              </div>
            </div>
          )}

          {section === 'notifications' && (
            <div className="panel">
              <div className="panel-card">
                <h3>What gets you an alert</h3>
                <p className="sub">For companies on your saved/watch list.</p>
                <div className="toggle-list">
                  {[
                    ['Status change (active → liquidation, etc.)', true],
                    ['Insolvency case opened', true],
                    ['Director appointed or resigned', true],
                    ['Accounts overdue', true],
                    ['New charge registered', false],
                    ['Filing of any kind', false],
                  ].map(([h, on]) => (
                    <div key={h as string} className="toggle-row">
                      <div className="left"><h5>{h as string}</h5></div>
                      <label className="toggle"><input type="checkbox" defaultChecked={on as boolean} /><span className="slider" /></label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel-card">
                <h3>How we email you</h3>
                <div className="field"><label>Cadence</label><select className="select"><option>Instant</option><option>Daily digest at 9am</option><option>Weekly Monday morning</option><option>Never</option></select></div>
                <div className="toggle-row">
                  <div className="left"><h5>Critical-only mode</h5><p>Only insolvency and director-disqualification alerts.</p></div>
                  <label className="toggle"><input type="checkbox" /><span className="slider" /></label>
                </div>
                {persona === 'agency' && (
                  <div className="field" style={{ marginTop: 16 }}><label>Slack webhook (Agency)</label><input className="input" placeholder="https://hooks.slack.com/services/…" /></div>
                )}
              </div>
            </div>
          )}

          {section === 'billing' && (
            <div className="panel">
              <div className="panel-card">
                <h3>Current plan</h3>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 600 }}>{persona === 'candidate' ? 'Free' : persona === 'freelancer' ? 'Pro' : 'Agency'}</div>
                    <p className="sub">{persona === 'candidate' ? '£0/mo · 5 checks/month' : persona === 'freelancer' ? '£19/mo · renews 02 Jun 2026' : '£79/mo · renews 02 Jun 2026'}</p>
                  </div>
                  <div className="row">
                    <button className="btn btn-secondary btn-sm">Change plan</button>
                    {persona !== 'candidate' && <button className="btn btn-ghost btn-sm">Cancel</button>}
                  </div>
                </div>
              </div>
              <div className="panel-card">
                <h3>This billing period</h3>
                <div className="stats" style={{ padding: 0, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div className="stat"><span className="label">Reports run</span><span className="val">128</span></div>
                  <div className="stat"><span className="label">Saved companies</span><span className="val">12</span></div>
                  <div className="stat"><span className="label">Alerts received</span><span className="val">6</span></div>
                </div>
              </div>
              <div className="panel-card">
                <h3>Payment method</h3>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div>Visa ending <b className="mono">4242</b> · expires 12/29</div>
                  <button className="btn btn-secondary btn-sm">Update card</button>
                </div>
              </div>
              <div className="panel-card">
                <h3>Invoice history</h3>
                {[
                  { d: '2026-05-01', n: 'Pro · May 2026', a: '£19.00' },
                  { d: '2026-04-01', n: 'Pro · April 2026', a: '£19.00' },
                  { d: '2026-03-01', n: 'Pro · March 2026', a: '£19.00' },
                ].map((inv) => (
                  <div key={inv.d} className="inv-row">
                    <span className="mono">{inv.d}</span>
                    <span>{inv.n}</span>
                    <span className="mono">{inv.a}</span>
                    <span className="badge badge-ok"><span className="dot" />Paid</span>
                    <button className="icon-btn"><Icon name="download" size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'team' && (
            <div className="panel">
              <div className="panel-card">
                <h3>Team workspace</h3>
                <p className="sub">{persona === 'agency' ? 'Invite consultants to share the same saved/watch list.' : 'Team workspace is available on Agency tier.'}</p>
                {persona === 'agency' ? (
                  <>
                    <div className="row" style={{ marginBottom: 14 }}>
                      <input className="input" placeholder="colleague@agency.com" style={{ flex: 1 }} />
                      <select className="select" style={{ width: 140 }}><option>Member</option><option>Admin</option></select>
                      <button className="btn btn-primary">Invite</button>
                    </div>
                    {[
                      ['Dibyajyoti P.', 'Admin', 'dibyojyotipradhan@gmail.com'],
                      ['Sara Patel', 'Member', 'sara@agency.com'],
                      ['Marcus Reed', 'Member', 'marcus@agency.com'],
                    ].map(([n, r, e]) => (
                      <div key={e} className="person">
                        <div className="av">{n.split(' ').map((p) => p[0]).join('')}</div>
                        <div><div className="name">{n}</div><div className="role">{e}</div></div>
                        <div className="when">{r}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="empty">Upgrade to Agency to invite teammates.</div>
                )}
              </div>
            </div>
          )}

          {section === 'security' && (
            <div className="panel">
              <div className="panel-card">
                <h3>Password</h3>
                <div className="field"><label>Current password</label><input className="input" type="password" /></div>
                <div className="field"><label>New password</label><input className="input" type="password" /></div>
                <button className="btn btn-primary btn-sm">Change password</button>
              </div>
              <div className="panel-card">
                <h3>Two-factor authentication</h3>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <p style={{ margin: 0, color: 'var(--muted)' }}>Not enabled.</p>
                  <button className="btn btn-secondary btn-sm">Set up 2FA</button>
                </div>
              </div>
              <div className="panel-card">
                <h3>Active sessions</h3>
                <div className="acc-row"><span><b>MacBook · Chrome</b><br /><span className="small muted">London · this session</span></span><span className="badge badge-ok"><span className="dot" />Active</span></div>
                <div className="acc-row"><span><b>iPhone · Safari</b><br /><span className="small muted">London · 2 hours ago</span></span><button className="btn btn-ghost btn-sm">Sign out</button></div>
              </div>
            </div>
          )}

          {section === 'danger' && (
            <div className="panel">
              <div className="danger-card">
                <h3>Delete account</h3>
                <p>This permanently deletes your account, saved companies, and history. This cannot be undone.</p>
                <button className="btn btn-danger" style={{ marginTop: 14 }}>Delete account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
