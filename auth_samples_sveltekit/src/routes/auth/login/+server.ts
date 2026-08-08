import { redirect } from '@sveltejs/kit';
import { beginLogin } from '$lib/server/oidc';

export async function GET({ cookies, url: requestUrl }) {
  const { transactionId, url } = await beginLogin();
  cookies.set('tuurio_transaction', transactionId, { path: '/', httpOnly: true, sameSite: 'lax', secure: requestUrl.protocol === 'https:', maxAge: 600 });
  redirect(303, url.href);
}
