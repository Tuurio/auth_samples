import type { APIRoute } from 'astro';
import { endSession } from '../../lib/server/oidc';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const url = await endSession(cookies.get('tuurio_session')?.value);
  cookies.delete('tuurio_session', { path: '/' });
  return redirect(url.href, 303);
};
