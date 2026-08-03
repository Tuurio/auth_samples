import { useAuth } from "./auth";
import "./style.css";

export default function App() {
  const auth = useAuth();
  if (auth.loading) return <main className="shell"><p>Checking session…</p></main>;
  if (auth.error) return <main className="shell"><h1>Login could not be completed</h1><p>{auth.error}</p><button onClick={() => void auth.login()}>Try again</button></main>;
  if (!auth.user) return <main className="shell"><span className="eyebrow">Tuurio ID starter</span><h1>Secure login, without coding your own auth.</h1><p>OIDC Authorization Code with PKCE. Credentials stay outside the browser bundle.</p><button onClick={() => void auth.login()}>Sign in</button></main>;
  return <main className="shell"><span className="eyebrow">Authenticated</span><h1>Welcome, {auth.user.profile.name || auth.user.profile.email}</h1><p>Your app now has a verified OIDC session.</p><button onClick={() => void auth.logout()}>Sign out</button></main>;
}
