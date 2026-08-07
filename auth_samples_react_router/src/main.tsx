import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router';
import './styles.css';

type User = { sub: string; name?: string; email?: string };

function Home() {
  return <main><p className="eyebrow">EU-hosted identity</p><h1>React Router + Tuurio ID</h1><p>Full-stack OpenID Connect with PKCE and server-only tokens.</p><a className="button" href="/auth/login">Sign in with Tuurio ID</a></main>;
}

function Dashboard() {
  const [state, setState] = useState<{ loading: boolean; user?: User }>({ loading: true });
  useEffect(() => { fetch('/api/me', { credentials: 'same-origin' }).then(async response => {
    if (!response.ok) return setState({ loading: false });
    setState({ loading: false, user: (await response.json()).user });
  }).catch(() => setState({ loading: false })); }, []);
  if (state.loading) return <main><p>Loading validated session…</p></main>;
  if (!state.user) return <Navigate to="/" replace />;
  return <main><p className="eyebrow">Protected area</p><h1>Welcome {state.user.name || state.user.email || state.user.sub}</h1><p>Your browser holds only an opaque session cookie.</p><a href="/auth/logout">Sign out</a></main>;
}

function App() { return <Routes><Route path="/" element={<Home />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="*" element={<main><h1>Not found</h1><Link to="/">Home</Link></main>} /></Routes>; }

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>);
