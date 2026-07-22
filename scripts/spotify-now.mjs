#!/usr/bin/env node
/**
 * Fetches Tiffany's currently-playing (or recently played) Spotify track
 * and writes data/spotify-now.json. Used by GitHub Actions.
 */
import fs from 'node:fs';
import path from 'node:path';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;
const OUT = path.join(process.cwd(), 'data', 'spotify-now.json');

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REFRESH_TOKEN');
  process.exit(1);
}

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

async function refreshAccessToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    const hint =
      json.error === 'invalid_grant'
        ? ' Refresh token is invalid/expired — re-run: node scripts/spotify-auth.mjs and update SPOTIFY_REFRESH_TOKEN.'
        : json.error === 'invalid_client'
          ? ' Client ID/secret are wrong — check SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.'
          : '';
    throw new Error(`token refresh failed: ${JSON.stringify(json)}.${hint}`);
  }
  return json.access_token;
}

function pickArt(images) {
  if (!images || !images.length) return '';
  // Prefer a mid-size image
  const sorted = images.slice().sort((a, b) => (a.width || 0) - (b.width || 0));
  const mid = sorted[Math.min(1, sorted.length - 1)] || sorted[0];
  return mid.url || '';
}

function fromTrack(track, isPlaying) {
  if (!track) {
    return {
      isPlaying: false,
      title: '',
      artist: '',
      albumArt: '',
      trackUrl: '',
      trackId: '',
      fetchedAt: new Date().toISOString(),
    };
  }
  return {
    isPlaying: !!isPlaying,
    title: track.name || '',
    artist: (track.artists || []).map((a) => a.name).filter(Boolean).join(', '),
    albumArt: pickArt(track.album && track.album.images),
    trackUrl: (track.external_urls && track.external_urls.spotify) || '',
    trackId: track.id || '',
    fetchedAt: new Date().toISOString(),
  };
}

async function main() {
  const token = await refreshAccessToken();

  const nowRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${token}` },
  });

  let payload;
  if (nowRes.status === 200) {
    const data = await nowRes.json();
    // Only surface actively playing tracks — never a profile or last-played fallback.
    payload = data.is_playing ? fromTrack(data.item, true) : fromTrack(null, false);
  } else if (nowRes.status === 204) {
    payload = fromTrack(null, false);
  } else {
    const errText = await nowRes.text();
    throw new Error(`currently-playing failed (${nowRes.status}): ${errText}`);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  let prevObj = {};
  try {
    prevObj = prev ? JSON.parse(prev) : {};
  } catch (_) {
    prevObj = {};
  }
  const changed =
    prevObj.isPlaying !== payload.isPlaying ||
    prevObj.trackId !== payload.trackId ||
    prevObj.title !== payload.title ||
    prevObj.artist !== payload.artist ||
    prevObj.albumArt !== payload.albumArt ||
    prevObj.trackUrl !== payload.trackUrl;

  if (changed) {
    fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n');
    console.log('updated', payload.isPlaying ? 'playing' : 'idle', payload.title || '(none)');
  } else {
    console.log('unchanged', payload.isPlaying ? 'playing' : 'idle', payload.title || '(none)');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
