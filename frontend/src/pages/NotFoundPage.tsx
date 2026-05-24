import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="container-narrow py-24 text-center">
      <div className="text-6xl font-extrabold tracking-tight text-brand">404</div>
      <h1 className="mt-3 text-2xl font-extrabold">Page not found</h1>
      <p className="mt-2 text-muted">The page you were looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center h-11 px-5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark"
      >
        Back home
      </Link>
    </div>
  );
}
