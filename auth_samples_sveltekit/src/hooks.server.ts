import type { Handle } from '@sveltejs/kit';
import { getSession } from '$lib/server/oidc';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = getSession(event.cookies.get('tuurio_session'))?.user ?? null;
  return resolve(event);
};
