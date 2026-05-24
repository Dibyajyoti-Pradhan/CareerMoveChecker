import { ReactNode, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

const KEY = 'cmc.adminAuth.v1';
const PASSWORD = 'change_me_local';

export function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(KEY) === '1') setUnlocked(true);
  }, []);

  if (unlocked) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === PASSWORD) {
      sessionStorage.setItem(KEY, '1');
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  return (
    <div className="container-narrow py-20">
      <Card>
        <h1 className="text-2xl font-extrabold tracking-tight">Admin access</h1>
        <p className="mt-2 text-sm text-muted">
          Enter the admin password to view admin dashboards. In production this is checked server-side. The frontend gate is a UX shortcut for this preview.
        </p>
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <Input
            type="password"
            placeholder="Admin password"
            value={pwd}
            onChange={(e) => {
              setPwd(e.target.value);
              setError(false);
            }}
            invalid={error}
          />
          {error && <Alert tone="danger">Wrong password.</Alert>}
          <Button type="submit">Unlock</Button>
        </form>
        <p className="mt-4 text-xs text-muted">
          Local default: <code className="font-mono">change_me_local</code>. Override server-side via <code className="font-mono">ADMIN_PASSWORD</code>.
        </p>
      </Card>
    </div>
  );
}
