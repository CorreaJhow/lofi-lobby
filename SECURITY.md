# Security

The client is public, so the server trusts nothing it sends.

## Access model

- **No accounts.** Anyone with the URL joins a room with a name they pick; names are not unique and prove nothing.
- **Admin** is one secret, `ADMIN_PASSWORD`, stored only as a Worker secret (and in a git-ignored `.dev.vars` locally). It is compared in **constant time**, and a connection is blocked after **5 wrong tries**. Admin can restart or skip the song, and kick or ban players.
- **Origin check:** the WebSocket only accepts the site's own origin, plus any listed in `ALLOWED_ORIGINS`. Anything else gets `403`.
- **Limits per connection:** 1 KB per message; rate limits (token bucket) for positions, chat and everything else; **100 players** per room.
- **Input is cleaned:** names (16 chars) and chat (140 chars) lose control and bidi characters; coordinates must be finite and within bounds; enums are checked against a list.
- **Output is safe:** the browser inserts every text that comes from the network with `textContent`, never as HTML.
- **Static game assets only:** the repo and live site serve the reviewed files in `public/assets/`; visitors cannot upload assets ([ADR 005](docs/adr/005-version-and-deploy-game-assets.md)).

- **Moderation:** names with bad words or porn names are refused and replaced by a random `trainer` name; bad chat words become `***`, and messages with blocked names are dropped ([`worker/moderation.js`](worker/moderation.js)). Text is normalized first (accents, leetspeak, repeated letters). The admin clicks a player's name to kick (10-minute IP ban) or ban (7-day IP ban) them, and `/unban` in the chat clears every ban. Bans are per IP, so people sharing an IP are affected together.
- **Progressive mute** for chat spam, per IP.

- **Chat history:** the room keeps the last 30 messages from the last 2 hours (name, text, time; never the IP) so people who just joined can read them. Messages are filtered before they are stored, and a banned player's messages are removed.

A word list never catches everything; kick and ban cover the rest.

## Reporting a vulnerability

Please use [GitHub private vulnerability reporting](https://github.com/YudiG12/lofi-lobby/security/advisories/new) instead of a public issue.
