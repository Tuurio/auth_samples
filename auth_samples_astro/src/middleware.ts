import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/server/oidc';

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = getSession(context.cookies.get('tuurio_session')?.value)?.user ?? null;
  if (context.url.pathname === '/dashboard' && !context.locals.user) return context.redirect('/', 303);
  return next();
});
