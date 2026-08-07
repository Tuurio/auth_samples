import { redirect } from '@sveltejs/kit';
import { endSession } from '$lib/server/oidc';

export async function GET({ cookies }) {
  const url = await endSession(cookies.get('tuurio_session'));
  cookies.delete('tuurio_session', { path: '/' });
  redirect(303, url.href);
}
