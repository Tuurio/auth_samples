import cookieParser from 'cookie-parser';
import express from 'express';
import { resolve } from 'node:path';
import { beginLogin, completeLogin, endSession, getSession } from './oidc.js';

const app = express();
app.set('trust proxy', 1);
app.use(cookieParser());

app.get('/auth/login', async (request, response, next) => { try {
  const { transactionId, url } = await beginLogin();
  response.cookie('tuurio_transaction', transactionId, { httpOnly: true, sameSite: 'lax', secure: request.secure, maxAge: 600_000, path: '/' });
  response.redirect(303, url.href);
} catch (error) { next(error); } });

app.get('/auth/callback', async (request, response, next) => { try {
  const currentUrl = new URL(request.originalUrl, `${request.protocol}://${request.get('host')}`);
  const sessionId = await completeLogin(currentUrl, request.cookies.tuurio_transaction);
  response.clearCookie('tuurio_transaction', { path: '/' });
  response.cookie('tuurio_session', sessionId, { httpOnly: true, sameSite: 'lax', secure: request.secure, maxAge: 3_600_000, path: '/' });
  response.redirect(303, '/dashboard');
} catch (error) { next(error); } });

app.get('/api/me', (request, response) => { const session = getSession(request.cookies.tuurio_session); if (!session) return response.status(401).json({ error: 'unauthenticated' }); return response.json({ user: session.user }); });
app.get('/auth/logout', async (request, response, next) => { try { const url = await endSession(request.cookies.tuurio_session); response.clearCookie('tuurio_session', { path: '/' }); response.redirect(303, url.href); } catch (error) { next(error); } });
app.get('/logout/callback', (_request, response) => response.redirect(303, '/'));

if (process.env.NODE_ENV === 'production') {
  const clientRoot = resolve('dist/client');
  app.use(express.static(clientRoot));
  app.use((request, response, next) => request.method === 'GET' && request.accepts('html') ? response.sendFile(resolve(clientRoot, 'index.html')) : next());
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

app.use((_error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => { response.status(400).send('Authentication request could not be completed.'); });
app.listen(Number(process.env.PORT || 3000), () => console.log(`Listening on http://localhost:${process.env.PORT || 3000}`));
