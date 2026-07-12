# ITF Masters scraper — Denmark vs Germany (Fred Perry Cup 2026)

Playwright script that extracts the result of the Denmark vs Germany tie
(play-off for 5th/6th place, Fred Perry Cup / Men's 50) from the
**ITF Masters World Team Championships 2026** (Rome, Italy, 5–10 July 2026)
on `itfmasters.tournamentsoftware.com`.

## Usage

```bash
npm install          # installs Playwright; downloads Chromium on first run
node script.js
```

Optional environment variables:

- `PW_EXECUTABLE_PATH` — use an existing Chromium binary instead of the
  Playwright-managed download.
- `HTTPS_PROXY` — route browser traffic through a proxy.

## Why this was not executed in the sandbox

The remote execution environment where this script was authored enforces an
egress network policy that returns `403` on the proxy `CONNECT` for
`itfmasters.tournamentsoftware.com` (and general web hosts), so the browser
fails with `net::ERR_TUNNEL_CONNECTION_FAILED` before any page loads. The
site additionally serves `403` to non-browser fetchers. Run the script from a
machine with normal internet access to obtain the results.
