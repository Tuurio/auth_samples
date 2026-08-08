import type { APIRoute } from 'astro';
import { beginLogin } from '../../lib/server/oidc';

export const GET: APIRoute = async ({ cookies, redirect, url: requestUrl }) => {
  const { transactionId, url } = await beginLogin();
  cookies.set('tuurio_transaction', transactionId, { path: '/', httpOnly: true, sameSite: 'lax', secure: requestUrl.protocol === 'https:', maxAge: 600 });
  return redirect(url.href, 303);
};
