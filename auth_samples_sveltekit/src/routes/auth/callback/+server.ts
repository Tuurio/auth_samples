import { redirect } from '@sveltejs/kit';
import { completeLogin } from '$lib/server/oidc';

export async function GET({ cookies, url }) {
  const { sessionId } = await completeLogin(url, cookies.get('tuurio_transaction'));
  cookies.delete('tuurio_transaction', { path: '/' });
  cookies.set('tuurio_session', sessionId, { path: '/', httpOnly: true, sameSite: 'lax', secure: url.protocol === 'https:', maxAge: 3600 });
  redirect(303, '/dashboard');
}
