import { getTuurioSession } from '../utils/tuurio-oidc';
export default defineEventHandler((event) => {
  const session = getTuurioSession(getCookie(event, 'tuurio_session'));
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
  return session.user;
});
