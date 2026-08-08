import type { APIRoute } from 'astro';
import { completeLogin } from '../../lib/server/oidc';

export const GET: APIRoute = async ({ cookies, redirect, url }) => {
  const sessionId = await completeLogin(url, cookies.get('tuurio_transaction')?.value);
  cookies.delete('tuurio_transaction', { path: '/' });
  cookies.set('tuurio_session', sessionId, { path: '/', httpOnly: true, sameSite: 'lax', secure: url.protocol === 'https:', maxAge: 3600 });
  return redirect('/dashboard', 303);
};
