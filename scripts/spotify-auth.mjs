#!/usr/bin/env node
/**
 * One-time Spotify OAuth helper for Headspace "now playing".
 *
 * 1. Create an app at https://developer.spotify.com/dashboard
 * 2. Add Redirect URI:  http://127.0.0.1:53682/callback
 * 3. Run:
 *      SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/spotify-auth.mjs
 * 4. Browser opens → approve → copy the refresh_token into GitHub Secrets
 *    as SPOTIFY_REFRESH_TOKEN (also add SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET).
 */
import http from 'node:http';
import { URL } from 'node:url';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PORT = 53682;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = [
  'user-read-currently-playing',
  'user-read-recently-played',
].join(' ');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET env vars first.');
  process.exit(1);
}

const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
  }).toString();

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, `http://127.0.0.1:${PORT}`);
    if (u.pathname !== '/callback') {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const code = u.searchParams.get('code');
    const err = u.searchParams.get('error');
    if (err || !code) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end(`Auth failed: ${err || 'missing code'}`);
      server.close();
      process.exit(1);
    }

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const json = await tokenRes.json();
    if (!tokenRes.ok) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(JSON.stringify(json, null, 2));
      server.close();
      process.exit(1);
    }

    console.log('\nSuccess. Add these GitHub repo secrets:\n');
    console.log(`SPOTIFY_CLIENT_ID=${CLIENT_ID}`);
    console.log(`SPOTIFY_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`SPOTIFY_REFRESH_TOKEN=${json.refresh_token}\n`);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
      '<html><body style="font-family:system-ui;padding:2rem">' +
        '<h1>Connected</h1><p>You can close this tab and check your terminal for the refresh token.</p>' +
        '</body></html>'
    );
    server.close();
    process.exit(0);
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.end(String(e));
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Listening on', REDIRECT_URI);
  console.log('Open this URL to authorize:\n');
  console.log(authUrl);
  console.log('');
  import('node:child_process').then(({ exec }) => {
    const open =
      process.platform === 'darwin'
        ? `open "${authUrl}"`
        : process.platform === 'win32'
          ? `start "" "${authUrl}"`
          : `xdg-open "${authUrl}"`;
    exec(open);
  });
});
