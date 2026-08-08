import { endSession } from '../../utils/tuurio-oidc';
export default defineEventHandler(async (event) => {
  const url = await endSession(getCookie(event, 'tuurio_session'));
  deleteCookie(event, 'tuurio_session', { path: '/' });
  return sendRedirect(event, url.href, 303);
});
