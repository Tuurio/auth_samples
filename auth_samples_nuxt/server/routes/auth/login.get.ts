import { beginLogin } from '../../utils/tuurio-oidc';
export default defineEventHandler(async (event) => {
  const { transactionId, url } = await beginLogin();
  setCookie(event, 'tuurio_transaction', transactionId, { httpOnly: true, sameSite: 'lax', secure: getRequestURL(event).protocol === 'https:', maxAge: 600, path: '/' });
  return sendRedirect(event, url.href, 303);
});
