import { completeLogin } from '../../utils/tuurio-oidc';
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const sessionId = await completeLogin(url, getCookie(event, 'tuurio_transaction'));
  deleteCookie(event, 'tuurio_transaction', { path: '/' });
  setCookie(event, 'tuurio_session', sessionId, { httpOnly: true, sameSite: 'lax', secure: url.protocol === 'https:', maxAge: 3600, path: '/' });
  return sendRedirect(event, '/dashboard', 303);
});
