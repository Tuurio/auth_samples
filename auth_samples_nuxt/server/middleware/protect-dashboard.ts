import { getTuurioSession } from '../utils/tuurio-oidc';
export default defineEventHandler((event) => {
  if (event.path.startsWith('/dashboard') && !getTuurioSession(getCookie(event, 'tuurio_session'))) return sendRedirect(event, '/', 303);
});
